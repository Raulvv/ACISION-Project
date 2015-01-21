
var acisionSDK=null;
var mediaSession= null;

const MYAPIKEY = "hFb0QFd0GXPp";
const USER_NAME =["francisco_moya_martinez_gmail_com_0", "francisco_moya_martinez_gmail_com_1"];
const PASSWORD =["z7If@c84M", "WH@n@VefV"];

$().ready(function setup() {
    $("#dlgSelectUser").click(dlgSelectUser_Start);
    $("#dlgDisconnect").click(acisionSDK_onDisconnected);
    $("#dlgLogin1").click({index: 0}, login);
    $("#dlgLogin2").click({index: 1}, login);
});

function login(e){
    $("#status").html("Login to SDK"+e.data.index);
    console.log(e.data.index);
    var config={
        persistent: true,
        username: USER_NAME[e.data.index],
        password: PASSWORD[e.data.index]
    };

    acisionSDK = new AcisionSDK("MYAPIKEY", {
        onConnected: acisionSDK_onConnected,
        onDisconnected: acisionSDK_onDisconnected,
        onAuthFailure: acisionSDK_onAuthFailure
    }, config);
}

function acisionSDK_onConnected() {
  console.log("acisionSDK_onConnected()");

  // We have successfully connected, so update the UI
  showSpinner("#dlgLogin", false);
  enableDialog("#dlgLogin", true);
  $("#dlgLogin").dialog("close");
  $("#dlgSelectUser").dialog("option", "title", acisionSDK.getAddress().split('@')[0]).dialog("open");
}

function acisionSDK_onAuthFailure(evt) {
  console.log("acisionSDK_onAuthFailure()");

  // Currently the SDK will fire an onDisconnected event, so set our flag so
  // that we don't display another error dialog
  fNormalDisconnect = true;

  if(evt && evt.interactiveUrl) {
    return acisionSDK_oauthLogin(evt.interactiveUrl);
  }

  // The connection failed. Show an error message and reset the UI
  showSpinner("#dlgLogin", false);
  enableDialog("#dlgLogin", true);
  showError("Login failed.", false);

  acisionSDK = null;
}

// Convert url param string into JSON
function processUrlParams(url) {
  var params = url.split('?')[1].split('&');
  var urlParams = {};

  for(var i = 0 ; i < params.length ; i++) {
    var param = params[i].split('=');

    urlParams[param[0]] = param[1];
  }

  return urlParams;
}

var oauthInterval;
function acisionSDK_oauthLogin(url) {
  var iframe = $('#dlgOauth').attr('src', url);
  var win = iframe[0].contentWindow;
  iframe.dialog("open");
  var params = processUrlParams(decodeURIComponent(url));

  // Keep checking window location to see if it matches our redirect URI
  oauthInterval = setInterval(function() {
    try {
      // Fix for IE
      if(!win.location.origin)
        win.location.origin = win.location.protocol + '//' + win.location.host;

      var windowLocation = win.location.origin + win.location.pathname;
      if(params.redirect_uri === windowLocation) {
        var oauthParams = processUrlParams(win.location.search);

        clearInterval(oauthInterval);
        iframe.dialog("close");

        $('#dlgOauth').attr('src', 'about:blank');

        if(oauthParams.error) {
          return acisionSDK_onAuthFailure();
        }

        if(oauthParams.code) {
          authCode = oauthParams.code;
          dlgLogin_Login();
        }
      }
    } catch(e) {
    }
  }, 200);
}

function acisionSDK_onDisconnected() {
  console.log("acisionSDK_onDisconnected()");

  if (fNormalDisconnect) {
    // We initiated the disconnect, so don't do anything
    fNormalDisconnect = false;
    return;
  }

  showError("Connection lost", true);
}


// Functions for making an outgoing video call

function dlgSelectUser_Start() {
  console.log("dlgSelectUser_Start()");

  sRemoteUser = $("#txtChatWith").val();
  if (_.isEmpty(sRemoteUser)) {
    return;
  }

  enableDialog("#dlgSelectUser", false);
  showSpinner("#dlgSelectUser", true);
  // Force a reload of the audio otherwise Chrome will only ever play the file once
  document.getElementById("audRing").load();
  document.getElementById("audRing").play();

  mediaSession = acisionSDK.webrtc.connect(sRemoteUser, {
    onConnect: mediaSession_onConnect,
    onConnecting: mediaSession_onConnecting,
    onClose: mediaSession_onClose
  }, {
    streamConfig: {
      audioIn: true,
      audioOut: true,
      videoIn: true,
      videoOut: true
    }
  });
  mediaSession.remoteAudioElement = document.getElementById("audRemote");
  mediaSession.remoteVideoElement = document.getElementById("vidRemote");
  mediaSession.localVideoElement = document.getElementById("vidLocal");
}

function mediaSession_onConnect() {
  console.log("mediaSession_onConnect()");

  $("#vidRemote").fadeTo(500, 1);
  showSpinner("#dlgChat", false);
  document.getElementById("audRing").pause();
}

function mediaSession_onConnecting() {
  console.log("mediaSession_onConnecting()");

  showSpinner("#dlgSelectUser", false);
  enableDialog("#dlgSelectUser", true);
  // Disable close handler before closing as we're going forwards
  $("#dlgSelectUser").off("dialogbeforeclose").dialog("close");
  $("#vidRemote").fadeTo(0, 0.5);
  showSpinner("#dlgChat", true);
  $("#dlgChat").dialog("option", "title", sRemoteUser).dialog("open");
}


// Functions for accepting an incoming video call

function dlgSelectUser_Wait() {
  console.log("dlgSelectUser_Wait()");

  // Disable close handler before closing as we're going forwards
  $("#dlgSelectUser").off("dialogbeforeclose").dialog("close");
  $("#vidRemote").fadeTo(0, 0.5);
  showSpinner("#dlgChat", true);
  $("#dlgChat").dialog("option", "title", "Waiting for incoming video call")
      .dialog("open");

  acisionSDK.webrtc.setCallbacks({
    onIncomingSession: acisionSDK_onIncomingSession,
  })
}

function acisionSDK_onIncomingSession(event) {
  console.log("acisionSDK_onIncomingSession()");

  mediaSession = event.session;
  sRemoteUser = mediaSession.address.split("@")[0];
  mediaSession.remoteAudioElement = document.getElementById("audRemote");
  mediaSession.remoteVideoElement = document.getElementById("vidRemote");
  mediaSession.localVideoElement = document.getElementById("vidLocal");
  mediaSession.setCallbacks({
    onClose: mediaSession_onClose
  })
  mediaSession.accept();

  $("#dlgChat").dialog("option", "title", sRemoteUser).dialog("open");

  $("#vidRemote").fadeTo(500, 1);
  showSpinner("#dlgChat", false);
}


// Common functions for both video call modes

function dlgSelectUser_beforeClose() {
  console.log("dlgSelectUser_beforeClose()");

  // This event should only be enabled when cancelling the dialog

  // This is an intentional disconnect so set our flag so that we don't then
  // display an error dialog
  fNormalDisconnect = true;

  // Disconnect from the SDK and return to the login dialog
  acisionSDK.disconnect();
  acisionSDK = null;
  $("#txtChatWith").val("");
  $("#dlgLogin").dialog("open");
}

function mediaSession_onClose(event) {
  console.log("mediaSession_onClose(" + event + ")");

  document.getElementById("audRing").pause();
  mediaSession = null;
  $("#dlgChat").dialog("close");
  $("#dlgSelectUser").dialog("open");
}

function dlgChat_Disconnect(event, ui) {
  console.log("dlgChat_Disconnect(" + event + ", " + ui + ")");
  $(this).dialog("close");
}

function dlgChat_beforeClose(event, ui) {
  console.log("dlgChat_beforeClose(" + event + ")");

  if (!_.isNull(mediaSession)) {
    mediaSession.close("normal");
    mediaSession = null;
    $("#audRemote")[0].src = "";
    $("#vidRemote")[0].src = "";
    $("#vidLocal")[0].src = "";
  }
  $("#dlgSelectUser").dialog("open");
}

/**
 * Disconnect from the SDK and reset the page back to the login dialog.
 */
function reset() {
  console.log("reset())");

  document.getElementById("audRing").pause();

  if (!_.isNull(acisionSDK)) {
    try {
      // This is an intentional disconnect so set our flag so that we
      // don't then display an error dialog
      fNormalDisconnect = true;

      acisionSDK.disconnect();
      acisionSDK = null;
    } catch (err) {
      console.warn("Error when disconnecting SDK: ", err)
    }
  }

  // Disable close handler before closing the Select User dialog
  $("#dlgSelectUser").off("dialogbeforeclose");

  // Close all dialogs, then open login dialog
  $(".ui-dialog-content").dialog("close");
  $("#dlgLogin").dialog("open");
}


//Utility functions for managing the user interface

function dlgLogin_open() {
  $(window).off('beforeunload');
}

function dlgLogin_close() {
  $(window).on('beforeunload', window_onbeforeunload);
}

function dlgOauth_open() {
  console.log("dlgOauth_open()");
}

function dlgOauth_close() {

}

function window_onbeforeunload(event) {
  return 'You are currently logged in. Leaving this page will log you out.';
}

function window_onunload(event) {
  reset();
}

function dlgSelectUser_open() {
  console.log("dlgSelectUser_open()");

  // Enable the close handler so that cancelling the dialog sends us back to
  // the login dialog
  $("#dlgSelectUser").on("dialogbeforeclose", dlgSelectUser_beforeClose);
}

function dlgError_OK(event, ui) {
  console.log("dlgError_OK(" + event + ")");

  if ($(this).data("fatal")) {
    reset();
  } else {
    $(this).dialog("close");
  }
}

/**
 * Handle the enter key in a text box by running the provided submitFunction.
 *
 * @param submitFunction
 *       the event handler to run when the Enter key is pressed
 * @return a keypress event handler
 */
function handleEnter(submitFunction) {
  return function(event) {
    if (event.keyCode == 13) {
      submitFunction();
      event.preventDefault();
    }
  }
}

/**
 * Enable/disable a dialog by setting the disabled attribute on the dialog
 * buttons.
 *
 * @param dialog
 *       the JQuery selector of the dialog to modify
 * @param enable
 *       true to enable the dialog or false to disable it
 */
function enableDialog(dialog, enable) {
  button = $(dialog).dialog("widget").find("button");
  if (enable) {
    button.removeAttr("disabled").removeClass("ui-state-disabled");
  } else {
    button.attr("disabled", "disabled").addClass("ui-state-disabled");
  }
}

/**
 * Show/hide a busy spinner in the button pane of a dialog.
 *
 * @param dialog
 *       the JQuery selector of the dialog to modify
 * @param show
 *       true to show the spinner or false to hide it
 */
function showSpinner(dialog, show) {
  if (show) {
    $(dialog).dialog("widget").find(".ui-dialog-buttonset").prepend(
        $("#imgSpinner").removeClass("ui-helper-hidden"));
  } else {
    $("body").append($("#imgSpinner").addClass("ui-helper-hidden"));
  }
}

/**
 * Display an error message.
 *
 * @param {string} message
 *       The message to display
 * @param {boolean} fatal
 *       Whether or not this is a fatal error. If true, then reset() will be
 *       called when the error message is closed.
 */
function showError(message, fatal) {
  $("#spnErrorMessage").text(message);
  $("#dlgError").data("fatal", fatal);
  $("#dlgError").dialog("open");
}

//Initialise the user interface
$().ready(function setup() {
  $.widget("ui.dialog", $.ui.dialog, {
    _title: function (title) {
      // Override title function to insert the Acision logo (this is
      // is needed as the default function escapes HTML)
      title.html("<img src='img/icon.png' width='16' height='16' style='margin-right: 0.5em; vertical-align: bottom;'>"
              + this.options.title);
    }
  });

  $("#dlgLogin").dialog({
    dialogClass: "no-close",
    autoOpen: false,
    closeOnEscape: false,
    hide: true,
    show: true,
    title: "Acision SDK Video Call",
    buttons: [
      {text: "Login with Acision Forge", click: dlgLogin_Login}
    ],
    open: dlgLogin_open,
    close: dlgLogin_close
  });

  $("#dlgOauth").dialog({
    dialogClass: "no-close",
    autoOpen: false,
    closeOnEscape: false,
    hide: true,
    show: true,
    title: "Login with Acision Forge",
    open: dlgOauth_open,
    close: dlgOauth_close
  });

  $("#dlgSelectUser").dialog({
    autoOpen: false,
    closeOnEscape: false,
    hide: true,
    show: true,
    buttons: [
      {text: "Logout", click: function() {$(this).dialog("close")}},
      {text: "Send video call request", click: dlgSelectUser_Start},
      {text: "Wait for incoming video call", click: dlgSelectUser_Wait}
    ],
    open: dlgSelectUser_open
  });

  $("#dlgChat").dialog({
    autoOpen: false,
    closeOnEscape: false,
    hide: true,
    show: true,
    width: 350,
    beforeClose: dlgChat_beforeClose,
    buttons: [
      {text: "Disconnect", click: dlgChat_Disconnect}
    ]
  });

  $("#dlgError").dialog({
    title: "Error",
    autoOpen: false,
    hide: true,
    show: true,
    modal: true,
    buttons: [
      {text: "OK", click: dlgError_OK}
    ]
  });

  $("#txtUsername").keypress(handleEnter(dlgLogin_Login));
  $("#txtPassword").keypress(handleEnter(dlgLogin_Login));
  $("#txtChatWith").keypress(handleEnter(dlgSelectUser_Start));

  $(window).on("unload", window_onunload);

  $("#dlgLogin").dialog("open");
});



/*
///////////////////////////////////////////////////////////////
  // Test for WebRTC support
  if (!window.webkitRTCPeerConnection &&
      !window.mozRTCPeerConnection &&
      !window.RTCPeerConnection) {
    showError("Warning: could not detect WebRTC support. " +
      "This application may not function correctly.", false);
  }
})

/*
function onConnected() {
    $("#status").html("Connected to SDK");

    acisionSDK.webrtc.setCallbacks({
        onIncomingSession: onIncomingSession,
    });
}

function onDisconnected() {
    $("#status").html("Disconnected to SDK");

    acisionSDK.webrtc.setCallbacks({
        onClose: onClose,
    });
}


function onIncomingSession(event) {
    mediaSession=event.session;
    $("#status").html("Incoming Call: "+ mediaSession.address);

    mediaSession.remoteAudioElement=document.getElementById("audRemote");
    mediaSession.remoteVideoElement=document.getElementById("vidRemote");
    mediaSession.localVideoElement=document.getElementById("vidLocal");

    mediaSession.setCallbacks({
    });

    mediaSession.accept();
    $("#call").attr("disabled", true);
}

function call(){
    $("#status").html("Make call");

    sRemoteUser= $("#destination").val();

    if (sRemoteUser.length ===0){
        $("#status").html("Destination empty");
        return;
    }

    mediaSession=acisionSDK.webrtc.connect(sRemoteUser, {
        onConnect: onConnect,
        onConnecting: onConnecting,
        onClose: onClose
    }, {
        streamConfig: {
            audioIn: true, audioOut: true, videoIn: true, videoOut: true
        }
    });

    mediaSession.remoteAudioElement=document.getElementById("audRemote");
    mediaSession.remoteVideoElement=document.getElementById("vidRemote");
    mediaSession.localVideoElement=document.getElementById("vidLocal");
    $("#call").attr("disabled", true);

    }
*/
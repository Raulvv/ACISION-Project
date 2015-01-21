require 'services/highlights'
class UsersController < ApplicationController
    def initialize(*args)
        super(*args)
        @highlightService = Services::Highlights.new();   
    end

    def index
    end

    def show                
        @user = User.find(params[:id])
        @users = User.all
        @session = @user.sessions.find(params[:id])
        @tracks = Track.all
        @highlights = @highlightService.getHighestRankedSessions()
    end
    
    private
    def sessions_params
        params.require(:session).permit(:session_name, :description, :user_id) 
    end 
end

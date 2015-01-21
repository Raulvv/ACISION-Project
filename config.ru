# This file is used by Rack-based servers to start the application.
$LOAD_PATH << File.join(File.dirname(__FILE__), 'app')
require ::File.expand_path('../config/environment',  __FILE__)
run Rails.application

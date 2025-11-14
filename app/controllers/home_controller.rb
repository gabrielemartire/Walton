require 'ostruct'

class HomeController < ApplicationController
  def landing
    if user_signed_in?
      @user_data = current_user
      @repository = current_user.repositories

      redirect_to repositories_path
    else
      @waiting = Waiting.new
      render :landing
    end
  end
end

class AdminController < ApplicationController
	  before_filter :authenticate_user!
  def index
    if params[:approved] == "false"
      @users = User.find_all_by_approved(false)
    else
      @users = User.all
    end
  end
end

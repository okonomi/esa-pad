class SessionsController < ApplicationController
  def create
    user = User.find_or_create_from_auth_hash(request.env['omniauth.auth'])
    session[:user_id] = user.id
    session[:token] = request.env['omniauth.auth'][:credentials][:token]
    redirect_to '/', notice: 'ログインしました'
  end
end

require 'test_helper'

class ConfigpagesControllerTest < ActionController::TestCase
  test "should get dell" do
    get :dell
    assert_response :success
  end

end

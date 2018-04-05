/**
 * Created by raslanrauff on 4/5/18.
 */

function LoginView(){
    var this_ = this;
    this.lblUsername = null;
    this.checkAndDisplayUserDetails = function () {
        var username = getCookie("user");
        if(username){
           this_.lblUsername.innerHTML = username;
        }
    };
    this.onLogoutClick = function () {
        window.location.href = HOST + LOGOUT_URL;
    };
    this.init = function () {
        this_.lblUsername = document.getElementById('lbl_username');
    };
}
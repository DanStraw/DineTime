var config = {
  apiKey: "AIzaSyDFxvI2pF2TVAL8YxlTKiIJsA3zAT8wT1I",
  authDomain: "dinetime-c2874.firebaseapp.com",
  databaseURL: "https://dinetime-c2874.firebaseio.com",
  projectId: "dinetime-c2874",
  storageBucket: "",
  messagingSenderId: "647476940046"
};

class UserAuth {
  constructor(userInfo, fb_app = null, config) {
    this.userInfo = userInfo;
    this.fb_app = fb_app;
    this.config = config;
  }

  displayLoggedInState() {
    $("#history-panel").show();
    $("#login-panel").hide();
  }

  displayLoggedOutState() {
    $("#history-panel").hide();
    $("#login-panel").show();
  }

  signUpUser(cb) {
    this.fb_app = firebase.initializeApp(config);
    this.fb_app.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    this.fb_app.auth().createUserWithEmailAndPassword(this.userInfo.email, this.userInfo.password).then(({ user }) => {
      return user.getIdToken().then((idToken) => {
        this.userInfo.idToken = idToken;
        return $.ajax({
          url: `/users`,
          dataType: 'JSON',
          method: 'POST',
          data: this.userInfo
        })
      })
    }).then(response => {
      this.fb_app.delete();
      this.clearUserLogin();
      this.clearUserSignup();
      this.displayLoggedInState();
      cb(response);
    }).catch(err => {
      console.log('signupErr: ' + err);
      this.fb_app.delete();
    })
  }

  loginUser(cb) {
    this.fb_app = firebase.initializeApp(config);
    this.fb_app.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    this.fb_app.auth().signInWithEmailAndPassword(this.userInfo.email, this.userInfo.password)
      .then(({ user }) => {
        user.getIdToken().then((idToken) => {
          $.ajax({
            url: '/users/login',
            dataType: 'JSON',
            method: 'POST',
            data: { idToken }
          }).then(response => {
            this.fb_app.delete();
            this.clearUserLogin();
            this.clearUserSignup();
            this.displayLoggedInState();
            cb(response);
          }).catch(err => {
            return swal('Email or Password Incorrect');
          })
        })
      })
      .catch((error) => {
        this.fb_app.delete();
        var errorCode = error.code;
        var errorMessage = error.message;
        swal("Login Failed.  Please check your username and password and try again");
      });
  }

  logoutUser() {
    this.fb_app = !firebase.apps.length ? firebase.initializeApp(config) : firebase.apps[0];
    this.fb_app.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    this.fb_app.auth().signOut().then(() => {
      $.getJSON(`/users/auth/logout`).then(() => {
        this.displayLoggedOutState();
        this.fb_app.delete();
      }).catch(err => {
        return err;
      })
    }).catch((error) => {
      console.log('auth logout error: ' + error);
    })
  }

  verifyUserByToken(callback) {
    $.getJSON('/users/auth/token', (res) => {
      callback(res);
    })
  }

  clearUserLogin() {
    $('#login-email:text').val("");
    $('input[type="password"]').val('');
  }

  clearUserSignup() {
    $("#signup-email:text").val("");
    $("#signup-username:text").val("");
    $('input[type="password"]').val('');
  }

  toggleAuthForm() {
    if ($('#login-body').is(":hidden")) {
      $('#login-body').show();
      $('#signup-body').hide();
      $("#login-header-text").text("Login");
    } else {
      $('#login-body').hide();
      $('#signup-body').show();
      $("#login-header-text").text("Sign Up");
    }
  }
}

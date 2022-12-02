var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
var qmStates = require('../../ionic/src/data/qmStates.js');
var qm = require('../../ionic/src/js/qmHelpers.js');
var qmLog = require('../../ionic/src/js/qmLogger.js');
const credentials = require("../utils/credentials");
const authHelper = require("../utils/authHelper");
const urlHelper = require("../utils/urlHelper");
const db = require("../db");


/* Configure password authentication strategy.
 *
 * The `LocalStrategy` authenticates users by verifying a username and password.
 * The strategy parses the username and password from the request and calls the
 * `verify` function.
 *
 * The `verify` function queries the database for the user record and verifies
 * the password by hashing the password supplied by the user and comparing it to
 * the hashed password stored in the database.  If the comparison succeeds, the
 * user is authenticated; otherwise, not.
 */
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passReqToCallback: true
  }, function(req, email, password, done) {
    return authHelper.loginViaEmail(req, function (err, user) {
      done(err, user);
  });
}));


  /* Configure session management.
   *
   * When a login session is established, information about the user will be
   * stored in the session.  This information is supplied by the `serializeUser`
   * function, which is yielding the user ID and username.
   *
   * As the user interacts with the app, subsequent requests will be authenticated
   * by verifying the session.  The same user information that was serialized at
   * session establishment will be restored when the session is authenticated by
   * the `deserializeUser` function.
   */

passport.serializeUser( (user, done) => {
  console.log(`\n--------> Serialize User:`)
  console.log(user)
  // The USER object is the "authenticated user" from the done() in authUser function.
  // serializeUser() will attach this user to "req.session.passport.user.{user}", so that it is tied to the session object for each session.

  done(null, user)
} )


passport.deserializeUser((user, done) => {
  if(qm.appMode.isDebug()){
    console.log("\n--------- Deserialized User:")
    console.log(user)
  }
  // This is the {user} that was saved in req.session.passport.user.{user} in the serializationUser()
  // deserializeUser will attach this {user} to the "req.user.{user}", so that it can be used anywhere in the App.

  done (null, user)
})


var router = express.Router();

/* GET /login
 *
 * This route prompts the user to log in.
 *
 * The 'login' view renders an HTML form, into which the user enters their
 * username and password.  When the user submits the form, a request will be
 * sent to the `POST /login/password` route.
 */
router.get('/login', function(req, res, next) {
  //res.render('login');
  res.redirect("/#/app/login")
});

/* POST /login/password
 *
 * This route authenticates the user by verifying a username and password.
 *
 * A username and password are submitted to this route via an HTML form, which
 * was rendered by the `GET /login` route.  The username and password is
 * authenticated using the `local` strategy.  The strategy will parse the
 * username and password from the request and call the `verify` function.
 *
 * Upon successful authentication, a login session will be established.  As the
 * user interacts with the app, by clicking links and submitting forms, the
 * subsequent requests will be authenticated by verifying the session.
 *
 * When authentication fails, the user will be re-prompted to login and shown
 * a message informing them of what went wrong.
 */
router.post('/login/password', passport.authenticate('local', {
  successReturnToOrRedirect: urlHelper.loginSuccessRedirect,
  failureRedirect: urlHelper.loginFailureRedirect,
  failureMessage: true
}));

/* POST /logout
 *
 * This route logs the user out.
 */
router.post('/auth/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.user = null;
    //res.redirect('/');
  });
});

/* POST /signup
 *
 * This route creates a new user account.
 *
 * A desired username and password are submitted to this route via an HTML form,
 * which was rendered by the `GET /signup` route.  The password is hashed and
 * then a new user record is inserted into the database.  If the record is
 * successfully created, the user is logged in.
 */
router.post('/signup', function(req, res, next) {
  var salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    if (err) { return next(err); }
    db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
      req.body.username,
      hashedPassword,
      salt
    ], function(err) {
      if (err) { return next(err); }
      var user = {
        id: this.lastID,
        username: req.body.username
      };
      req.login(user, function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });
  });
});

function socialLoginRoutes(strategyName, libraryName, connectorName) {
  if(!connectorName){connectorName = strategyName;}
  libraryName = libraryName || "passport-" + strategyName;
  let { Strategy: Strategy } = require(libraryName);
  let strategyOpts = credentials.find(strategyName, connectorName);
  if(strategyName === "fitbit"){
    Strategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;
  }
  let authCallbackFunction = function(request, accessToken, refreshToken, profile, done){
    return authHelper.handleConnection(request, accessToken, refreshToken, profile, done, connectorName);
  };
  try {
    passport.use(new Strategy(strategyOpts, authCallbackFunction));
  } catch (e) {
    qmLog.error("Error creating " + strategyName + " strategy.  Please check your credentials.json file.  Error: " + e);
    throw e
  }

  let authOpts = {
    scope: credentials.getScopes(connectorName)
  };
  router.get("/auth/" + connectorName,
    passport.authenticate(strategyName, authOpts));
  router.get("/auth/" + strategyName + "/callback",
    passport.authenticate(strategyName, {
      //successRedirect: urlHelper.loginFailureRedirect,
      failureRedirect: urlHelper.loginFailureRedirect
    }), (req, res) => {
      let url = req.session.final_callback_url;
      if(url){
        req.session.final_callback_url = null;
        res.redirect(url);
      } else {
        res.redirect(urlHelper.loginSuccessRedirect);
      }
    });
}
socialLoginRoutes('google', 'passport-google-oauth2', 'googleplus');
socialLoginRoutes('github');
socialLoginRoutes('facebook');
socialLoginRoutes('twitter');
socialLoginRoutes('fitbit', 'passport-fitbit-oauth2');
//socialLoginRoutes('withings');

module.exports = router;

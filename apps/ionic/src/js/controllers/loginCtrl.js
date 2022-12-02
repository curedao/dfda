angular.module('starter').controller('LoginCtrl', ["$scope", "$state", "$rootScope", "$ionicLoading", "$injector",
    "$stateParams", "$timeout", "qmService", "$mdDialog",
    function($scope, $state, $rootScope, $ionicLoading, $injector, $stateParams, $timeout, qmService, $mdDialog){
        function hideLoginPageLoader(){
            //return;
            qmService.hideLoader();
        }
        $scope.state = {
            //useLocalUserNamePasswordForms: qm.platform.isMobileOrChromeExtension(),
            useLocalUserNamePasswordForms: true,
            loading: false,
            alreadyRetried: false,
            showRetry: false,
            registrationForm: false,
            loginForm: false,
            tryToGetUser: function(force){
                qmService.showBasicLoader(); // Chrome needs to do this because we can't redirect with access token
                qmLog.authDebug("Trying to get user");
                qmService.refreshUser(force, {}).then(function(){
                    qmLog.authDebug("Got user");
                    hideLoginPageLoader();
                    leaveIfLoggedIn();
                }, function(error){
                    console.info("Could not get user! error: " + error);
                    //qmService.showMaterialAlert(error);  Can't do this because it has a not authenticate popup
                    hideLoginPageLoader();  // Hides login loader too early
                    leaveIfLoggedIn();
                });
            },
            emailRegister: function () {
                var params = $scope.state.registrationForm;
                params.register = true;
                if(!params.passwordConfirm || params.passwordConfirm !== params.password){
                    qmService.showMaterialAlert("Confirm Password", "Passwords do not match!");
                    return;
                }
                qmService.showBasicLoader();
                qm.api.post('api/v3/userSettings', params, function(response){
                    qmService.setUserInLocalStorageBugsnagIntercomPush(response.user);
                    hideLoginPageLoader();
                    leaveIfLoggedIn();
                }, function(error){
                    var message = qm.api.getErrorMessageFromResponse(error);
                    qmService.showMaterialAlert("Error", message);
                    hideLoginPageLoader();  // Hides login loader too early
                    leaveIfLoggedIn();
                });
            },
            emailLogin: function () {
                qmService.showBasicLoader(); // Chrome needs to do this because we can't redirect with access token
                fetch('/login/password',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify($scope.state.loginForm)
                }).then(function(response){
                    hideLoginPageLoader();
                    if(!response.ok){
                        var body = response.json();
                        qmService.showMaterialAlert("Error", "Invalid username or password");
                        return;
                    }
                    leaveIfLoggedIn();
                }, function(error){
                    qmLog.error("Email Login Error", error);
                    qmService.showMaterialAlert("Login Error", "Hmm. I couldn't sign you in with those credentials.  Please double check them or contact me at https://help.quantimo.do.");
                    hideLoginPageLoader();  // Hides login loader too early
                    leaveIfLoggedIn();
                });
            }
        };
        $scope.state.socialLogin = function(connectorName, ev, additionalParams){
            if(connectorName === 'quantimodo' && $scope.state.useLocalUserNamePasswordForms){
                if(additionalParams.register){
                    $scope.state.registrationForm = {};
                }else{
                    $scope.state.loginForm = {};
                }
                return;
            }
            // qmService.createDefaultReminders();  TODO:  Do this at appropriate time. Maybe on the back end during user creation?
            loginTimeout();
            //window.location.href = window.location.origin + '/auth/'+strategyName;
            //return;
            qm.connectorHelper.webConnectViaRedirect(connectorName, ev, additionalParams);
        };
        $scope.controller_name = "LoginCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.circlePage = {
            title: null,
            overlayIcon: false, //TODO: Figure out how to position properly in circle-page.html
            color: {
                "backgroundColor": "#3467d6",
                circleColor: "#00000042"
            },
            image: {
                url: "img/robots/robot-waving.svg",
                height: "120",
                width: "120",
                display: "block",
                left: "10px"
            },
            bodyText: "Sign in so you never lose your precious data.",
            // moreInfo: "Your data belongs to you.  Security and privacy our top priorities. I promise that even if " +
            //     "the NSA waterboards me, I will never divulge share your data without your permission.",
        };
        var leaveIfLoggedIn = function(){
            if(qm.getUser() && qm.auth.getAccessTokenFromUrlUserOrStorage()){
                qmLog.authDebug('Already logged in on login page.  goToDefaultStateIfNoAfterLoginGoToUrlOrState...');
                qmService.login.afterLoginGoToUrlOrState();
            }
        };
        function handleLoginError(error, metaData){
            $scope.retryLogin(error);
            qmLog.error('Login failure: ' + error, metaData, metaData);
        }
        function handleLoginSuccess(){
            if(qm.getUser() && $state.current.name.indexOf('login') !== -1){
                qmService.login.afterLoginGoToUrlOrState();
            }
        }
        var loginTimeout = function(){
            var duration = 60;
            qmService.showBlackRingLoader(duration);
            $scope.circlePage.title = 'Logging in...';
            $scope.circlePage.bodyText = 'Thank you for your patience. Your call is very important to us!';
            qmLog.authDebug('Setting login timeout...');
            $timeout(function(){
                $scope.state.showRetry = true;
            }, 15000);
            return $timeout(function(){
                qmLog.authDebug('Finished login timeout');
                if(!qm.getUser()){
                    handleLoginError("timed out");
                }else{
                    handleLoginSuccess();
                }
            }, duration * 1000);
        };
        $scope.$on('$ionicView.beforeEnter', function(e){
            if (document.title !== "Login") {document.title = "Login";}
            qmLog.authDebug('beforeEnter in state ' + $state.current.name);
            leaveIfLoggedIn();
            if(qm.urlHelper.getParam('loggingIn') || qm.auth.getAccessTokenFromUrlAndSetLocalStorageFlags($state.current.name)){
                loginTimeout();
            }else{
                qmLog.authDebug('refreshUser in beforeEnter in state ' + $state.current.name + ' in case we\'re on a Chrome extension that we can\'t redirect to with a token');
                $scope.state.tryToGetUser(false);
            }
        });
        $scope.$on('$ionicView.enter', function(){
            //leaveIfLoggedIn();  // Can't call this again because it will send to default state even if the leaveIfLoggedIn in beforeEnter sent us to another state
            qmLog.authDebug($state.current.name + ' enter...');
            qmService.navBar.hideNavigationMenu();
        });
        $scope.$on('$ionicView.afterEnter', function(){
            qm.connectorHelper.getConnectorsFromLocalStorageOrApi();  // Pre-load to speed up login
            //leaveIfLoggedIn();  // Can't call this again because it will send to default state even if the leaveIfLoggedIn in beforeEnter sent us to another state
            qmService.splash.hideSplashScreen();
            var errorMessage = qm.urlHelper.getParam('error');
            if(!qm.stringHelper.isFalsey(errorMessage)){
                errorMessage = decodeURIComponent(errorMessage);
                qmLog.error(errorMessage);
                if(!qm.getUser()){
                    qmService.showMaterialAlert("Login Issue", "Hmm.  I couldn't log you in with that method.  Could you try a different one?  Thanks!  Error: " +
                    errorMessage);
                }
            }
            if(qm.speech.getSpeechEnabled() && !qm.urlHelper.getParam('loggingIn')){
                //qm.speech.sayIfNotInRecentStatements("I'm not sure who you are... So while you're logging in... Take that time to ask yourself who YOU... think YOU are on a deeper level.");
            }
        });
        $scope.state.setAuthDebugEnabled = function(){
            qmLog.setAuthDebugEnabled(true);
            qmLog.authDebug("Enabled auth debug with on-hold button");
        };
        $scope.retryLogin = function(error){
            qmLog.setAuthDebugEnabled(true);
            $scope.state.alreadyRetried = true;
            $scope.state.showRetry = false;
            //$scope.circlePage.title = 'Please try logging in again';
            $scope.circlePage.title = null;
            qmLog.error("Called retry login because: ", error);
        };
    }]);

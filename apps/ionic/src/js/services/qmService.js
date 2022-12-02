/* eslint-disable no-console */
/** @namespace window.qmLog */
/** @namespace window.qm.notifications */
/** @namespace window.qm.storage */
/* global chcp $ionicDeploy qm.staticData.stateNames chcp qm.staticData.stateNames */
angular.module('starter').factory('qmService', ["$http", "$q", "$rootScope", "$ionicPopup", "$state", "$timeout",
    "$ionicPlatform", "$mdDialog", "$mdToast", "$cordovaGeolocation", "CacheFactory", "$ionicLoading",
    //"Analytics", // Analytics + uBlock origin extension breaks app
    "wikipediaFactory", "$ionicHistory", "$ionicActionSheet", "clipboard",
    function($http, $q, $rootScope, $ionicPopup, $state, $timeout, $ionicPlatform, $mdDialog, $mdToast,
             $cordovaGeolocation, CacheFactory, $ionicLoading,
             //Analytics, // Analytics + uBlock origin extension breaks app
             wikipediaFactory, $ionicHistory,
             $ionicActionSheet, clipboard){
        var allStates = $state.get();
        //console.log(JSON.stringify(allStates));
        var qmService = {
            adBanner: {
                showOrHide: function(stateParams){
                    if(qm.platform.isMobile()){
                        document.addEventListener('deviceready', function(){
                            if(stateParams.showAds){
                                qmService.adBanner.show();
                            }else{
                                qmService.adBanner.hide();
                            }
                        }, false);
                    }
                },
                adPublisherIds: {
                    ios: {
                        banner: 'ca-app-pub-2427218021515520/1775529603',
                        interstitial: ''
                    },
                    android: {
                        banner: 'ca-app-pub-2427218021515520/1775529603',
                        interstitial: ''
                    }
                },
                initialize: function(){
                    if(!qm.platform.isMobile()){
                        qmLog.info("admob: Not Initializing because not on mobile...");
                        return false;
                    }
                    qmLog.info("admob: Checking if user is older than a day...");
                    if(!qmService.adBanner.admobPluginInstalled()){
                        return;
                    }
                    if(qmService.adBanner.floatingHotpot.isInstalled()){
                        qmService.adBanner.floatingHotpot.createBannerView();
                    }else if(typeof admob.banner !== "undefined"){
                        admob.banner.config({id: qmService.adBanner.adPublisherIds[qm.platform.getCurrentPlatform()].banner,});
                        admob.banner.prepare(); // Create banner
                    }else{
                        admob.setOptions({
                            publisherId: qmService.adBanner.adPublisherIds[qm.platform.getCurrentPlatform()].banner,
                            interstitialAdId: qmService.adBanner.adPublisherIds[qm.platform.getCurrentPlatform()].interstitial,
                            //tappxIdiOS:       "/XXXXXXXXX/Pub-XXXX-iOS-IIII",
                            //tappxIdAndroid:   "/XXXXXXXXX/Pub-XXXX-Android-AAAA",
                            //tappxShare:       0.5,
                        });
                    }
                },
                show: function(force){
                    if(!qmService.adBanner.admobPluginInstalled()){
                        return;
                    }
                    qmService.adBanner.initialize();
                    qm.userHelper.userIsOlderThan1Day(function(OlderThan1Day){
                        if(!OlderThan1Day && !force){
                            qmLog.info("admob: Not showing admob because user not older than 1 day");
                            return;
                        }
                        if(qm.getUser().loginName === 'bucket_box'){
                            qmLog.info("admob: Not showing because it's an Apple test user");
                            return;
                        }
                        qmLog.info("admob: Initializing admob and creating banner...");
                        if(qmService.adBanner.floatingHotpot.isInstalled()){
                            qmService.cordova.getPlugins().AdMob.showAd(true);
                        }else if(typeof admob.createBannerView !== "undefined"){
                            admob.createBannerView();
                        }else{
                            admob.banner.show();
                        }
                    });
                },
                hide: function(){
                    if(!qmService.adBanner.admobPluginInstalled()){
                        return;
                    }
                    qmLog.info("Hiding ad");
                    if(qmService.adBanner.floatingHotpot.isInstalled()){
                        qmService.cordova.getPlugins().AdMob.showAd(false);
                    }else if(typeof admob.destroyBannerView !== "undefined"){
                        admob.destroyBannerView();
                    }else{
                        admob.banner.hide();
                    }
                },
                admobPluginInstalled: function(){
                    if(typeof admob === "undefined" && !qmService.adBanner.floatingHotpot.isInstalled()){
                        qmLog.error("admob not installed on mobile");
                        return false;
                    }
                    return true;
                },
                floatingHotpot: {
                    isInstalled: function(){
                        return typeof qmService.cordova.getPlugins().AdMob !== "undefined";
                    },
                    createBannerView: function(){
                        if(!qmService.adBanner.floatingHotpot.isInstalled()){
                            qmLog.error("admob: window.plugins.AdMob undefined on mobile");
                            return;
                        }
                        qmService.cordova.getPlugins().AdMob.setOptions({
                            publisherId: qmService.adBanner.adPublisherIds[qm.platform.getCurrentPlatform()].banner,
                            interstitialAdId: qmService.adBanner.adPublisherIds[qm.platform.getCurrentPlatform()].interstitial,
                            bannerAtTop: false, // set to true, to put banner at top
                            overlap: false, // set to true, to allow banner overlap webview
                            offsetTopBar: false, // set to true to avoid ios7 status bar overlap
                            isTesting: false, // receiving test ad
                            autoShow: true // auto show interstitial ad when loaded
                        });
                        qmService.cordova.getPlugins().AdMob.createBannerView(); // display the banner at startup
                    }
                }
            },
            actionSheet: {
                setDefaultActionSheet: function(refreshFunction, variableCategoryName, destructiveText, destructiveFunction){
                    qmService.rootScope.setShowActionSheetMenu(function(){
                        var allButtons = qmService.actionSheets.actionSheetButtons;
                        var params = {
                            buttons: [
                                allButtons.historyAll,
                                allButtons.reminderAdd,
                                allButtons.measurementAddSearch,
                                allButtons.charts,
                                allButtons.settings,
                                allButtons.help,
                                allButtons.refresh
                            ],
                            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                            cancel: function(){
                                qmLog.debug('CANCELLED', null);
                            },
                            buttonClicked: function(index, button){
                                qmLog.debug('BUTTON CLICKED', index);
                                var stateParams = {};
                                if(variableCategoryName){
                                    stateParams.variableCategoryName = variableCategoryName;
                                }
                                if(index === 0){
                                    qmService.goToState('app.historyAll', stateParams);
                                }
                                if(index === 1){
                                    qmService.goToState('app.reminderSearch', stateParams);
                                }
                                if(index === 2){
                                    qmService.goToState('app.measurementAddSearch', stateParams);
                                }
                                if(index === 3){
                                    qmService.goToState('app.chartSearch', stateParams);
                                }
                                if(index === 4){
                                    qmService.goToState('app.settings');
                                }
                                if(index === 5){
                                    qmService.goToState('app.help');
                                }
                                if(index === 6){
                                    refreshFunction(3)
                                }
                                return true;
                            },
                            destructiveButtonClicked: function(){
                                if(destructiveFunction){
                                    destructiveFunction();
                                }
                                return true;
                            }
                        };
                        if(destructiveText){
                            params.destructiveText = '<i class="icon ion-trash-a"></i>' + destructiveText;
                        }
                        var hideSheet = $ionicActionSheet.show(params);
                    });
                },
            },
            adSense: {
                showOrHide: function(){
                    function showAdSense(){
                        return false; // Remove this line if you need to show ads
                        var u = $rootScope.user;
                        if(!u){
                            return false;
                        }
                        if(u.id === 230){
                            return true;
                        } // Show ads for mike so he sees any issues
                        if(u.stripeActive){
                            return false;
                        } // Show ads for mike so he sees any issues
                        if(!qm.platform.isWeb()){
                            return false;
                        }
                        if($rootScope.hideNavigationMenu !== false){
                            return false;
                        }
                        return $rootScope.appSettings.additionalSettings.monetizationSettings.advertisingEnabled;
                    }
                    if(!showAdSense()){
                        return;
                    }
                    qm.userHelper.userIsOlderThan1Day(function(OlderThan1Day){
                        if(!OlderThan1Day){
                            qmLog.info("admob: Not showing admob because user not older than 1 day");
                            return;
                        }
                        if($rootScope.showAdSense !== showAdSense()){
                            $timeout(function(){
                                qmService.rootScope.setProperty('showAdSense', showAdSense()); // This is necessary
                                                                                               // because of "No slot
                                                                                               // size for
                                                                                               // availableWidth=0"
                                                                                               // error
                            }, 3000)
                        }
                    });
                }
            },
            api: {
                checkRequiredProperties: function(bodyToCheck, modelName, successHandler){
                    qm.apiHelper.checkRequiredProperties(bodyToCheck, modelName, function(requiredExplanation){
                        if(requiredExplanation){
                            qmService.showMaterialAlert(requiredExplanation.title, requiredExplanation.textContent);
                            return;
                        }
                        successHandler();
                    });
                }
            },
            auth: {
                deleteAllAccessTokens: function(reason){
                    if($rootScope.user){
                        $rootScope.user.accessToken = null;
                    }
                    qm.auth.deleteAllAccessTokens(reason);
                },
                handleExpiredAccessTokenResponse: function(responseBody){
                    if(responseBody && qm.objectHelper.objectContainsString(responseBody, 'expired')){
                        qmService.rootScope.setUser(null);
                        qmService.auth.deleteAllAccessTokens("Got expired access token response");
                    }
                },
                socialLogin: function(connectorName, ev, additionalParams, successHandler, errorHandler){
                    if(!qm.getUser()){
                        qmService.login.setAfterLoginGoToState(qm.staticData.stateNames.onboarding);
                    }
                    //if(window && qmService.cordova.getPlugins() && qmService.cordova.getPlugins().googleplus){qmService.auth.googleLogout();}
                    qmService.showBasicLoader(30);
                    qm.connectorHelper.getConnectorByName(connectorName, function(connector){
                        return qmService.connectors.oAuthConnect(connector, ev, additionalParams, successHandler, errorHandler);
                    });
                },
                saveAccessTokenResponseAndGetUser: function(response){
                    qmLog.authDebug('Access token received', null, response);
                    qm.auth.saveAccessTokenResponse(response);
                    qmLog.authDebug('get user details from server and going to defaultState...');
                    qmService.showBlackRingLoader();
                    qmService.refreshUser(true).then(function(user){
                        qmService.hideLoader();
                        qmService.syncAllUserData();
                        qmLog.authDebug($state.current.name + ' qmService.fetchAccessTokenAndUserDetails got this user ', user);
                    }, function(error){
                        qmService.hideLoader();
                        qmLog.error($state.current.name + ' could not refresh user because ', error);
                    });
                },
                googleLogout: function(){
                    qmLog.authDebug('googleLogout so we care able to get serverAuthCode again if logging in a second time');
                    document.addEventListener('deviceready', deviceReady, false);
                    function deviceReady(){
                        /** @namespace qmService.cordova.getPlugins().googleplus */
                        qmService.cordova.getPlugins().googleplus.logout(function(msg){
                            qmLog.authDebug('plugins.googleplus.logout: logged out of google!', msg, msg);
                        }, function(error){
                            qmLog.authDebug('plugins.googleplus.logout: failed to logout', error, error);
                        });
                        qmService.cordova.getPlugins().googleplus.disconnect(function(msg){
                            qmLog.authDebug('plugins.googleplus.logout: disconnected google!');
                        });
                    }
                },
                completelyResetAppStateAndLogout: function(reason){
                    qmService.showBlackRingLoader(60);
                    qm.auth.logout();
                    qmService.completelyResetAppState(reason);
                    saveDeviceTokenToSyncWhenWeLogInAgain();
                    //qmService.goToState(qm.staticData.stateNames.intro);
                    $timeout(function(){ // Wait for above functions to complete
                        //document.location.href = 'index.html#/app/intro?logout=true';  // Try this if below doesn't work
                        document.location.href = 'index.html?logout=true';
                    }, 2000);
                    if(qm.platform.isMobile() || qm.platform.isChromeExtension()){
                        qmLog.info("Restarting app to enable opening login window again");
                        $timeout(function(){ // Wait for above functions to complete
                            //document.location.href = 'index.html#/app/intro?logout=true';  // Try this if below doesn't work
                            document.location.href = 'index.html?logout=true';
                        }, 2000);
                    }
                },
                showErrorAlertMessageOrSendToLogin: function(title, errorMessage){
                    if(errorMessage){
                        if(typeof errorMessage !== "string"){
                            errorMessage = JSON.stringify(errorMessage);
                        }
                        if(errorMessage.toLowerCase().indexOf('unauthorized') !== -1){
                            qm.auth.setAfterLoginGoToUrlAndSendToLogin(title + ": " + errorMessage);
                        }else{
                            qmService.showMaterialAlert(title, errorMessage);
                        }
                    }else{
                        qmLog.error("No error message provided to showErrorAlertMessageOrSendToLogin!");
                    }
                }
            },
            barcodeScanner: {
                scanResult: null,
                upcToAttach: null,
                noVariableResultsHandler: function(){
                    var scanResult = qmService.barcodeScanner.scanResult;
                    qmService.hideLoader();
                    var errorMessage = "I couldn't find anything matching barcode " + scanResult.format + " " + scanResult.text;
                    qmLog.error(errorMessage);
                    var userErrorMessage = errorMessage + ".  Try a manual search and " +
                        "I'll link the code to your selected variable so scanning should work in the future.";
                    qmService.barcodeScanner.upcToAttach = scanResult.text;
                    return userErrorMessage;
                },
                scanSuccessHandler: function(scanResult, params, variableSearchSuccessHandler, variableSearchErrorHandler){
                    qmService.barcodeScanner.scanResult = scanResult;
                    params = params || {};
                    qmLog.pushDebug("We got a barcode\n" + "Result: " + scanResult.text + "\n" + "Format: " + scanResult.format +
                        "\n" + "Cancelled: " + scanResult.cancelled);
                    var doneSearching = false;
                    $timeout(function(){
                        if(!doneSearching){
                            qmService.hideLoader();
                            variableSearchErrorHandler("variable search timeout");
                        }
                    }, 15000);
                    qmService.showBlackRingLoader();
                    params.upc = scanResult.text;
                    params.barcodeFormat = scanResult.format;
                    params.minimumNumberOfResultsRequiredToAvoidAPIRequest = 1;
                    qm.variablesHelper.getFromLocalStorageOrApi(params).then(function(variables){
                        variableSearchSuccessHandler(variables);
                        doneSearching = true;
                        qmService.hideLoader();
                    }, function(error){
                        qmLog.error(error);
                        doneSearching = true;
                        var userErrorMessage = qmService.barcodeScanner.noVariableResultsHandler(scanResult);
                        if(variableSearchErrorHandler){
                            variableSearchErrorHandler(userErrorMessage);
                        }else{
                            qmService.showMaterialAlert("No matches found", userErrorMessage);
                        }
                    });
                },
                scanBarcode: function(requestParams, variableSearchSuccessHandler, variableSearchErrorHandler){
                    requestParams = requestParams || {};
                    var scannerConfig = {
                        //preferFrontCamera : true, // iOS and Android
                        showFlipCameraButton: true, // iOS and Android
                        showTorchButton: true, // iOS and Android
                        torchOn: true, // Android, launch with the torch switched on (if available)
                        //saveHistory: true, // Android, save scan history (default false)
                        prompt: "Place a barcode inside the scan area", // Android
                        //resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                        //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                        //orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                        //disableAnimations : true, // iOS
                        //disableSuccessBeep: false // iOS and Android
                    };
                    if(qm.platform.isAndroid()){
                        scannerConfig.formats =
                            "QR_CODE," +
                            "DATA_MATRIX," +
                            //"UPC_E," + // False positives on Android
                            "UPC_A," +
                            "EAN_8," +
                            //"EAN_13," + // False positives on Android
                            "CODE_128," +
                            "CODE_39," +
                            "ITF";
                    }
                    /** @namespace cordova.plugins.barcodeScanner */
                    var testResult = false;
                    //var testResult = {format: "UPC_A", text: 311917110189};
                    //var testResult = {format: "UPC_A", text: 311917110182349};  // No results
                    if(testResult){
                        qmService.barcodeScanner.scanSuccessHandler(testResult, requestParams, variableSearchSuccessHandler, variableSearchErrorHandler);
                        return;
                    }
                    cordova.plugins.barcodeScanner.scan(function(result){
                        qmService.barcodeScanner.scanSuccessHandler(result, requestParams, variableSearchSuccessHandler, variableSearchErrorHandler);
                    }, function(error){
                        qmLog.error("Barcode scan failure! error: ", error);
                        qmService.showMaterialAlert("Barcode scan failed!", "Couldn't identify your barcode, but I'll look into it.  Please try a manual search in the meantime. ");
                    }, scannerConfig);
                },
                addUpcToVariableObject: function(variableObject){
                    if(!variableObject){
                        return;
                    }
                    if(qmService.barcodeScanner.upcToAttach){
                        variableObject.upc = qmService.barcodeScanner.upcToAttach;
                        qmService.barcodeScanner.upcToAttach = null;
                    }
                    return variableObject;
                },
                quaggaScan: function(){
                    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia || navigator.msGetUserMedia;
                    window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
                    function getUserMedia(constraints, success, failure){
                        navigator.getUserMedia(constraints, function(stream){
                            var videoSrc = (window.URL && window.URL.createObjectURL(stream)) || stream;
                            // eslint-disable-next-line no-useless-call
                            success.apply(null, [videoSrc]);
                        }, failure);
                    }
                    function initCamera(constraints, video, callback){
                        getUserMedia(constraints, function(src){
                            video.src = src;
                            video.addEventListener('loadeddata', function(){
                                var attempts = 10;
                                function checkVideo(){
                                    if(attempts > 0){
                                        if(video.videoWidth > 0 && video.videoHeight > 0){
                                            console.log(video.videoWidth + "px x " + video.videoHeight + "px");
                                            video.play();
                                            callback();
                                        }else{
                                            window.setTimeout(checkVideo, 100);
                                        }
                                    }else{
                                        callback('Unable to play video stream.');
                                    }
                                    attempts--;
                                }
                                checkVideo();
                            }, false);
                        }, function(e){
                            console.log(e);
                        });
                    }
                    function copyToCanvas(video, ctx){
                        (function frame(){
                            ctx.drawImage(video, 0, 0);
                            window.requestAnimationFrame(frame);
                        }());
                    }
                    window.addEventListener('load', function(){
                        var constraints = {
                                video: {
                                    mandatory: {
                                        minWidth: 1280,
                                        minHeight: 720
                                    }
                                }
                            },
                            video = document.createElement('video'),
                            canvas = document.createElement('canvas');
                        document.body.appendChild(video);
                        document.body.appendChild(canvas);
                        initCamera(constraints, video, function(){
                            canvas.setAttribute('width', video.videoWidth);
                            canvas.setAttribute('height', video.videoHeight);
                            copyToCanvas(video, canvas.getContext('2d'));
                        });
                    }, false);
                }
            },
            buttonClickHandlers: {
                generalButtonClickHandler: function(button, ev){
                    if(button.link && button.text && button.text.toLowerCase().indexOf('clipboard') !== -1){
                        button.text = 'Copied!';
                        clipboard.copyText(button.link);
                        qmService.showInfoToast('Copied link to clipboard!');
                        return;
                    }
                    if(button.link){
                        return qm.urlHelper.goToUrl(button.link);
                    }
                    if(!qmService.buttonClickHandlers[button.functionName]){
                        qmLog.error("qmService.buttonClickHandlers." + button.functionName + " is not defined!", button);
                        return;
                    }
                    if(!button.confirmationText){
                        qmService.buttonClickHandlers[button.functionName]();
                        return;
                    }
                    function yesCallback(){
                        if(button.successToastText){
                            qmService.showInfoToast(button.successToastText)
                        }
                        qmService.buttonClickHandlers[button.functionName]();
                    }
                    function noCallback(){
                        qmLog.info("Canceled " + button.text)
                    }
                    qmService.showMaterialConfirmationDialog(button.text, button.confirmationText, yesCallback, noCallback, ev, 'No');
                },
                vote: function(button){
                    qmService.postVoteToApi(button.parameters, function(){
                        qmLog.debug('upVote');
                    }, function(error){
                        qmLog.error('upVote failed!', error);
                    });
                },
                skipAll: function(button, card, successHandler){
                    qmService.showBasicLoader();
                    card.parameters = qm.objectHelper.copyPropertiesFromOneObjectToAnother(button.parameters, card.parameters, false);
                    qm.feed.addToFeedQueueAndRemoveFromFeed(card, function(nextCard){
                        qm.feed.postToFeedEndpointImmediately(card, function(feed){
                            if(successHandler){
                                successHandler(feed);
                            }
                            qmService.feed.broadcastGetCards();
                            qmService.hideLoader();
                        });
                    });
                }
            },
            connectors: {
                broadcastRefreshConnectors: function(){
                    if($state.current.name.toLowerCase().indexOf('import') !== -1){
                        qmLog.info("Broadcasting broadcastRefreshConnectors so manage reminders page is updated");
                        $rootScope.$broadcast('broadcastRefreshConnectors');
                    }else{
                        qmLog.info("NOT broadcasting broadcastRefreshConnectors because state is " + $state.current.name);
                    }
                },
                connectorErrorHandler: function(error){
                    qmLog.error(error);
                },
                connectWithToken: function(response, connector, successHandler, errorHandler){
                    qmLog.authDebug('connectWithToken: Connecting with  ', null, response);
                    var body = {connectorCredentials: {token: response}, connector: connector};
                    qm.api.post('api/v3/connectors/connect', body, function(response){
                        var connectors = qmService.connectors.storeConnectorResponse(response);
                        qmLog.authDebug("connectConnectorWithTokenDeferred response: ", response, response);
                        qmService.connectors.broadcastRefreshConnectors();
                        if(successHandler){
                            successHandler(response);
                        }
                    }, function(error){
                        qmService.connectors.broadcastRefreshConnectors();
                        qmService.connectors.connectorErrorHandler(error);
                        if(errorHandler){
                            errorHandler(error);
                        }
                    });
                },
                connectWithAuthCode: function(authorizationCode, connector, successHandler, errorHandler){
                    if(authorizationCode === "" || !authorizationCode){
                        var errorMessage = "No auth code provided to connectWithAuthCode";
                        qmLog.error(errorMessage);
                        if(errorHandler){
                            errorHandler(errorMessage);
                        }
                        return;
                    }
                    qmLog.debug(connector.name + ' connect result is ', authorizationCode);
                    var params = {noRedirect: true, code: authorizationCode};
                    function localSuccessHandler(response){
                        qmService.connectors.storeConnectorResponse(response);
                        qmService.connectors.broadcastRefreshConnectors();
                        if(successHandler){
                            successHandler(response);
                        }
                    }
                    qm.api.get('api/v3/connectors/' + connector.name + '/connect',
                        ['code', 'noRedirect'], params, function(response){
                        localSuccessHandler(response);
                    }, function(error){
                        if(error.error){
                            qmLog.error("connectWithAuthCode error.error: " + error.error, error, error);
                        }
                        if(error.user){
                            qmLog.error("connectWithAuthCode: Called error handler even though we got a user! Response: ",
                                error, {response: error});
                            localSuccessHandler(error.user);
                            return;
                        }
                        qmLog.error("error on connectWithAuthCode for " + connector.name + " is: ", error, error);
                        qmService.connectors.broadcastRefreshConnectors();
                        if(errorHandler){
                            errorHandler(error);
                        }
                    });
                },
                connectWithParams: function(params, lowercaseConnectorName, successHandler, errorHandler){
                    if(typeof lowercaseConnectorName !== "string"){
                        lowercaseConnectorName = lowercaseConnectorName.name;
                    }
                    qmService.connectConnectorWithParamsDeferred(params, lowercaseConnectorName)
                        .then(function(result){
                            qmLog.authDebug(JSON.stringify(result));
                            qmService.connectors.broadcastRefreshConnectors();
                            if(successHandler){
                                successHandler(result);
                            }
                        }, function(error){
                            qmService.connectors.connectorErrorHandler(error);
                            qmService.connectors.broadcastRefreshConnectors();
                            if(errorHandler){
                                errorHandler(error);
                            }
                        });
                },
                postConnectorCredentials: function(connectorName, credentials, successHandler, errorHandler){
                    qm.api.post('api/v3/connectors/' + connectorName + '/connect?noRedirect=true',
                        {connectorCredentials: credentials},
                        function(response){
                            qmLog.authDebug("postConnectorCredentials got response:", response, response);
                            qmService.connectors.storeConnectorResponse(response);
                            if(successHandler){
                                qmLog.authDebug("postConnectorCredentials calling successHandler with response from postConnectorCredentials:", response, response);
                                successHandler(response);
                            }else{
                                qmLog.authDebug("postConnectorCredentials: No success handler!", response, response);
                            }
                        }, function(error){
                            qmLog.error("postConnectorCredentials error: ", error, {
                                errorResponse: error,
                                connectorName: connectorName
                            });
                            if(errorHandler){
                                errorHandler(error);
                            }
                        });
                },
                qmApiMobileConnect: function(connector, ev, options){  // Uses promises instead of successHandler and errorHandler
                    qmLog.authDebug("qmService.connectors.qmApiMobileConnect for " + JSON.stringify(connector), null, connector);
                    var deferred = $q.defer();
                    if(window.cordova){
                        if(window.cordova.InAppBrowser){
                            //var redirect_uri = "http://localhost/callback";
                            var final_callback_url = qm.api.getQuantiModoUrl('api/v1/window/close');
                            if(options !== undefined){
                                if(options.hasOwnProperty("redirect_uri")){
                                    final_callback_url = options.redirect_uri;
                                }
                            }
                            qmLog.authDebug("qmApiMobileConnect login: Setting final_callback_url to " + final_callback_url);
                            var url = qm.api.getExpressUrl('api/v1/connectors/' + connector.name + '/connect?client_id=' +
                                qm.api.getClientId() + '&final_callback_url=' + encodeURIComponent(final_callback_url))
                                //+ '&client_secret=' + qm.api.getClientSecret());
                            if(options){
                                url = qm.urlHelper.addUrlQueryParamsToUrlString(options, url)
                            }
                            var browserRef = window.cordova.InAppBrowser.open(url, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
                            browserRef.addEventListener('loadstart', function(event){
                                if((event.url).indexOf(final_callback_url) === 0){
                                    var accessToken = qm.urlHelper.getParameterFromEventUrl(event, 'sessionToken');
                                    if(!accessToken){
                                        accessToken = qm.urlHelper.getParameterFromEventUrl(event, 'accessToken');
                                    }
                                    qmLog.authDebug("qmApiMobileConnect login: Got access token " + accessToken + " from url " + event.url);
                                    qm.auth.saveAccessToken(accessToken);
                                    if(!qm.getUser()){
                                        qmLog.authDebug("qmApiMobileConnect login: Refreshing user");
                                        qmService.login.setAfterLoginGoToState(qm.staticData.stateNames.onboarding);
                                        qmService.showBasicLoader();
                                        qmService.refreshUser(true).then(function(user){
                                            qmLog.authDebug("Got user: " + JSON.stringify(user));
                                            deferred.resolve(user);
                                        }, function(error){
                                            deferred.reject(error)
                                        });
                                    }else{
                                        qmLog.authDebug("qmApiMobileConnect login: Getting connectors");
                                        qmService.refreshConnectors().then(function(connectors){
                                            qmLog.authDebug("qmApiMobileConnect login: Got connectors");
                                            deferred.resolve(connectors);
                                        }, function(error){
                                            deferred.reject(error)
                                        });
                                    }
                                    browserRef.close();
                                }
                            });
                            browserRef.addEventListener('exit', function(event){
                                qmLog.error("qmApiMobileConnect login: The sign in flow was canceled: " + JSON.stringify(event), null, event);
                                deferred.reject("The sign in flow was canceled");
                            });
                        }else{
                            qmLog.error("qmApiMobileConnect login: Could not find InAppBrowser plugin");
                            deferred.reject("Could not find InAppBrowser plugin");
                        }
                    }else{
                        qmLog.error("qmApiMobileConnect login: Cannot authenticate via a web browser");
                        deferred.reject("Cannot authenticate via a web browser");
                    }
                    return deferred.promise;
                },
                getConnectUrl: function(connector, params){
                    var url = qm.api.getExpressUrl('/auth/' + connector.name);
                    params.final_callback_url = window.location.href;
                    if(qm.platform.isChromeExtension()){params.final_callback_url = chrome.identity.getRedirectURL();}
                    params.clientId = qm.api.getClientId();
                    url = qm.urlHelper.addUrlQueryParamsToUrlString(params, url);
                    console.info('Going to ' + url);
                    return url;
                },
                webConnectViaRedirect: function(connector, ev, additionalParams){
                    qmService.showInfoToast("Connecting " + connector.displayName + "...", 30);
                    qmService.showBasicLoader();
                    qm.auth.setAfterLoginGoToUrl(window.location.href);
                    var url = qmService.connectors.getConnectUrl(connector, additionalParams);
                    window.location.href = url;
                },
                webConnectViaPopup: function(connector, ev, additionalParams){
                    /** @namespace connector.connectInstructions */
                    var url = qmService.connectors.getConnectUrl(connector, additionalParams);
                    if(qm.platform.isChromeExtension()){
                        chrome.identity.launchWebAuthFlow({url: url, interactive: true}, function(responseUrl){
                            console.info('chrome.identity.launchWebAuthFlow responseUrl ' + responseUrl);
                            var value = qm.urlHelper.getParam('accessToken', responseUrl);
                            if(!value){
                                value = qm.urlHelper.getParam('sessionToken', responseUrl);
                            }
                            qmService.auth.saveAccessTokenResponseAndGetUser(value);
                            qmService.refreshConnectors();
                        });
                        return;
                    }
                    url = qm.urlHelper.addUrlQueryParamsToUrlString({popup: true}, url);
                    //url = connector.connectInstructions.url;  // TODO: Should we just send to the /connect endpoint above and let API redirect?
                    var ref = window.open(url, '', "width=600,height=800");
                    if(!ref){
                        qmService.showMaterialAlert("Login Popup Blocked", "Please unblock popups by clicking the icon on the right of the address bar to login.", ev);
                        qmLog.error("Login Popup Blocked");
                    }else{
                        qm.auth.openBrowserWindowAndGetParameterFromRedirect(url, qm.auth.getRedirectUri(), 'accessToken', function(accessToken){
                            qmService.saveAccessTokenResponseAndGetUser(accessToken);
                        }, ref);
                        qmLog.info('Opened connectInstructions.url ' + url);
                        qm.urlHelper.addEventListenerAndGetParameterFromRedirectedUrl(ref, 'sessionToken', function(sessionToken){
                            qmService.saveAccessTokenResponseAndGetUser(sessionToken);
                        });
                    }
                },
                webConnect: function(connector, ev, additionalParams){
                    additionalParams = additionalParams || {};
                    if(!$rootScope.platform.isWeb && !$rootScope.platform.isChromeExtension){
                        return false;
                    }
                    var isIframe = qm.windowHelper.isIframe();
                    var usePopup = false;
                    if(qm.platform.isChromeExtension()){
                        usePopup = true;
                    }
                    if(isIframe && connector.name.indexOf('google') !== -1){
                        usePopup = true;
                    }
                    if(usePopup){
                        qmService.pusher.loginRedirectionSubscribe();
                        qmService.connectors.webConnectViaPopup(connector, ev, additionalParams);
                    }else{  // Can't use popup if logging in because it's hard to get the access token from a separate window
                        qmService.connectors.webConnectViaRedirect(connector, ev, additionalParams);
                    }
                    return true;
                },
                oAuthMobileConnect: function(connector, ev, options, successHandler, errorHandler){  // This would be ideal because it's universal but I'm getting too many redirects errors.  Maybe try again after releasing fixes to production API
                    if(connector.mobileConnectMethod === 'google'){
                        qmService.connectors.googleMobileConnect(connector, ev, options, successHandler, errorHandler);
                    }else if(connector.mobileConnectMethod === 'facebook'){
                        qmService.connectors.facebookMobileConnect(connector, ev, options, successHandler, errorHandler);
                    }else{
                        qmService.connectors.qmApiMobileConnect(connector, ev, options) // qmApiMobileConnect uses promises instead of successHandler and errorHandler
                            .then(function(userOrConnectors){
                                if(successHandler){
                                    successHandler(userOrConnectors);
                                }
                            }, function(error){
                                if(errorHandler){
                                    errorHandler(error);
                                }
                            });
                    }
                },
                oAuthConnect: function(connector, ev, additionalParams, successHandler, errorHandler){
                    qmLog.info("qmService.connectors.oAuthConnect for " + JSON.stringify(connector), null, connector);
                    if($rootScope.platform.isWeb || $rootScope.platform.isChromeExtension){
                        qmService.connectors.webConnect(connector, ev, additionalParams);
                        return;
                    }
                    qmService.connectors.oAuthMobileConnect(connector, ev, additionalParams, successHandler, errorHandler);
                },
                googleLogout: function(callback){
                    qmService.cordova.getPlugins().googleplus.logout(function(msg){
                        qmLog.authDebug('plugins.googleplus.logout: logged out of google so we should get a serverAuthCode now', msg, msg);
                        callback();
                    }, function(error){
                        qmLog.error('plugins.googleplus.logout: failed to logout but going to try logging in anyway', error, error);
                        callback();
                    });
                },
                googleMobileConnect: function(connector, ev, additionalParams, successHandler, errorHandler){
                    qmLog.info("qmService.connectors.googleMobileConnect for " + JSON.stringify(connector), null, connector);
                    document.addEventListener('deviceready', deviceReady, false);
                    function deviceReady(){
                        qmLog.authDebug("plugins.googleplus.login deviceReady: ", connector, connector);
                        var scopes = connector.scopes.join(" ");
                        var params = {
                            'scopes': scopes, // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
                            'webClientId': '1052648855194.apps.googleusercontent.com', // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
                            'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
                        };
                        qmLog.authDebug("plugins.googleplus.login with params: ", params, params);
                        qmService.showBasicLoader();
                        function googleLoginSuccessHandler(googleResponse, connector){
                            if(!connector){
                                qmLog.error("No connector in googleLoginSuccessHandler!")
                            }else{
                                qmLog.authDebug("have connector in googleLoginSuccessHandler")
                            }
                            qmService.connectors.postConnectorCredentials(connector.name, googleResponse, function(qmResponse){
                                qmLog.authDebug("plugins.googleplus.login hiding loader because we got response from connectWithAuthCode:", qmResponse, qmResponse);
                                qmService.hideLoader();
                                if(successHandler){
                                    qmLog.authDebug("plugins.googleplus.login calling successHandler with response from connectWithAuthCode:", qmResponse, qmResponse);
                                    successHandler(qmResponse);
                                }else{
                                    qmLog.authDebug("plugins.googleplus.login: No success handler!", qmResponse, qmResponse);
                                }
                            }, function(error){
                                qmService.hideLoader();
                                qmLog.error("plugins.googleplus.login error: ", error, {
                                    errorResponse: error,
                                    params: params
                                });
                                if(errorHandler){
                                    errorHandler(error);
                                }
                            });
                        }
                        qmService.cordova.getPlugins().googleplus.login(params, function(googleResponse){
                            qmLog.authDebug('plugins.googleplus.login response:', googleResponse, googleResponse);
                            if(!googleResponse.serverAuthCode || googleResponse.serverAuthCode === ""){
                                qmLog.error("plugins.googleplus.login: no serverAuthCode so logging out of Google and trying again");
                                qmService.connectors.googleLogout(function(){
                                    qmService.cordova.getPlugins().googleplus.login(params, function(googleResponse){
                                        if(!connector){
                                            qmLog.error("No connector after logout and login!")
                                        }else{
                                            qmLog.authDebug("have connector after logout and login")
                                        }
                                        qmLog.authDebug('plugins.googleplus.login response:', googleResponse, googleResponse);
                                        googleLoginSuccessHandler(googleResponse, connector);
                                    });
                                });
                            }else{
                                if(!connector){
                                    qmLog.error("No connector after login!")
                                }else{
                                    qmLog.authDebug("have connector after login")
                                }
                                qmLog.authDebug("plugins.googleplus.login: got this serverAuthCode " + googleResponse.serverAuthCode, googleResponse, googleResponse);
                                googleLoginSuccessHandler(googleResponse, connector);
                            }
                        }, function(errorMessage){
                            qmService.hideLoader();
                            if(errorHandler){
                                errorHandler(errorMessage);
                            }
                            qmService.showMaterialAlert("Google Login Issue", JSON.stringify(errorMessage));
                            qmLog.error("plugins.googleplus.login could not get userData from Google!  Fallback to qmService.nonNativeMobileLogin registration. Error Message: " +
                                JSON.stringify(errorMessage), null, params);
                        });
                    }
                },
                facebookMobileConnect: function(connector, ev, additionalParams, successHandler, errorHandler){
                    qmLog.authDebug("qmService.connectors.facebookMobileConnect for " + JSON.stringify(connector), null, connector);
                    function fbSuccessHandler(result){
                        qmService.showBasicLoader(15);
                        qmLog.authDebug("qmService.connectors.facebookMobileConnect success result: " + JSON.stringify(result), null, result);
                        qmService.connectors.connectWithToken(result, connector, successHandler, errorHandler);
                    }
                    function fbErrorHandler(error){
                        qmLog.error("qmService.connectors.facebookMobileConnect for " + JSON.stringify(error), null, error);
                        qmService.connectors.connectorErrorHandler(error);
                        if(errorHandler){
                            errorHandler(error);
                        }
                    }
                    function useNativeLogin(){
                        if(typeof facebookConnectPlugin === "undefined"){
                            return false;
                        }
                        if(qm.platform.isIOS() && qm.getClientId().indexOf('moodimodo') === -1){
                            qmLog.authDebug("We can only specify one iOS app in Facebook so using web connect");
                            return false;
                        }
                        return true;
                    }
                    if(useNativeLogin()){
                        qmLog.authDebug("qmService.connectors.facebookMobileConnect for " +
                            JSON.stringify(connector.scopes), null, connector);
                        facebookConnectPlugin.login(connector.scopes, fbSuccessHandler, fbErrorHandler);
                    }else{
                        qmLog.authDebug("qmService.connectors.facebookMobileConnect no facebookConnectPlugin so falling back to qmService.connectors.oAuthConnect", null, connector);
                        qmService.connectors.qmApiMobileConnect(connector, ev, additionalParams, fbSuccessHandler, fbErrorHandler);
                    }
                },
                storeConnectorResponse: function(response){
                    if(response.user){
                        qmService.setUser(response.user)
                    }
                    return qm.connectorHelper.storeConnectorResponse(response);
                },
                weatherConnect: function(connector, $scope, successHandler, errorHandler){
                    if(!connector){
                        qm.connectorHelper.getConnectorByName('weather', function(connector){
                            showPopup(connector, $scope);
                        });
                    }else{
                        showPopup(connector, $scope);
                    }
                    function showPopup(connector, $scope){
                        $scope.data = {};
                        var myPopup = $ionicPopup.show({
                            template: '<label class="item item-input">' +
                                '<i class="icon ion-android-locate placeholder-icon"></i>' +
                                '<input id="postal-code-input" type="text" placeholder="Postal Code" ng-model="data.zip"></label>',
                            title: connector.displayName,
                            subTitle: 'Enter your zip code or postal code',
                            scope: $scope,
                            buttons: [
                                {text: 'Cancel'},
                                {
                                    text: '<b>Save</b>',
                                    type: 'button-positive',
                                    onTap: function(e){
                                        if(!$scope.data.zip){
                                            e.preventDefault();
                                        }else{
                                            return $scope.data.zip;
                                        }
                                    }
                                }
                            ]
                        });
                        myPopup.then(function(res){
                            qmService.showInfoToast("Connecting weather...");
                            if(successHandler){successHandler();}
                            if(errorHandler){errorHandler();}
                            qmService.connectors.connectWithParams({zip: res}, connector.name);
                        });
                    }
                }
            },
            cordova: {
                getPlugins: function(){
                    if(!window.plugins){
                        qmLog.error("window.plugins not defined!  Did you use deviceReady event wrapper?");
                        return {};
                    }else{
                        return window.plugins;
                    }
                }
            },
            deploy: {
                fetchUpdate: function(){
                    if(!qmService.deploy.chcpIsDefined()){
                        return false;
                    }
                    qmService.deploy.setVersionInfo();
                    var options = {};
                    // var options = {'config-file': 'https://s3.amazonaws.com/qm-cordova-hot-code-push/chcp.json'};
                    // qmLog.info("Checking for CHCP updates at " + options['config-file']);
                    // noinspection Annotator
                    chcp.fetchUpdate(qmService.deploy.updateCallback, null);
                },
                chcpError: function(message, metaData){
                    metaData = metaData || {};
                    metaData.chcpInfo = qmLog.globalMetaData.chcpInfo;
                    metaData.chcpConfig = qm.staticData.chcp;
                    qmLog.error("CHCP: " + message, metaData);
                },
                installUpdate: function(){
                    qmLog.info('CHCP installUpdate...');
                    // noinspection Annotator
                    chcp.installUpdate(function(error){
                        qmService.deploy.setVersionInfo();
                        if(error){
                            qmLog.globalMetaData.chcpInfo.error = error;
                            qmService.deploy.chcpError('CHCP Install ERROR: ' + JSON.stringify(error));
                            qmService.showMaterialAlert('Update error ' + error.code)
                        }else{
                            // Automatically restarts
                            //navigator.app.loadUrl("file:///android_asset/www/index.html");
                            qmLog.info('CHCP Update installed...');
                        }
                    });
                },
                updateCallback: function(error, data){
                    qmLog.globalMetaData = qmLog.globalMetaData || {};
                    qmLog.globalMetaData.chcpInfo = qmLog.globalMetaData.chcpInfo || {};
                    if(error){
                        qmLog.globalMetaData.chcpInfo.error = error;
                    }
                    if(data){
                        qmLog.globalMetaData.chcpInfo.data = data;
                    }
                    if(error){
                        qmService.deploy.chcpError("CHCP updateCallback ERROR: ", {error: error, data: data});
                    }else{
                        qmLog.info('CHCP update is loaded: ', data);
                        qmService.deploy.installUpdate(qmService.deploy.installUpdateCallback);
                        // var title = 'Update available';
                        // var textContent = 'An update was just downloaded. Would you like to restart your app to use the latest features?';
                        // var noText = 'Not now';
                        // function yesCallback() {qmService.deploy.installUpdate();}
                        // function noCallback() {}
                        // qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, null, noText);
                    }
                },
                installUpdateCallback: function(error){
                    if(error){
                        qmService.deploy.chcpError("CHCP installUpdateCallback ERROR:", error);
                        // failed to install the update, should handle this gracefuly;
                        // probably nothing that user can do, just let him in the app.
                    }else{
                        qmService.deploy.chcpError("CHCP installUpdateCallback Success!");
                        // update installed and user can proceed;
                        // and he will, since the plugin will reload app to the index page.
                    }
                },
                chcpIsDefined: function(){
                    if(!qm.platform.isMobile()){
                        return false;
                    }
                    if(typeof chcp === "undefined"){
                        qmService.deploy.chcpError("chcp not defined");
                        return false;
                    }
                    return true;
                },
                setVersionInfo: function(){
                    if(!qmService.deploy.chcpIsDefined()){
                        return false;
                    }
                    chcp.getVersionInfo(function(error, versionInfo){
                        if(error){
                            qmLog.globalMetaData.chcpInfo.error = error;
                            qmService.deploy.chcpError("CHCP VERSION ERROR: " + JSON.stringify(qmLog.globalMetaData.chcpInfo));
                        }
                        if(versionInfo){
                            qmLog.globalMetaData.chcpInfo.versionInfo = versionInfo;
                        }
                        qm.api.getViaXhrOrFetch('chcp.json', function(chcpConfig){
                            if(!chcpConfig){
                                qmLog.error("No chcp.json config!");
                            }
                            if(chcpConfig){
                                qmLog.globalMetaData.chcpInfo.chcpConfig = chcpConfig;
                            }
                            qmLog.info('CHCP VERSION DATA: ', qmLog.globalMetaData.chcpInfo);
                        }, function(error){
                            if(error){
                                qmLog.globalMetaData.chcpInfo.error = error;
                                qmService.deploy.chcpError("CHCP VERSION ERROR: " + JSON.stringify(qmLog.globalMetaData.chcpInfo));
                            }
                        });
                    });
                }
            },
            dialogs: {
                mayISpeak: function(callback, ev){
                    var title = 'Hi!';
                    var textContent = "May I speak to you?";
                    var noText = 'No';
                    function yesCallback(){
                        qm.speech.setSpeechEnabled(true);
                        if(callback){
                            callback(true);
                        }
                    }
                    function noCallback(){
                        qm.speech.setSpeechEnabled(false);
                        qm.robot.hide();
                        if(callback){
                            callback(false);
                        }
                    }
                    qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev, noText);
                }
            },
            dialogFlow: {
                currentIntent: null,
                fulfillIntent: function(userInput, successHandler, errorHandler){
                    var intent = qm.dialogFlow.getIntent(userInput);
                    if(!intent){
                        if(qm.mic.wildCardHandler && qm.dialogFlow.matchedIntent){
                            qm.mic.wildCardHandler(userInput);
                            return true;
                        }else{
                            intent = qm.staticData.dialogAgent.intents['Default Fallback Intent'];
                            qmService.dialogFlow.intents[intent.name](intent, userInput);
                            return;
                        }
                    }
                    qmLog.info("intent: ", intent);
                    var unfilledParam = qm.dialogFlow.getUnfilledParameter(intent);
                    if(unfilledParam){
                        var prompt = unfilledParam.prompts[0].value;
                        qm.speech.talkRobot(prompt);
                        qm.dialogFlow.matchedIntent = intent;
                        qm.mic.wildCardHandler = function(userInput){
                            intent.parameters[unfilledParam.name] = userInput;
                            qmService.dialogFlow.intents[intent.name](intent, userInput);
                        };
                        return;
                    }
                    qm.dialogFlow.matchedIntent = null;
                    qmService.dialogFlow.intents[intent.name](intent, userInput);
                },
                intents: {
                    "Answer Question Intent": function(intent){
                        qmLog.info("intent: ", intent);
                    },
                    "Ask Question Intent": function(intent){
                        qmLog.info("intent: ", intent);
                    },
                    "Cancel Intent": function(intent){
                        qm.speech.talkRobot(intent.responses.messages.speech);
                        qm.dialogFlow.matchedIntent = null;
                        qm.mic.abortListening();
                        qmService.goToDefaultState();
                    },
                    "Create Reminder Intent": function(intent, successHandler){
                        qm.variablesHelper.getFromLocalStorageOrApi({searchPhrase: intent.parameters.variableName})
                            .then(function(variable){
                                qmService.reminders.addToRemindersUsingVariableObject(variable, {
                                    skipReminderSettingsIfPossible: true,
                                    doneState: "false"
                                }, successHandler);
                            });
                    },
                    "Default Fallback Intent": function(intent, userInput){
                        qmLog.info("intent: ", intent);
                        var instruction = intent.responses[0].messages[0].speech[0];
                        qm.speech.talkRobot(instruction);
                        var askQuestionIntent = qm.staticData.dialogAgent.intents['Ask Question Intent'];
                        askQuestionIntent.parameters = {
                            question: userInput,
                            recipientUserId: 230,
                            intent: 'Ask Question Intent'
                        };
                        qm.feed.postToFeedEndpointImmediately(askQuestionIntent.parameters)
                    },
                    "Default Welcome Intent": function(intent){
                        qmLog.info("intent: ", intent);
                    },
                    "Done With Category Intent": function(intent){
                        qmLog.info("intent: ", intent);
                    },
                    "Help Intent": function(intent){
                        qmLog.info("intent: ", intent);
                    },
                    "Knowledge.KnowledgeBase.MTQ3ODYxNjIwMDE1ODc0NzAzMzY": function(intent){
                        qmLog.info("intent: ", intent);
                    },
                    "Record Measurement Intent": function(intent){
                        qmLog.info("intent: ", intent);
                    },
                    "Record Symptom Intent": function(intent){
                        qm.measurements.saveMeasurement(intent.parameters);
                    },
                    "Tracking Reminder Notification Intent": function(intent){
                        qmLog.info("intent: ", intent);
                        var card = qm.feed.currentCard;
                        card.parameters = qm.objectHelper.copyPropertiesFromOneObjectToAnother(intent.parameters, card.parameters, false);
                        qm.feed.addToFeedQueueAndRemoveFromFeed(card, function(nextCard){
                            if(card.followUpAction){
                                card.followUpAction();
                            }
                        });
                    }
                }
            },
            email: {
                postInvitation: function(callback, $scope){
                    if(!$scope.data){$scope.data = {};}
                    if(!$scope.data.email){$scope.data.email = null;}
                    var myPopup = $ionicPopup.show({
                        template: '<label class="item item-input">' +
                            '<i class="icon ion-email placeholder-icon"></i>' +
                            '<input type="email" placeholder="Email" ng-model="data.email"></label>',
                        title: 'Enter Email',
                        subTitle: 'Invite someone to share their data',
                        scope: $scope,
                        buttons: [
                            {text: 'Cancel'},
                            {
                                text: '<b>Save</b>',
                                type: 'button-positive',
                                onTap: function(e){
                                    if(!$scope.data.email){
                                        //don't allow the user to close unless he enters email
                                        e.preventDefault();
                                    }else{
                                        return $scope.data;
                                    }
                                }
                            }
                        ]
                    });
                    myPopup.then(function(res){
                        qmService.showInfoToast("Inviting "+$scope.data.email+" via email");
                        qm.api.post('v1/shares/invitePatient',{email: $scope.data.email},
                            function(response){
                                if(callback){callback();}
                            }, function(error){
                                if(callback){callback();}
                            });
                    });
                },
                updateEmailAndExecuteCallback: function(callback){
                    var $scope = {};
                    if($rootScope.user.email){
                        $scope.data = {
                            email: $rootScope.user.email
                        };
                    }
                    var myPopup = $ionicPopup.show({
                        template: '<label class="item item-input">' +
                            '<i class="icon ion-email placeholder-icon"></i>' +
                            '<input type="email" placeholder="Email" ng-model="data.email"></label>',
                        title: 'Update Email',
                        subTitle: 'Enter Your Email Address',
                        scope: $scope,
                        buttons: [
                            {text: 'Cancel'},
                            {
                                text: '<b>Save</b>',
                                type: 'button-positive',
                                onTap: function(e){
                                    if(!$scope.data.email){
                                        //don't allow the user to close unless he enters email
                                        e.preventDefault();
                                    }else{
                                        return $scope.data;
                                    }
                                }
                            }
                        ]
                    });
                    myPopup.then(function(res){
                        qmService.updateUserSettingsDeferred({email: $scope.data.email});
                        $rootScope.user.email = $scope.data.email;
                        if(callback){
                            callback();
                        }
                    });
                },
                sendEmailAfterVerification: function(emailType){
                    var verifyEmailAddressAndExecuteCallback = function(callback){
                        if($rootScope.user.email || $rootScope.user.userEmail){
                            callback();
                            return;
                        }
                        qmService.updateEmailAndExecuteCallback(callback);
                    };
                    var sendCouponEmail = function(){
                        qmService.sendEmailViaAPIDeferred('couponInstructions');
                        qmService.showMaterialAlert('Coupon Redemption', 'Please go check your email at ' + $rootScope.user.email + ' for instructions to redeem your coupon.');
                    };
                    var sendFitbitEmail = function(){
                        qmService.sendEmailViaAPIDeferred('fitbit');
                        qmService.showMaterialAlert('Get Fitbit', 'Please check your email at ' + $rootScope.user.email + ' for instructions to get and connect Fitbit.');
                    };
                    var sendChromeEmail = function(){
                        qmService.sendEmailViaAPIDeferred('chrome');
                        qmService.showMaterialAlert('Get the Chrome Extension', 'Please check your email at ' + $rootScope.user.email + ' for your link.');
                    };
                    if(emailType === 'couponInstructions'){
                        verifyEmailAddressAndExecuteCallback(sendCouponEmail);
                    }
                    if(emailType === 'fitbit'){
                        verifyEmailAddressAndExecuteCallback(sendFitbitEmail);
                    }
                    if(emailType === 'chrome'){
                        verifyEmailAddressAndExecuteCallback(sendChromeEmail);
                    }
                },
            },
            feed: {
                broadcastGetCards: function(){
                    if($state.current.name === qm.staticData.stateNames.feed){
                        qmLog.info("Broadcasting broadcastGetCards");
                        $rootScope.$broadcast('broadcastGetCards');
                    }else{
                        qmLog.info("NOT broadcasting broadcastGetCards because state is " + $state.current.name);
                    }
                }
            },
            healthKit: {
                sampleTypes: {
                    'HKQuantityTypeIdentifierBasalBodyTemperature': {unit: 'degF'},
                    'HKQuantityTypeIdentifierDietaryEnergyConsumed': {unit: 'kilocalorieUnit'},
                    'HKQuantityTypeIdentifierDietaryFatTotal': {unit: 'gramUnit'},
                    'HKQuantityTypeIdentifierDistanceWalkingRunning': {unit: 'meterUnit'},
                    'HKQuantityTypeIdentifierHeight': {unit: 'footUnit'},
                    'HKQuantityTypeIdentifierStepCount': {unit: 'countUnit'},
                },
                postData: function(data){
                    var caller = arguments.callee.caller.name;
                    console.log(caller+": "+JSON.stringify(data));
                },
                available: function () {
                    window.plugins.healthkit.available(
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                requestAuthorization: function () {
                    var supportedTypes = [
                        'HKQuantityTypeIdentifierHeight',
                        'HKQuantityTypeIdentifierStepCount',
                        'HKQuantityTypeIdentifierDistanceWalkingRunning',
                        'HKCategoryTypeIdentifierSleepAnalysis',
                        'HKQuantityTypeIdentifierDietaryEnergyConsumed',
                        'HKQuantityTypeIdentifierDietaryFatTotal'
                    ];
                    window.plugins.healthkit.requestAuthorization(
                        {
                            readTypes: supportedTypes,
                            writeTypes: supportedTypes
                        },
                        function () {
                            // qmService.healthKit.findWorkouts();
                            // qmService.healthKit.readBloodType();
                            // qmService.healthKit.readDateOfBirth();
                            // qmService.healthKit.readFitzpatrickSkinType();
                            // qmService.healthKit.readGender();
                            // qmService.healthKit.readHeight();
                            // qmService.healthKit.readWeight();
                            for (var type in qmService.healthKit.sampleTypes){
                                if(qmService.healthKit.sampleTypes.hasOwnProperty(type)){
                                    var req = {
                                        'startDate': new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // three days ago
                                        'endDate': new Date(), // now
                                        'sampleType': type,
                                        //'sampleType': 'HKQuantityTypeIdentifierStepCount', // anything in HealthKit/HKTypeIdentifiers.h
                                        'unit': qmService.healthKit.sampleTypes[type] // make sure this is compatible with the sampleType
                                    };
                                    qmService.healthKit.querySampleType(req);
                                }
                            }
                        },
                        function () {
                            alert('nok')
                        }
                    );
                },
                checkAuthStatus: function () {
                    window.plugins.healthkit.checkAuthStatus(
                        {
                            'type': 'HKQuantityTypeIdentifierHeight'
                        },
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                readDateOfBirth: function () {
                    window.plugins.healthkit.readDateOfBirth(
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                readGender: function () {
                    window.plugins.healthkit.readGender(
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                readBloodType: function () {
                    window.plugins.healthkit.readBloodType(
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                readFitzpatrickSkinType: function () {
                    window.plugins.healthkit.readFitzpatrickSkinType(
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                saveWeight: function () {
                    window.plugins.healthkit.saveWeight({
                            'requestReadPermission': false, // use if your app doesn't need to read
                            'unit': 'kg',
                            'amount': 78.5,
                            'date': new Date() // is 'now', which is the default as well
                        },
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                readWeight: function () {
                    window.plugins.healthkit.readWeight(
                        {
                            'requestWritePermission': true, // use if your app doesn't need to write
                            'unit': 'kg'
                        },
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                saveHeight: function () {
                    window.plugins.healthkit.saveHeight({
                            'requestReadPermission': false,
                            'unit': 'cm', // m|cm|mm|in|ft
                            'amount': 187
                        },
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                readHeight: function () {
                    window.plugins.healthkit.readHeight({
                            'requestWritePermission': false,
                            'unit': 'cm' // m|cm|mm|in|ft
                        },
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                findWorkouts: function () {
                    window.plugins.healthkit.findWorkouts({},
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                saveWorkout: function () {
                    window.plugins.healthkit.saveWorkout({
                            //'requestReadPermission' : false,
                            'activityType': 'HKWorkoutActivityTypeCycling', // HKWorkoutActivityType constant (https://developer.apple.com/library/ios/documentation/HealthKit/Reference/HKWorkout_Class/#//apple_ref/c/tdef/HKWorkoutActivityType)
                            'quantityType': 'HKQuantityTypeIdentifierDistanceCycling',
                            'startDate': new Date(), // mandatory
                            'endDate': null, // optional, use either this or duration
                            'duration': 3600, // in seconds, optional, use either this or endDate
                            'energy': 300, //
                            'energyUnit': 'kcal', // J|cal|kcal
                            'distance': 11, // optional
                            'distanceUnit': 'km' // probably useful with the former param
                            // 'extraData': "", // Not sure how necessary this is
                        },
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                querySampleType: function (params) {
                    window.plugins.healthkit.querySampleType(
                        params,
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                querySampleTypeAggregated: function () {
                    window.plugins.healthkit.querySampleTypeAggregated(
                        {
                            'startDate': new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // three days ago
                            'endDate': new Date(), // now
                            'aggregation': 'week', // 'hour', 'week', 'year' or 'day', default 'day'
                            'sampleType': 'HKQuantityTypeIdentifierStepCount', // any HKQuantityType
                            'unit': 'count' // make sure this is compatible with the sampleType
                        },
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                // to test, set a few 'weight' samples, then run this
                deleteSamples: function () {
                    window.plugins.healthkit.deleteSamples(
                        {
                            'startDate': new Date(new Date().getTime() - 60 * 60 * 1000), // an hour ago
                            'endDate': new Date(), // now
                            'sampleType': 'HKQuantityTypeIdentifierBodyMass'
                        },
                        qmService.healthKit.postData,
                        qmService.healthKit.postData
                    );
                },
                // this is work in progress
                monitorSampleType: function () {
                    window.plugins.healthkit.monitorSampleType(
                        {
                            'sampleType': 'HKCategoryTypeIdentifierSleepAnalysis'
                        },
                        function (value) {
                            // this gets called when a new sample is available (can then be fetched by a different function)
                            console.log("Sleep (webview): " + value);
                        },
                        qmService.healthKit.postData
                    );
                },
                sumQuantityType: function () {
                    window.plugins.healthkit.sumQuantityType(
                        {
                            'startDate': new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000), // three days ago
                            'endDate': new Date(), // now
                            'sampleType': 'HKQuantityTypeIdentifierStepCount'
                        },
                        function (value) {
                            alert("Success for running step query " + value);
                        },
                        qmService.healthKit.postData
                    );
                },
                saveQuantitySample_StepCount: function () {
                    window.plugins.healthkit.saveQuantitySample(
                        {
                            'startDate': new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // a day ago
                            'endDate': new Date(), // now
                            'sampleType': 'HKQuantityTypeIdentifierStepCount', // make sure you request write access beforehand
                            'unit': 'count',
                            'amount': 300
                        },
                        function (value) {
                            alert("Success running saveQuantitySample, result: " + value);
                        },
                        qmService.healthKit.postData
                    );
                },
                saveQuantitySample_Energy: function () {
                    window.plugins.healthkit.saveQuantitySample(
                        {
                            'startDate': new Date(), // now
                            'endDate': new Date(), // now
                            'sampleType': 'HKQuantityTypeIdentifierDietaryEnergyConsumed', // make sure you request write access beforehand
                            'unit': 'kcal',
                            'amount': 64
                        },
                        function (value) {
                            alert("Success running saveQuantitySample, result: " + value);
                        },
                        qmService.healthKit.postData
                    );
                },
                saveCorrelation: function () {
                    window.plugins.healthkit.saveCorrelation(
                        {
                            'startDate': new Date(), // now
                            'endDate': new Date(), // now
                            'metadata': {'a': 'b'},
                            'correlationType': 'HKCorrelationTypeIdentifierFood', // don't request write permission for this
                            'samples': [
                                {
                                    'startDate': new Date(),
                                    'endDate': new Date(),
                                    'sampleType': 'HKQuantityTypeIdentifierDietaryEnergyConsumed', // make sure you request write access beforehand
                                    'unit': 'kcal',
                                    'amount': 500
                                },
                                {
                                    'startDate': new Date(),
                                    'endDate': new Date(),
                                    'sampleType': 'HKQuantityTypeIdentifierDietaryFatTotal', // make sure you request write access beforehand
                                    'unit': 'g',
                                    'amount': 25
                                }
                            ]
                        },
                        function (value) {
                            alert("Success running saveCorrelation, result: " + value);
                        },
                        qmService.healthKit.postData
                    );
                },
                queryCorrelationTypeFood: function () {
                    window.plugins.healthkit.queryCorrelationType(
                        {
                            'startDate': new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // a day ago
                            'endDate': new Date(), // now
                            'correlationType': 'HKCorrelationTypeIdentifierFood', // don't request read permission for this
                            'unit': 'g'
                        },
                        function (value) {
                            alert("Success running queryCorrelationType, result: " + JSON.stringify(value));
                        },
                        qmService.healthKit.postData
                    );
                },
                queryCorrelationTypeBloodPressure: function () {
                    window.plugins.healthkit.queryCorrelationType(
                        {
                            'startDate': new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // a day ago
                            'endDate': new Date(), // now
                            'correlationType': 'HKCorrelationTypeIdentifierBloodPressure', // don't request read permission for this
                            'unit': 'Pa'
                        },
                        function (value) {
                            alert("Success running queryCorrelationType, result: " + JSON.stringify(value));
                        },
                        qmService.healthKit.postData
                    );
                }
            },
            help: {
                showExplanationsPopup: function(parameterOrPropertyName, ev, modelName, title){
                    qm.help.getExplanation(parameterOrPropertyName, modelName, function(explanation){
                        if(title){
                            explanation.title = title;
                        }
                        qmService.showMaterialAlert(explanation.title, explanation.textContent, ev);
                    });
                }
            },
            intro: {
                setIntroSeen: function(value, reason){
                    qmLog.info("Setting intro seen to " + value + " because " + reason);
                    qm.storage.setItem(qm.items.introSeen, value);
                }
            },
            localNotifications: {
                localNotificationsPluginInstalled: function(){
                    var installed = true;
                    if(typeof cordova === "undefined"){
                        qmLog.debug('cordova is undefined!');
                        installed = false;
                    }else if(typeof cordova.plugins === "undefined"){
                        qmLog.debug('cordova.plugins is undefined');
                        installed = false;
                    }else if(typeof cordova.plugins.notification === "undefined"){
                        qmLog.debug('cordova.plugins.notification is undefined');
                        installed = false;
                    }
                    qmLog.debug('localNotificationsPluginInstalled: ' + installed);
                    return installed;
                },
                getAllLocalScheduled: function(callback){
                    if(qm.platform.isMobile()){
                        $ionicPlatform.ready(function(){
                            if(!qmService.localNotifications.localNotificationsPluginInstalled()){
                                qmLog.error("local notifications plugin not installed!");
                                return;
                            }
                            cordova.plugins.notification.local.getAll(function(notifications){
                                qmLog.pushDebug('All local notifications: ', notifications);
                                qm.storage.setItem(qm.items.scheduledLocalNotifications, notifications);
                                callback(notifications);
                            });
                        });
                    }else{
                        callback();
                    }
                }
            },
            login: {
                completelyResetAppStateAndSendToLogin: function(reason){
                    qmLog.debug('called qmService.login.completelyResetAppStateAndSendToLogin');
                    qmService.completelyResetAppState(reason);
                    qm.auth.sendToLogin(reason);
                },
                sendToLoginIfNecessaryAndComeBack: function(reason, afterLoginGoToState, afterLoginGoToUrl){
                    qmLog.authDebug('Called qmService.login.sendToLoginIfNecessaryAndComeBack');
                    qmService.refreshUserUsingAccessTokenInUrlIfNecessary();
                    if(!qm.auth.getAccessTokenFromUrlUserOrStorage()){
                        if(qm.platform.isDesignMode()){
                            qmService.login.setAfterLoginGoToState(qm.staticData.stateNames.configuration);
                        }else if(afterLoginGoToState){
                            qmService.login.setAfterLoginGoToState(afterLoginGoToState);
                        }else{
                            qm.auth.setAfterLoginGoToUrl(afterLoginGoToUrl);
                        }
                        qm.auth.sendToLogin(reason);
                        return true;
                    }
                    return false;
                },
                setAfterLoginGoToState: function(afterLoginGoToState){
                    if(!qm.auth.weShouldSetAfterLoginStateOrUrl(afterLoginGoToState)){
                        return false;
                    }
                    qmLog.debug('Setting afterLoginGoToState to ' + afterLoginGoToState + ' and going to login. ');
                    qmService.storage.setItem(qm.items.afterLoginGoToState, afterLoginGoToState);
                },
                getAfterLoginState: function(){
                    return qm.storage.getItem(qm.items.afterLoginGoToState);
                },
                deleteAfterLoginState: function(){
                    $timeout(function(){  // Wait 10 seconds in case it's called again too quick and sends to default state
                        qm.storage.removeItem(qm.items.afterLoginGoToState);
                    }, 10000);
                },
                afterLoginGoToUrlOrState: function(){
                    qmLog.info("Called afterLoginGoToUrlOrState in " + $state.current.name + "(" + window.location.href + ")");
                    function sendToDefaultStateIfNecessary(){
                        if($state.current.name === 'app.login'){
                            /** @namespace qm.getAppSettings().appDesign.defaultState */
                            /** @namespace qm.getAppSettings().appDesign */
                            qmService.goToDefaultState();
                            return true;
                        }
                    }
                    function sendToAfterLoginStateIfNecessary(){
                        var afterLoginGoToState = qmService.login.getAfterLoginState();
                        qmLog.debug('afterLoginGoToState from localstorage is  ' + afterLoginGoToState);
                        if(afterLoginGoToState){
                            if(qm.appMode.isBuilder()){
                                afterLoginGoToState = qm.staticData.stateNames.configuration;
                            }
                            if(qm.appMode.isPhysician()){
                                afterLoginGoToState = qm.staticData.stateNames.physician;
                            }
                            qmService.goToState(afterLoginGoToState);
                            qmService.login.deleteAfterLoginState();
                            return true;
                        }
                    }
                    function sendToAfterLoginGoToUrlIfNecessary(){
                        var afterLoginGoToUrl = qm.storage.getItem(qm.items.afterLoginGoToUrl);
                        if(afterLoginGoToUrl){
                            qmLog.info('Going to afterLoginGoToUrl from local storage  ' + afterLoginGoToUrl);
                            $timeout(function(){
                                qm.storage.removeItem(qm.items.afterLoginGoToUrl);
                            }, 10000);
                            window.location.replace(afterLoginGoToUrl);
                            return true;
                        }else{
                            qmLog.debug('sendToAfterLoginGoToUrlIfNecessary: No afterLoginGoToUrl from local storage');
                        }
                    }
                    if(sendToAfterLoginGoToUrlIfNecessary()){
                        return true;
                    }
                    if(sendToAfterLoginStateIfNecessary()){
                        return true;
                    }
                    return sendToDefaultStateIfNecessary();
                }
            },
            measurements: {
                broadcastUpdatePrimaryOutcomeHistory: function(){
                    qmLog.info("Broadcasting updatePrimaryOutcomeHistory");
                    $rootScope.$broadcast('updatePrimaryOutcomeHistory');
                },
            },
            navBar: {
                setFilterBarSearchIcon: function(value){
                    qmService.rootScope.setProperty('showFilterBarSearchIcon', value)
                },
                setOfflineConnectionErrorShowing: function(value){
                    qmService.rootScope.setProperty('offlineConnectionErrorShowing', value)
                },
                showNavigationMenuIfHideUrlParamNotSet: function(){
                    var hideMenu = qm.urlHelper.getParam('hideMenu');
                    if(!hideMenu){
                        qmService.navBar.showNavigationMenu();
                    }
                },
                hideNavigationMenuIfHideUrlParamSet: function(){
                    var hideMenu = qm.urlHelper.getParam('hideMenu');
                    if(hideMenu){
                        qmService.navBar.hideNavigationMenu();
                    }
                },
                hideNavigationMenu: function(){
                    qmLog.debug("Hiding navigation menu");
                    qmService.rootScope.setProperty('hideNavigationMenu', true);
                },
                showNavigationMenu: function(){
                    qmLog.debug("Showing navigation menu");
                    qmService.rootScope.setProperty('hideNavigationMenu', false);
                }
            },
            notifications: {
                showActionSheetForNotification: function(n){
                    var trackingReminder = n;
                    trackingReminder.id = n.trackingReminderId;
                    var variableObject = n;
                    variableObject.variableId = n.variableId;
                    variableObject.name = n.variableName;
                    var allButtons = qmService.actionSheets.actionSheetButtons;
                    var buttons = [
                        {text: 'Actions for ' + n.variableName},
                        {text: '<i class="icon ion-android-notifications-none"></i>Edit Reminder'},
                        allButtons.charts,
                        allButtons.historyAllVariable,
                        //allButtons.variableSettings
                    ];
                    if(n.outcome === true){
                        buttons.push(allButtons.predictors);
                    }else if(n.outcome === false){
                        buttons.push(allButtons.outcomes);
                    }else{
                        qmLog.error("Why is outcome not boolean in this notification!?!?!", null, n)
                    }
                    for(var i = 0; i < n.trackAllActions.length; i++){
                        buttons.push({text: '<i class="icon ion-android-done-all"></i>' + n.trackAllActions[i].title})
                    }
                    buttons.push({text: '<i class="icon ion-trash-a"></i>Skip All '});
                    // Show the action sheet
                    var hideSheetForNotification = $ionicActionSheet.show({
                        buttons: buttons,
                        //destructiveText: '<i class="icon ion-trash-a"></i>Skip All ',
                        cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                        cancel: function(){
                            qmLog.debug('CANCELLED', null);
                        },
                        buttonClicked: function(index, button){
                            qmLog.debug('BUTTON CLICKED', null, index);
                            if(index === 0){
                                qmLog.debug('clicked variable name', null);
                            }
                            if(index === 1){
                                qmService.notifications.editReminderSettingsByNotification(n);
                            }
                            if(index === 2){
                                qmService.goToState('app.charts', {
                                    variableObject: variableObject,
                                    variableName: variableObject.name
                                });
                            }
                            if(index === 3){
                                qmService.goToState('app.historyAllVariable', {
                                    variableObject: variableObject,
                                    variableName: variableObject.name
                                });
                            }
                            var buttonIndex = 4;
                            for(var i = 0; i < n.trackAllActions.length; i++){
                                if(index === buttonIndex){
                                    qm.notifications.trackAll(n, n.trackAllActions[i].modifiedValue);
                                }
                                buttonIndex++;
                            }
                            if(index === buttonIndex){
                                qmService.notifications.skipAll(n);
                            }
                            buttonIndex++;
                            if(index === buttonIndex){
                                qmService.goToVariableSettingsByName(n.variableName);
                            }
                            return true;
                        },
                        destructiveButtonClicked: function(){
                            qmService.notifications.skipAll(n);
                            return true;
                        }
                    });
                    //$timeout(function() {hideSheetForNotification();}, 20000);
                },
                editReminderSettingsByNotification: function(notification){
                    var reminder = JSON.parse(JSON.stringify(notification));
                    notification.hide = true;
                    reminder.id = notification.trackingReminderId;
                    qmService.goToState('app.reminderAdd', {
                        reminder: reminder,
                    });
                },
                broadcastGetTrackingReminderNotifications: function(){
                    if($state.current.name.toLowerCase().indexOf('inbox') !== -1){
                        qmLog.info("Broadcasting broadcastGetTrackingReminderNotifications so inbox is updated");
                        $rootScope.$broadcast('broadcastGetTrackingReminderNotifications');  // Refresh Reminders Inbox
                    }else{
                        qmLog.info("NOT broadcasting broadcastGetTrackingReminderNotifications because state is " + $state.current.name);
                    }
                },
                enableDrawOverAppsPopups: function(){
                    qm.notifications.setLastPopupTime(null);
                    qmService.storage.setItem(qm.items.drawOverAppsPopupEnabled, true);
                    $ionicPlatform.ready(function(){
                        qmService.scheduleSingleMostFrequentLocalNotification();
                        if(typeof window.overApps !== "undefined"){
                            window.overApps.checkPermission(function(msg){
                                qmLog.info('overApps.checkPermission: ' + msg, null);
                            });
                        }else{
                            qmLog.error("window.overApps is undefined!");
                        }
                        qmService.notifications.showAndroidPopupForMostRecentNotification();
                    });
                },
                showEnablePopupsConfirmation: function(ev){
                    if(!$rootScope.platform.isAndroid){
                        return;
                    }
                    var title = 'Enable Rating Popups';
                    var textContent = 'Would you like to receive subtle popups allowing you to rating symptoms or emotions in' +
                        ' a fraction of a second?';
                    var noText = 'No';
                    function yesCallback(){
                        qmService.notifications.enableDrawOverAppsPopups();
                    }
                    function noCallback(){
                        qmService.notifications.disablePopups();
                    }
                    qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev, noText);
                },
                disablePopups: function(){
                    qmService.showInfoToast("Rating popups disabled");
                    qmService.storage.setItem(qm.items.drawOverAppsPopupEnabled, false);
                    if(qmService.localNotifications.localNotificationsPluginInstalled()){
                        cordova.plugins.notification.local.cancelAll();
                    }
                },
                getDrawOverAppsPopupPermissionIfNecessary: function(ev){
                    if(!$rootScope.platform.isAndroid){
                        return false;
                    }
                    if(qmService.notifications.drawOverAppsPopupAreDisabled()){
                        return false;
                    }
                    if(qmService.notifications.drawOverAppsPopupHaveNotBeenConfigured()){
                        qmService.notifications.showEnablePopupsConfirmation(ev);
                    }else if(qm.notifications.lastPopupWasBeforeLastReminderTime()){
                        qmLog.error("Popups enabled but no popups shown since before last reminder time!  Re-initializing popups...");
                        qmService.notifications.showEnablePopupsConfirmation(ev); // Sometimes we lose permission for some reason
                    }
                },
                drawOverAppsPopupRatingNotification: function(ratingTrackingReminderNotification, force){
                    qmLog.pushDebug('Called qmService.notifications.drawOverAppsPopupRatingNotification...');
                    if(!ratingTrackingReminderNotification){
                        // Need to use unique rating notifications because we need to setup initial popup via url params
                        ratingTrackingReminderNotification = qm.notifications.getMostRecentRatingNotificationNotInSyncQueue();
                    }
                    qmService.notifications.drawOverAppsPopup(qm.notifications.getRatingNotificationPath(ratingTrackingReminderNotification), force);
                },
                drawOverAppsPopup: function(path, force){
                    qmLog.pushDebug('Called qmService.notifications.drawOverAppsPopup...');
                    if(qmService.notifications.drawOverAppsPopupAreDisabled()){
                        qmLog.pushDebug("Cannot show popup because it has been disabled");
                        return false;
                    }
                    if(typeof window.overApps === "undefined"){
                        qmLog.error('window.overApps is undefined!');
                        return;
                    }
                    if(!force && !qm.notifications.canWeShowPopupYet(path)){
                        return;
                    }
                    //window.overApps.checkPermission(function(msg){console.log("checkPermission: " + msg);});
                    var options = {
                        path: path,          // file path to display as view content.
                        hasHead: false,              // display over app head image which open the view up on click.
                        dragToSide: false,          // enable auto move of head to screen side after dragging stop.
                        enableBackBtn: true,       // enable hardware back button to close view.
                        enableCloseBtn: true,      //  whether to show native close btn or to hide it.
                        verticalPosition: "bottom",    // set vertical alignment of view.
                        horizontalPosition: "center"  // set horizontal alignment of view.
                    };
                    qmLog.pushDebug('drawOverAppsPopupRatingNotification options: ', options);
                    /** @namespace window.overApps */
                    window.overApps.startOverApp(options, function(success){
                        if(success.toLowerCase().indexOf('no permission') !== -1){
                            if(qmService.notifications.drawOverAppsPopupEnabled()){
                                qmLog.error(success + ' even though drawOverAppsPopupEnabled so asking for permission again!');
                                qmService.notifications.showEnablePopupsConfirmation();
                            }else if(qmService.notifications.drawOverAppsPopupHaveNotBeenConfigured()){
                                qmService.notifications.showEnablePopupsConfirmation();
                            }else{
                                qmLog.pushDebug("startOverApp popup error: " + success, 'drawOverAppsPopup Have NOT Been Configured returns: ' +
                                    qmService.notifications.drawOverAppsPopupHaveNotBeenConfigured());
                            }
                        }else{
                            qmLog.pushDebug('startOverApp success: ' + success);
                        }
                    }, function(err){
                        window.qmLog.error('startOverApp error: ' + err);
                    });
                },
                drawOverAppsPopupEnabled: function(){
                    if(!qm.platform.isAndroid()){return false;}
                    var enabled = qm.storage.getItem(qm.items.drawOverAppsPopupEnabled);
                    if(enabled === true || enabled === "true"){
                        return true;
                    }
                    qmLog.pushDebug("Popups are not enabled!  qm.items.drawOverAppsPopupEnabled is: " + enabled);
                    return false;
                },
                drawOverAppsPopupAreDisabled: function(){
                    var enabled = qm.storage.getItem(qm.items.drawOverAppsPopupEnabled);
                    if(enabled === false || enabled === "false"){
                        qmLog.pushDebug("Popups are explicitly disabled!  qm.items.drawOverAppsPopupEnabled is: " + enabled);
                        return true;
                    }
                    return false;
                },
                drawOverAppsPopupHaveNotBeenConfigured: function(){
                    var enabled = qm.storage.getItem(qm.items.drawOverAppsPopupEnabled);
                    if(enabled === null || enabled === "null"){
                        qmLog.pushDebug("Popups have not been configured!  qm.items.drawOverAppsPopupEnabled is: " + enabled);
                        return true;
                    }
                    return false;
                },
                showAndroidPopupForMostRecentNotification: function(doNotShowInInbox){
                    if(!qm.platform.isAndroid()){
                        qmLog.pushDebug('Can only show popups on Android');
                        return;
                    }
                    if(doNotShowInInbox && qm.urlHelper.urlContains('app/reminders-inbox')){
                        qmLog.pushDebug("Not showing drawOverAppsPopup because we're in the inbox already");
                        return;
                    }
                    qmLog.pushDebug('Called drawOverAppsPopup showAndroidPopupForMostRecentNotification...');
                    qm.notifications.refreshIfEmpty(function(){
                        // Need to use unique rating notifications because we need to setup initial popup via url params
                        if(qm.notifications.getMostRecentRatingNotificationNotInSyncQueue()){
                            qmService.notifications.drawOverAppsPopupRatingNotification();
                            // } else if (window.qm.storage.getTrackingReminderNotifications().length) {
                            //     qmService.notifications.drawOverAppsPopupCompactInboxNotification();  // TODO: Fix me
                        }else{
                            qmLog.pushDebug("No getMostRecentRatingNotificationNotInSyncQueue so not showing popup!");
                        }
                    });
                },
                drawOverAppsPopupCompactInboxNotification: function(){
                    qmService.notifications.drawOverAppsPopup(qm.chrome.windowParams.compactInboxWindowParams.url);
                },
                reconfigurePushNotificationsIfNoTokenOnServerOrToSync: function(){
                    //if(qm.platform.isMobile() && !qm.storage.getItem(qm.items.deviceTokenOnServer) && !qm.storage.getItem(qm.items.deviceTokenToSync)){
                    if(!qm.storage.getItem(qm.items.deviceTokenOnServer) && !qm.storage.getItem(qm.items.deviceTokenToSync)){
                        qmLog.debug("No device token on deviceTokenOnServer or deviceTokenToSync! Going to reconfigure push notifications");
                        qmService.configurePushNotifications();
                    } else {
                        qmLog.info("NOT going to reconfigurePushNotifications because we have deviceTokenOnServer || deviceTokenToSync")
                    }
                },
                skipAll: function(n, successHandler, errorHandler, ev){
                    var title = "Skip all?";
                    var textContent = "Do you want to dismiss all remaining past " + n.variableName + " reminder notifications?";
                    function yesCallback(){
                        var filtered = qm.notifications.deleteByVariableName(n.variableName);
                        n.hide = true;
                        qmLog.debug('Skipping all notifications for trackingReminder', null, n);
                        qmService.showInfoToast("Skipping all " + n.variableName + " notifications...");
                        var params = {trackingReminderId: n.trackingReminderId};
                        if(successHandler){successHandler(filtered);}
                        qm.notifications.skipAll(params);
                    }
                    function noCallback(){}
                    qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
                    return true;
                },
                lastAction: "",
                skip: function(trackingReminderNotification){
                    qmService.notification.skip(trackingReminderNotification);
                    qmService.showInfoToast("Skipped " + trackingReminderNotification.variableName);
                }
            },
            pusher: {
                loginRedirectionSubscribe: function(){
                    var channelName = qm.cookieHelper.getGACookie();
                    if(!channelName){
                        qmLog.error("Could not get channelName from user or GA id!");
                        return false;
                    }
                    if(typeof Pusher === "undefined"){
                        qmLog.error("Pusher not defined!");
                        return;
                    }
                    Pusher.logToConsole = qm.appMode.isDevelopment() || qm.appMode.isDebug();  // Enable pusher logging - don't include this in production
                    var pusher = new Pusher('4e7cd12d82bff45e4976', {cluster: 'us2', encrypted: true});
                    var channel = pusher.subscribe(channelName);
                    channel.bind('user', function(user){
                        qmService.setUserInLocalStorageBugsnagIntercomPush(user);
                        pusher.disconnect();
                    });
                },
                subscribe: function(user){
                    if(typeof Pusher === "undefined"){
                        qmLog.debug("Pusher not defined!");
                        return;
                    }
                    Pusher.logToConsole = qm.appMode.isDevelopment() || qm.appMode.isDebug();  // Enable pusher logging - don't include this in production
                    var pusher = new Pusher('4e7cd12d82bff45e4976', {cluster: 'us2', encrypted: true});
                    var channel = pusher.subscribe('user-' + user.id);
                    channel.bind('my-event', function(data){
                        if($state.current.name !== qm.staticData.stateNames.chat){
                            qmService.showToastWithButton(data.message, function(){
                                qmService.goToState(qm.staticData.stateNames.chat);
                            });
                        }else{
                            qmService.showInfoToast(data.message);
                        }
                        qmService.pusher.stateSpecificMessageHandler(data.message);
                    });
                },
                stateSpecificMessageHandler: function(message){
                    qmLog.info("stateSpecificMessageHandler handler not defined for message: " + message);
                }
            },
            reminders: {
                broadcastGetTrackingReminders: function(){
                    if($state.current.name.toLowerCase().indexOf(qm.staticData.stateNames.remindersManage.toLowerCase()) !== -1){
                        qmLog.info("Broadcasting broadcastGetTrackingReminders so manage reminders page is updated");
                        $rootScope.$broadcast('broadcastGetTrackingReminders');
                    }else{
                        qmLog.info("NOT broadcasting broadcastGetTrackingReminders because state is " + $state.current.name);
                    }
                },
                addToRemindersUsingVariableObject: function(v, options, successHandler){
                    if(qm.arrayHelper.variableIsArray(v)){
                        v = v[0];
                    }
                    var doneState = getDefaultState();
                    if(options.doneState){
                        doneState = options.doneState;
                    }
                    var tr = JSON.parse(JSON.stringify(v));  // We need this so all fields are populated in list before we get the returned reminder from API
                    tr.variableId = v.variableId;
                    delete tr.id;
                    tr.variableName = v.name;
                    if(v.unit){
                        tr.unitAbbreviatedName = v.unitAbbreviatedName;
                    }
                    tr.valence = v.valence;
                    tr.variableCategoryName = v.variableCategoryName;
                    tr.reminderFrequency = 86400;
                    tr.reminderStartTime = qm.timeHelper.getUtcTimeStringFromLocalString("19:00:00");
                    if(v.variableName === "Blood Pressure"){
                        options.skipReminderSettingsIfPossible = true;
                    }
                    if(!options.skipReminderSettingsIfPossible){
                        qmService.goToState('app.reminderAdd', {variableObject: v, doneState: doneState});
                        return;
                    }
                    var unitAbbreviatedName = (v.unit) ? v.unitAbbreviatedName : v.abbreviatedName;
                    if(unitAbbreviatedName === 'serving'){
                        tr.defaultValue = 1;
                    }
                    tr.valueAndFrequencyTextDescription = "Every day"; // Needed for getActive sorting sync queue
                    qm.reminderHelper.addToQueue(tr);
                    //if($state.current.name !== qm.staticData.stateNames.onboarding){qmService.showBasicLoader();} // TODO: Why do we need loader here?  It's failing to timeout for some reason
                    $timeout(function(){ // Allow loader to show
                        // We should wait unit this is in local storage before going to Favorites page so they don't see a blank screen
                        qmService.goToState(doneState, {trackingReminder: tr}); // Need this because it can be in between sync queue and storage
                        tr.message = "Added " + tr.variableName;
                        if(successHandler){
                            successHandler(tr);
                        }
                        $timeout(function(){
                            qmService.showToastWithButton(tr.message, "SETTINGS", function(){
                                qmService.goToState(qm.staticData.stateNames.reminderAdd, {trackingReminder: tr})
                            });
                        }, 1);
                        qm.reminderHelper.syncReminders();
                    }, 1);
                }
            },
            robot: {
                toggleSpeechAndMicEnabled: function(){
                    if($rootScope.speechEnabled){
                        $rootScope.setMicAndSpeechEnabled(false);
                    }else{
                        $rootScope.setMicAndSpeechEnabled(true);
                    }
                }
            },
            rootScope: {
                setProperty: function(property, value, callback){  // Avoid Error: [$rootScope:inprog] $apply already in progress
                    if(!property){
                        qmLog.error("No property name given to rootScope!");
                        return value;
                    }
                    if(typeof $rootScope[property] !== "undefined" && $rootScope[property] === value){
                        return value;
                    }
                    $timeout(function(){
                        var string = value;
                        if(typeof string !== "string"){
                            string = JSON.stringify(string);
                        }
                        qmLog.debug("Setting $rootScope." + property + " to " + string);
                        $rootScope[property] = value;
                        if(callback){
                            callback();
                        }
                    }, 0);
                    return value;
                },
                setUser: function(user){
                    if(user && user.data && user.data.user){user = user.data.user;}
                    qmService.rootScope.setProperty('user', user);
                },
                setShowActionSheetMenu: function(actionSheetFunction){
                    qmService.rootScope.setProperty('showActionSheetMenu', actionSheetFunction);
                }
            },
            shares: {
                sendInvitation: function(invitation, successHandler, errorHandler){
                    qmService.api.checkRequiredProperties(invitation, "ShareInvitationBody", function(){
                        qmService.showInfoToast("Invitation sent!");
                        qm.shares.sendInvitation(invitation, successHandler, errorHandler);
                    });
                },
            },
            showVariableSearchDialog: function(dialogParams, successHandler, errorHandler, ev){
                var SelectVariableDialogController = function($scope, $state, $rootScope, $stateParams, $filter, qmService,
                                                              $q, $log, dialogParams, $timeout){
                    var self = this;
                    //debugger
                    if(!dialogParams.placeholder){
                        dialogParams.placeholder = "Enter a variable";
                    }
                    if(dialogParams.requestParams && dialogParams.requestParams.variableCategoryName){
                        var cat = qm.variableCategoryHelper.findByNameIdObjOrUrl(dialogParams.requestParams);
                        if(cat){
                            var name = cat.variableCategoryNameSingular.toLowerCase();
                            dialogParams.title = 'Select ' + name;
                            dialogParams.placeholder = dialogParams.placeholder.replace('variable', name);
                            dialogParams.helpText = dialogParams.helpText.replace('variable', name);
                        }
                    }
                    if(qm.platform.isMobile()){
                        dialogParams.placeholder += ' or press camera to scan';
                        dialogParams.helpText += '. Press the camera button to scan a barcode.';
                    }
                    $timeout(function(){
                        showVariableList();
                    }, 500);
                    qm.mic.wildCardHandler = function(tag){
                        showVariableList();
                        if(qm.speech.callback){
                            qm.speech.callback(tag);
                        }
                        qm.speech.lastUserStatement = tag;
                        qmLog.info("Just heard user say " + tag);
                        querySearch(tag);
                        self.searchText = tag;
                    };
                    self.minLength = dialogParams.minLength || 0;
                    self.dialogParameters = dialogParams;
                    self.querySearch = querySearch;
                    self.selectedItemChange = selectedItemChange;
                    self.searchTextChange = searchTextChange;
                    self.platform = {};
                    self.platform.isMobile = $rootScope.platform.isMobile;
                    //self.showHelp = !($rootScope.platform.isMobile);
                    self.showHelp = true;
                    self.title = dialogParams.title;
                    self.helpText = dialogParams.helpText;
                    self.placeholder = dialogParams.placeholder;
                    self.createNewVariable = createNewVariable;
                    self.getHelp = function(){
                        if(self.helpText && !self.showHelp){
                            return self.showHelp = true;
                        }
                        qmService.goToState(window.qm.staticData.stateNames.help);
                        $mdDialog.cancel();
                    };
                    self.cancel = function(){
                        self.items = null;
                        $mdDialog.cancel();
                    };
                    self.finish = function(){
                        self.items = null;
                        $scope.variable = qmService.barcodeScanner.addUpcToVariableObject($scope.variable);
                        $mdDialog.hide($scope.variable);
                    };
                    self.scanBarcode = function(deferred){
                        self.helpText = "One moment please";
                        self.searchText = "Searching by barcode...";
                        self.title = "Barcode Search";
                        self.loading = true;
                        function noResultsHandler(userErrorMessage){
                            self.helpText = userErrorMessage;
                            self.title = "No matches found";
                            self.searchText = "";
                            delete dialogParams.requestParams.upc;
                            delete dialogParams.requestParams.barcodeFormat;
                            deferred.reject(self.title);
                            querySearch();
                            qmLog.error(userErrorMessage);
                            showVariableList();
                        }
                        if(!qm.platform.isMobile()){
                            qmService.barcodeScanner.quaggaScan();
                            return;
                        }
                        qmService.barcodeScanner.scanBarcode(dialogParams.requestParams, function(variables){
                            if(variables && variables.length){
                                self.helpText = "If you don't see what you're looking for, click the x and try a manual search";
                                self.lastResults = variables;
                                self.items = convertVariablesToToResultsList(variables);
                                self.searchText = "Barcode search results";
                                deferred.resolve(self.items);
                                showVariableList();
                                //self.selectedItemChange(self.items[0]);
                                //self.searchText = variables[0].name;
                                //qmService.actionSheets.showVariableObjectActionSheet(variables[0].name, variables[0])
                                //$mdDialog.hide(variables[0]);
                            }else{
                                var userErrorMessage = qmService.barcodeScanner.noVariableResultsHandler();
                                noResultsHandler(userErrorMessage);
                            }
                        }, function(userErrorMessage){
                            noResultsHandler(userErrorMessage)
                        });
                    };
                    function logDebug(message, queryString){
                        if(queryString){
                            message += "(" + queryString + ")";
                        }
                        qmLog.debug("VariableSearchDialog: " + message)
                    }
                    logDebug("Opened search dialog");
                    function showVariableList(){
                        $timeout(function(){
                            if(self.items && self.items.length){
                                self.hidden = false;
                                logDebug("showing list");
                                document.querySelector('#variable-search-box').focus();
                                document.getElementById('#variable-search-box').querySelector('input').focus();
                                //document.getElementById('variable-search-box').focus();
                                //document.getElementById('variable-search-box').select();
                            }else{
                                logDebug("Not showing list because we don't have results yet");
                            }
                        }, 100);
                    }
                    function createNewVariable(variableName){
                        logDebug("Creating new variable: " + variableName);
                        qmService.goToState(qm.staticData.stateNames.reminderAdd, {variableName: variableName});
                        $mdDialog.cancel();
                    }
                    function querySearch(query, variableSearchSuccessHandler, variableSearchErrorHandler){
                        var deferred = $q.defer();
                        if(query === 'barcode'){
                            self.scanBarcode(deferred);
                            return deferred.promise;
                        }
                        if(self.searchText && self.searchText.toLowerCase().indexOf('barcode') !== -1){
                            qmLog.info("Already searching by barcode");
                            deferred.resolve(self.items || []);
                            return deferred.promise;
                        }
                        if(!query || query === ""){
                            if(self.items && self.items.length > 10){
                                logDebug("Returning " + self.items.length + " items from querySearch");
                                deferred.resolve(self.items);
                                return deferred.promise;
                            }
                        }
                        self.notFoundText = "No variables found. Please try another wording or contact mike@quantimo.do.";
                        if(query === self.lastApiQuery && self.lastResults){
                            logDebug("Why are we researching with the same query?", query);
                            deferred.resolve(self.lastResults);
                            return deferred.promise;
                        }
                        if(query && query.indexOf("Not seeing") !== -1){
                            self.searchPhrase = query = self.lastApiQuery;
                            self.dialogParameters.excludeLocal = true;
                        }
                        if(self.dialogParameters.excludeLocal){
                            dialogParams.requestParams.excludeLocal = self.dialogParameters.excludeLocal;
                        }
                        if(query && query !== ""){
                            dialogParams.requestParams.searchPhrase = query;
                            self.lastApiQuery = query;
                        }
                        if(query === "" && dialogParams.requestParams.searchPhrase){
                            delete dialogParams.requestParams.searchPhrase;
                        } // This happens after clicking x clear button
                        logDebug("getFromLocalStorageOrApi in querySearch with params: " +
                            JSON.stringify(dialogParams.requestParams), query);
                        if(query && query.length){
                            //debugger
                        }
                        // Debounce in the template doesn't seem to work so we wait 500ms before searching here
                        clearTimeout(qmService.searchTimeout);
                        qmService.searchTimeout = setTimeout(function(){
                            qm.variablesHelper.getFromLocalStorageOrApi(dialogParams.requestParams).then(function(variables){
                                logDebug('Got ' + variables.length + ' results matching ', query);
                                showVariableList();
                                var list = convertVariablesToToResultsList(variables);
                                if(!dialogParams.requestParams.excludeLocal){
                                    list.push({
                                        value: "search-more",
                                        name: "Not seeing what you're looking for?",
                                        variable: "Search for more...",
                                        ionIcon: ionIcons.search,
                                        subtitle: "Search for more..."
                                    });
                                }else if(!list.length){
                                    list.push({
                                        value: "create-new-variable",
                                        name: "Create " + query + " variable",
                                        variable: {name: query},
                                        ionIcon: ionIcons.plus,
                                        subtitle: null
                                    });
                                }
                                self.lastResults = list;
                                deferred.resolve(list);
                                if(variables && variables.length){
                                    if(variableSearchSuccessHandler){
                                        variableSearchSuccessHandler(variables);
                                    }
                                }else{
                                    if(variableSearchErrorHandler){
                                        variableSearchErrorHandler();
                                    }
                                }
                            }, variableSearchErrorHandler);
                        }, 500);
                        return deferred.promise;
                    }
                    function searchTextChange(text){
                        logDebug('Text changed to ' + text + " in querySearch");
                    }
                    function selectedItemChange(item){
                        if(!item){
                            return;
                        }
                        if(item.value === "search-more" && !dialogParams.requestParams.excludeLocal){
                            self.selectedItem = null;
                            //dialogParameters.requestParams.excludeLocal = true;
                            //querySearch(self.searchText);
                            return;
                        }
                        if(item.value === "create-new-variable"){
                            createNewVariable(item.variable.name);
                            return;
                        }
                        self.selectedItem = item;
                        self.buttonText = "Select " + item.variable.name;
                        if(self.barcode){
                            item.variable.barcode = item.variable.upc = self.barcode;
                            item.variable.barcodeFormat = self.barcodeFormat;
                        }
                        $scope.variable = item.variable;
                        item.variable.lastSelectedAt = qm.timeHelper.getUnixTimestampInSeconds();
                        qm.variablesHelper.setLastSelectedAtAndSave(item.variable);
                        logDebug('Item changed to ' + item.variable.name + " in querySearch");
                        self.finish();
                    }
                    /**
                     * Build `variables` list of key/value pairs
                     */
                    function convertVariablesToToResultsList(variables){
                        if(!variables || !variables[0]){
                            return [];
                        }
                        var list = variables.map(function(variable){
                            var variableName =
                                //variable.displayName || Don't use this or we can't differentiate Water (mL) from Water (serving)
                                variable.variableName || variable.name;
                            if(!variableName){
                                qmLog.error("No variable name in convertVariablesToToResultsList: " + JSON.stringify(variable));
                                return;
                            }
                            return {
                                value: variable.name.toLowerCase(),
                                name: variableName,
                                displayName: variable.name,
                                variable: variable,
                                ionIcon: variable.ionIcon,
                                subtitle: variable.subtitle
                            };
                        });
                        return list;
                    }
                    querySearch();
                };
                SelectVariableDialogController.$inject = ["$scope", "$state", "$rootScope", "$stateParams", "$filter",
                    "qmService", "$q", "$log", "dialogParameters", "$timeout"];
                $mdDialog.show({
                    controller: SelectVariableDialogController,
                    controllerAs: 'ctrl',
                    templateUrl: 'templates/dialogs/variable-search-dialog.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: false,
                    fullscreen: qm.platform.isMobile() || qm.windowHelper.isSmallHeight(),
                    locals: {dialogParameters: dialogParams}
                }).then(function(variable){
                    successHandler(variable);
                }, function(error){
                    if(errorHandler){
                        errorHandler(error);
                    }
                    qmLog.debug('User cancelled selection');
                });
            },
            splash: {
                hideSplashScreen: function(){
                    if(navigator && navigator.splashscreen){
                        qmLog.debug('Hiding splash screen because app is ready', null);
                        navigator.splashscreen.hide();
                    }
                }
            },
            states: {
                outputStateNameConstantsForPHP: function(){
                    for(var i = 0; i < allStates.length; i++){
                        var x = allStates[i];
                        console.log("const " + x.name.replace('app.', '') + " = '" + x.name + "';")
                    }
                },
                outputStateInfoForJsonFile: function(){
                    console.log(qm.stringHelper.prettyJsonStringify(allStates));
                }
            },
            storage: {},
            search: {
                getTitle: function(variableCategoryName){
                    var title = 'Enter a variable';
                    if(variableCategoryName){
                        var variableCategory = qm.variableCategoryHelper.findByNameIdObjOrUrl(variableCategoryName);
                        if(variableCategory){
                            title = "Enter a " + variableCategory.variableCategoryNameSingular;
                        }
                    }
                    return title;
                },
                reminderSearch: function(successHandler, ev, variableCategoryName){
                    qmService.showVariableSearchDialog({
                        title: qmService.search.getTitle(variableCategoryName),
                        helpText: "Pick a variable you'd like to discover the effects or causes of. You'll be able to track this regularly in your inbox.",
                        requestParams: {variableCategoryName: variableCategoryName, includePublic: true},
                        skipReminderSettingsIfPossible: true
                    }, function(variableObject){
                        if(successHandler){
                            successHandler(variableObject);
                        }
                        qmService.reminders.addToRemindersUsingVariableObject(variableObject, {
                            skipReminderSettingsIfPossible: true,
                            doneState: "false"
                        }); // false must have quotes
                    }, null, ev);
                },
                measurementAddSearch: function(successHandler, ev, variableCategoryName){
                    qmService.showVariableSearchDialog({
                        title: qmService.search.getTitle(variableCategoryName),
                        helpText: "Pick a variable you'd like to record a measurement for.",
                        requestParams: {variableCategoryName: variableCategoryName, includePublic: true}
                    }, function(variableObject){
                        if(successHandler){
                            successHandler(variableObject);
                        }
                        $rootScope.goToState(qm.staticData.stateNames.measurementAdd, {
                            variableObject: variableObject,
                            doneState: "false"
                        }); // false must have quotes
                    }, null, ev);
                }
            },
            stateHelper: {
                goBack: function(providedStateParams){
                    qmLog.info("goBack: Called goBack with state params: ", providedStateParams);
                    function skipSearchPages(){
                        if(stateId.toLowerCase().indexOf('search') !== -1){ // Skip search pages
                            $ionicHistory.removeBackView();
                            backView = $ionicHistory.backView();  // TODO: Figure out why $stateParams are null
                            stateId = backView.stateName;
                            //$ionicHistory.goBack(-2);
                            //qmService.goToDefaultState(stateParams);
                            //return;
                        }
                    }
                    function addProvidedStateParamsToBackViewStateParams(){
                        for(var key in providedStateParams){
                            if(providedStateParams.hasOwnProperty(key)){
                                if(providedStateParams[key] && providedStateParams[key] !== ""){
                                    if(!backView.stateParams){
                                        backView.stateParams = {};
                                    }
                                    backView.stateParams[key] = providedStateParams[key];
                                    stateId += "_" + key + "=" + providedStateParams[key];
                                }
                            }
                        }
                        //backView.stateId = stateId;  // TODO: What is this for?
                    }
                    if($ionicHistory.viewHistory().backView){
                        var backView = $ionicHistory.backView();
                        qmLog.info("goBack: backView.stateName is " + backView.stateName);
                        var stateId = backView.stateName;
                        //skipSearchPages();  // TODO:  If we skipSearchPages we have to remove intro page as well
                        if(providedStateParams){
                            addProvidedStateParamsToBackViewStateParams();
                        }
                        qmLog.info('Going back to ' + backView.stateId + '  with stateParams ', backView.stateParams, null);
                        $ionicHistory.goBack();
                    }else{
                        qmLog.info("goBack: goToDefaultState because there is no $ionicHistory.viewHistory().backView ");
                        qmService.goToDefaultState(providedStateParams);
                    }
                },
                getValueFromScopeStateParamsOrUrl: function(propertyName, $scope, $stateParams){
                    if($stateParams[propertyName]){
                        return $stateParams[propertyName];
                    }
                    if($scope[propertyName]){
                        return $scope[propertyName];
                    }
                    if($scope.state && $scope.state[propertyName]){
                        return $scope.state[propertyName];
                    }
                    return qm.urlHelper.getParam(propertyName);
                },
                getVariableNameFromScopeStateParamsOrUrl: function($scope, $stateParams){
                    var variableName = qmService.stateHelper.getValueFromScopeStateParamsOrUrl('variableName', $scope, $stateParams);
                    if(variableName){return variableName;}
                    var variableObject = qmService.stateHelper.getValueFromScopeStateParamsOrUrl('variableObject', $scope, $stateParams);
                    if(variableObject){
                        variableName = variableObject.name;
                    }
                    return variableName;
                },
                getVariableIdFromScopeStateParamsOrUrl: function($scope, $stateParams){
                    var variableName = qmService.stateHelper.getValueFromScopeStateParamsOrUrl('variableId', $scope, $stateParams);
                    var variableObject = qmService.stateHelper.getValueFromScopeStateParamsOrUrl('variableObject', $scope, $stateParams);
                    if(variableObject){
                        variableName = variableObject.variableId || variableObject.variableId;
                    }
                    return variableName;
                },
                addVariableNameOrIdToRequestParams: function(params, $scope, $stateParams){
                    params = params || {};
                    var variableName = qmService.stateHelper.getVariableNameFromScopeStateParamsOrUrl($scope, $stateParams);
                    if(variableName){
                        params.name = variableName;
                    }else{
                        var variableId = qmService.stateHelper.getVariableIdFromScopeStateParamsOrUrl($scope, $stateParams);
                        if(!variableId){
                            qmLog.error("No variable name or id in variable settings page!");
                            return false;
                        }
                        params.variableId = variableId;
                    }
                    return params;
                }
            },
            sharing: {
                shareNativelyOrViaWeb: function(sharingUrl){
                    if(qm.platform.isMobile()){
                        // this is the complete list of currently supported params you can pass to the plugin (all optional)
                        var options = {
                            //message: correlationObject.sharingTitle, // not supported on some apps (Facebook, Instagram)
                            //subject: correlationObject.sharingTitle, // fi. for email
                            //files: ['', ''], // an array of filenames either locally or remotely
                            url: sharingUrl.replace('local.q', 'app.q'),
                            chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
                        };
                        var onSuccess = function(result){
                            //qmLog.error("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
                            qmLog.error("Share to " + result.app + ' completed: ' + result.completed); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
                        };
                        var onError = function(msg){
                            qmLog.error("Sharing failed with message: " + msg);
                        };
                        qmService.cordova.getPlugins().socialsharing.shareWithOptions(options, onSuccess, onError);
                    }else{
                        qmService.openSharingUrl(sharingUrl);
                    }
                }
            },
            studyHelper: {
                showShareStudyConfirmation: function(study, sharingUrl, ev){
                    qm.studyHelper.lastStudy = study;
                    var title = 'Share Study';
                    var textContent = 'Are you absolutely sure you want to make your ' + qm.studyHelper.getCauseVariableName() +
                        ' and ' + qm.studyHelper.getEffectVariableName() +
                        ' measurements publicly visible? You can make them private again at any time on this study page.';
                    function yesCallback(){
                        study.studySharing.shareUserMeasurements = true;
                        qm.studyHelper.saveLastStudyToGlobalsAndLocalForage(study);
                        var body = {
                            causeVariableId: qm.studyHelper.getCauseVariableId(),
                            effectVariableId: qm.studyHelper.getEffectVariableId(), shareUserMeasurements: true
                        };
                        qmService.showBlackRingLoader();
                        qm.studyHelper.postStudy(body).then(function(){
                            qmService.hideLoader();
                            if(sharingUrl){
                                qmService.studyHelper.shareStudyNativelyOrViaWeb(study, sharingUrl);
                            }
                        }, function(error){
                            qmService.hideLoader();
                            qmLog.error(error);
                        });
                    }
                    function noCallback(){
                        study.shareUserMeasurements = false;
                    }
                    qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
                },
                shareStudyNativelyOrViaWeb: function(study, sharingUrl){
                    if($rootScope.platform.isMobile){
                        // this is the complete list of currently supported params you can pass to the plugin (all optional)
                        var options = {
                            //message: correlationObject.sharingTitle, // not supported on some apps (Facebook, Instagram)
                            //subject: correlationObject.sharingTitle, // fi. for email
                            //files: ['', ''], // an array of filenames either locally or remotely
                            url: study.studyLinks.studyLinkStatic.replace('local.q', 'app.q'),
                            chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
                        };
                        var onSuccess = function(result){
                            //qmLog.error("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
                            qmLog.error("Share to " + result.app + ' completed: ' + result.completed); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
                        };
                        var onError = function(msg){
                            qmLog.error("Sharing failed with message: " + msg);
                        };
                        qmService.cordova.getPlugins().socialsharing.shareWithOptions(options, onSuccess, onError);
                    }else{
                        qmService.openSharingUrl(sharingUrl);
                    }
                },
                showUnShareStudyConfirmation: function(correlation, ev){
                    var title = 'Share Study';
                    var textContent = 'Are you absolutely sure you want to make your ' + qm.studyHelper.getCauseVariableName() +
                        ' and ' + qm.studyHelper.getEffectVariableName() + ' measurements private? Links to studies your ' +
                        'previously shared with these variables will no longer work.';
                    function yesCallback(){
                        correlation.shareUserMeasurements = false;
                        var body = {
                            causeVariableId: qm.studyHelper.getCauseVariableId(),
                            effectVariableId: qm.studyHelper.getEffectVariableId(), shareUserMeasurements: false
                        };
                        qm.studyHelper.postStudy(body);
                    }
                    function noCallback(){
                        correlation.shareUserMeasurements = true;
                    }
                    qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
                },
            },
            subscriptions: {
                setUpgradeDisabledIfOnAndroidWithoutKey: function(appSettings){
                    if(!qm.platform.isAndroid()){
                        return appSettings;
                    }
                    if(!appSettings.additionalSettings.monetizationSettings.playPublicLicenseKey.value && appSettings.additionalSettings.monetizationSettings.subscriptionsEnabled.value){
                        qmLog.error("To enable android subscriptions add your playPublicLicenseKey at https://builder.quantimo.do");
                        appSettings.additionalSettings.monetizationSettings.subscriptionsEnabled.value = false;
                    }
                    return appSettings;
                }
            },
            toast: {
                showUndoToast: function(text, undoFunction){
                    qmService.showToastWithButton(text, 'UNDO', undoFunction);
                }
            }
        };
        qmService.actionSheets = {
            actionSheetButtons: {
                charts: {state: qm.staticData.stateNames.charts, icon: ionIcons.charts, text: 'Charts'},
                chartSearch: {state: qm.staticData.stateNames.chartSearch, icon: ionIcons.charts, text: 'Charts'},
                compare: {icon: ionIcons.study, text: 'Create Study'},
                help: {state: window.qm.staticData.stateNames.help, icon: ionIcons.help, text: 'Help'},
                historyAll: {state: qm.staticData.stateNames.historyAll, icon: ionIcons.history, text: 'History'},
                historyAllCategory: {state: qm.staticData.stateNames.historyAllCategory, icon: ionIcons.history, text: 'History'},
                historyAllVariable: {state: qm.staticData.stateNames.historyAllVariable, icon: ionIcons.history, text: 'History'},
                lastValuesAction: {icon: ionIcons.recordMeasurement},
                measurementAdd: {
                    state: qm.staticData.stateNames.measurementAddSearch,
                    icon: ionIcons.recordMeasurement,
                    text: 'Record Measurement'
                },
                measurementAddSearch: {
                    state: qm.staticData.stateNames.measurementAddSearch,
                    icon: ionIcons.recordMeasurement,
                    text: 'Record Measurement'
                },
                measurementAddVariable: {
                    state: qm.staticData.stateNames.measurementAddVariable,
                    icon: ionIcons.recordMeasurement,
                    text: 'Record Measurement'
                },
                outcomes: {icon: ionIcons.outcomes, text: 'Top Outcomes'},
                openUrl: {icon: ionIcons.outcomes, text: 'Go to Website'},
                predictors: {icon: ionIcons.predictors, text: 'Top Predictors'},
                relationships: {icon: ionIcons.discoveries, text: 'Relationships'},
                recordMeasurement: {
                    state: qm.staticData.stateNames.measurementAddVariable,
                    icon: ionIcons.recordMeasurement,
                    text: 'Record Measurement'
                },
                refresh: {icon: ionIcons.refresh, text: 'Refresh'},
                reminderAdd: {
                    state: qm.staticData.stateNames.reminderAdd,
                    icon: ionIcons.reminder,
                    text: 'Add Reminder',
                    stateParams: {skipReminderSettingsIfPossible: true}
                },
                reminderEdit: {
                    state: qm.staticData.stateNames.reminderAdd,
                    icon: ionIcons.reminder,
                    text: 'Reminder Settings',
                    stateParams: {}
                },
                reminderSearch: {
                    state: qm.staticData.stateNames.reminderSearch,
                    icon: ionIcons.reminder,
                    text: 'Add Reminder',
                    stateParams: {skipReminderSettingsIfPossible: true}
                },
                settings: {state: window.qm.staticData.stateNames.settings, icon: ionIcons.settings, text: 'Settings'},
                sortAscendingTime: {icon: ionIcons.androidArrowUp, text: 'Sort Ascending by Time'},
                sortAscendingValue: {icon: ionIcons.androidArrowUp, text: 'Sort Ascending by Value'},
                sortDescendingTime: {icon: ionIcons.androidArrowDown, text: 'Sort Descending by Time'},
                sortDescendingValue: {icon: ionIcons.androidArrowDown, text: 'Sort Descending by Value'},
                studyCreation: {icon: ionIcons.study, text: 'Create Study'},
                variableSettings: {
                    state: qm.staticData.stateNames.variableSettingsVariableName,
                    icon: ionIcons.settings,
                    text: 'Analysis Settings'
                },
            },
            addHtmlToActionSheetButton: function(actionSheetButton, id){
                if(actionSheetButton.ionIcon){
                    actionSheetButton.icon = actionSheetButton.ionIcon;
                }
                if(!actionSheetButton.id){
                    if(id){
                        actionSheetButton.id = id;
                    }else if(actionSheetButton.ionIcon){
                        actionSheetButton.id = actionSheetButton.ionIcon;
                    }
                }
                if(actionSheetButton.text && actionSheetButton.text.indexOf('<span ') === -1){
                    actionSheetButton.text = '<span id="' + id + '"><i class="icon ' + actionSheetButton.icon + '"></i>' + actionSheetButton.text + '</span>';
                }
                return actionSheetButton;
            },
            addHtmlToActionSheetButtonArray: function(buttons){
                buttons = JSON.parse(JSON.stringify(buttons));
                buttons = buttons.map(function(button){
                    button = qmService.actionSheets.addHtmlToActionSheetButton(button, button.action);
                    return button;
                });
                return buttons;
            },
            addHtmlToAllActionSheetButtons: function(){
                var allButtons = qmService.actionSheets.actionSheetButtons;
                for(var propertyName in allButtons){
                    if(allButtons.hasOwnProperty(propertyName)){
                        allButtons[propertyName] =
                            qmService.actionSheets.addHtmlToActionSheetButton(allButtons[propertyName], propertyName);
                    }
                }
            },
            handleCardButtonClick: function(button, card){
                card.selectedButton = button;
                if(button.webhookUrl){
                    var yesCallback = function(){
                        card.hide = true;
                        qm.api.post(button.webhookUrl, button.parameters,function(response){
                            if(button.successToastText){
                                qmService.showInfoToast(button.successToastText);
                            }
                        }, function(error){
                            qmService.showMaterialAlert("Error", error);
                        });
                    };
                    qmService.showMaterialConfirmationDialog(button.tooltip, button.confirmationText, yesCallback, function(){
                        qmLog.info("Said no");
                    });
                    return true;  // Needed to close action sheet
                }
                button.state = button.state || button.stateName;
                if(button.state){
                    var stateParams = {};
                    if(button.stateParams){
                        stateParams = button.stateParams;
                    }
                    stateParams = qm.objectHelper.copyPropertiesFromOneObjectToAnother(stateParams, card.parameters, false);
                    delete stateParams.id;
                    qmService.goToState(button.state, stateParams);
                    return true;  // Needed to close action sheet
                }
                if(button.action && qmService.buttonClickHandlers[button.action]){
                    qmService.buttonClickHandlers[button.action](button, card);
                    return true;  // Needed to close action sheet
                }
                if(button.action && button.action === "share"){
                    qmService.sharing.shareNativelyOrViaWeb(button.link);
                    return true;
                }
                if(button.link){
                    if(button.link.indexOf("http") === 0 && button.link.indexOf(window.location.host) === -1){
                        qm.urlHelper.openUrlInNewTab(button.link);
                    }else{
                        qm.urlHelper.openUrl(button.link);
                    }
                    return true;
                }
                card.hide = true;
                qm.feed.addToFeedQueueAndRemoveFromFeed(card);
                return false; // Don't close if clicking top variable name
            },
            handleVariableActionSheetClick: function(b, v){
                var params = {};
                if(b.stateParams){params = b.stateParams;}
                if(v){
                    params.variableObject = v;
                    params.variableName = v.name || v.variableName;
                }
                b.state = b.state || b.stateName;
                if(b.state){
                    if(b.state === qm.staticData.stateNames.reminderAdd && v && !v.trackingReminderId){
                        qmService.reminders.addToRemindersUsingVariableObject(v, {
                            doneState: qm.staticData.stateNames.remindersList,
                            skipReminderSettingsIfPossible: true
                        });
                    }else{
                        qmService.goToState(b.state, params);
                    }
                    return true;
                }
                if(b.action && b.action.modifiedValue){
                    qm.reminderHelper.trackByFavorite(params.variableObject, b.action.modifiedValue);
                }
                var allButtons = qmService.actionSheets.actionSheetButtons;
                if(b.id === allButtons.compare.id){
                    qmService.goToStudyCreationForVariable(v);
                }
                if(b.id === allButtons.predictors.id){
                    qmService.goToCorrelationsListForVariable(v);
                }
                if(b.id === allButtons.outcomes.id){
                    qmService.goToCorrelationsListForVariable(v);
                }
                return false; // Don't close if clicking top variable name
            },
            getVariableObjectActionSheet: function(name, v, extraButtons, state){
                if(!name || typeof name !== "string"){
                    if(!v){v = name;}
                    name = v.variableName || v.name;
                }
                if(!v){v = qm.userVariables.findByNameSync(name);}
                if(!name){name = v.variableName || v.name;}
                qmLog.info("Getting action sheet for variable " + name);
                return function(){
                    qmLog.debug('variablePageCtrl.showActionSheetMenu:  variable: ' + name);
                    name = v.displayName || v.variableName || v.name;
                    var titleButton = qmService.actionSheets.addHtmlToActionSheetButton({
                        icon: v.ionIcon,
                        text: qmService.getTruncatedVariableName(name)
                    }, 'variableName');
                    var buttons = [titleButton];
                    if(extraButtons){
                        if(!Array.isArray(extraButtons)){extraButtons = [extraButtons];}
                        buttons = buttons.concat(extraButtons);
                    }
                    var allButtons = qmService.actionSheets.actionSheetButtons;
                    buttons.push(allButtons.measurementAddVariable);
                    if(v.trackingReminderId){
                        buttons.push(allButtons.reminderEdit);
                    } else {
                        buttons.push(allButtons.reminderAdd);
                    }
                    var hasMeasurements = v.userId && v.numberOfRawMeasurements;
                    if(hasMeasurements){
                        buttons.push(allButtons.charts);
                        buttons.push(allButtons.historyAllVariable);
                    }
                    var u = qm.getUser();
                    var hasMeasurementsOrIsAdmin = hasMeasurements || (u && u.administrator);
                    if(hasMeasurementsOrIsAdmin){buttons.push(allButtons.variableSettings);}
                    if(v){buttons.push(allButtons.compare);}
                    if(v && v.outcome){
                        buttons.push(allButtons.predictors);
                    }else{
                        buttons.push(allButtons.outcomes);
                    }
                    var actions = v.actionArray;
                    if(actions){
                        for(var i = 0; i < actions.length; i++){
                            var item = actions[i];
                            var id = item.callback || item.id;
                            var text = item.longTitle || item.title || item.text;
                            var ionIcon = item.ionIcon || ionIcons.recordMeasurement;
                            qmLog.debug("Action array item: ", item);
                            if(item.action === "track"){
                                buttons.push({action: item, id: id, text: '<span id="' + id + '"><i class="icon ' + ionIcon + '"></i>' + text + '</span>'});
                            }
                            if(buttons.length > 8){break;}
                        }
                    }
                    for(var j = 0; j < buttons.length; j++){
                        qmLog.debug("Button text: " + buttons[j].text);
                        buttons[j] = qmService.actionSheets.addHtmlToActionSheetButton(buttons[j]);
                    }
                    var actionSheetParams = {
                        buttons: buttons,
                        cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                        cancel: function(){
                            qmLog.debug('CANCELLED');
                            return true;
                        },
                        buttonClicked: function(index, button){
                            return qmService.actionSheets.handleVariableActionSheetClick(button, v);
                        }
                    };
                    if(v.trackingReminderId){
                        actionSheetParams.destructiveText = '<i class="icon ion-trash-a"></i>Delete';
                        actionSheetParams.destructiveButtonClicked = function(){
                            if(state && state.favoritesArray){
                                state.favoritesArray = state.favoritesArray.filter(function(one){
                                    return one.trackingReminderId !== v.trackingReminderId;
                                });
                            }
                            v.hide = true
                            qm.reminderHelper.deleteReminder(v);
                            return true;
                        };
                    }
                    var hideSheet = $ionicActionSheet.show(actionSheetParams);
                };
            },
            showVariableObjectActionSheet: function(name, variable, extraButtons, state){
                var showActionSheet = qmService.actionSheets.getVariableObjectActionSheet(name, variable, extraButtons, state);
                return showActionSheet();
            },
            addActionArrayButtonsToActionSheet: function(actionArray, buttons){
                if(!actionArray){
                    qmLog.info("No action array provided to addActionArrayButtonsToActionSheet! Maybe it's a new reminders?");
                    return buttons;
                }
                for(var i = 0; i < actionArray.length; i++){
                    if(actionArray[i].action !== "snooze"){
                        buttons.push({text: '<i class="icon ion-android-done-all"></i> Record ' + actionArray[i].title});
                    }
                }
                return buttons;
            },
            openActionSheetForCard: function(card, destructiveButtonClickedFunction){
                qmLog.info("card", card);
                qmLog.info("actionSheetButtons", card.actionSheetButtons);
                card.actionSheetButtons = card.actionSheetButtons.map(function(button){
                    if(button.html){
                        button.text = button.html;
                    }
                    return button;
                });
                var actionSheetParams = {
                    title: card.title,
                    buttons: card.actionSheetButtons,
                    cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                    cancel: function(){
                        qmLog.debug('CANCELLED');
                        return true;
                    },
                    buttonClicked: function(index, button){
                        return qmService.actionSheets.handleCardButtonClick(button, card);
                    }
                };
                if(destructiveButtonClickedFunction){
                    actionSheetParams.destructiveText = '<i class="icon ion-trash-a"></i>Dismiss';
                    actionSheetParams.destructiveButtonClicked = function(response){
                        qmLog.debug('destructiveButtonClicked', response);
                        card.hide = true;
                        destructiveButtonClickedFunction(card);
                        return true;
                    };
                }
                var hideSheet = $ionicActionSheet.show(actionSheetParams);
                //$timeout(function() {hideSheet();}, 30000);
            }
        };
        qmService.actionSheets.addHtmlToAllActionSheetButtons(qmService.actionSheets.actionSheetButtons);
        qmService.navBar.setOfflineConnectionErrorShowing(false); // to prevent more than one popup
        function qmSdkApiResponseHandler(error, data, response, successHandler, errorHandler, params, functionName){
            if(!response){
                if($state.current.name !== 'app.login' && $state.current.name !== 'app.intro'){
                    qmLog.info("No response provided to " + functionName + " qmSdkApiResponseHandler with params " + JSON.stringify(params));
                }
                return;
            }
            qmLog.debug(response.status + ' response from ' + response.req.url);
            if(error){
                qmApiGeneralErrorHandler(error, data, response);
                if(errorHandler){
                    errorHandler(error);
                }
            }else{
                if(data && params){
                    qm.api.cacheSet(params, data, functionName);
                }
                if(successHandler){
                    successHandler(data, response);
                }
            }
        }
        function addVariableCategoryInfo(array){
            angular.forEach(array, function(value, key){
                if(!value){
                    qmLog.error("no value for key " + key + " in array: ", array);
                    return;
                }
                var nameOrId = value.variableCategoryId || value.variableCategoryName || null;
                if(!nameOrId){return;}
                var cat = qm.variableCategoryHelper.findByNameIdObjOrUrl(nameOrId);
                if(cat){
                    if(typeof value.iconClass === "undefined"){
                        value.iconClass = 'icon positive ' + cat.ionIcon;
                    }
                    if(typeof value.ionIcon === "undefined"){
                        value.ionIcon = cat.ionIcon;
                    }
                    if(typeof value.moreInfo === "undefined"){
                        value.moreInfo = cat.moreInfo;
                    }
                    if(typeof value.image === "undefined"){
                        qmLog.info("Updating image to " + value.variableCategoryName);
                        value.image = {
                            url: cat.imageUrl,
                            height: "96",
                            width: "96"
                        };
                    }
                }
            });
            return array;
        }
        function addColors(array){
            angular.forEach(array, function(value, key){
                if(!value){
                    qmLog.error("no value for key " + key + " in array ", array);
                }
                if(value && value.color && qmService.colors[value.color]){
                    value.color = qmService.colors[value.color];
                }
            });
            return array;
        }
        function toObject(arr){
            var rv = {};
            for(var i = 0; i < arr.length; ++i){
                rv[i] = arr[i];
            }
            return rv;
        }
        function addVariableCategoryStateParam(object){
            if(typeof object !== "object"){
                qmLog.error("not an object", object);
                return object;
            }
            for(var prop in object){
                // skip loop if the property is from prototype
                if(!object.hasOwnProperty(prop)){
                    continue;
                }
                if(object[prop].stateParameters){
                    if(object[prop].stateParameters.constructor === Array){
                        qmLog.error('stateParams should be an object!');
                        object[prop].stateParameters = toObject(object[prop].stateParameters);
                    }
                    if(!object[prop].stateParameters.variableCategoryName){
                        object[prop].stateParameters.variableCategoryName = "Anything";
                    }
                }
            }
            return object;
        }
        function removeDeprecatedProperties(object){
            if(typeof object !== "object"){
                qmLog.error("not an object", object);
                return object;
            }
            var deprecatedProperties = ['newIntroType'];
            for(var i = 0; i < deprecatedProperties.length; i++){
                delete object[deprecatedProperties[i]];
            }
            return object;
        }
        function addAppDisplayName(array){
            return JSON.parse(JSON.stringify(array).replace('__APP_DISPLAY_NAME__', $rootScope.appSettings.appDisplayName));
        }
        qmService.addColorsCategoriesAndNames = function(array){
            array = addVariableCategoryInfo(array);
            array = addColors(array);
            array = addAppDisplayName(array);
            array = addVariableCategoryStateParam(array);
            array = removeDeprecatedProperties(array);
            return array;
        };
        qmService.showOfflineError = function(options, request){
            var doNotShowOfflineError = false;
            if(options && options.doNotShowOfflineError){
                doNotShowOfflineError = true;
            }
            var pathWithQuery = request.url.match(/\/\/[^\/]+\/([^\.]+)/)[1];
            var pathWithoutQuery = pathWithQuery.split("?")[0];
            /** @namespace $rootScope.offlineConnectionErrorShowing */
            if(!$rootScope.offlineConnectionErrorShowing && !doNotShowOfflineError){
                qmLog.error("Showing offline indicator because no data was returned from this request: " + pathWithoutQuery,
                    {debugApiOrigin: qm.api.getDebugApiOriginFromRequest(request), request: request}, options.stackTrace);
                qmService.navBar.setOfflineConnectionErrorShowing(true);
                if($rootScope.platform.isIOS){
                    $ionicPopup.show({
                        title: 'NOT CONNECTED',
                        //subTitle: '',
                        template: 'Either you are not connected to the internet or the QuantiModo server cannot be reached.',
                        buttons: [{
                            text: 'OK', type: 'button-positive', onTap: function(){
                                qmService.navBar.setOfflineConnectionErrorShowing(false);
                            }
                        }]
                    });
                }
            }
        }
        qmService.postMeasurementsExport = function(type, successHandler, errorHandler){
            qm.api.post('api/v2/measurements/request_' + type, [], successHandler, errorHandler);
        };
        qmService.getNotesFromApi = function(params, successHandler, errorHandler){
            var options = {};
            qm.api.get('api/v3/notes', ['variableName'], params, successHandler, errorHandler, options);
        };
        qmService.postVoteToApi = function(study, successHandler, errorHandler){
            qm.api.post('api/v3/votes',  {
                causeVariableName: qm.studyHelper.getCauseVariableName(study),
                effectVariableName: qm.studyHelper.getEffectVariableName(study),
                vote: (study.studyVotes) ? study.studyVotes.userVote : study.userVote
            }, successHandler, errorHandler);
        };
        qmService.disconnectConnectorToApi = function(name, successHandler, errorHandler){
            qm.api.get('api/v3/connectors/' + name + '/disconnect', [], {}, successHandler, errorHandler);
        };
        qmService.connectConnectorWithParamsToApi = function(params, lowercaseConnectorName, successHandler, errorHandler){
            if(qm.arrayHelper.variableIsArray(params)){
                var arrayParams = params;
                params = {};
                for(var i = 0; i < arrayParams.length; i++){
                    params[arrayParams[i].key] = arrayParams[i].value;
                }
            }
            qmLog.authDebug("connectConnectorWithParamsToApi:", params, params);
            var allowedParams = ['location', 'username', 'password', 'email', 'zip'];
            qm.api.get('api/v3/connectors/' + lowercaseConnectorName + '/connect', allowedParams, params, successHandler, errorHandler);
        };
        qmService.getUserEmailPreferences = function(params, successHandler, errorHandler){
            if($rootScope.user){
                console.warn('Are you sure we should be getting the user again when we already have a user?', $rootScope.user);
            }
            var options = {};
            options.doNotSendToLogin = true;
            qm.api.get('api/v3/notificationPreferences', ['userEmail'], params, successHandler, errorHandler, options);
        };
        qmService.postUserTagDeferred = function(tagData){
            var deferred = $q.defer();
            qmService.postUserTag(tagData, function(response){
                /** @namespace response.data.userTaggedVariable */
                qm.variablesHelper.setLastSelectedAtAndSave(response.data.userTaggedVariable);
                /** @namespace response.data.userTagVariable */
                qm.variablesHelper.setLastSelectedAtAndSave(response.data.userTagVariable);
                deferred.resolve(response);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };
        qmService.postUserTag = function(userTagData, successHandler, errorHandler){
            if(!(userTagData instanceof Array)){
                userTagData = [userTagData];
            }
            qm.api.post('api/v3/userTags', userTagData, successHandler, errorHandler);
        };
        qmService.postVariableJoinDeferred = function(tagData){
            var deferred = $q.defer();
            if(!Array.isArray(tagData)){
                tagData = [tagData];
            }
            qm.api.post('api/v3/variables/join', tagData, function(response){
                /** @namespace response.data.currentVariable */
                qm.variablesHelper.setLastSelectedAtAndSave(response.data.currentVariable);
                qm.variablesHelper.setLastSelectedAtAndSave(response.data.joinedVariable);
                deferred.resolve(response.data.currentVariable);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };
        qmService.deleteVariableJoinDeferred = function(tagData){
            var deferred = $q.defer();
            qmService.deleteVariableJoin(tagData, function(response){
                if(!response){
                    qmLog.info("No response from deleteVariableJoin");
                    deferred.resolve();
                    return;
                }
                qm.variablesHelper.setLastSelectedAtAndSave(response.data.currentVariable);
                qm.variablesHelper.setLastSelectedAtAndSave(response.data.joinedVariable);
                deferred.resolve(response.data.currentVariable);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };
        qmService.deleteVariableJoin = function(variableJoinData, successHandler, errorHandler){
            qm.api.post('api/v3/variables/join/delete', variableJoinData, successHandler, errorHandler);
        };
        qmService.deleteDeviceTokenFromServer = function(successHandler, errorHandler){
            var deferred = $q.defer();
            if(!qm.storage.getItem(qm.items.deviceTokenOnServer)){
                deferred.reject('No deviceToken provided to qmService.deleteDeviceTokenFromServer');
            }else{
                var params = {deviceToken: qm.storage.getItem(qm.items.deviceTokenOnServer)};
                qm.api.post('api/v3/deviceTokens/delete', params, successHandler, errorHandler);
                qm.storage.removeItem(qm.items.deviceTokenOnServer);
                deferred.resolve();
            }
            return deferred.promise;
        };
        // skip tracking reminder
        qmService.skipTrackingReminderNotification = function(params, successHandler, errorHandler){
            qm.api.post('api/v3/trackingReminderNotifications/skip',
                params,
                successHandler,
                errorHandler);
        };
        qmService.getVariableCategoryNameFromStateParamsOrUrl = function($stateParams){
            var variableCategoryName;
            if($stateParams && $stateParams.variableCategoryName){
                variableCategoryName = $stateParams.variableCategoryName;
            }else if(qm.urlHelper.getParam('variableCategoryName')){
                variableCategoryName = qm.urlHelper.getParam('variableCategoryName');
            }
            if(variableCategoryName && variableCategoryName !== "Anything"){
                return variableCategoryName;
            }
            return null;
        };
        qmService.goToState = function(to, params, options){
            qmService.setLastStateAndUrl()
            if(params && params.variableObject && !params.variableName){params.variableName = params.variableObject.name;}
            //qmLog.info('Called goToState: ' + to, null, qmLog.getStackTrace());
            qmLog.info('Going to state ' + to);
            if(to !== "false"){
                params = params || {};
                params.fromUrl = window.location.href;
                params.fromState = $state.current.name;
                params = qm.objectHelper.snakeToCamelCaseProperties(params);
                qmService.setCurrentState({name: to, params: params})
                $state.go(to, params, options);
            }
        };
        qmService.goToLastState =  function(){
            var state = qm.storage.getItem(qm.items.lastState, state);
            if(state && state.name === $state.current.name){
                qmService.goToDefaultState()
                return;
            }
            var url = qm.storage.getItem(qm.items.lastUrl, window.location.href);
            if(url.indexOf("?") !== -1){
                window.location.hef = url;
            } else {
                qmService.goToState(state.name, state.params)
            }
        }
        qmService.setLastStateAndUrl = function(){
            qm.storage.setItem(qm.items.lastState, $state.current);
            qm.storage.setItem(qm.items.lastUrl, window.location.href);
        }
        qmService.setCurrentState = function(state){
            //debugger
            qm.storage.setItem(qm.items.currentState, state);
        }
        qmService.getCurrentState = function(){
            return qm.storage.getItem(qm.items.currentState);
        }
        function getDefaultState(){
            if(qm.appMode.isPhysician()){
                return qm.staticData.stateNames.physician;
            }
            if(window.designMode){
                return qm.staticData.stateNames.configuration;
            }
            /** @namespace qm.getAppSettings().appDesign.defaultState */
            var appSettings = qm.getAppSettings();
            if(appSettings && appSettings.appDesign.defaultState){
                return appSettings.appDesign.defaultState;
            }
            return qm.staticData.stateNames.remindersInbox;
        }
        qmService.goToDefaultState = function(params, options){
            var defaultState = getDefaultState();
            qmLog.info('Called goToDefaultState: ' + defaultState);
            qmService.goToState(defaultState, params, options);
        };
        qmService.goToVariableSettingsByObject = function(variableObject){
            qmService.goToState(qm.staticData.stateNames.variableSettingsVariableName, {variableObject: variableObject});
        };
        qmService.goToVariableSettingsByName = function(variableName){
            qmService.goToState(qm.staticData.stateNames.variableSettingsVariableName, {variableName: variableName});
        };
        qmService.refreshUserUsingAccessTokenInUrlIfNecessary = function(){
            qmLog.authDebug("Called refreshUserUsingAccessTokenInUrlIfNecessary");
            if(!$rootScope.user){
                $rootScope.user = qm.getUser();
            }
            var currentUser = $rootScope.user;
            var accessTokenFromLocalStorage = qm.storage.getItem(qm.items.accessToken);
            var tokenFromUrl = qm.auth.getAccessTokenFromUrlAndSetLocalStorageFlags($state.current.name);
            function clearStorageIfTokenFromStorageDoesNotMatchTokenFromUrl(){
                if(tokenFromUrl && accessTokenFromLocalStorage && tokenFromUrl !== accessTokenFromLocalStorage){
                    qm.storage.clearStorageExceptForUnitsAndCommonVariables();
                    qmLog.authDebug("Cleared local storage because accessTokenFromLocalStorage does not match accessTokenFromUrl");
                }
            }
            function unsetUserIfTokenDoesNotMatchOneFromUrl(){
                if(tokenFromUrl && currentUser && currentUser.accessToken !== tokenFromUrl){
                    qmService.rootScope.setUser(null);
                    qm.storage.clearStorageExceptForUnitsAndCommonVariables();
                    qmLog.authDebug("refreshUserUsingAccessTokenInUrlIfNecessary: Cleared local storage because user.accessToken does not match qm.auth.accessTokenFromUrl");
                }
            }
            function storeTokenFromUrlIfDoNotRememberNotSet(){
                if(tokenFromUrl && !qm.urlHelper.getParam('doNotRemember')){
                    qmLog.authDebug("refreshUserUsingAccessTokenInUrlIfNecessary: Setting access token in local storage because doNotRemember is not set");
                    qmService.storage.setItem(qm.items.accessToken, tokenFromUrl);
                }
            }
            function refreshUserDoesNotExistOrIfTokenFromUrlDoesNotMatch(){
                if(tokenFromUrl && (!currentUser || currentUser.accessToken !== tokenFromUrl)){
                    qmLog.authDebug("refreshUserUsingAccessTokenInUrlIfNecessary: No $rootScope.user so going to refreshUser");
                    qmService.refreshUser();
                }
            }
            clearStorageIfTokenFromStorageDoesNotMatchTokenFromUrl();
            unsetUserIfTokenDoesNotMatchOneFromUrl();
            storeTokenFromUrlIfDoNotRememberNotSet();
            refreshUserDoesNotExistOrIfTokenFromUrlDoesNotMatch();
        };
        function qmApiGeneralErrorHandler(error, data, response, options){
            if(!response){
                return qmLog.error("No API response provided to qmApiGeneralErrorHandler", {
                    errorMessage: error,
                    responseData: data,
                    apiResponse: response,
                    requestOptions: options
                });
            }
            if(response.status === 401 || (response.text && response.text.indexOf('expired') !== -1)){
                qmService.auth.handleExpiredAccessTokenResponse(response.body);
                if(!options || !options.doNotSendToLogin){
                    qm.auth.setAfterLoginGoToUrlAndSendToLogin("401 response from " + JSON.stringify(response));
                }
            }else{
                var errorMessage = (response.error && response.error.message) ? response.error.message : error.message;
                qmLog.error(errorMessage, error.stack, {apiResponse: response}, error.stack);
            }
        }
        qmService.getTokensAndUserViaNativeSocialLogin = function(provider, accessToken){
            var deferred = $q.defer();
            if(!accessToken || accessToken === "null"){
                qmLog.error("accessToken not provided to getTokensAndUserViaNativeSocialLogin function");
                deferred.reject("accessToken not provided to getTokensAndUserViaNativeSocialLogin function");
            }
            var url = qm.api.getQuantiModoUrl('api/v2/auth/social/authorizeToken');
            url += "provider=" + encodeURIComponent(provider);
            url += "&accessToken=" + encodeURIComponent(accessToken);
            url += "&client_id=" + encodeURIComponent(qm.api.getClientId());
            qmLog.debug('qmService.getTokensAndUserViaNativeSocialLogin about to make request to ' + url, null);
            $http({
                method: 'GET',
                url: url,
                headers: {'Content-Type': 'application/json'}
            }).then(function(response){
                if(response.data.success && response.data.data && response.data.data.token){
                    deferred.resolve(response.data.data);
                }else{
                    deferred.reject(response);
                }
            }, function(error){
                qmLog.error(error);
                deferred.reject(error);
            });
            return deferred.promise;
        };
        var setupGoogleAnalytics = function(user, appSettings){
            if(typeof Analytics !== "undefined") {
                if (!appSettings) {
                    appSettings = qm.getAppSettings();
                }
                if (!appSettings) {
                    appSettings = qm.getAppSettings();
                    qmLog.errorAndExceptionTestingOrDevelopment("No appSettings for googleAnalyticsTrackingIds");
                    return;
                }
                var additionalSettings = appSettings.additionalSettings;
                if (additionalSettings && additionalSettings.googleAnalyticsTrackingIds) {
                    Analytics.configuration.accounts[0].tracker = additionalSettings.googleAnalyticsTrackingIds.endUserApps;
                } else {
                    qmLog.debug("No qm.getAppSettings().additionalSettings.googleAnalyticsTrackingIds.endUserApps!");
                }
                Analytics.registerScriptTags();
                Analytics.registerTrackers();
                // you can set any advanced configuration here
                if (user) {
                    Analytics.set('&uid', user.id);
                }
                Analytics.set('&ds', qm.platform.getCurrentPlatform());
                Analytics.set('&cn', appSettings.appDisplayName);
                Analytics.set('&cs', appSettings.appDisplayName);
                Analytics.set('&cm', qm.platform.getCurrentPlatform());
                Analytics.set('&an', appSettings.appDisplayName);
                if (additionalSettings && additionalSettings.appIds && additionalSettings.appIds.googleReversedClientId) {
                    Analytics.set('&aid', additionalSettings.appIds.googleReversedClientId);
                }
                Analytics.set('&av', appSettings.versionNumber);
                // Register a custom dimension for the default, unnamed account object
                // e.g., ga('set', 'dimension1', 'Paid');
                Analytics.set('dimension1', 'Paid');
                if (user) {
                    Analytics.set('dimension2', user.id.toString());
                }
                // Register a custom dimension for a named account object
                // e.g., ga('accountName.set', 'dimension2', 'Paid');
                //Analytics.set('dimension2', 'Paid', 'accountName');
                Analytics.pageView(); // send data to Google Analytics
                //qmLog.debug('Just set up Google Analytics');
            }
        }
        qmService.setUser = function(user){
            qmLog.authDebug("Setting user to: ", user, user);
            qmService.rootScope.setUser(user);
            qm.userHelper.setUser(user);
            if(user && !user.stripeActive && qm.getAppSettings() &&
                qm.getAppSettings().additionalSettings.monetizationSettings.advertisingEnabled){
                qmService.adBanner.initialize();
            }else{
                qmLog.info("admob: Not initializing for some reason")
            }
        };
        qmService.setUserInLocalStorageBugsnagIntercomPush = function(user){
            qmLog.debug('setUserInLocalStorageBugsnagIntercomPush:', null, user);
            qmService.setUser(user);
            //qmService.pusher.subscribe(user); // Too many connections exceeds daily limit of 100 and they're required for iFrame login
            if(qm.urlHelper.getParam('doNotRemember')){
                return;
            }
            qmService.backgroundGeolocationStartIfEnabled();
            qmLog.setupBugsnag(user);
            setupGoogleAnalytics(qm.userHelper.getUserSync());
            if(qm.storage.getItem(qm.items.deviceTokenOnServer)){
                qmLog.debug('This token is already on the server: ' + qm.storage.getItem(qm.items.deviceTokenOnServer));
            }
            qm.notifications.registerDeviceToken();
            qmService.notifications.reconfigurePushNotificationsIfNoTokenOnServerOrToSync();
            if($rootScope.sendReminderNotificationEmails){
                qmService.updateUserSettingsDeferred({sendReminderNotificationEmails: $rootScope.sendReminderNotificationEmails});
                $rootScope.sendReminderNotificationEmails = null;
            }
            qmService.login.afterLoginGoToUrlOrState();
        };
        qmService.syncAllUserData = function(){
            qm.reminderHelper.syncReminders();
            return qm.userVariables.getFromLocalStorageOrApi();
        };
        qmService.deferredRequests = {};
        qmService.refreshUser = function(force){
            var deferred = qmService.deferredRequests.user;
            if(deferred){
                return deferred.promise;
            }
            qmService.deferredRequests.user = deferred = $q.defer();
            if(qm.urlHelper.getParam('logout') && !force){
                qmService.deferredRequests.user = null;
                qmLog.authDebug('qmService.refreshUser: Not refreshing user because we have a logout parameter');
                deferred.reject('Not refreshing user because we have a logout parameter');
                return deferred.promise;
            }
            qmLog.debug('qmService.refreshUser: Calling qmService.getUserFromApi...');
            qm.userHelper.getUserFromApi().then(function(user){
                qmLog.authDebug('qmService.refreshUser: qmService.getUserFromApi returned ', user);
                qmService.setUserInLocalStorageBugsnagIntercomPush(user);
                qmService.deferredRequests.user = null;
                deferred.resolve(user);
            }, function(error){
                qmLog.info(error);
                deferred.reject(error);
                qmService.deferredRequests.user = null;
                return deferred.promise;
            });
            return deferred.promise;
        };
        qmService.refreshUserEmailPreferencesDeferred = function(params, successHandler, errorHandler){
            qmService.getUserEmailPreferences(params, function(user){
                successHandler(user);
            }, function(error){
                errorHandler(error);
            });
        };
        qmService.completelyResetAppState = function(reason){
            qmService.rootScope.setUser(null);
            // Getting token so we can post as the new user if they log in again
            qmService.deleteDeviceTokenFromServer();
            qm.storage.clearStorageExceptForUnitsAndCommonVariables();
            qmService.cancelAllNotifications();
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
            qmService.auth.deleteAllAccessTokens(reason);
            qm.api.post('/auth/logout');
        };
        qmService.updateUserSettingsDeferred = function(params){
            if($rootScope.physicianUser || qm.storage.getItem(qm.items.physicianUser)){
                return false;
            } // Let's restrict settings updates to users
            var deferred = $q.defer();
            if(qm.urlHelper.getParam('userEmail')){
                params.userEmail = qm.urlHelper.getParam('userEmail');
            }
            var u = qm.userHelper.getUserSync();
            if(u){
                params.userId = u.id;
            }
            qm.api.post('api/v3/userSettings', params, function(response){
                if(!params.userEmail){
                    qmService.refreshUser(true).then(function(user){
                        qmLog.debug('updateUserSettingsDeferred got this user: ', user, null);
                    }, function(error){
                        qmLog.error('qmService.updateUserSettingsDeferred could not refresh user because ', error);
                    });
                }
                deferred.resolve(response);
            }, function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };
        qmService.storage.getFavorites = function(categoryName){
            var deferred = $q.defer();
            qm.reminderHelper.getRemindersFavoritesArchived(categoryName).then(function(allTypes){
                deferred.resolve(allTypes.favorites);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };
        qmService.getTruncatedVariableName = function(variableName, maxCharacters){
            if(!maxCharacters){
                maxCharacters = (qm.platform.isMobile()) ? 18 : 30;
            }
            if(variableName.length > maxCharacters){
                return variableName.substring(0, maxCharacters) + '...';
            }else{
                return variableName;
            }
        };
        qmService.createPrimaryOutcomeMeasurement = function(numericRatingValue){
            var v = qm.getPrimaryOutcomeVariable();
            // if val is string (needs conversion)
            if(isNaN(parseFloat(numericRatingValue))){
                numericRatingValue = v.ratingTextToValueConversionDataSet[numericRatingValue] ?
                    v.ratingTextToValueConversionDataSet[numericRatingValue] : false;
            }
            var m = {
                variableName: v.name,
                variableCategoryName: v.variableCategoryName,
                valence: v.valence,
                startAt: qm.timeHelper.toMySQLTimestamp(),
                unitAbbreviatedName: v.unitAbbreviatedName,
                value: numericRatingValue,
                note: null
            };
            qm.measurements.addLocationAndSource(m);
            return m;
        };
        qmService.setPlatformVariables = function(){
            var platform = {};
            //qmLog.debug("ionic.Platform.platform() is " + ionic.Platform.platform());
            platform.isWeb = qm.platform.isWeb();
            platform.isIPad = ionic.Platform.isIPad() && !platform.isWeb;
            platform.isIOS = qm.platform.isIOS();
            platform.isAndroid = qm.platform.isAndroid();
            platform.isWindowsPhone = ionic.Platform.isWindowsPhone() && !platform.isWeb;
            platform.isChrome = !!window.chrome;
            platform.currentPlatform = qm.platform.getCurrentPlatform();
            platform.currentPlatformVersion = ionic.Platform.version();
            platform.isMobile = qm.platform.isMobile();
            platform.isWindows = window.location.href.indexOf('ms-appx') > -1;
            platform.isChromeExtension = qm.platform.isChromeExtension();
            platform.isWebOrChrome = platform.isChromeExtension || platform.isWeb;
            platform.isIframe = qm.windowHelper.isIframe();
            platform.isWebView = qm.platform.isWebView();
            platform.screen = window.screen;
            if(platform.isMobile){qmLog.error("isWebView is  " + platform.isWebView);}
            qmService.localNotificationsEnabled = platform.isChromeExtension;
            qmService.rootScope.setProperty('platform', platform, qmService.configurePushNotifications);
            qmLog.debug("Platform: ", platform);
        };
        qmService.getConnectorsDeferred = function(){
            var deferred = $q.defer();
            var connectors = qm.connectorHelper.getConnectorsFromLocalStorage();
            if(connectors && qm.connectorHelper.filterConnectorsByName("weather", connectors)){
                //connectors = hideUnavailableConnectors(connectors);
                deferred.resolve(connectors);
            }else{
                qmService.refreshConnectors().then(function(connectors){
                    deferred.resolve(connectors);
                });
            }
            return deferred.promise;
        };
        qmService.refreshConnectors = function(){
            var stackTrace = qmLog.getStackTrace();
            if(window.qmLog.isDebugMode()){
                qmLog.debug('Called refresh connectors: ' + stackTrace);
            }
            var deferred = $q.defer();
            qm.connectorHelper.getConnectorsFromApi({}, function(response){
                var connectors = qmService.connectors.storeConnectorResponse(response);
                deferred.resolve(connectors);
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };
        qmService.disconnectConnectorDeferred = function(name){
            var deferred = $q.defer();
            qmService.disconnectConnectorToApi(name, function(){
                deferred.resolve();
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };
        qmService.connectConnectorWithParamsDeferred = function(params, lowercaseConnectorName){
            var deferred = $q.defer();
            if(lowercaseConnectorName.indexOf('weather') > -1 && !params.location && !params.zip){
                // Not sure why this is necessary but it doesn't seem to work?
                $http.get('https://freegeoip.net/json/').success(function(data){
                    console.log(JSON.stringify(data, null, 2));
                    qmService.connectConnectorWithParamsToApi({location: data.ip}, lowercaseConnectorName, function(){
                        qmService.refreshConnectors();
                    }, function(error){
                        deferred.reject(error);
                    });
                });
            }else{
                qmService.connectConnectorWithParamsToApi(params, lowercaseConnectorName, function(response){
                    qmService.refreshConnectors();
                    deferred.resolve(response);
                }, function(error){
                    deferred.reject(error);
                });
            }
            return deferred.promise;
        };
        var geoLocationDebug = false;
        qmService.getLocationInfoFromFoursquareOrGoogleMaps = function(latitude, longitude){
            if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){
                qmLog.error('getLocationInfoFromFoursquareOrGoogleMaps with longitude ' + longitude + ' and latitude,' + latitude);
            }
            var deferred = $q.defer();
            qmService.getLocationInfoFromFoursquare($http).whatsAt(latitude, longitude).then(function(geoLookupResult){
                if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){
                    qmLog.error('getLocationInfoFromFoursquare result: ', geoLookupResult);
                }
                if(geoLookupResult.status === 200 && geoLookupResult.data.response.venues.length >= 1){
                    var bestMatch = geoLookupResult.data.response.venues[0];
                    //convert the result to something the caller can use consistently
                    geoLookupResult = {
                        type: "foursquare",
                        name: bestMatch.name,
                        address: bestMatch.location.formattedAddress.join(", ")
                    };
                    //console.dir(bestMatch);
                    deferred.resolve(geoLookupResult);
                }else{
                    //ok, time to try google
                    qmService.getLocationInfoFromGoogleMaps($http).lookup(latitude, longitude).then(function(googleResponse){
                        //qmLog.debug('back from google with ');
                        if(googleResponse.data && googleResponse.data.results && googleResponse.data.results.length >= 1){
                            //qmLog.debug('did i come in here?');
                            var bestMatch = googleResponse.data.results[0];
                            //qmLog.debug(JSON.stringify(bestMatch));
                            var geoLookupResult = {type: "geocode", address: bestMatch.formatted_address};
                            deferred.resolve(geoLookupResult);
                        }
                    });
                }
            }, function(error){
                qmLog.error('getLocationInfoFromFoursquareOrGoogleMaps error: ', error);
            });
            return deferred.promise;
        };
        qmService.getLocationInfoFromGoogleMaps = function($http){
            function lookup(latitude, longitude){
                return $http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude +
                    '&key=' + qm.geoLocation.getGoogleMapsApiKey());
            }
            return {lookup: lookup};
        };
        qmService.getLocationInfoFromFoursquare = function($http){
            function whatsAt(latitude, longitude){
                return $http.get('https://api.foursquare.com/v2/venues/search?ll=' + latitude + ',' + longitude +
                                 '&intent=browse&radius=30&client_id=' + qm.geoLocation.getFoursquareClientId() + '&client_secret=' +
                                 qm.geoLocation.getFoursquareClientSecret() + '&v=20151201');
            }
            return {whatsAt: whatsAt};
        };
        function getLocationNameFromResult(getLookupResult){
            if(getLookupResult.name && getLookupResult.name !== "undefined"){
                return getLookupResult.name;
            }
            if(getLookupResult.address && getLookupResult.address !== "undefined"){
                return getLookupResult.address;
            }
            qmLog.error("No name or address property found in this coordinates result: ", getLookupResult);
        }
        qmService.storage.updateLocation = function(geoLookupResult){
            if(getLocationNameFromResult(geoLookupResult)){
                qm.storage.setItem(qm.items.lastLocationName, getLocationNameFromResult(geoLookupResult));
            }
            if(geoLookupResult.type){
                qm.storage.setItem(qm.items.lastLocationResultType, geoLookupResult.type);
            }else{
                qmLog.error('Geolocation error', "No geolocation lookup type", geoLookupResult);
            }
            if(geoLookupResult.latitude){
                qm.storage.setItem(qm.items.lastLatitude, geoLookupResult.latitude);
            }else{
                qmLog.error('Geolocation error', "No latitude!", geoLookupResult);
            }
            if(geoLookupResult.longitude){
                qm.storage.setItem(qm.items.lastLongitude, geoLookupResult.longitude);
            }else{
                qmLog.error('Geolocation error', "No longitude!", geoLookupResult);
            }
            qm.storage.setItem(qm.items.lastLocationUpdateTimeEpochSeconds, window.qm.timeHelper.getUnixTimestampInSeconds());
            if(geoLookupResult.address){
                qm.storage.setItem(qm.items.lastLocationAddress, geoLookupResult.address);
                if(geoLookupResult.address === qm.storage.getItem(qm.items.lastLocationName)){
                    qm.storage.setItem(qm.items.lastLocationNameAndAddress, qm.storage.getItem(qm.items.lastLocationAddress));
                }else{
                    qm.storage.setItem(qm.items.lastLocationNameAndAddress,
                        qm.storage.getItem(qm.items.lastLocationName) + " (" + qm.storage.getItem(qm.items.lastLocationAddress) + ")");
                }
            }else{
                qmLog.error('Geolocation error', "No address found!", geoLookupResult);
            }
        };
        function getLastLocationNameFromLocalStorage(){
            var lastLocationName = qm.storage.getItem(qm.items.lastLocationName);
            if(lastLocationName && lastLocationName !== "undefined"){
                return lastLocationName;
            }
        }
        function getHoursAtLocation(){
            var secondsAtLocation = window.qm.timeHelper.getUnixTimestampInSeconds() - qm.storage.getItem(qm.items.lastLocationUpdateTimeEpochSeconds);
            return Math.round(secondsAtLocation / 3600 * 100) / 100;
        }
        function getGeoLocationSourceName(isBackground){
            var sourceName = qm.storage.getItem(qm.items.lastLocationResultType) + ' on ' + qm.getSourceName();
            if(isBackground){
                sourceName = sourceName + " (Background Geolocation)";
            }
            return sourceName;
        }
        function weShouldPostLocation(){
            return $rootScope.platform.isMobile && getLastLocationNameFromLocalStorage() && getHoursAtLocation();
        }
        qmService.postLocationMeasurementAndSetLocationVariables = function(geoLookupResult, isBackground){
            if(weShouldPostLocation()){
                var newMeasurement = {
                    variableName: getLastLocationNameFromLocalStorage(),
                    unitAbbreviatedName: 'h',
                    startAt: qm.timeHelper.toMySQLTimestamp(qm.storage.getItem(qm.items.lastLocationUpdateTimeEpochSeconds)),
                    sourceName: getGeoLocationSourceName(isBackground),
                    value: getHoursAtLocation(),
                    variableCategoryName: 'Location',
                    location: qm.storage.getItem(qm.items.lastLocationAddress),
                    combinationOperation: "SUM"
                };
                qm.measurements.postMeasurement(newMeasurement);
            }else{
                if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){
                    qmLog.error('Not posting location getLastLocationNameFromLocalStorage returns ' + getLastLocationNameFromLocalStorage());
                }
            }
            qmService.storage.updateLocation(geoLookupResult);
        };
        function hasLocationNameChanged(geoLookupResult){
            return getLastLocationNameFromLocalStorage() !== getLocationNameFromResult(geoLookupResult);
        }
        function coordinatesChanged(coordinates){
            return qm.storage.getItem(qm.items.lastLatitude) !== coordinates.latitude && qm.storage.getItem(qm.items.lastLongitude) !== coordinates.longitude;
        }
        function lookupGoogleAndFoursquareLocationAndPostMeasurement(coordinates, isBackground){
            if(!qm.geoLocation.getFoursquareClientId() || !qm.geoLocation.getFoursquareClientSecret()){
                qmLog.error('Please add FOURSQUARE_CLIENT_ID & FOURSQUARE_CLIENT_SECRET to private config');
                return;
            }
            if(!qm.geoLocation.getGoogleMapsApiKey()){
                qmLog.error('Please add GOOGLE_MAPS_API_KEY to private config');
                return;
            }
            if(!coordinatesChanged(coordinates)){
                return;
            }
            qmService.getLocationInfoFromFoursquareOrGoogleMaps(coordinates.latitude, coordinates.longitude).then(function(geoLookupResult){
                if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){
                    qmLog.error('getLocationInfoFromFoursquareOrGoogleMaps was ' + JSON.stringify(geoLookupResult));
                }
                if(geoLookupResult.type === 'foursquare'){
                    if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){
                        qmLog.error('Foursquare location name is ' + geoLookupResult.name + ' located at ' + geoLookupResult.address);
                    }
                }else if(geoLookupResult.type === 'geocode'){
                    if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){
                        qmLog.error('geocode address is ' + geoLookupResult.address);
                    }
                }else{
                    var map = 'https://maps.googleapis.com/maps/api/staticmap?center=' + coordinates.latitude + ',' + coordinates.longitude +
                        'zoom=13&size=300x300&maptype=roadmap&markers=color:blue%7Clabel:X%7C' + coordinates.latitude + ',' + coordinates.longitude;
                    qmLog.debug('Sorry, I\'ve got nothing. But here is a map!', null);
                }
                geoLookupResult.latitude = coordinates.latitude;
                geoLookupResult.longitude = coordinates.longitude;
                if(hasLocationNameChanged(geoLookupResult)){
                    qmService.postLocationMeasurementAndSetLocationVariables(geoLookupResult, isBackground);
                }else{
                    if(geoLocationDebug && $rootScope.user && $rootScope.user.id === 230){
                        qmLog.error('Location name has not changed!');
                    }
                }
            });
        }
        qmService.updateLocationVariablesAndPostMeasurementIfChanged = function(){
            var deferred = $q.defer();
            var message;
            if(!$rootScope.user){
                message = 'Not logging location because we do not have a user';
                qmLog.debug(message);
                deferred.reject(message);
                return deferred.promise;
            }
            if(!$rootScope.user.trackLocation){
                message = 'Location tracking disabled for this user';
                qmLog.debug(message);
                deferred.reject(message);
                return deferred.promise;
            }
            var currentTimestamp = window.qm.timeHelper.getUnixTimestampInSeconds();
            var lastLocationPostUnixTime = parseInt(qm.storage.getItem(qm.items.lastLocationPostUnixTime));
            var secondsSinceLastPostedLocation = currentTimestamp - lastLocationPostUnixTime;
            if(lastLocationPostUnixTime && secondsSinceLastPostedLocation < 300){
                message = 'Already posted location ' + secondsSinceLastPostedLocation + " seconds ago";
                qmLog.debug(message);
                deferred.reject(message);
                return deferred.promise;
            }
            $ionicPlatform.ready(function(){
                qm.storage.setItem(qm.items.lastLocationPostUnixTime, currentTimestamp);
                var posOptions = {enableHighAccuracy: true, timeout: 20000, maximumAge: 0};
                $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position){
                    qmService.forecastIoWeather(position.coords);
                    lookupGoogleAndFoursquareLocationAndPostMeasurement(position.coords);
                    deferred.resolve();
                    //qmLog.debug("My coordinates are: ", position.coords);
                }, function(error){
                    deferred.reject(error);
                    qmLog.error(error);
                });
            });
            return deferred.promise;
        };
        qmService.backgroundGeolocationStartV2 = function(){
            if(typeof backgroundGeolocation === "undefined"){
                qmLog.error('Cannot execute backgroundGeolocationStartV2 because BackgroundGeolocation and backgroundGeolocation is not defined');
                return;
            }
            qm.storage.setItem('bgGPS', 1);
            var callbackFn = function(coordinates){
                qmLog.debug('background location is ', coordinates, null);
                var isBackground = true;
                qmService.forecastIoWeather(coordinates);
                lookupGoogleAndFoursquareLocationAndPostMeasurement(coordinates, isBackground);
                backgroundGeolocation.finish();
            };
            var failureFn = function(error){
                var errorMessage = 'BackgroundGeoLocation error ' + JSON.stringify(error);
                qmLog.error(errorMessage);
            };
            backgroundGeolocation.configure(callbackFn, failureFn, {
                desiredAccuracy: 25,
                stationaryRadius: 50,
                distanceFilter: 50,
                debug: false,  // Created notifications with location info
                stopOnTerminate: false,
                notificationTitle: 'Recording Location',
                notificationText: 'Tap to open inbox',
                notificationIconLarge: null,
                notificationIconSmall: 'ic_stat_icon_bw',
                startForeground: true, // ANDROID ONLY: On Android devices it is recommended to have a notification in the drawer
                locationProvider: backgroundGeolocation.ANDROID_DISTANCE_FILTER_PROVIDER,  // Best for background https://github.com/mauron85/cordova-plugin-background-geolocation/blob/master/PROVIDERS.md
                // ACTIVITY_PROVIDER Settings Start
                // locationProvider: BackgroundGeolocation.ANDROID_ACTIVITY_PROVIDER, // Best for foreground https://github.com/mauron85/cordova-plugin-background-geolocation/blob/master/PROVIDERS.md
                interval: 60 * 1000,  // These might not work with locationService: 'ANDROID_DISTANCE_FILTER',
                fastestInterval: 5 * 1000,  // These might not work with locationService: 'ANDROID_DISTANCE_FILTER',
                activitiesInterval: 10 * 1000  // These might not work with locationService: 'ANDROID_DISTANCE_FILTER',
                // ACTIVITY_PROVIDER Settings End
                // url: 'http://192.168.81.15:3000/location', // TODO: IMPLEMENT THIS
                // httpHeaders: {
                //     'X-FOO': 'bar'
                // },
                // // customize post properties
                // postTemplate: {
                //     lat: '@latitude',
                //     lon: '@longitude',
                //     foo: 'bar' // you can also add your own properties
                // }
            });
            backgroundGeolocation.start();
        };
        qmService.backgroundGeolocationStartV3 = function(){
            if(typeof BackgroundGeolocation === "undefined"){
                if(typeof backgroundGeolocation === "undefined"){
                    qmLog.error('Cannot execute backgroundGeolocationStartV2 because BackgroundGeolocation and backgroundGeolocation is not defined');
                }else{
                    qmLog.error('Cannot execute backgroundGeolocationStartV2 because BackgroundGeolocation is not defined. However, backgroundGeolocation is defined');
                }
                return;
            }
            // Don't forget to remove listeners at some point!
            BackgroundGeolocation.events.forEach(function(event){
                BackgroundGeolocation.removeAllListeners(event);
            });
            BackgroundGeolocation.configure({
                locationProvider: BackgroundGeolocation.ANDROID_DISTANCE_FILTER_PROVIDER,  // Best for background https://github.com/mauron85/cordova-plugin-background-geolocation/blob/master/PROVIDERS.md
                desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
                stationaryRadius: 25, // Stationary radius in meters. When stopped, the minimum distance the device must move beyond the stationary location for aggressive background-tracking to engage.
                distanceFilter: 25, // The minimum distance (measured in meters) a device must move horizontally before an update event is generated.
                debug: true,  //  When enabled, the plugin will emit sounds for life-cycle events of background-geolocation! See debugging sounds table.
                stopOnTerminate: false, // Enable this in order to force a stop() when the application terminated (e.g. on iOS, double-tap home button, swipe away the app).
                // ACTIVITY_PROVIDER Settings Start
                // locationProvider: BackgroundGeolocation.ANDROID_ACTIVITY_PROVIDER, // Best for foreground https://github.com/mauron85/cordova-plugin-background-geolocation/blob/master/PROVIDERS.md
                interval: 5 * 60 * 1000,  // The minimum time interval between location updates in milliseconds.
                fastestInterval: 60 * 1000,  // Fastest rate in milliseconds at which your app can handle location updates.
                activitiesInterval: 5 * 60 * 1000,  // Rate in milliseconds at which activity recognition occurs. Larger values will result in fewer activity detections while improving battery life.
                // ANDROID
                startForeground: true, //  On Android devices it is recommended to have a notification in the drawer
                startOnBoot: true, // Start background service on device boot.
                notificationTitle: 'Recording Location',
                notificationText: 'Tap to open inbox',
                notificationIconLarge: null,
                notificationIconSmall: 'ic_stat_icon_bw',
                // ACTIVITY_PROVIDER Settings End
                // url: 'http://192.168.81.15:3000/location', // TODO: IMPLEMENT THIS
                // httpHeaders: {
                //     'X-FOO': 'bar'
                // },
                // // customize post properties
                // postTemplate: {
                //     lat: '@latitude',
                //     lon: '@longitude',
                //     foo: 'bar' // you can also add your own properties
                // }
            });
            BackgroundGeolocation.on('stationary', function(stationaryLocation){
                qmLog.info('background location stationary so posting measurement ', stationaryLocation);
                var isBackground = true;
                qmService.forecastIoWeather(stationaryLocation);
                lookupGoogleAndFoursquareLocationAndPostMeasurement(stationaryLocation, isBackground);
                //BackgroundGeolocation.finish();
            });
            BackgroundGeolocation.on('error', function(error){
                var errorMessage = 'BackgroundGeoLocation error ' + JSON.stringify(error);
                qmLog.error(errorMessage);
            });
            BackgroundGeolocation.on('start', function(){
                qmLog.info('[INFO] BackgroundGeolocation service has been started');
            });
            BackgroundGeolocation.on('stop', function(){
                qmLog.info('[INFO] BackgroundGeolocation service has been stopped');
            });
            BackgroundGeolocation.on('authorization', function(status){
                qmLog.info('[INFO] BackgroundGeolocation authorization status: ' + status);
                if(status !== BackgroundGeolocation.AUTHORIZED){
                    // we need to set delay or otherwise alert may not be shown
                    setTimeout(function(){
                        var showSettings = confirm('App requires location tracking permission. Would you like to open app settings?');
                        if(showSettings){
                            return BackgroundGeolocation.showAppSettings();
                        }
                    }, 1000);
                }
            });
            BackgroundGeolocation.on('event', function(event){
                qmLog.info('[INFO] Event detected ' + JSON.stringify(event));
                // you can also reconfigure service (changes will be applied immediately)
            });
            BackgroundGeolocation.on('background', function(){
                qmLog.info('[INFO] App is in background');
                // you can also reconfigure service (changes will be applied immediately)
                BackgroundGeolocation.configure({debug: true});
            });
            BackgroundGeolocation.on('foreground', function(){
                qmLog.info('[INFO] App is in foreground');
                BackgroundGeolocation.configure({debug: false});
            });
            BackgroundGeolocation.checkStatus(function(status){
                qmLog.info('[INFO] BackgroundGeolocation service is running', status.isRunning);
                qmLog.info('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
                qmLog.info('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
                // you don't need to check status before start (this is just the example)
                if(!status.isRunning){
                    BackgroundGeolocation.start(); //triggers start on start event
                }
            });
        };
        qmService.backgroundGeolocationStartIfEnabled = function(){
            var deferred = $q.defer();
            //qmLog.debug('Starting qmService.backgroundGeolocationStartIfEnabled');
            if(qm.storage.getItem('bgGPS')){
                $ionicPlatform.ready(function(){
                    qmService.backgroundGeolocationStartV2();
                });
                deferred.resolve();
            }else{
                var error = 'qmService.backgroundGeolocationStartIfEnabled failed because $rootScope.user.trackLocation is not true';
                //qmLog.debug(error);
                deferred.reject(error);
            }
            return deferred.promise;
        };
        qmService.backgroundGeolocationStop = function(){
            qm.storage.setItem('bgGPS', 0);
            if(typeof BackgroundGeolocation !== "undefined"){
                BackgroundGeolocation.stop();
            }
            if(typeof backgroundGeolocation !== "undefined"){
                backgroundGeolocation.stop();
            }
        };
        qmService.getSecondsSinceWeLastGotNotifications = function(){
            var lastGotNotificationsAtMilliseconds = qm.storage.getItem(qm.items.lastGotNotificationsAtMilliseconds);
            if(!lastGotNotificationsAtMilliseconds){
                lastGotNotificationsAtMilliseconds = 0;
            }
            return parseInt((qm.timeHelper.getUnixTimestampInMilliseconds() - lastGotNotificationsAtMilliseconds) / 1000);
        };
        qmService.storage.deleteTrackingReminderNotification = function(body){
            qm.storage.deleteTrackingReminderNotification(body);
        };
        qmService.createDefaultReminders = function(){
            var deferred = $q.defer();
            var defaultRemindersCreated = qm.storage.getItem('defaultRemindersCreated');
            if(!defaultRemindersCreated){
                var defaults = qmService.getDefaultReminders();
                if(defaults && defaults.length){
                    qm.reminderHelper.addToQueue(defaults);
                    qmService.trackingReminders.syncTrackingReminders().then(function(fromAPI){
                        deferred.resolve(fromAPI);
                    });
                    qmLog.debug('Creating default reminders ', defaults);
                }
            }else{
                deferred.reject('Default reminders already created');
                qmLog.debug('Default reminders already created', null);
            }
            return deferred.promise;
        };
        qmService.getNotesDeferred = function(variableName){
            var deferred = $q.defer();
            qmService.getNotesFromApi({variableName: variableName}, function(response){
                deferred.resolve(response.data);
            }, function(error){
                qmLog.error(error);
                deferred.reject(error);
            });
            return deferred.promise;
        };
        qm.getPrimaryOutcomeVariableOptionLabels = function(shouldShowNumbers){
            if(shouldShowNumbers || !qm.getPrimaryOutcomeVariable().ratingOptionLabels){
                return ['1', '2', '3', '4', '5'];
            }else{
                return qm.getPrimaryOutcomeVariable().ratingOptionLabels;
            }
        };
        qmService.getPositiveImageByRatingValue = function(numericValue){
            var positiveRatingOptions = qmService.getPositiveRatingOptions();
            var filteredList = positiveRatingOptions.filter(function(option){
                return option.numericValue === numericValue;
            });
            return filteredList.length ? filteredList[0].img || false : false;
        };
        qmService.getNegativeImageByRatingValue = function(numericValue){
            var negativeRatingOptions = this.getNegativeRatingOptions();
            var filteredList = negativeRatingOptions.filter(function(option){
                return option.numericValue === numericValue;
            });
            return filteredList.length ? filteredList[0].img || false : false;
        };
        qmService.getNumericImageByRatingValue = function(numericValue){
            var numericRatingOptions = this.getNumericRatingOptions();
            var filteredList = numericRatingOptions.filter(function(option){
                return option.numericValue === numericValue;
            });
            return filteredList.length ? filteredList[0].img || false : false;
        };
        qmService.getRatingFaceImageByText = function(lowerCaseRatingTextDescription){
            var positiveRatingOptions = qmService.getPositiveRatingOptions();
            var filteredList = positiveRatingOptions.filter(
                function(option){
                    return option.lowerCaseTextDescription === lowerCaseRatingTextDescription;
                });
            return filteredList.length ? filteredList[0].img || false : false;
        };
        qmService.getPositiveRatingOptions = function(){
            return [
                {
                    numericValue: 1,
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[0],
                    lowerCaseTextDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[0].toLowerCase(),
                    img: qm.ratingImages.positive[0]
                },
                {
                    numericValue: 2,
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[1],
                    lowerCaseTextDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[1].toLowerCase(),
                    img: qm.ratingImages.positive[1]
                },
                {
                    numericValue: 3,
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[2],
                    lowerCaseTextDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[2].toLowerCase(),
                    img: qm.ratingImages.positive[2]
                },
                {
                    numericValue: 4,
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[3],
                    lowerCaseTextDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[3].toLowerCase(),
                    img: qm.ratingImages.positive[3]
                },
                {
                    numericValue: 5,
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[4],
                    lowerCaseTextDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[4].toLowerCase(),
                    img: qm.ratingImages.positive[4]
                }
            ];
        };
        qmService.getNegativeRatingOptions = function(){
            return [
                {
                    numericValue: 1,
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[4],
                    value: qm.getPrimaryOutcomeVariable().ratingOptionLabels[4].toLowerCase(),
                    img: qm.ratingImages.negative[0]
                },
                {
                    numericValue: 2,
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[3],
                    value: qm.getPrimaryOutcomeVariable().ratingOptionLabels[3].toLowerCase(),
                    img: qm.ratingImages.negative[1]
                },
                {
                    numericValue: 3,
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[2],
                    value: qm.getPrimaryOutcomeVariable().ratingOptionLabels[2].toLowerCase(),
                    img: qm.ratingImages.negative[2]
                },
                {
                    numericValue: 4,
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[1],
                    value: qm.getPrimaryOutcomeVariable().ratingOptionLabels[1].toLowerCase(),
                    img: qm.ratingImages.negative[3]
                },
                {
                    numericValue: 5,
                    displayDescription: qm.getPrimaryOutcomeVariable().ratingOptionLabels[0],
                    value: qm.getPrimaryOutcomeVariable().ratingOptionLabels[0].toLowerCase(),
                    img: qm.ratingImages.negative[4]
                }
            ];
        };
        qmService.getNumericRatingOptions = function(){
            return [
                {numericValue: 1, img: qm.ratingImages.numeric[0]},
                {numericValue: 2, img: qm.ratingImages.numeric[1]},
                {numericValue: 3, img: qm.ratingImages.numeric[2]},
                {numericValue: 4, img: qm.ratingImages.numeric[3]},
                {numericValue: 5, img: qm.ratingImages.numeric[4]}
            ];
        };
        qmService.getWeekdayChartConfigForPrimaryOutcome = function(){
            var deferred = $q.defer();
            qm.localForage.getItem(qm.items.primaryOutcomeMeasurements, function(measurements){
                deferred.resolve(qmService.processDataAndConfigureWeekdayChart(measurements, qm.getPrimaryOutcomeVariable()));
            });
            return deferred.promise;
        };
        qmService.generateDistributionArray = function(allMeasurements){
            var distributionArray = [];
            var valueLabel;
            for(var i = 0; i < allMeasurements.length; i++){
                if(!allMeasurements[i]){
                    return distributionArray;
                }
                valueLabel = String(allMeasurements[i].value);
                if(valueLabel.length > 1){
                    valueLabel = String(Number(allMeasurements[i].value.toPrecision(1)));
                }
                if(typeof distributionArray[valueLabel] === "undefined"){
                    distributionArray[valueLabel] = 0;
                }
                distributionArray[valueLabel] += 1;
            }
            return distributionArray;
        };
        qmService.generateWeekdayMeasurementArray = function(allMeasurements){
            if(!allMeasurements){
                qmLog.info('No measurements provided to generateWeekdayMeasurementArray', null);
                return false;
            }
            var weekdayMeasurementArrays = [];
            var millis = null;
            for(var i = 0; i < allMeasurements.length; i++){
                var m = allMeasurements[i];
                var day = qm.timeHelper.toUtcMoment(m.startAt).day();
                if(typeof weekdayMeasurementArrays[day] === "undefined"){
                    weekdayMeasurementArrays[day] = [];
                }
                weekdayMeasurementArrays[day].push(m);
            }
            return weekdayMeasurementArrays;
        };
        qmService.generateMonthlyMeasurementArray = function(allMeasurements){
            if(!allMeasurements){
                qmLog.info('No measurements provided to generateMonthlyMeasurementArray', null);
                return false;
            }
            var monthlyMeasurementArrays = [];
            for(var i = 0; i < allMeasurements.length; i++){
                var m = allMeasurements[i];
                var month = qm.timeHelper.toUtcMoment(m.startAt).month();
                if(typeof monthlyMeasurementArrays[month] === "undefined"){
                    monthlyMeasurementArrays[month] = [];
                }
                monthlyMeasurementArrays[month].push(m);
            }
            return monthlyMeasurementArrays;
        };
        qmService.generateHourlyMeasurementArray = function(allMeasurements){
            var hourlyMeasurementArrays = [];
            for(var i = 0; i < allMeasurements.length; i++){
                var m = allMeasurements[i];
                var hour = qm.timeHelper.toUtcMoment(m.startAt).hour();
                if(typeof hourlyMeasurementArrays[hour] === "undefined"){
                    hourlyMeasurementArrays[hour] = [];
                }
                hourlyMeasurementArrays[hour].push(m);
            }
            return hourlyMeasurementArrays;
        };
        qmService.calculateAverageValueByHour = function(hourlyMeasurementArrays){
            var sumByHour = [];
            var averageValueByHourArray = [];
            for(var k = 0; k < 23; k++){
                if(typeof hourlyMeasurementArrays[k] !== "undefined"){
                    for(var j = 0; j < hourlyMeasurementArrays[k].length; j++){
                        if(typeof sumByHour[k] === "undefined"){
                            sumByHour[k] = 0;
                        }
                        sumByHour[k] = sumByHour[k] + hourlyMeasurementArrays[k][j].value;
                    }
                    averageValueByHourArray[k] = sumByHour[k] / (hourlyMeasurementArrays[k].length);
                }else{
                    averageValueByHourArray[k] = null;
                    //qmLog.debug("No data for hour " + k);
                }
            }
            return averageValueByHourArray;
        };
        qmService.calculateAverageValueByWeekday = function(weekdayMeasurementArrays){
            var sumByWeekday = [];
            var averageValueByWeekdayArray = [];
            for(var k = 0; k < 7; k++){
                if(typeof weekdayMeasurementArrays[k] !== "undefined"){
                    for(var j = 0; j < weekdayMeasurementArrays[k].length; j++){
                        if(typeof sumByWeekday[k] === "undefined"){
                            sumByWeekday[k] = 0;
                        }
                        sumByWeekday[k] = sumByWeekday[k] + weekdayMeasurementArrays[k][j].value;
                    }
                    averageValueByWeekdayArray[k] = sumByWeekday[k] / (weekdayMeasurementArrays[k].length);
                }else{
                    averageValueByWeekdayArray[k] = null;
                    //qmLog.debug("No data for day " + k);
                }
            }
            return averageValueByWeekdayArray;
        };
        qmService.calculateAverageValueByMonthly = function(monthlyMeasurementArrays){
            var sumByMonthly = [];
            var averageValueByMonthlyArray = [];
            for(var k = 0; k < 12; k++){
                if(typeof monthlyMeasurementArrays[k] !== "undefined"){
                    for(var j = 0; j < monthlyMeasurementArrays[k].length; j++){
                        if(typeof sumByMonthly[k] === "undefined"){
                            sumByMonthly[k] = 0;
                        }
                        sumByMonthly[k] = sumByMonthly[k] + monthlyMeasurementArrays[k][j].value;
                    }
                    averageValueByMonthlyArray[k] = sumByMonthly[k] / (monthlyMeasurementArrays[k].length);
                }else{
                    averageValueByMonthlyArray[k] = null;
                    //qmLog.debug("No data for day " + k);
                }
            }
            return averageValueByMonthlyArray;
        };
        var shouldWeUsePrimaryOutcomeLabels = function(variableObject){
            return variableObject.userUnitId === 10 && variableObject.name === qm.getPrimaryOutcomeVariable().name;
        };
        qmService.configureDistributionChart = function(dataAndLabels, variableObject){
            var xAxisLabels = [];
            var xAxisTitle = 'Daily Values (' + variableObject.unitAbbreviatedName + ')';
            var data = [];
            if(shouldWeUsePrimaryOutcomeLabels(variableObject)){
                data = [0, 0, 0, 0, 0];
            }
            function isInt(n){
                return parseFloat(n) % 1 === 0;
            }
            var dataAndLabels2 = [];
            for(var propertyName in dataAndLabels){
                // propertyName is what you want
                // you can get the value like this: myObject[propertyName]
                if(dataAndLabels.hasOwnProperty(propertyName)){
                    dataAndLabels2.push({label: propertyName, value: dataAndLabels[propertyName]});
                    xAxisLabels.push(propertyName);
                    if(shouldWeUsePrimaryOutcomeLabels(variableObject)){
                        if(isInt(propertyName)){
                            data[parseInt(propertyName) - 1] = dataAndLabels[propertyName];
                        }
                    }else{
                        data.push(dataAndLabels[propertyName]);
                    }
                }
            }
            dataAndLabels2.sort(function(a, b){
                return a.label - b.label;
            });
            xAxisLabels = [];
            data = [];
            for(var i = 0; i < dataAndLabels2.length; i++){
                xAxisLabels.push(dataAndLabels2[i].label);
                data.push(dataAndLabels2[i].value);
            }
            if(shouldWeUsePrimaryOutcomeLabels(variableObject)){
                xAxisLabels = qm.getPrimaryOutcomeVariableOptionLabels();
                xAxisTitle = '';
            }
            var highchartConfig = {
                chart: {
                    height: 300,
                    type: 'column',
                    renderTo: 'BarContainer',
                    animation: {
                        duration: 0
                    }
                },
                xAxis: {
                    title: {
                        text: xAxisTitle
                    },
                    categories: xAxisLabels
                },
                yAxis: {
                    title: {
                        text: 'Number of Measurements'
                    },
                    min: 0
                },
                lang: {
                    loading: ''
                },
                loading: {
                    style: {
                        background: 'url(/res/loading3.gif) no-repeat center'
                    },
                    hideDuration: 10,
                    showDuration: 10
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0,
                        pointWidth: 40 * 5 / xAxisLabels.length,
                        enableMouseTracking: true,
                        colorByPoint: true
                    }
                },
                credits: {
                    enabled: false
                },
                colors: ["#000000", "#5D83FF", "#68B107", "#ffbd40", "#CB0000"],
                title: {
                    text: variableObject.name + ' Distribution'
                },
                series: [{
                    name: variableObject.name + ' Distribution',
                    data: data
                }]
            };
            return qm.chartHelper.setChartExportingOptionsOnce(highchartConfig);
        };
        qmService.processDataAndConfigureWeekdayChart = function(measurements, variableObject){
            if(!measurements){
                qmLog.info('No measurements provided to processDataAndConfigureWeekdayChart', null);
                return false;
            }
            if(!variableObject.name){
                qmLog.error("ERROR: No variable name provided to processDataAndConfigureWeekdayChart");
                return;
            }
            var weekdayMeasurementArray = this.generateWeekdayMeasurementArray(measurements);
            var averageValueByWeekdayArray = this.calculateAverageValueByWeekday(weekdayMeasurementArray);
            return this.configureWeekdayChart(averageValueByWeekdayArray, variableObject);
        };
        qmService.processDataAndConfigureMonthlyChart = function(measurements, variableObject){
            if(!measurements){
                qmLog.info('No measurements provided to processDataAndConfigureMonthlyChart', null);
                return false;
            }
            if(!variableObject.name){
                qmLog.error("ERROR: No variable name provided to processDataAndConfigureMonthlyChart");
                return;
            }
            var monthlyMeasurementArray = this.generateMonthlyMeasurementArray(measurements);
            var averageValueByMonthlyArray = this.calculateAverageValueByMonthly(monthlyMeasurementArray);
            return this.configureMonthlyChart(averageValueByMonthlyArray, variableObject);
        };
        qmService.processDataAndConfigureHourlyChart = function(measurements, variableObject){
            if(!variableObject.name){
                qmLog.error("ERROR: No variable name provided to processDataAndConfigureHourlyChart");
                return;
            }
            var hourlyMeasurementArray = this.generateHourlyMeasurementArray(measurements);
            var count = 0;
            for(var i = 0; i < hourlyMeasurementArray.length; ++i){
                if(hourlyMeasurementArray[i]){
                    count++;
                }
            }
            if(variableObject.name.toLowerCase().indexOf('daily') !== -1){
                qmLog.debug('Not showing hourly chart because variable name contains daily', null);
                return false;
            }
            if(count < 3){
                qmLog.debug('Not showing hourly chart because we have less than 3 hours with measurements', null);
                return false;
            }
            var averageValueByHourArray = this.calculateAverageValueByHour(hourlyMeasurementArray);
            return this.configureHourlyChart(averageValueByHourArray, variableObject);
        };
        qmService.processDataAndConfigureDistributionChart = function(measurements, variableObject){
            if(!variableObject.name){
                qmLog.error("ERROR: No variable name provided to processDataAndConfigureHourlyChart");
                return;
            }
            var distributionArray = this.generateDistributionArray(measurements);
            return this.configureDistributionChart(distributionArray, variableObject);
        };
        qmService.configureWeekdayChart = function(averageValueByWeekdayArray, variableObject){
            if(!variableObject.name){
                qmLog.error("ERROR: No variable name provided to configureWeekdayChart");
                return;
            }
            var maximum = 0;
            var minimum = 99999999999999999999999999999999;
            var xAxisLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            for(var i = 0; i < averageValueByWeekdayArray.length; i++){
                if(averageValueByWeekdayArray[i] > maximum){
                    maximum = averageValueByWeekdayArray[i];
                }
                if(averageValueByWeekdayArray[i] < minimum){
                    minimum = averageValueByWeekdayArray[i];
                }
            }
            var highchartConfig = {
                chart: {
                    height: 300,
                    type: 'column',
                    renderTo: 'BarContainer',
                    animation: {duration: 1000}
                },
                xAxis: {categories: xAxisLabels},
                yAxis: {
                    title: {text: 'Average Value (' + variableObject.unitAbbreviatedName + ')'},
                    min: minimum,
                    max: maximum
                },
                lang: {loading: ''},
                loading: {
                    style: {background: 'url(/res/loading3.gif) no-repeat center'},
                    hideDuration: 10,
                    showDuration: 10
                },
                legend: {enabled: false},
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0,
                        pointWidth: 40 * 5 / xAxisLabels.length,
                        enableMouseTracking: true,
                        colorByPoint: true
                    }
                },
                credits: {enabled: false},
                title: {text: 'Average  ' + variableObject.name + ' by Day of Week'},
                colors: ["#5D83FF", "#68B107", "#ffbd40", "#CB0000"],
                series: [{
                    name: 'Average  ' + variableObject.name + ' by Day of Week',
                    data: averageValueByWeekdayArray
                }]
            };
            return qm.chartHelper.setChartExportingOptionsOnce(highchartConfig);
        };
        qmService.configureMonthlyChart = function(averageValueByMonthlyArray, variableObject){
            if(!variableObject.name){
                qmLog.error("ERROR: No variable name provided to configureMonthlyChart");
                return;
            }
            var maximum = 0;
            var minimum = 99999999999999999999999999999999;
            var xAxisLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for(var i = 0; i < averageValueByMonthlyArray.length; i++){
                if(averageValueByMonthlyArray[i] > maximum){
                    maximum = averageValueByMonthlyArray[i];
                }
                if(averageValueByMonthlyArray[i] < minimum){
                    minimum = averageValueByMonthlyArray[i];
                }
            }
            var highchartConfig = {
                chart: {
                    height: 300,
                    type: 'column',
                    renderTo: 'BarContainer',
                    animation: {duration: 1000}
                },
                xAxis: {categories: xAxisLabels},
                yAxis: {
                    title: {text: 'Average Value (' + variableObject.unitAbbreviatedName + ')'},
                    min: minimum,
                    max: maximum
                },
                lang: {loading: ''},
                loading: {
                    style: {background: 'url(/res/loading3.gif) no-repeat center'},
                    hideDuration: 10,
                    showDuration: 10
                },
                legend: {enabled: false},
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0,
                        pointWidth: 40 * 5 / xAxisLabels.length,
                        enableMouseTracking: true,
                        colorByPoint: true
                    }
                },
                credits: {enabled: false},
                colors: ["#5D83FF", "#68B107", "#ffbd40", "#CB0000"],
                title: {text: 'Average  ' + variableObject.name + ' by Month'},
                series: [{
                    name: 'Average  ' + variableObject.name + ' by Month',
                    data: averageValueByMonthlyArray
                }]
            };
            return qm.chartHelper.setChartExportingOptionsOnce(highchartConfig);
        };
        qmService.configureHourlyChart = function(averageValueByHourArray, variableObject){
            if(!variableObject.name){
                qmLog.error("ERROR: No variable name provided to configureHourlyChart");
                return;
            }
            var maximum = 0;
            var minimum = 99999999999999999999999999999999;
            var xAxisLabels = [
                '12 AM',
                '1 AM',
                '2 AM',
                '3 AM',
                '4 AM',
                '5 AM',
                '6 AM',
                '7 AM',
                '8 AM',
                '9 AM',
                '10 AM',
                '11 AM',
                '12 PM',
                '1 PM',
                '2 PM',
                '3 PM',
                '4 PM',
                '5 PM',
                '6 PM',
                '7 PM',
                '8 PM',
                '9 PM',
                '10 PM',
                '11 PM'
            ];
            for(var i = 0; i < averageValueByHourArray.length; i++){
                if(averageValueByHourArray[i] > maximum){
                    maximum = averageValueByHourArray[i];
                }
                if(averageValueByHourArray[i] < minimum){
                    minimum = averageValueByHourArray[i];
                }
            }
            var highchartConfig = {
                chart: {
                    height: 300,
                    type: 'column',
                    renderTo: 'BarContainer',
                    animation: {
                        duration: 1000
                    }
                },
                title: {text: 'Average  ' + variableObject.name + ' by Hour of Day'},
                xAxis: {categories: xAxisLabels},
                yAxis: {
                    title: {text: 'Average Value (' + variableObject.unitAbbreviatedName + ')'},
                    min: minimum,
                    max: maximum
                },
                lang: {loading: ''},
                loading: {
                    style: {background: 'url(/res/loading3.gif) no-repeat center'},
                    hideDuration: 10,
                    showDuration: 10
                },
                legend: {enabled: false},
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0,
                        pointWidth: 40 * 5 / xAxisLabels.length,
                        enableMouseTracking: true,
                        colorByPoint: true
                    }
                },
                credits: {enabled: false},
                colors: ["#5D83FF", "#68B107", "#ffbd40", "#CB0000"],
                series: [{
                    name: 'Average  ' + variableObject.name + ' by Hour of Day',
                    data: averageValueByHourArray
                }]
            };
            return qm.chartHelper.setChartExportingOptionsOnce(highchartConfig);
        };
        qmService.processDataAndConfigureLineChart = function(measurements, variableObject){
            if(!measurements || !measurements.length){
                qmLog.info('No measurements provided to qmService.processDataAndConfigureLineChart');
                return false;
            }
            var lineChartData = [];
            var lineChartItem, name;
            var numberOfMeasurements = measurements.length;
            if(numberOfMeasurements > 1000){
                console.warn('Highstock cannot show tooltips because we have more than 100 measurements');
            }
            for(var i = 0; i < numberOfMeasurements; i++){
                var m = measurements[i];
                var millis = qm.timeHelper.toMillis(m.startAt);
                if(numberOfMeasurements < 1000){
                    name = (m.sourceName) ? "(" + m.sourceName + ")" : '';
                    if(m.note){
                        name = m.note + " " + name;
                    }
                    lineChartItem = {x: millis, y: m.value, name: name};
                }else{
                    lineChartItem = [millis, m.value];
                }
                lineChartData.push(lineChartItem);
            }
            return qmService.configureLineChart(lineChartData, variableObject);
        };
        function calculateWeightedMovingAverage(array, weightedPeriod){
            var weightedArray = [];
            for(var i = 0; i <= array.length - weightedPeriod; i++){
                var sum = 0;
                for(var j = 0; j < weightedPeriod; j++){
                    sum += array[i + j] * (weightedPeriod - j);
                }
                weightedArray[i] = sum / ((weightedPeriod * (weightedPeriod + 1)) / 2);
            }
            return weightedArray;
        }
        qmService.configureLineChart = function(measurements, variable){
            if(!variable.name){
                if(variable.variableName){
                    variable.name = variable.variableName;
                }else{
                    qmLog.error("ERROR: No variable name provided to configureLineChart");
                    return;
                }
            }
            if(measurements.length < 1){
                qmLog.error("ERROR: No data provided to configureLineChart");
                return;
            }
            var date = new Date();
            var timezoneOffsetHours = (date.getTimezoneOffset()) / 60;
            var offset = timezoneOffsetHours * 60 * 60 * 1000; // minutes, seconds, milliseconds
            var min, max, i;
            var numberOfMeasurements = measurements.length;
            if(numberOfMeasurements < 1000){
                measurements = measurements.sort(function(a, b){
                    return a.x - b.x;
                });
                for(i = 0; i < numberOfMeasurements; i++){
                    measurements[i].x = measurements[i].x - offset;
                }
                min = measurements[0].x - offset;
                max = measurements[measurements.length - 1].x - offset;
            }else{
                measurements = measurements.sort(function(a, b){
                    return a[0] - b[0];
                });
                for(i = 0; i < numberOfMeasurements; i++){
                    measurements[i][0] = measurements[i][0] - offset;
                }
                min = measurements[0][0] - offset;
                max = measurements[measurements.length - 1][0] - offset;
            }
            var spread = max - min;
            if(spread < 86400 * 1000){
                console.warn('Need at least a day worth of data for line chart');
                //return;
            }
            var chartConfig = {
                useHighStocks: true,
                //turboThreshold: 0, // DOESN'T SEEM TO WORK -Disables 1000 data point limitation http://api.highcharts.com/highcharts/plotOptions.series.turboThreshold
                tooltip: {
                    shared: true,
                    formatter: function(){
                        var value = this;
                        var string = '';
                        if(numberOfMeasurements < 1000){
                            string += '<h3><b>' + moment(value.x).format("h A, dddd, MMM Do YYYY") + '<b></h3><br/>';
                        }else{
                            string += '<h3><b>' + moment(value.x).format("MMM Do YYYY") + '<b></h3><br/>';
                        }
                        angular.forEach(value.points, function(point){
                            //string += '<span>' + point.series.name + ':</span> ';
                            string += '<span>' + (point.point.y + variable.unitAbbreviatedName).replace(' /', '/') + '</span>';
                            string += '<br/>';
                            if(value.points["0"].point.name){
                                string += '<span>' + value.points["0"].point.name + '</span>';
                                string += '<br/>';
                            }
                        });
                        return string;
                    },
                    useHtml: true
                },
                legend: {enabled: false},
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        millisecond: '%I:%M %p',
                        second: '%I:%M %p',
                        minute: '%I:%M %p',
                        hour: '%I %p',
                        day: '%e. %b',
                        week: '%e. %b',
                        month: '%b \'%y',
                        year: '%Y'
                    },
                    min: min,
                    max: max
                },
                credits: {enabled: false},
                rangeSelector: {enabled: true},
                navigator: {
                    enabled: true,
                    xAxis: {
                        type: 'datetime',
                        dateTimeLabelFormats: {
                            millisecond: '%I:%M %p',
                            second: '%I:%M %p',
                            minute: '%I:%M %p',
                            hour: '%I %p',
                            day: '%e. %b',
                            week: '%e. %b',
                            month: '%b \'%y',
                            year: '%Y'
                        }
                    }
                },
                title: {text: variable.name + ' Over Time (' + variable.unitAbbreviatedName + ')'},
                series: [{
                    name: variable.name + ' Over Time',
                    data: measurements,
                    tooltip: {valueDecimals: 2}
                }]
            };
            var doNotConnectPoints = variable.unitCategoryName !== 'Rating';
            if(doNotConnectPoints){
                chartConfig.series.marker = {enabled: true, radius: 2};
                chartConfig.series.lineWidth = 0;
                chartConfig.series.states = {hover: {lineWidthPlus: 0}};
            }
            return qm.chartHelper.setChartExportingOptionsOnce(chartConfig);
        };
        qmService.goToPredictorsList = function(variableName){
            qmService.goToState(qm.staticData.stateNames.predictorsAll, {effectVariableName: variableName});
        };
        qmService.goToOutcomesList = function(variableName){
            qmService.goToState(qm.staticData.stateNames.outcomesAll, {causeVariableName: variableName});
        };
        qmService.goToCorrelationsListForVariable = function(variable){
            function goToCorrelationsList(variable){
                var name = variable.name || variable.variableName;
                if(variable.outcome){
                    qmService.goToPredictorsList(name);
                }else{
                    qmService.goToOutcomesList(name);
                }
            }
            if(typeof variable === "string"){
                qm.userVariables.findByName(variable, {}, null)
                    .then(function(userVariable){
                        goToCorrelationsList(userVariable);
                    })
            }else{
                goToCorrelationsList(variable);
            }
        };
        qmService.goToStudyCreationForOutcome = function(variable){
            qmService.goToState(qm.staticData.stateNames.studyCreation, {effectVariable: variable});
        };
        qmService.goToStudyCreationForPredictor = function(variable){
            qmService.goToState(qm.staticData.stateNames.studyCreation, {causeVariable: variable});
        };
        qmService.goToStudyCreationForVariable = function(variable){
            if(variable.outcome){
                qmService.goToStudyCreationForOutcome(variable);
            }else{
                qmService.goToStudyCreationForPredictor(variable);
            }
        };
        qmService.addWikipediaExtractAndThumbnail = function(variableObject){
            qmService.getWikipediaArticle(variableObject.name).then(function(page){
                if(page){
                    variableObject.wikipediaExtract = page.extract;
                    if(page.thumbnail){
                        variableObject.imageUrl = page.thumbnail;
                    }
                }
            });
        };
        qmService.scheduleSingleMostFrequentLocalNotification = function(activeTrackingReminders){
            if(!qm.platform.isMobile() && !qm.platform.isChromeExtension()){
                return;
            }
            if(!qm.getUser()){
                qmLog.pushDebug('No user for scheduleSingleMostFrequentLocalNotification');
                return;
            }
            if(!qmService.localNotifications.localNotificationsPluginInstalled()){
                qmLog.pushDebug('Can only schedule notification on mobile or Chrome extension');
                return;
            }
            qmLog.pushDebug('We HAVE TO reschedule whenever app opens or it loses binding to its trigger events!');
            function getLocalNotificationSettings(){
                if(!activeTrackingReminders){
                    activeTrackingReminders = qm.reminderHelper.getActive();
                }
                //var at = new Date(0); // The 0 there is the key, which sets the date to the epoch
                var mostFrequentIntervalInMinutes = qm.notifications.getMostFrequentReminderIntervalInMinutes();
                if(activeTrackingReminders){
                    for(var i = 0; i < activeTrackingReminders.length; i++){
                        if(activeTrackingReminders[i].reminderFrequency === mostFrequentIntervalInMinutes * 60){
                            //at.setUTCSeconds(activeTrackingReminders[i].nextReminderTimeEpochSeconds);
                        }
                    }
                }
                var notificationSettings = {
                    every: mostFrequentIntervalInMinutes,
                    //at: at  // Setting at property calls first notification way in the future for some reason.  I think it defaults to now
                };
                notificationSettings.id = qm.getPrimaryOutcomeVariable().id;
                notificationSettings.title = "How are you?";
                notificationSettings.text = "Open reminder inbox";
                notificationSettings.sound = null;
                qmLog.pushDebug('scheduleSingleMostFrequentLocalNotification: Going to schedule generic notification', notificationSettings);
                if(qm.platform.isAndroid()){
                    notificationSettings.icon = 'ic_stat_icon_bw';
                }
                if(qm.platform.isIOS()){
                    notificationSettings.sound = "file://sound/silent.ogg";
                    var everyString = 'minute';
                    if(notificationSettings.every > 1){
                        everyString = 'hour';
                    }
                    if(notificationSettings.every > 60){
                        everyString = 'day';
                    }
                    console.warn("scheduleGenericIosNotification: iOS requires second, minute, hour, day, week, month, year so converting " +
                        notificationSettings.every + " minutes to string: " + everyString);
                    // Don't include notificationSettings.icon for iOS. I keep seeing "Unknown property: icon" in Safari console
                    notificationSettings.every = everyString;
                }
                return notificationSettings;
            }
            var notificationSettings = getLocalNotificationSettings();
            cordova.plugins.notification.local.cancelAll(function(){
                qmLog.pushDebug('cancelAllNotifications: notifications have been cancelled');
                qmService.localNotifications.getAllLocalScheduled(function(notifications){
                    qmLog.pushDebug('cancelAllNotifications: All notifications after cancelling: ', notifications);
                    function initializeLocalPopupNotifications(notificationSettings){
                        $ionicPlatform.ready(function(){
                            /** @namespace cordova.plugins.notification */
                            cordova.plugins.notification.local.schedule(notificationSettings, function(data){
                                qmLog.info('scheduleGenericNotification: notification scheduled.  Settings: ', notificationSettings);
                                qmLog.info('cordova.plugins.notification.local callback. data: ', data);
                                qmService.notifications.showAndroidPopupForMostRecentNotification(true);
                                qmLog.pushDebug("Setting pop-up on local notification trigger but IT ONLY WORKS WHEN THE APP IS RUNNING so we set it for push notifications as well as local ones!");
                                cordova.plugins.notification.local.on("trigger", function(currentNotification){
                                    qmLog.pushDebug('onTrigger: just triggered this notification: ', currentNotification);
                                    qm.storage.setItem(qm.items.lastLocalNotificationTime, qm.timeHelper.getUnixTimestampInSeconds());
                                    qmService.notifications.showAndroidPopupForMostRecentNotification();
                                });
                            });
                        });
                    }
                    initializeLocalPopupNotifications(notificationSettings);
                });
            });
        };
        // cancel all existing notifications
        qmService.cancelAllNotifications = function(){
            var deferred = $q.defer();
            if(typeof cordova !== "undefined" && typeof cordova.plugins.notification !== "undefined"){
                $ionicPlatform.ready(function(){
                    cordova.plugins.notification.local.cancelAll(function(){
                        qmLog.pushDebug('cancelAllNotifications: notifications have been cancelled', null);
                        qmService.localNotifications.getAllLocalScheduled(function(notifications){
                            qmLog.pushDebug('cancelAllNotifications: All notifications after cancelling', notifications);
                        });
                        deferred.resolve();
                    });
                });
            }else if(typeof chrome !== "undefined" && typeof chrome.alarms !== "undefined"){
                chrome.alarms.clearAll(function(){
                    qmLog.debug('Cleared all Chrome alarms!', null);
                    deferred.resolve();
                });
            }else{
                qmLog.pushDebug('cancelAllNotifications: Chrome and cordova are not defined.', null);
                deferred.resolve();
            }
            return deferred.promise;
        };
        // TIME SERVICE
        qmService.getSecondsSinceMidnightLocalFromLocalString = function(localTimeString){
            var timeFormat = "HH:mm:ss";
            var hours = parseInt(moment(localTimeString, timeFormat).format("HH"));
            var minutes = parseInt(moment(localTimeString, timeFormat).format("mm"));
            var seconds = parseInt(moment(localTimeString, timeFormat).format("ss"));
            var secondsSinceMidnightLocal = hours * 60 * 60 + minutes * 60 + seconds;
            return secondsSinceMidnightLocal;
        };
        qmService.getEpochTimeFromLocalString = function(localTimeString){
            var timeFormat = "HH:mm:ss";
            return moment(localTimeString, timeFormat).unix();
        };
        qmService.getEpochTimeFromLocalStringRoundedToHour = function(localTimeString){
            var timeFormat = "HH";
            var partsOfString = localTimeString.split(':');
            var epochTime = moment(partsOfString[0], timeFormat).unix();
            return epochTime;
        };
        qmService.getLocalTimeStringFromUtcString = function(utcTimeString){
            var timeFormat = "HH:mm:ss Z";
            var utcTimeStringFull = moment().format(timeFormat);
            if(utcTimeString){
                utcTimeStringFull = utcTimeString + " +0000";
            }
            var returnTimeFormat = "HH:mm:ss";
            var localTimeString = moment(utcTimeStringFull, timeFormat).format(returnTimeFormat);
            //qmLog.debug("localTimeString is " + localTimeString);
            return localTimeString;
        };
        qmService.getLocalMidnightInUtcString = function(){
            var localMidnightMoment = moment(0, "HH");
            var timeFormat = 'YYYY-MM-DD HH:mm:ss';
            return localMidnightMoment.utc().format(timeFormat);
        };
        qmService.getTomorrowLocalMidnightInUtcString = function(){
            var tomorrowLocalMidnightMoment = moment(0, "HH");
            var timeFormat = 'YYYY-MM-DD HH:mm:ss';
            tomorrowLocalMidnightMoment.add(1, 'days');
            var tomorrowLocalMidnightInUtcString = tomorrowLocalMidnightMoment.utc().format(timeFormat);
            return tomorrowLocalMidnightInUtcString;
        };
        qmService.getCurrentTimeInLocalString = function(){
            var currentMoment = moment();
            var timeFormat = 'HH:mm:ss';
            var currentTimeInLocalString = currentMoment.format(timeFormat);
            return currentTimeInLocalString;
        };
        qmService.getCurrentDateTimeInUtcString = function(){
            var currentMoment = moment();
            var timeFormat = 'YYYY-MM-DD HH:mm:ss';
            var currentDateTimeInUtcString = currentMoment.utc().format(timeFormat);
            return currentDateTimeInUtcString;
        };
        qmService.getCurrentDateString = function(){
            var currentMoment = moment();
            var timeFormat = 'YYYY-MM-DD';
            var currentDateString = currentMoment.utc().format(timeFormat);
            return currentDateString;
        };
        qmService.getCurrentDateTimeInUtcStringPlusMin = function(minutes){
            var currentMoment = moment().add(minutes, 'minutes');
            var timeFormat = 'YYYY-MM-DD HH:mm:ss';
            var currentDateTimeInUtcStringPlus15Min = currentMoment.utc().format(timeFormat);
            return currentDateTimeInUtcStringPlus15Min;
        };
        qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteen = function(defaultStartTimeInSecondsSinceMidnightLocal){
            // Round minutes
            var defaultStartTime = new Date(defaultStartTimeInSecondsSinceMidnightLocal * 1000);
            var defaultStartTimeHours = defaultStartTime.getUTCHours();
            var defaultStartTimeMinutes = defaultStartTime.getUTCMinutes();
            if(defaultStartTimeMinutes % 15 !== 0){
                if((defaultStartTimeMinutes > 0 && defaultStartTimeMinutes <= 7)){
                    defaultStartTimeMinutes = 0;
                }else if(defaultStartTimeMinutes > 7 && defaultStartTimeMinutes <= 22){
                    defaultStartTimeMinutes = 15;
                }else if(defaultStartTimeMinutes > 22 && defaultStartTimeMinutes <= 37){
                    defaultStartTimeMinutes = 30;
                }else if(defaultStartTimeMinutes > 37 && defaultStartTimeMinutes <= 52){
                    defaultStartTimeMinutes = 45;
                }else if(defaultStartTimeMinutes > 52){
                    defaultStartTimeMinutes = 0;
                    if(defaultStartTimeHours === 23){
                        defaultStartTimeHours = 0;
                    }else{
                        defaultStartTimeHours += 1;
                    }
                }
            }
            defaultStartTimeInSecondsSinceMidnightLocal = qmService.getSecondsSinceMidnightLocalFromLocalString("" +
                defaultStartTimeHours + ":" + defaultStartTimeMinutes + ":00");
            return defaultStartTimeInSecondsSinceMidnightLocal;
        };
        qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteenFromLocalString = function(localString){
            var secondsSinceMidnightLocal = qmService.getSecondsSinceMidnightLocalFromLocalString(localString);
            return qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteen(secondsSinceMidnightLocal);
        };
        // Local Storage Services
        qmService.storage.deleteById = function(localStorageItemName, elementId){
            var deferred = $q.defer();
            deferred.resolve(window.qm.storage.deleteById(localStorageItemName, elementId));
            return deferred.promise;
        };
        qmService.storage.setItem = function(key, value){
            var deferred = $q.defer();
            window.qm.storage.setItem(key, value);
            deferred.resolve();
            return deferred.promise;
        };
        qmService.storage.getAsStringWithCallback = function(key, callback){
            var val = qm.storage.getItem(key);
            callback(val);
        };
        function createWeatherIconMeasurementSet(data){
            return {
                variableCategoryName: "Environment",
                variableName: data.daily.data[0].icon.replace('-', ' '),
                combinationOperation: "MEAN",
                sourceName: $rootScope.appSettings.appDisplayName,
                unitAbbreviatedName: "count",
                fillingValue: 0,
                measurements: [{
                    value: 1,
                    startAt: yesterdayNoonAt(),
                    //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
                }]
            };
        }
        function createOutdoorWeatherMeasurementSet(data){
            return {
                variableCategoryName: "Environment",
                variableName: "Outdoor Temperature",
                combinationOperation: "MEAN",
                sourceName: $rootScope.appSettings.appDisplayName,
                unitAbbreviatedName: "F",
                measurements: [{
                    value: (data.daily.data[0].temperatureMax + data.daily.data[0].temperatureMin) / 2,
                    startAt: yesterdayNoonAt(),
                    //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
                }]
            };
        }
        function yesterdayNoonAt(){
            var localMidnightMoment = moment(0, "HH");
            var localMidnightTimestamp = localMidnightMoment.unix();
            var yesterdayNoonTimestamp = localMidnightTimestamp - 86400 / 2;
            return qm.timeHelper.toMySQLTimestamp(yesterdayNoonTimestamp);
        }
        function createBarometricPressureMeasurement(data){
            return {
                variableCategoryName: "Environment",
                variableName: "Barometric Pressure",
                combinationOperation: "MEAN",
                sourceName: $rootScope.appSettings.appDisplayName,
                unitAbbreviatedName: "Pa",
                measurements: [{
                    value: data.daily.data[0].pressure * 100,
                    startAt: yesterdayNoonAt()
                    //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
                }]
            };
        }
        function createOutdoorHumidityMeasurement(data){
            return {
                variableCategoryName: "Environment",
                variableName: "Outdoor Humidity",
                combinationOperation: "MEAN",
                sourceName: $rootScope.appSettings.appDisplayName,
                unitAbbreviatedName: "%",
                measurements: [{
                    value: data.daily.data[0].humidity * 100,
                    startAt: yesterdayNoonAt()
                    //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
                }]
            };
        }
        function createOutdoorVisibilityMeasurement(data){
            return {
                variableCategoryName: "Environment",
                variableName: "Outdoor Visibility",
                combinationOperation: "MEAN",
                sourceName: $rootScope.appSettings.appDisplayName,
                unitAbbreviatedName: "miles",
                measurements: [{
                    value: data.daily.data[0].visibility,
                    startAt: yesterdayNoonAt()
                    //note: data.daily.data[0].icon // We shouldn't add icon as note because it messes up the note analysis
                }]
            };
        }
        function createCloudCoverMeasurement(data){
            /** @namespace data.daily.data[0].cloudCover */
            return {
                variableCategoryName: "Environment",
                variableName: "Cloud Cover",
                combinationOperation: "MEAN",
                sourceName: $rootScope.appSettings.appDisplayName,
                unitAbbreviatedName: "%",
                measurements: [{
                    value: data.daily.data[0].cloudCover * 100,
                    startAt: yesterdayNoonAt()
                    //note: data.daily.data[0].icon  // We shouldn't add icon as note because it messes up the note analysis
                }]
            };
        }
        function getLastPostedWeatherAtTimeUnixTime(){
            return Number(qm.storage.getItem('lastPostedWeatherAt'));
        }
        function alreadyPostedWeatherSinceNoonYesterday(){
            var time = getLastPostedWeatherAtTimeUnixTime();
            if(!time){
                return false;
            }
            var lastPostedWeatherAt = qm.timeHelper.toMySQLTimestamp(time);
            if(lastPostedWeatherAt && lastPostedWeatherAt > yesterdayNoonAt()){
                qmLog.debug('recently posted weather already', null);
                return true;
            }
            return false;
        }
        function getWeatherMeasurementSets(data){
            qmLog.debug(data, null);
            var measurementSets = [];
            measurementSets.push(createWeatherIconMeasurementSet(data));
            measurementSets.push(createOutdoorWeatherMeasurementSet(data));
            measurementSets.push(createBarometricPressureMeasurement(data));
            measurementSets.push(createOutdoorHumidityMeasurement(data));
            if(data.daily.data[0].visibility){
                measurementSets.push(createOutdoorVisibilityMeasurement(data));
            }
            measurementSets.push(createCloudCoverMeasurement(data));
            return measurementSets;
        }
        qmService.forecastIoWeather = function(coordinates){
            if(!$rootScope.user){
                qmLog.debug('No recording weather because we\'re not logged in', null);
                return;
            }
            if(alreadyPostedWeatherSinceNoonYesterday()){
                return;
            }
            var FORECASTIO_KEY = '81b54a0d1bd6e3ccdd52e777be2b14cb';
            var url = 'https://api.forecast.io/forecast/' + FORECASTIO_KEY + '/';
            var time = qm.timeHelper.toUnixTime(yesterdayNoonAt());
            url = url + coordinates.latitude + ',' + coordinates.longitude + ',' + time + '?callback=JSON_CALLBACK';
            qmLog.debug('Checking weather forecast at ' + url);
            $http.jsonp(url).success(function(data){
                var measurementSets = getWeatherMeasurementSets(data);
                qm.measurements.postMeasurements(measurementSets).then(function(response){
                    qmLog.debug('posted weather measurements');
                    if(response && response.data && response.data.userVariables){
                        qm.variablesHelper.saveToLocalStorage(response.data.userVariables);
                    }
                    qmService.storage.setItem('lastPostedWeatherAt', window.qm.timeHelper.getUnixTimestampInSeconds());
                }, function(error){
                    qmLog.error('could not post weather measurements: ', error);
                });
            }).error(function(error){
                qmLog.error('forecast.io request failed!  error: ', error, {error_response: error, request_url: url});
            });
        };
        qmService.setupHelpCards = function(){
            if(qm.storage.getItem(qm.items.defaultHelpCards)){
                return qm.storage.getItem(qm.items.defaultHelpCards);
            }
            if(!qm.getAppSettings()){
                qmLog.errorAndExceptionTestingOrDevelopment("No appSettings to setup help cards!");
                qm.getAppSettings();
                return;
            }
            qm.storage.setItem(qm.items.defaultHelpCards, qm.getAppSettings().appDesign.helpCard.active);
            return qm.getAppSettings().appDesign.helpCard.active;
        };
        qmService.colors = {
            green: {backgroundColor: "#0f9d58", circleColor: "#03c466"},
            blue: {backgroundColor: "#3467d6", circleColor: "#5b95f9"},
            yellow: {backgroundColor: "#f09402", circleColor: "#fab952"}
        };
        qmService.setupOnboardingPages = function(){
            var activeOnboardingPages = $rootScope.appSettings.appDesign.onboarding.active;
            $rootScope.appSettings.appDesign.onboarding.active = qmService.addColorsCategoriesAndNames(activeOnboardingPages);
        };
        qmService.setupUpgradePages = function(){
            var upgradePages = [
                {
                    id: "upgradePage",
                    title: 'QuantiModo Plus',
                    "backgroundColor": "#3467d6",
                    circleColor: "#fefdfc",
                    iconClass: "icon positive ion-ios-medkit-outline",
                    image: {
                        url: "img/robots/quantimodo-robot-waving.svg"
                    },
                    bodyText: "I need to eat electricity to live and I am very hungry.  Please help me by subscribing or I will die."
                },
                {
                    id: "addTreatmentRemindersCard",
                    title: 'Any Treatments?',
                    "backgroundColor": "#f09402",
                    circleColor: "#fab952",
                    variableCategoryName: "Treatments",
                    bodyText: 'Are you taking any medications, treatments, supplements, or other interventions ' +
                        'like meditation or psychotherapy? ',
                    buttons: [
                        {
                            id: "hideAddTreatmentRemindersCardButton",
                            buttonText: 'Nope',
                            buttonIconClass: "ion-checkmark",
                            buttonClass: "button button-clear button-assertive",
                            clickFunctionCall: function(){
                                $rootScope.hideUpgradePage();
                            }
                        }
                    ]
                },
                {
                    id: "addSymptomRemindersCard",
                    title: 'Recurring Symptoms?',
                    "backgroundColor": "#3467d6",
                    circleColor: "#5b95f9",
                    variableCategoryName: "Symptoms",
                    bodyText: 'Got any recurring symptoms that vary in their severity?',
                    buttons: [
                        {
                            id: "hideAddSymptomRemindersCardButton",
                            buttonText: 'Nope',
                            buttonIconClass: "ion-checkmark",
                            buttonClass: "button button-clear button-assertive",
                            clickFunctionCall: function(){
                                $rootScope.hideUpgradePage();
                            }
                        }
                    ]
                },
                {
                    id: "addEmotionRemindersCard",
                    title: 'Varying Emotions?',
                    "backgroundColor": "#0f9d58",
                    circleColor: "#03c466",
                    variableCategoryName: "Emotions",
                    bodyText: "Do you have any emotions that fluctuate regularly?<br><br>If so, add them so I can try to " +
                        "determine which factors are influencing them.",
                    buttons: [
                        {
                            id: "hideAddEmotionRemindersCardButton",
                            buttonText: 'Nope',
                            buttonIconClass: "ion-checkmark",
                            buttonClass: "button button-clear button-assertive",
                            clickFunctionCall: function(){
                                $rootScope.hideUpgradePage();
                            }
                        }
                    ]
                },
                {
                    id: "addFoodRemindersCard",
                    title: 'Common Foods or Drinks?',
                    "backgroundColor": "#3467d6",
                    circleColor: "#5b95f9",
                    variableCategoryName: "Foods",
                    bodyText: "Add any foods or drinks that you consume more than a few times a week",
                    buttons: [
                        {
                            id: "hideAddFoodRemindersCardButton",
                            buttonText: 'Nope',
                            buttonIconClass: "ion-checkmark",
                            buttonClass: "button button-clear button-assertive",
                            clickFunctionCall: function(){
                                $rootScope.hideUpgradePage();
                            }
                        }
                    ]
                },
                {
                    id: "locationTrackingInfoCard",
                    title: 'Location Tracking',
                    "backgroundColor": "#0f9d58",
                    circleColor: "#03c466",
                    bodyText: "Would you like to automatically log location? ",
                    moreInfo: qm.variableCategoryHelper.findByNameOrId('Locations').moreInfo,
                    buttons: [
                        {
                            id: "hideLocationTrackingInfoCardButton",
                            buttonText: 'NO',
                            buttonIconClass: "ion-flash-off",
                            buttonClass: "button button-clear button-assertive",
                            clickFunctionCall: function(){
                                $rootScope.hideUpgradePage();
                            }
                        }
                    ]
                },
                {
                    id: "weatherTrackingInfoCard",
                    title: 'Weather Tracking',
                    "backgroundColor": "#0f9d58",
                    circleColor: "#03c466",
                    variableCategoryName: "Environment",
                    bodyText: "Would you like to automatically log the weather to see how it might be affecting you? ",
                    buttons: [
                        {
                            id: "hideLocationTrackingInfoCardButton",
                            buttonText: 'NO',
                            buttonIconClass: "ion-flash-off",
                            buttonClass: "button button-clear button-assertive",
                            clickFunctionCall: function(){
                                $rootScope.hideUpgradePage();
                            }
                        }
                    ]
                },
                {
                    id: "importDataCard",
                    title: 'Import Your Data',
                    "backgroundColor": "#f09402",
                    circleColor: "#fab952",
                    iconClass: "icon positive ion-ios-cloud-download-outline",
                    image: {
                        url: "img/intro/download_2-96.png",
                        height: "96",
                        width: "96"
                    },
                    bodyText: "Let's go to the Import Data page and see if you're using any of the dozens of apps and " +
                        "devices that I can automatically pull data from!",
                    buttons: [
                        {
                            id: "hideImportDataCardButton",
                            buttonText: 'Done connecting data sources',
                            buttonIconClass: "ion-checkmark",
                            buttonClass: "button button-clear button-assertive",
                            clickFunctionCall: function(){
                                $rootScope.hideUpgradePage();
                            }
                        }
                    ]
                },
                {
                    id: "allDoneCard",
                    title: 'Great job!',
                    "backgroundColor": "#3467d6",
                    circleColor: "#fefdfc",
                    iconClass: "icon positive ion-ios-cloud-download-outline",
                    image: {
                        url: "img/robots/quantimodo-robot-waving.svg"
                    },
                    bodyText: "You're all set up!  Let's take a minute to record your first measurements and then " +
                        "you're done for the day! ",
                    buttons: [
                        {
                            id: "goToInboxButton",
                            buttonText: 'GO TO INBOX',
                            buttonIconClass: "ion-ios-filing-outline",
                            buttonClass: "button button-clear button-assertive",
                            clickFunctionCall: function(){
                                $rootScope.doneUpgrade();
                            }
                        }
                    ]
                }
            ];
            var upgradePagesFromLocalStorage = qm.storage.getItem('upgradePages');
            if(upgradePagesFromLocalStorage && upgradePagesFromLocalStorage.length &&
                upgradePagesFromLocalStorage !== "undefined"){
                upgradePages = upgradePagesFromLocalStorage;
            }
            $rootScope.upgradePages = upgradePages;
        };
        qmService.postCreditCardDeferred = function(body){
            var deferred = $q.defer();
            qmService.recordUpgradeProductPurchase(body.productId, null, 1);
            qmService.showBlackRingLoader(30);
            qmService.showInfoToast("Thank you! One moment please...", 30);
            function upgradeErrorHandler(response){
                qmLog.error("Upgrade failed", null, response);
                var message = 'Please try again or contact mike@quantimo.do for help.';
                if(response.error){
                    message = response.error + '  ' + message;
                }
                qmService.hideLoader();
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Could not upgrade')
                        .textContent(message)
                        .ariaLabel('Error')
                        .ok('OK')
                );
            }
            qm.subscriptions.postCreditCard(body, function(response){
                qmService.hideLoader();
                qmLog.debug("postCreditCard", response);
                if(!response || !response.user){
                    upgradeErrorHandler(response);
                    return;
                }
                qmLog.error('Successful upgrade response from API');
                qmService.setUserInLocalStorageBugsnagIntercomPush(response.user);
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Thank you!')
                        .textContent("I'm eternally grateful for your generous support!")
                        .ariaLabel('OK!')
                        .ok('Get Started')
                ).finally(function(){
                    qmService.stateHelper.goBack();
                    /** @namespace response.data.purchaseId */
                    qmService.recordUpgradeProductPurchase(response.data.productId, response.data.purchaseId, 2);
                });
                deferred.resolve(response);
            }, function(response){
                upgradeErrorHandler(response);
                deferred.reject(response);
            });
            return deferred.promise;
        };
        qmService.postDowngradeSubscriptionDeferred = function(){
            var deferred = $q.defer();
            $rootScope.user.stripeActive = false;
            qmLog.error('User downgraded subscription: ', $rootScope.user);
            qm.subscriptions.postDowngradeSubscription({}, function(user){
                qmService.setUserInLocalStorageBugsnagIntercomPush(user);
                deferred.resolve(user);
            }, function(response){
                deferred.reject(response);
            });
            return deferred.promise;
        };
        qmService.sendWithEmailComposer = function(subjectLine, emailBody, emailAddress, fallbackUrl){
            if(!emailBody){
                emailBody = "I love you!";
            }
            if(!cordova || !cordova.plugins.email){
                qmLog.error('Trying to send with cordova.plugins.email even though it is not installed. ' +
                    ' Using qmService.sendWithMailTo instead.');
                qmService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                return;
            }
            if(!emailAddress){
                emailAddress = null;
            }
            document.addEventListener('deviceready', function(){
                qmLog.debug('deviceready');
                cordova.plugins.email.isAvailable(
                    function(isAvailable){
                        if(isAvailable){
                            if(qmService.cordova.getPlugins() && qmService.cordova.getPlugins().emailComposer){
                                qmLog.debug('Generating email with cordova-plugin-email-composer', null);
                                qmService.cordova.getPlugins().emailComposer.showEmailComposerWithCallback(function(result){
                                        qmLog.debug('Response -> ' + result, null);
                                    },
                                    subjectLine, // Subject
                                    emailBody,                      // Body
                                    emailAddress,    // To
                                    'info@quantimo.do',                    // CC
                                    null,                    // BCC
                                    true,                   // isHTML
                                    null,                    // Attachments
                                    null);                   // Attachment Data
                            }else{
                                qmLog.error('window.plugins.emailComposer not available!');
                                qmService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                            }
                        }else{
                            qmLog.error('Email has not been configured for this device!');
                            qmService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                        }
                    }
                );
            }, false);
        };
        qmService.sendEmail = function(subjectLine, emailBody, emailAddress){
            if($rootScope.isMobile){
                qmService.sendWithEmailComposer(subjectLine, emailBody, emailAddress);
            }else{
                qmService.sendWithMailTo(subjectLine, emailBody, emailAddress);
            }
        };
        qmService.sendWithMailTo = function(subjectLine, emailBody, emailAddress){
            if(!emailBody){
                emailBody = "I love you!";
            }
            var emailUrl = 'mailto:';
            if(emailAddress){
                emailUrl = emailUrl + emailAddress;
            }
            emailUrl = emailUrl + '?subject=' + subjectLine + '&body=' + emailBody;
            qmService.openSharingUrl(emailUrl);
        };
        qmService.openSharingUrl = function(sharingUrl){
            qmLog.info("Opening " + sharingUrl);
            var newTab = window.open(sharingUrl, '_system');
            if(!newTab){
                alert("Please unblock popups and press the share button again!");
            }
        };
        qmService.sendEmailViaAPI = function(body, successHandler, errorHandler){
            qm.api.post('api/v2/email', body, successHandler, errorHandler);
        };
        qmService.sendEmailViaAPIDeferred = function(emailType){
            var deferred = $q.defer();
            qmService.sendEmailViaAPI({emailType: emailType}, function(){
                deferred.resolve();
            }, function(error){
                deferred.reject(error);
            });
            return deferred.promise;
        };
        var upgradeSubscriptionProducts = {
            monthly7: {
                baseProductId: 'monthly7',
                name: 'QuantiModo Plus Monthly Subscription',
                category: 'Subscription/End-User',  //The category to which the product belongs (e.g. Apparel). Use / as a delimiter to specify up to 5-levels of hierarchy (e.g. Apparel/Men/T-Shirts).
                variant: 'monthly', // The variant of the product (e.g. Black).
                position: 1, // The product's position in a list or collection (e.g. 2)
                price: 6.95
            },
            yearly60: {
                baseProductId: 'yearly60',
                name: 'QuantiModo Plus Yearly Subscription',
                category: 'Subscription/End-User',  //The category to which the product belongs (e.g. Apparel). Use / as a delimiter to specify up to 5-levels of hierarchy (e.g. Apparel/Men/T-Shirts).
                variant: 'yearly', // The variant of the product (e.g. Black).
                position: 2, // The product's position in a list or collection (e.g. 2)
                price: 59.95
            }
        };
        qmService.recordUpgradeProductImpression = function(){
            // id	text	Yes*	The product ID or SKU (e.g. P67890). *Either this field or name must be set.
            // name	text	Yes*	The name of the product (e.g. Android T-Shirt). *Either this field or id must be set.
            // list	text	No	The list or collection to which the product belongs (e.g. Search Results)
            // brand	text	No	The brand associated with the product (e.g. Google).
            // category	text	No	The category to which the product belongs (e.g. Apparel). Use / as a delimiter to specify up to 5-levels of hierarchy (e.g. Apparel/Men/T-Shirts).
            // variant	text	No	The variant of the product (e.g. Black).
            // position	integer	No	The product's position in a list or collection (e.g. 2).
            // price	currency	No	The price of a product (e.g. 29.20).
            // example: Analytics.addImpression(baseProductId, name, list, brand, category, variant, position, price);
            if(typeof Analytics !== "undefined"){
                Analytics.addImpression(upgradeSubscriptionProducts.monthly7.baseProductId,
                    upgradeSubscriptionProducts.monthly7.name, $rootScope.platform.currentPlatform + ' Upgrade Options',
                    $rootScope.appSettings.appDisplayName, upgradeSubscriptionProducts.monthly7.category,
                    upgradeSubscriptionProducts.monthly7.variant, upgradeSubscriptionProducts.monthly7.position,
                    upgradeSubscriptionProducts.monthly7.price);
                Analytics.addImpression(upgradeSubscriptionProducts.yearly60.baseProductId,
                    upgradeSubscriptionProducts.yearly60.name, $rootScope.platform.currentPlatform + ' Upgrade Options',
                    $rootScope.appSettings.appDisplayName, upgradeSubscriptionProducts.yearly60.category,
                    upgradeSubscriptionProducts.yearly60.variant, upgradeSubscriptionProducts.yearly60.position,
                    upgradeSubscriptionProducts.yearly60.price);
                Analytics.pageView();
            }
        };
        qmService.recordUpgradeProductPurchase = function(baseProductId, transactionId, step, coupon){
            //Analytics.addProduct(baseProductId, name, category, brand, variant, price, quantity, coupon, position);
            if(typeof Analytics !== "undefined"){
                Analytics.addProduct(baseProductId, upgradeSubscriptionProducts[baseProductId].name,
                    upgradeSubscriptionProducts[baseProductId].category, $rootScope.appSettings.appDisplayName,
                    upgradeSubscriptionProducts[baseProductId].variant, upgradeSubscriptionProducts[baseProductId].price,
                    1, coupon, upgradeSubscriptionProducts[baseProductId].position);
            }
            // id	text	Yes*	The transaction ID (e.g. T1234). *Required if the action type is purchase or refund.
            // affiliation	text	No	The store or affiliation from which this transaction occurred (e.g. Google Store).
            // revenue	currency	No	Specifies the total revenue or grand total associated with the transaction (e.g. 11.99). This value may include shipping, tax costs, or other adjustments to total revenue that you want to include as part of your revenue calculations. Note: if revenue is not set, its value will be automatically calculated using the product quantity and price fields of all products in the same hit.
            // tax	currency	No	The total tax associated with the transaction.
            // shipping	currency	No	The shipping cost associated with the transaction.
            // coupon	text	No	The transaction coupon redeemed with the transaction.
            // list	text	No	The list that the associated products belong to. Optional.
            // step	integer	No	A number representing a step in the checkout process. Optional on checkout actions.
            // option	text	No	Additional field for checkout and checkout_option actions that can describe option information on the checkout page, like selected payment method.
            var revenue = upgradeSubscriptionProducts[baseProductId].price;
            var affiliation = $rootScope.appSettings.appDisplayName;
            var tax = 0;
            var shipping = 0;
            var list = $rootScope.appSettings.appDisplayName;
            var option = '';
            if(typeof Analytics !== "undefined"){
                Analytics.trackTransaction(transactionId, affiliation, revenue, tax, shipping, coupon, list, step,
                    option);
            }
        };
        qmService.getStudyLinks = function(causeVariableName, effectVariableName, study){
            if(study && study.studyLinks){
                return study.studyLinks;
            }
            qmService.postVoteToApi({
                causeVariableName: causeVariableName,
                effectVariableName: effectVariableName,
                userVote: 1
            });
            var subjectLine = "Help us discover the effect of " + causeVariableName + " on " + effectVariableName;
            var studyLinkStatic = qm.api.getExpressOrigin() + "/api/v2/study?causeVariableName=" +
                                  encodeURIComponent(causeVariableName) + '&effectVariableName=' + encodeURIComponent(effectVariableName);
            var bodyText = "Please join my study at " + studyLinkStatic + " .  Have a great day!";
            return {
                studyLinkFacebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(studyLinkStatic),
                studyLinkTwitter: "https://twitter.com/home?status=" + encodeURIComponent(subjectLine + ' ' + studyLinkStatic + ' @quantimodo'),
                studyLinkGoogle: "https://plus.google.com/share?url=" + encodeURIComponent(studyLinkStatic),
                studyLinkEmail: "mailto:?subject=" + encodeURIComponent(subjectLine) + "&body=" + encodeURIComponent(bodyText)
            };
        };
        qmService.getStudyLinkStatic = function(causeVariableName, effectVariableName, study){
            if(study && study.studyLinks){
                return study.studyLinks.studyLinkStatic;
            }
            return qm.api.getExpressOrigin() + '/api/v2/study?causeVariableName=' + encodeURIComponent(causeVariableName) + '&effectVariableName=' + encodeURIComponent(effectVariableName);
        };
        qmService.getWikipediaArticle = function(title){
            var deferred = $q.defer();
            wikipediaFactory.getArticle({
                term: title, // Searchterm
                //lang: '<LANGUAGE>', // (optional) default: 'en'
                //gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
                pithumbsize: '200', // (optional) default: 400
                //pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
                exlimit: 'max', // (optional) 'max': extracts for all articles, otherwise only for the first
                //exintro: '1', // (optional) '1': if we just want the intro, otherwise it shows all sections
                redirects: ''
            }).then(function(repsonse){
                if(repsonse.data.query){
                    deferred.resolve(repsonse.data.query.pages[0]);
                }else{
                    var error = 'Wiki not found for ' + title;
                    qmLog.error(error);
                    qmLog.error(error);
                    deferred.reject(error);
                }
            }).catch(function(error){
                qmLog.error(error);
                deferred.reject(error);
                //on error
            });
            return deferred.promise;
        };
        qmService.addToFavoritesUsingVariableObject = function(v){
            var tr = {};
            tr.variableId = v.variableId;
            tr.variableName = v.name;
            tr.unitAbbreviatedName = v.unitAbbreviatedName;
            tr.valence = v.valence;
            tr.variableCategoryName = v.variableCategoryName;
            tr.reminderFrequency = 0;
            if($rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise){
                var message = 'Got deletion request before last reminder refresh completed';
                qmLog.debug(message, null);
                $rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise.reject();
                $rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise = null;
            }
            if((tr.unitAbbreviatedName !== '/5' && tr.variableName !== "Blood Pressure")){
                qmLog.debug('Going to favoriteAdd state', null);
                qmService.goToState(qm.staticData.stateNames.favoriteAdd, {
                    variableObject: v,
                    doneState: 'app.favorites'
                });
                return;
            }
            qm.reminderHelper.addToQueue(tr);
            qmService.goToState(qm.staticData.stateNames.favorites, {
                trackingReminder: tr,
            });
            qm.reminderHelper.syncReminders();
        };
        qmService.getDefaultReminders = function(){
            if(qm.getAppSettings().defaultReminders){
                return qm.getAppSettings().defaultReminders;
            }
            if(qm.getAppSettings().defaultRemindersType === 'medication'){
                return [
                    {
                        variableName: 'Heart Rate (Pulse)',
                        defaultValue: null,
                        unitAbbreviatedName: 'bpm',
                        reminderFrequency: 0,
                        icon: 'ion-heart',
                        variableCategoryName: 'Vital Signs'
                    },
                    {
                        variableName: 'Blood Pressure',
                        icon: 'ion-heart',
                        unitAbbreviatedName: 'mmHg',
                        reminderFrequency: 0,
                        defaultValue: null,
                        variableCategoryName: 'Vital Signs'
                    },
                    {
                        variableName: 'Core Body Temperature',
                        icon: null,
                        unitAbbreviatedName: 'C',
                        reminderFrequency: 0,
                        defaultValue: null,
                        variableCategoryName: 'Vital Signs'
                    },
                    {
                        variableName: 'Oxygen Saturation',
                        icon: null,
                        unitAbbreviatedName: '%',
                        reminderFrequency: 0,
                        defaultValue: null,
                        variableCategoryName: 'Vital Signs'
                    },
                    {
                        variableName: 'Respiratory Rate (Ventilation/Breath/RR/Respiration)',
                        icon: null,
                        unitAbbreviatedName: '/minute',
                        reminderFrequency: 0,
                        defaultValue: null,
                        variableCategoryName: 'Vital Signs'
                    },
                    {
                        variableName: 'Weight',
                        icon: null,
                        unitAbbreviatedName: 'lb',
                        reminderFrequency: 0,
                        defaultValue: null,
                        variableCategoryName: 'Physique'
                    },
                    {
                        variableName: 'Height',
                        icon: null,
                        unitAbbreviatedName: 'cm',
                        reminderFrequency: 0,
                        defaultValue: null,
                        variableCategoryName: 'Physique'
                    },
                    {
                        variableName: 'Body Mass Index or BMI',
                        icon: null,
                        unitAbbreviatedName: 'index',
                        reminderFrequency: 0,
                        defaultValue: null,
                        variableCategoryName: 'Physique'
                    },
                    {
                        variableName: 'Blood Glucose Sugar',
                        icon: null,
                        unitAbbreviatedName: 'mg/dL',
                        reminderFrequency: 0,
                        defaultValue: null,
                        variableCategoryName: 'Vital Signs'
                    }
                ];
            }
            return null;
        };
        qmService.convertTrackingReminderToVariableObject = function(trackingReminder){
            var variableObject = JSON.parse(JSON.stringify(trackingReminder));
            variableObject.variableId = trackingReminder.variableId;
            variableObject.name = trackingReminder.variableName;
            return variableObject;
        };
        qmService.showMaterialAlert = function(title, textContent, ev){
            if(qm.speech.getSpeechEnabled()){
                qm.speech.talkRobot(title, function(){
                    qm.speech.talkRobot(textContent);
                });
            }
            AlertDialogController.$inject = ["$scope", "$mdDialog", "dialogParameters"];
            function AlertDialogController($scope, $mdDialog, dialogParameters){
                var blackList = [
                    'Unauthorized cannot GET'
                ];
                var content = dialogParameters.textContent;
                for (var i = 0; i < blackList.length; i++) {
                    var contentElement = blackList[i];
                    if(content.indexOf(contentElement) !== -1){
                        qmLog.errorAndExceptionTestingOrDevelopment("Material alert should not contain "+
                            contentElement+ " but is"+content);
                        return;
                    }
                }
                var self = this;
                self.title = dialogParameters.title;
                self.textContent = dialogParameters.textContent;
                $scope.hide = function(){
                    $mdDialog.hide();
                };
                self.cancel = function(){
                    $mdDialog.cancel();
                };
                $scope.answer = function(answer){
                    $mdDialog.hide(answer);
                };
                self.getHelp = function(){
                    if(self.helpText && !self.showHelp){
                        return self.showHelp = true;
                    }
                    qmService.goToState(window.qm.staticData.stateNames.help);
                    $mdDialog.cancel();
                };
            }
            $mdDialog.show({
                controller: AlertDialogController,
                controllerAs: 'ctrl',
                templateUrl: 'templates/dialogs/robot-alert.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false,
                locals: {dialogParameters: {title: title, textContent: textContent}}
            })
                .then(function(answer){
                    if(answer === "help"){
                        qmService.goToState('app.help');
                    }
                    //$scope.status = 'You said the information was "' + answer + '".';
                }, function(){
                    //$scope.status = 'You cancelled the dialog.';
                });
        };
        qmService.showMaterialConfirmationDialog = function(title, textContent, yesCallbackFunction, noCallbackFunction, ev, noText){
            var maxLength = 20;
            if(title.length > maxLength){
                title = title.substring(0, maxLength) + '...';
            }
            ConfirmationDialogController.$inject = ["$scope", "$mdDialog", "dialogParameters"];
            if(!noText){
                noText = 'Cancel';
            }
            function ConfirmationDialogController($scope, $mdDialog, dialogParameters){
                var self = this;
                self.title = dialogParameters.title;
                self.textContent = dialogParameters.textContent;
                self.noText = dialogParameters.noText;
                $scope.hide = function(){
                    $mdDialog.hide();
                };
                self.cancel = function(){
                    $mdDialog.cancel();
                };
                self.getHelp = function(){
                    if(self.helpText && !self.showHelp){
                        return self.showHelp = true;
                    }
                    qmService.goToState(window.qm.staticData.stateNames.help);
                    $mdDialog.cancel();
                };
                $scope.answer = function(answer){
                    $mdDialog.hide(answer);
                };
            }
            $mdDialog.show({
                controller: ConfirmationDialogController,
                controllerAs: 'ctrl',
                templateUrl: 'templates/dialogs/robot-confirmation.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false,
                locals: {dialogParameters: {title: title, textContent: textContent, noText: noText}}
            }).then(function(answer){
                if(answer === "help"){
                    qmService.goToState('app.help');
                }
                if(answer === 'yes'){
                    yesCallbackFunction(ev);
                }
                if(answer === 'no' && noCallbackFunction){
                    noCallbackFunction(ev);
                    $mdDialog.cancel();
                }
                //}, function() {if(noCallbackFunction){noCallbackFunction(ev);}}); TODO: What was the point of this? It causes popups to be disabled inadvertently
            });
        };
        // Doesn't work yet
        function generateMovingAverageTimeSeries(rawMeasurements){
            var smoothedMeasurements = [];
            var weightedPeriod = 10;
            var sum = 0;
            var j;
            var numberOfMeasurements = rawMeasurements.length;
            for(var i = 1; i <= numberOfMeasurements - weightedPeriod; i++){
                if(numberOfMeasurements < 1000){
                    for(j = 0; j < weightedPeriod; j++){
                        sum += rawMeasurements[i + j].y * (weightedPeriod - j);
                    }
                    rawMeasurements[i].y = sum / ((weightedPeriod * (weightedPeriod + 1)) / 2);
                }else{
                    for(j = 0; j < weightedPeriod; j++){
                        sum += rawMeasurements[i + j][1] * (weightedPeriod - j);
                    }
                    rawMeasurements[i][1] = sum / ((weightedPeriod * (weightedPeriod + 1)) / 2);
                }
                smoothedMeasurements.push(rawMeasurements[i]);
            }
            return smoothedMeasurements;
        }
        qmService.getPlanFeatureCards = function(){
            var planFeatureCards = {
                lite: {
                    title: 'QuantiModo Lite',
                    headerColor: "#f2f9ff",
                    backgroundColor: "#f2f9ff",
                    subtitle: 'Improve your life!',
                    priceHtml: "Price: Free forever",
                    buttonText: "Sign Up Now",
                    buttonClass: "button button-balanced"
                },
                premium: {
                    title: 'QuantiModo Plus',
                    headerColor: "#f0df9a",
                    backgroundColor: "#ffeda5",
                    subtitle: 'Perfect your life!',
                    priceHtml: "14 day free trial <br> Monthly: $6.99/month <br> Annual: $4.99/month (4 months free!)",
                    buttonText: "Start My Free Trial",
                    buttonClass: "button button-large button-assertive"
                }
            };
            if(qm.platform.isIOS()){
                planFeatureCards = JSON.parse(JSON.stringify(planFeatureCards)
                    .replace('Start My Free Trial', 'Upgrade')
                    .replace('Android, and iOS', 'any mobile device')
                    .replace(', Sleep as Android', ''));
            }
            return planFeatureCards;
        };
        qmService.showBasicLoader = function(duration){
            if(typeof psychedelicLoader === "undefined"){
                qmLog.error("psychedelicLoader undefined!");
            } else {
                if(psychedelicLoader.showing){return;}
            }
            duration = duration || 10;
            qmLog.debug('Called showBasicLoader in ' + $state.current.name, null, qmLog.getStackTrace());
            $ionicLoading.show({duration: duration * 1000});
        };
        qmService.showBlackRingLoader = function(duration){
            if(typeof psychedelicLoader === "undefined"){
                qmLog.error("psychedelicLoader undefined!");
            } else {
                if(psychedelicLoader.showing){return;}
            }
            if(qm.urlHelper.getParam('loaderDebug')){
                qmLog.debug('Called showBlackRingLoader in ' + $state.current.name);
            }
            duration = duration || 15;
            if(ionic && ionic.Platform && ionic.Platform.isIOS()){
                qmService.showBasicLoader(duration);  // Centering is messed up on iOS for some reason
            }else{
                $ionicLoading.show({templateUrl: "templates/loaders/ring-loader.html", duration: duration * 1000});
            }
        };
        qmService.hideLoader = function(delay){
            //debugger
            if(qm.urlHelper.getParam('loaderDebug')){
                qmLog.debug('Called hideLoader in ' + $state.current.name);
            }
            if(delay){
                $timeout(function(){
                    $ionicLoading.hide();
                    if(typeof psychedelicLoader === "undefined"){
                        qmLog.error("psychedelicLoader undefined!");
                    } else {
                        psychedelicLoader.stop();
                    }
                }, delay * 1000);
            }else{
                $timeout(function(){
                    $ionicLoading.hide();
                    if(typeof psychedelicLoader === "undefined"){
                        qmLog.error("psychedelicLoader undefined!");
                    } else {
                        psychedelicLoader.stop();
                    }
                }, 500);
            }
        };
        qmService.weShouldUseOAuthLogin = function(){
            return window.location.href.indexOf('.quantimo.do') === -1;
        };
        qmService.getUserFromLocalStorageOrRefreshIfNecessary = function(){
            qmLog.debug('getUserFromLocalStorageOrRefreshIfNecessary', null);
            if(qm.urlHelper.getParam('refreshUser')){
                qm.storage.clearStorageExceptForUnitsAndCommonVariables();
                qmService.storage.setItem('onboarded', true);
                qmService.intro.setIntroSeen(true, "url has param refreshUser");
                qmService.rootScope.setUser(null);
            }
            if(!$rootScope.user && qm.getUser()){
                qmService.rootScope.setUser(qm.getUser());
                if($rootScope.user){
                    qmLog.debug('Got $rootScope.user', null, $rootScope.user);
                }
            }
            qmService.refreshUserUsingAccessTokenInUrlIfNecessary();
            if($rootScope.user){
                //qmService.registerDeviceToken(); // Try again in case it was accidentally deleted from server TODO: remove after 8/1 or so
                if(typeof $rootScope.user.trackLocation === "undefined"){
                    $rootScope.user.trackLocation = false;
                } // Only update $rootScope.user properties if undefined.  Updating $rootScope is too expensive to do all the time
                if(typeof $rootScope.user.getPreviewBuilds === "undefined"){
                    $rootScope.user.getPreviewBuilds = false;
                }
                //qmSetupInPopup();
                //qmService.humanConnect();
            }
        };
        qmService.humanConnect = function(){
            var options = {
                clientUserId: encodeURIComponent($rootScope.user.id),
                clientId: 'e043bd14114cb0fb5f0b358f3a8910545ca9525e',
                publicToken: ($rootScope.user.humanApiPublicToken) ? $rootScope.user.humanApiPublicToken : '',
                finish: function(err, sessionTokenObject){
                    /* Called after user finishes connecting their health data */
                    //POST sessionTokenObject as-is to your server for step 2.
                    qm.api.post('api/v3/human/connect/finish', sessionTokenObject).then(function(response){
                        console.log(response);
                        qmService.rootScope.setUser(response.data.user);
                    });
                    // Include code here to refresh the page.
                },
                close: function(){
                    /* (optional) Called when a user closes the popup
                 without connecting any data sources */
                },
                error: function(err){
                    /* (optional) Called if an error occurs when loading
                 the popup. */
                }
            };
            HumanConnect.open(options);
        };
        qmService.quantimodoConnectPopup = function(){
            // noinspection Annotator
            window.QuantiModoIntegration.options = {
                clientUserId: encodeURIComponent($rootScope.user.id),
                clientId: $rootScope.appSettings.clientId,
                publicToken: ($rootScope.user.quantimodoPublicToken) ? $rootScope.user.quantimodoPublicToken : '',
                finish: function(err, sessionTokenObject){
                    /* Called after user finishes connecting their health data */
                    //POST sessionTokenObject as-is to your server for step 2.
                    qm.api.post('api/v3/quantimodo/connect/finish', sessionTokenObject, function(response){
                        console.log(response);
                        if(!response.data){
                            qmLog.error("No data from api/v3/quantimodo/connect/finish response: ", response);
                            return;
                        }
                        qmService.rootScope.setUser(response.data.user);
                    });
                    // Include code here to refresh the page.
                },
                close: function(){
                    /* (optional) Called when a user closes the popup
                 without connecting any data sources */
                },
                error: function(err){
                    /* (optional) Called if an error occurs when loading
                 the popup. */
                }
            };
            window.QuantiModoIntegration.openConnectorsListPopup();
        };
        var toastPosition = angular.extend({}, {bottom: true, top: false, left: true, right: false});
        var getToastPosition = function(){
            return Object.keys(toastPosition).filter(function(pos){
                return toastPosition[pos];
            }).join(' ');
        };
        qmService.showInfoToast = function(text, seconds){
            if(!seconds){
                seconds = 3;
            }
            $mdToast.show($mdToast.simple().textContent(text).position(getToastPosition()).hideDelay(seconds * 1000));
        };
        qmService.showToastWithButton = function(textContent, buttonText, buttonFunction){
            if(!textContent || textContent === ""){
                throw "No textContent provided to showToastWithButton!";
            }
            var toast = $mdToast.simple()
                .textContent(textContent)
                .action(buttonText)
                .highlightAction(true)
                .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
                .hideDelay(10000)
                .position(getToastPosition());
            $mdToast.show(toast).then(function(response){
                if(response === 'ok'){
                    buttonFunction();
                }
            });
        };
        qmService.processAndSaveAppSettings = function(appSettings, callback){
            qmLog.debug("processAndSaveAppSettings for " + appSettings.clientId, null, appSettings);
            appSettings.doctorRobotAlias = qm.appsManager.getDoctorRobotoAlias(appSettings);
            function changeFavicon(appSettings){
                /** @namespace $rootScope.appSettings.additionalSettings.appImages.favicon */
                if(appSettings.favicon){
                    return;
                }
                //noinspection JSAnnotator
                document.head || (document.head = document.getElementsByTagName('head')[0]);
                var link = document.createElement('link'), oldLink = document.getElementById('dynamic-favicon');
                link.id = 'dynamic-favicon';
                link.rel = 'shortcut icon';
                link.href = appSettings.additionalSettings.appImages.favicon;
                if(oldLink){
                    document.head.removeChild(oldLink);
                }
                document.head.appendChild(link);
            }
            appSettings = qmService.subscriptions.setUpgradeDisabledIfOnAndroidWithoutKey(appSettings);
            qm.appsManager.processAndSaveAppSettings(appSettings, callback);
            //qmService.rootScope.setProperty('appSettings', qm.getAppSettings());
            // Need to apply immediately before rendering or nav bar color is not set for some reason
            $rootScope.appSettings = appSettings;
            qmLog.debug('appSettings.clientId is ' + appSettings.clientId);
            changeFavicon(appSettings);
        };
        qmService.initializeApplication = function(appSettings){
            qmLog.debug("Initializing application...");
            qm.qmService = qmService;
            if(window.config){
                return;
            }
            qmService.processAndSaveAppSettings(appSettings);
            qmService.patient.switchBackToPhysician();
            qmService.getUserFromLocalStorageOrRefreshIfNecessary();
            qm.userVariables.refreshIfNumberOfRemindersGreaterThanUserVariables();
            qmService.backgroundGeolocationStartIfEnabled();
            qmLog.setupBugsnag();
            setupGoogleAnalytics(qm.userHelper.getUserSync(), appSettings);
            qmService.navBar.hideNavigationMenuIfHideUrlParamSet();
            qmService.scheduleSingleMostFrequentLocalNotification();
            if(qm.urlHelper.getParam('finish_url')){
                $rootScope.finishUrl = qm.urlHelper.getParam('finish_url', null, true);
            }
            qmService.deploy.setVersionInfo();
            qmService.deploy.fetchUpdate(); // fetchUpdate done manually instead of auto-update to address iOS white screen. See: https://github.com/nordnet/cordova-hot-code-push/issues/259
            qmService.rootScope.setProperty(qm.items.speechAvailable, qm.speech.getSpeechAvailable());
            qmService.rootScope.setProperty('variableCategoryNames', qm.staticData.variableCategories.map(function(cat){
                return cat.name
            }));
            if(qm.speech.getSpeechAvailable()){
                qmService.rootScope.setProperty(qm.items.speechEnabled, qm.speech.getSpeechEnabled());
            }
            if(qm.mic.getMicAvailable()){
                qmService.rootScope.setProperty(qm.items.micAvailable, qm.mic.getMicAvailable());
            }
            qm.rootScope = $rootScope;
            if(qm.getUser()){
                qmService.setUserInLocalStorageBugsnagIntercomPush(qm.getUser());
            }
            qmService.statesToShowDriftButton = [
                qm.staticData.stateNames.onboarding,
                qm.staticData.stateNames.login,
                qm.staticData.stateNames.settings,
                qm.staticData.stateNames.upgrade,
            ];
        };
        qmService.sendBugReport = function(){
            qm.notifications.registerDeviceToken(); // Try again in case it was accidentally deleted from server
            qmService.notifications.reconfigurePushNotificationsIfNoTokenOnServerOrToSync();
            function addAppInformationToTemplate(template, callback){
                var after = new Date(qm.timeHelper.getUnixTimestampInMilliseconds() - 10 * 60 * 1000);
                var before = new Date(qm.timeHelper.getUnixTimestampInMilliseconds() + 5 * 60 * 1000);
                var url = 'https://app.bugsnag.com/quantimodo/ionic/errors?filters[event.since][0]=' + after.toISOString() +
                    '&filters[event.before][0]=' + before.toISOString();
                template = template + "Internal Debug Info: " + url + '\r\n';
                template = template + "User ID: " + $rootScope.user.id + '\r\n';
                template = template + "User Email: " + $rootScope.user.email + '\r\n';
                if(qmService.localNotifications.localNotificationsPluginInstalled()){
                    qmService.localNotifications.getAllLocalScheduled(function(localNotifications){
                        template = template + "localNotifications: " + qm.stringHelper.prettyJsonStringify(localNotifications) + '\r\n';
                        callback(template);
                    })
                }else{
                    callback(template);
                }
            }
            var subjectLine = encodeURIComponent($rootScope.appSettings.appDisplayName + ' ' + qm.getAppSettings().versionNumber + ' Bug Report');
            var template = "Please describe the issue here:  " + '\r\n' + '\r\n' + '\r\n' + '\r\n' +
                "Additional Information: " + '\r\n';
            addAppInformationToTemplate(template, function(template){
                var emailBody = encodeURIComponent(template);
                var emailAddress = 'mike@quantimo.do';
                var fallbackUrl = 'http://help.quantimo.do';
                qmLog.error("Bug Report", template);
                if(qm.platform.isMobile()){
                    qmService.sendWithEmailComposer(subjectLine, emailBody, emailAddress, fallbackUrl);
                }else{
                    qmService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                }
            });
        };
        qmService.logEventToGA = function(category, action, label, value, nonInteraction, customDimension, customMetric){
            if(!label){
                label = (qm.getUser()) ? qm.getUser().id : "NotLoggedIn";
            }
            if(typeof nonInteraction === "undefined"){
                nonInteraction = true;
            }
            if(typeof Analytics !== "undefined"){
                Analytics.trackEvent(category, action, label, value, nonInteraction, {
                    dimension15: 'My Custom Dimension',
                    metric18: 8000
                });
            }
        };
        qmService.configurePushNotifications = function(){
            if(!qm.getUser()){ // Otherwise we try to do it immediately and always get 401 and make duplicate appSettings requests
                qmLog.debug("Not configuring push notifications because we don't have a user yet");
                return;
            }
            if(!qm.platform.isMobile()){
                qm.webNotifications.registerServiceWorker(true);
                return;
            }
            $ionicPlatform.ready(function(){
                if(qm.platform.isMobile()){
                    if(typeof PushNotification === "undefined"){
                        qmLog.error('PushNotification is undefined on mobile!');
                    }
                }
                if(typeof PushNotification !== "undefined"){
                    var pushConfig = {
                        android: {
                            senderID: "1052648855194",
                            badge: true,
                            sound: false,
                            vibrate: false,
                            icon: 'ic_stat_icon_bw',
                            clearBadge: true
                        },
                        browser: {pushServiceURL: 'http://push.api.phonegap.com/v1/push'},
                        ios: {alert: "false", badge: "true", sound: "false", clearBadge: true},
                        windows: {}
                    };
                    qmLog.pushDebug('Going to try to register push ', JSON.stringify(pushConfig), pushConfig);
                    var push = PushNotification.init(pushConfig);
                    push.on('registration', function(registerResponse){
                        qmService.logEventToGA(qm.analytics.eventCategories.pushNotifications, "registered");
                        qmLog.pushDebug('Registered device for push notifications.', 'registerResponse: ', registerResponse);
                        if(!registerResponse.registrationId){
                            qmLog.error('No registerResponse.registrationId from push registration');
                        }
                        qmLog.pushDebug('Got device token for push notifications: ', registerResponse.registrationId, registerResponse);
                        var deviceTokenOnServer = qm.storage.getItem(qm.items.deviceTokenOnServer);
                        if(!deviceTokenOnServer || registerResponse.registrationId !== deviceTokenOnServer){
                            qmService.storage.setItem(qm.items.deviceTokenToSync, registerResponse.registrationId);
                        }
                    });
                    var finishPushes = true;  // Setting to false didn't solve notification dismissal problem
                    push.on('notification', function(data){
                        qm.push.logPushReceived({data: data});
                        qm.storage.setItem(qm.items.lastPushTimestamp, qm.timeHelper.getUnixTimestampInSeconds());
                        qm.storage.setItem(qm.items.lastPushData, data);
                        qmService.logEventToGA(qm.analytics.eventCategories.pushNotifications, "received");
                        qmLog.pushDebug('Received push notification: ', data);
                        qmService.updateLocationVariablesAndPostMeasurementIfChanged();
                        if(typeof window.overApps !== "undefined"){
                            qmLog.pushDebug('push notification is calling drawOverApps showAndroidPopupForMostRecentNotification...');
                            qmService.notifications.showAndroidPopupForMostRecentNotification();
                        }else{
                            qmLog.pushDebug('window.overApps for popups is undefined! ');
                            qm.notifications.syncIfEmpty({}).then(function(){
                                qmLog.pushDebug('push.on.notification: successfully refreshed notifications');
                            }, function(error){
                                qmLog.error('push.on.notification: ', error);
                            });
                        }
                        // data.message,
                        // data.title,
                        // data.count,
                        // data.sound,
                        // data.image,
                        // data.additionalData
                        if(data.additionalData.url){
                            qmLog.pushDebug("Opening data.additionalData.url: " + data.additionalData.url);
                            document.location.href = '#/app/settings'; // Hack to deal with url not updating when only parameters change
                            document.location.href = data.additionalData.url;
                        }
                        if(!finishPushes){
                            qmLog.pushDebug('Not doing push.finish for data.additionalData.notId: ' + data.additionalData.notId);
                            return;
                        }
                        push.finish(function(){
                            qmLog.pushDebug('processing of push data is finished: ', data);
                        });
                        data.deviceToken = qm.storage.getItem(qm.items.deviceTokenOnServer);
                        if(data.additionalData.acknowledge){
                            qmService.logEventToGA(qm.analytics.eventCategories.pushNotifications, "sendAcknowledgement");
                            qm.api.post("v1/trackingReminderNotification/received", data, function(response){
                                qmLog.pushDebug('notification received success response: ', response);
                            }, function(error){
                                qmLog.error("notification received error response: ", error);
                            });
                        }
                    });
                    push.on('error', function(e){
                        qmService.logEventToGA(qm.analytics.eventCategories.pushNotifications, "error", e.message);
                        qmLog.error("Push error", e.message, pushConfig);
                    });
                    var finishPush = function(data){
                        qmService.notifications.broadcastGetTrackingReminderNotifications();
                        if(!finishPushes){
                            qmLog.error('Not doing push.finish', 'Not doing push.finish for data.additionalData.notId: ' + data.additionalData.notId, data);
                            return;
                        }
                        push.finish(function(){
                            qmLog.pushDebug('Push callback finished', 'accept callback finished for data.additionalData.notId: ' +
                                data.additionalData.notId, null, data);
                        }, function(){
                            qmLog.error('Push callback failed', 'accept callback failed for data.additionalData.notId: ' +
                                data.additionalData.notId, null, data);
                        }, data.additionalData.notId);
                    };
                    window.trackYesAction = function(data){
                        var body = {
                            trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                            modifiedValue: 1
                        };
                        qmLog.pushDebug('trackYesAction', ' push data: ', {
                            pushData: data,
                            notificationsPostBody: body
                        });
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                    window.trackNoAction = function(data){
                        var body = {
                            trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                            modifiedValue: 0
                        };
                        qmLog.pushDebug('trackNoAction', ' push data: ', {pushData: data, notificationsPostBody: body});
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                    window.trackZeroAction = function(data){
                        var body = {
                            trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                            modifiedValue: 0
                        };
                        qmLog.pushDebug('trackZeroAction', ' push data: ', {
                            pushData: data,
                            notificationsPostBody: body
                        });
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                    window.trackOneRatingAction = function(data){
                        var body = {
                            trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                            modifiedValue: 1
                        };
                        qmLog.pushDebug('trackOneRatingAction', ' push data: ', {
                            pushData: data,
                            notificationsPostBody: body
                        });
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                    window.trackTwoRatingAction = function(data){
                        var body = {
                            trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                            modifiedValue: 2
                        };
                        qmLog.pushDebug('trackTwoRatingAction', ' push data: ', {
                            pushData: data,
                            notificationsPostBody: body
                        });
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                    window.trackThreeRatingAction = function(data){
                        var body = {
                            trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                            modifiedValue: 3
                        };
                        qmLog.pushDebug('trackThreeRatingAction', ' push data: ', {
                            pushData: data,
                            notificationsPostBody: body
                        });
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                    window.trackFourRatingAction = function(data){
                        var body = {
                            trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                            modifiedValue: 4
                        };
                        qmLog.pushDebug('trackFourRatingAction', ' push data: ', {
                            pushData: data,
                            notificationsPostBody: body
                        });
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                    window.trackFiveRatingAction = function(data){
                        var body = {
                            trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                            modifiedValue: 5
                        };
                        qmLog.pushDebug('trackFiveRatingAction', ' push data: ', {
                            pushData: data,
                            notificationsPostBody: body
                        });
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                    window.trackDefaultValueAction = function(data){
                        var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId};
                        qmLog.pushDebug('trackDefaultValueAction', ' push data: ', {
                            pushData: data,
                            notificationsPostBody: body
                        });
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                    window.snoozeAction = function(data){
                        var body = {trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId};
                        qmLog.pushDebug('snoozeAction', ' push data: ', {pushData: data, notificationsPostBody: body});
                        qm.notifications.snooze(body);
                        finishPush(data);
                    };
                    window.trackLastValueAction = function(data){
                        var body = {
                            trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                            modifiedValue: data.additionalData.lastValue
                        };
                        qmLog.pushDebug('trackLastValueAction', ' push data: ', {
                            pushData: data,
                            notificationsPostBody: body
                        });
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                    window.trackSecondToLastValueAction = function(data){
                        var body = {
                            trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                            modifiedValue: data.additionalData.secondToLastValue
                        };
                        qmLog.pushDebug('trackSecondToLastValueAction', ' push data: ', {
                            pushData: data,
                            notificationsPostBody: body
                        });
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                    window.trackThirdToLastValueAction = function(data){
                        var body = {
                            trackingReminderNotificationId: data.additionalData.trackingReminderNotificationId,
                            modifiedValue: data.additionalData.thirdToLastValue
                        };
                        qmLog.pushDebug('trackThirdToLastValueAction', ' push data: ', {
                            pushData: data,
                            notificationsPostBody: body
                        });
                        qm.notifications.postTrackingReminderNotifications(body);
                        finishPush(data);
                    };
                }
                qm.notifications.registerDeviceToken();
            });
        };
        qmService.setupVariableByVariableObject = function(variableObject){
            $rootScope.variableName = variableObject.name;
        };
        // qmService.autoUpdateApp = function () {
        //     var appUpdatesDisabled = true;
        //     if(appUpdatesDisabled){
        //         qmLog.debug("App updates disabled until more testing is done");
        //         return;
        //     }
        //     if(!$rootScope.platform.isMobile){
        //         qmLog.debug("Cannot update app because platform is not mobile");
        //         return;
        //     }
        //     qmService.updateApp();
        // };
        // qmService.updateApp = function () {
        //     var message;
        //     var releaseTrack;
        //     $ionicPlatform.ready(function () {
        //         if(typeof $ionicCloudProvider == "undefined"){
        //             console.warn('$ionicCloudProvider is not defined so we cannot use ionic deploy');
        //             return;
        //         }
        //         // We might need to move this back to app.js if it doesn't work
        //         if(qm.getAppSettings().additionalSettings.ionicAppId){
        //             $ionicCloudProvider.init({
        //                     "core": {
        //                         "app_id": qm.getAppSettings().additionalSettings.ionicAppId
        //                     }
        //             });
        //         } else {
        //             console.warn('Cannot initialize $ionicCloudProvider because appSettings.additionalSettings.ionicAppId is not set');
        //             return;
        //         }
        //         if($rootScope.user && $rootScope.user.getPreviewBuilds){
        //             $ionicDeploy.channel = 'staging';
        //             releaseTrack = "beta";
        //         } else {
        //             $ionicDeploy.channel = 'production';
        //             releaseTrack = "production";
        //             message = 'Not updating because user is not signed up for preview builds';
        //             qmLog.debug(message);
        //             qmLog.error(message);
        //             return;
        //         }
        //         message = 'Checking for ' + releaseTrack + ' updates...';
        //         qmService.showInfoToast(message);
        //         $ionicDeploy.check().then(function(snapshotAvailable) {
        //             if (snapshotAvailable) {
        //                 message = 'Downloading ' + releaseTrack + ' update...';
        //                 qmLog.debug(message);
        //                 if($rootScope.platform.isAndroid){
        //                     qmService.showInfoToast(message);
        //                 }
        //                 qmLog.error(message);
        //                 // When snapshotAvailable is true, you can apply the snapshot
        //                 $ionicDeploy.download().then(function() {
        //                     message = 'Downloaded new version.  Extracting...';
        //                     qmLog.debug(message);
        //                     if($rootScope.platform.isAndroid){
        //                         qmService.showInfoToast(message);
        //                     }
        //                     qmLog.error(message);
        //                     $ionicDeploy.extract().then(function() {
        //                         if($rootScope.platform.isAndroid){
        //                             $ionicPopup.show({
        //                                 title: 'Update available',
        //                                 //subTitle: '',
        //                                 template: 'An update was just downloaded. Would you like to restart your app to use the latest features?',
        //                                 buttons: [
        //                                     { text: 'Not now' },
        //                                     {
        //                                         text: 'Restart',
        //                                         onTap: function(e) {
        //                                             $ionicDeploy.load();
        //                                         }
        //                                     }
        //                                 ]
        //                             });
        //                         }
        //                     });
        //                 });
        //             } else {
        //                 message = 'No updates available';
        //                 if($rootScope.platform.isAndroid){
        //                     qmService.showInfoToast(message);
        //                 }
        //                 qmLog.debug(message);
        //                 qmLog.error(message);
        //             }
        //         });
        //     });
        // };
        qmService.drawOverAppsPopupRatingNotification = function(trackingReminderNotification, force){
            if(!$rootScope.platform.isAndroid){
                qmLog.debug('Can only show popups on android', null);
                return;
            }
            if(qm.stringHelper.isFalsey(qm.storage.getItem(qm.items.drawOverAppsPopupEnabled))){
                window.qmLog.debug('drawOverAppsPopup is disabled');
                return;
            }
            $ionicPlatform.ready(function(){
                qmService.notifications.drawOverAppsPopupRatingNotification(trackingReminderNotification, force);
            });
        };
        qmService.toggleDrawOverAppsPopup = function(ev){
            if(qmService.notifications.drawOverAppsPopupEnabled()){
                qmService.notifications.disablePopups();
            }else{
                qmService.notifications.showEnablePopupsConfirmation(ev);
            }
        };
        qmService.showShareVariableConfirmation = function(variable, sharingUrl, ev){
            var title = 'Share Variable';
            var textContent = 'Are you absolutely sure you want to make your ' + variable.name +
                ' measurements publicly visible? You can make them private again at any time on this page.';
            function yesCallback(){
                variable.shareUserMeasurements = true;
                var body = {variableId: variable.variableId, shareUserMeasurements: true};
                qmService.showBlackRingLoader();
                qm.userVariables.postUserVariable(body).then(function(){
                    qmService.hideLoader();
                    qmService.openSharingUrl(sharingUrl);
                }, function(error){
                    qmService.hideLoader();
                    qmLog.error(error);
                });
            }
            function noCallback(){
                variable.shareUserMeasurements = false;
            }
            qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        };
        qmService.showUnShareVariableConfirmation = function(variable, ev){
            var title = 'Share Variable';
            var textContent = 'Are you absolutely sure you want to make your ' + variable.name +
                ' and ' + variable.name + ' measurements private? Links to studies you ' +
                'previously shared with this variable will no longer work.';
            function yesCallback(){
                variable.shareUserMeasurements = false;
                var body = {variableId: variable.variableId, shareUserMeasurements: false};
                qm.userVariables.postUserVariable(body).then(function(){
                }, function(error){
                    qmLog.error(error);
                });
            }
            function noCallback(){
                variable.shareUserMeasurements = true;
            }
            qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        };
        qmService.getVariableNameFromStateParamsRootScopeOrUrl = function($stateParams, $scope){
            if($scope.variableName){
                return $scope.variableName;
            }
            if($stateParams.variableName){
                return $stateParams.variableName;
            }
            if(qm.urlHelper.getParam('variableName')){
                $stateParams.variableName = qm.urlHelper.getParam('variableName', window.location.href, true);
            }else if($stateParams.variableObject){
                $stateParams.variableName = $stateParams.variableObject.name;
            }else if($stateParams.trackingReminder){
                $stateParams.variableName = $stateParams.trackingReminder.variableName;
            }else if(qm.getPrimaryOutcomeVariable()){
                $stateParams.variableName = qm.getPrimaryOutcomeVariable().name;
            }
            return $stateParams.variableName;
        };
        qmService.patient = {
            switchToPatientInNewTab: function (user) {
                qm.patient.switchToPatientInNewTab(user);
            },
            switchBackFromPatient: function($scope){
                qmService.rootScope.setProperty(qm.items.patientUser, null);
                $scope.iframeUrl = null;
                qmService.navBar.showNavigationMenu();
            },
            switchToPatientInIFrame: function(user, $scope, $sce){
                qmService.showBasicLoader();
                qmService.navBar.hideNavigationMenu();
                $scope.iframeUrl = $sce.trustAsResourceUrl(qm.urlHelper.getPatientHistoryUrl(user.accessToken));
                qmService.rootScope.setProperty(qm.items.patientUser, user, function(){qmService.hideLoader();});
            },
            switchToPatientInCurrentApp: function(patientUser){
                if(!patientUser.accessToken){
                    qmLog.error("No access token for patientUser!");
                }
                if(!$rootScope.switchBackToPhysician){
                    $rootScope.switchBackToPhysician = qmService.patient.switchBackToPhysician;
                }
                qmService.rootScope.setProperty(qm.items.physicianUser, $rootScope.user);
                qm.storage.setItem(qm.items.physicianUser, $rootScope.user);
                qmService.showBlackRingLoader();
                qmService.completelyResetAppState("switching back to patient");
                qmService.setUserInLocalStorageBugsnagIntercomPush(patientUser);
                qm.storage.setItem(qm.items.physicianUser, $rootScope.physicianUser);
                qmService.goToState(qm.staticData.stateNames.historyAll);
                qmService.showInfoToast("Now acting as " + patientUser.displayName + ". Click the icon at the top to switch back.");
            },
            switchBackToPhysician: function(){
                if(!qm.storage.getItem(qm.items.physicianUser)){
                    qmLog.debug("No physician to switch back to");
                    return;
                }
                var physicianUser = JSON.parse(JSON.stringify(qm.storage.getItem(qm.items.physicianUser)));
                qmService.showBlackRingLoader();
                qmService.completelyResetAppState("switching back to physician");
                qmService.setUserInLocalStorageBugsnagIntercomPush(physicianUser);
                qm.storage.setItem(qm.items.physicianUser, null);
                qmService.rootScope.setProperty(qm.items.physicianUser, null);
                qmService.rootScope.setUser(physicianUser);
                qmService.goToDefaultState();
                qmService.showInfoToast("Switched back to your account");
            }
        };
        function saveDeviceTokenToSyncWhenWeLogInAgain(){
            // Getting token so we can post as the new user if they log in again
            if(qm.storage.getItem(qm.items.deviceTokenOnServer)){
                qm.storage.setItem(qm.items.deviceTokenToSync, qm.storage.getItem(qm.items.deviceTokenOnServer));
                qmService.deleteDeviceTokenFromServer();
            }
        }
        return qmService;
    }]);

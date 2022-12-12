// Database
//var db = null;
/** @namespace window.qmLog */
angular.module('starter',
    [
        'ionic', 'mdColorPicker',
        //'ionic.service.core',
        //'ionic.service.push',
        //'ionic.service.analytics',
        'oc.lazyLoad',
        'highcharts-ng',
        'ngCordova',
        'ionic-datepicker',
        'ionic-timepicker',
        'ngIOS9UIWebViewPatch',
        'ng-mfb',
        //'templates',
        //'fabric',  // Not sure if this does anything.  We might want to enable for native error logging sometime.
        'ngCordovaOauth',
        'jtt_wikipedia',
        'angular-clipboard',
        //'angular-google-analytics', // Analytics + uBlock origin extension breaks app
        //'angular-google-adsense',
        'ngMaterialDatePicker',
        'ngMaterial',
        'ngMessages',
        'angular-cache',
        'angular-d3-word-cloud',
        'ngFileUpload',
        //'ngOpbeat',
        'angular-web-notification',
        //'ui-iconpicker',
        'ngFitText',
        'ngMdIcons',
        'angularMoment',
        //'open-chat-framework'
    ]
)
    .run(["$ionicPlatform", "$ionicHistory", "$state", "$rootScope", "qmService",
        function($ionicPlatform, $ionicHistory, $state, $rootScope, qmService){
            if(!qm.urlHelper.onQMSubDomain()){
                //qm.appsManager.loadPrivateConfigFromJsonFile();
            }
            qmService.showBlackRingLoader();
            if(qm.urlHelper.getParam('logout')){
                qm.storage.clear();
                qmService.setUser(null);
            }
            qmService.setPlatformVariables();
            $ionicPlatform.ready(function(){
                //$ionicAnalytics.register();
                if(ionic.Platform.isIPad() || ionic.Platform.isIOS()){
                    window.onerror = function(error, url, lineNumber){
                        var name = error.name || error.message || error;
                        var message = ' Script: ' + url + ' Line: ' + lineNumber;
                        qmLog.error(name, message, error);
                    };
                }
                if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard){
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false); // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard for form inputs
                }
                if(window.StatusBar){
                    StatusBar.styleDefault();
                } // org.apache.cordova.statusbar required
            });
            $rootScope.goToState = function(stateName, stateParameters, ev){
                if(stateName === 'toggleRobot'){
                    qm.robot.toggle();
                    return;
                }
                if(stateName.indexOf('button') !== -1){
                    var showVariableSearchDialog = false; // Disabled until I can get it to add new variables properly and write tests for it
                    var buttonName = stateName;
                    /** @namespace $rootScope.appSettings.appDesign.floatingActionButton */
                    stateName = $rootScope.appSettings.appDesign.floatingActionButton.active[buttonName].stateName;
                    stateParameters = $rootScope.appSettings.appDesign.floatingActionButton.active[buttonName].stateParameters;
                    if(stateName === qm.staticData.stateNames.reminderSearch && showVariableSearchDialog){
                        qmService.search.reminderSearch(null, ev, stateParameters.variableCategoryName);
                        return;
                    }
                    if(stateName === qm.staticData.stateNames.measurementAddSearch && showVariableSearchDialog){
                        qmService.search.measurementAddSearch(null, ev, stateParameters.variableCategoryName);
                        return;
                    }
                }
                qmService.goToState(stateName, stateParameters, {reload: stateName === $state.current.name});
            };
            $ionicPlatform.registerBackButtonAction(function(event){
                if(qmService.backButtonState){
                    qmService.goToState(qmService.backButtonState);
                    qmService.backButtonState = null;
                    return;
                }
                if($ionicHistory.currentStateName() === 'app.upgrade'){
                    console.debug('registerBackButtonAction from upgrade: Going to default state...');
                    qmService.goToDefaultState();
                    return;
                }
                /** @namespace qm.getAppSettings().appDesign.defaultState */
                if($ionicHistory.currentStateName() === qm.getAppSettings().appDesign.defaultState){
                    ionic.Platform.exitApp();
                    return;
                }
                if($ionicHistory.backView()){
                    $ionicHistory.goBack();
                    return;
                }
                if(qm.storage.getItem(qm.items.user)){
                    qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
                    window.qmLog.debug('registerBackButtonAction: Going to default state...');
                    qmService.goToDefaultState();
                    return;
                }
                window.qmLog.debug('registerBackButtonAction: Closing the app');
                ionic.Platform.exitApp();
            }, 100);
            //var intervalChecker = setInterval(function(){if(qm.getAppSettings()){clearInterval(intervalChecker);}}, 500);
            if(qm.urlHelper.getParam('existingUser') || qm.urlHelper.getParam('introSeen') ||
                qm.urlHelper.getParam('refreshUser') || window.designMode){
                qmService.intro.setIntroSeen(true, "Url params have existingUser or introSeen or refreshUser or designMode");
                qm.storage.setItem(qm.items.onboarded, true);
            }
        }])
    .config(["$stateProvider", "$urlRouterProvider", "$compileProvider", "ionicTimePickerProvider",
        "ionicDatePickerProvider",
        "$ionicConfigProvider",
        //"AnalyticsProvider", // Analytics + uBlock origin extension breaks app
        "ngMdIconServiceProvider",
        //"$opbeatProvider",
        function($stateProvider, $urlRouterProvider, $compileProvider, ionicTimePickerProvider, ionicDatePickerProvider,
                 $ionicConfigProvider
                 //, AnalyticsProvider
                 //, $opbeatProvider
        ){
            //$opbeatProvider.config({orgId: '10d58117acb546c08a2cae66d650480d', appId: 'fc62a74505'});
            if(qm.urlHelper.getParam(qm.items.apiOrigin)){
                qm.storage.setItem(qm.items.apiOrigin, qm.urlHelper.getParam(qm.items.apiOrigin));
            }
            //$ionicCloudProvider.init({"core": {"app_id": "42fe48d4"}}); Trying to move to appCtrl
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|mailto|chrome-extension|ms-appx-web|ms-appx):/);
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|ftp|mailto|chrome-extension|ms-appx-web|ms-appx):/);
            $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
            $ionicConfigProvider.navBar.alignTitle('center');
            $ionicConfigProvider.views.transition('none'); // Disable transitions so we don't see leftover view when
            // view background is transparent.  Also seems more responsive without transitions
            if(ionic.Platform.isIPad() || ionic.Platform.isIOS()){
                $ionicConfigProvider.views.swipeBackEnabled(false);  // Prevents back swipe white screen on iOS when caching is disabled https://github.com/driftyco/ionic/issues/3216
            }
            Array.prototype.contains = function(obj){
                var i = this.length;
                while(i--){
                    if(this[i] === obj){
                        return true;
                    }
                }
            };
            var config_resolver = {
                appSettingsResponse: function($q){
                    var deferred = $q.defer();
                    qm.appsManager.getAppSettingsLocallyOrFromApi(function(appSettings){
                        deferred.resolve(appSettings);
                    }, function(error){
                        qmLog.error("Could not get appSettings because "+error+" so falling back to QuantiModo app settings from staticData");
                        deferred.resolve(qm.staticData.appSettings);
                    });
                    return deferred.promise;
                }
            };
            //config_resolver.loadMyService = ['$ocLazyLoad', function($ocLazyLoad) {return $ocLazyLoad.load([qm.appsManager.getAppConfig(), qm.appsManager.getPrivateConfig()]);}];
            ionicTimePickerProvider.configTimePicker({format: 12, step: 1, closeLabel: 'Cancel'});
            var datePickerObj = {
                inputDate: new Date(),
                setLabel: 'Set',
                todayLabel: 'Today',
                closeLabel: 'Cancel',
                mondayFirst: false,
                weeksList: ["S", "M", "T", "W", "T", "F", "S"],
                //monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
                templateType: 'modal',
                from: new Date(2012, 8, 1),
                to: new Date(),
                showTodayButton: true,
                dateFormat: 'dd MMMM yyyy',
                closeOnSelect: false
            };
            ionicDatePickerProvider.configDatePicker(datePickerObj);
            var clientId = qm.api.getClientIdFromBuilderQueryOrSubDomain();
            if(clientId){
                qm.storage.setItem(qm.items.clientId, clientId);
            }
            qmStates.forEach(function(state){
                    if(state.name === ''){
                        return;
                    }
                    if(state.name === 'app'){
                        state.resolve = config_resolver;
                    }
                    var isPhysicianState = state.views && state.views.menuContent.templateUrl.indexOf('physician') !== -1;
                    if(isPhysicianState && !qm.appMode.isPhysician()){
                        return;
                    }
                    $stateProvider.state(state.name, state);
                });
            function setFallbackRoute(){
                if(qm.appMode.isPhysician()){
                    $urlRouterProvider.otherwise('/app/physician');
                } else if(qm.appMode.isBuilder()){
                    $urlRouterProvider.otherwise('/app/configuration');
                }else if(!qm.storage.getItem(qm.items.introSeen)){
                    $urlRouterProvider.otherwise('/app/intro');
                }else if(!qm.storage.getItem(qm.items.onboarded)){
                    $urlRouterProvider.otherwise('/app/onboarding');
                }else{
                    $urlRouterProvider.otherwise('/app/reminders-inbox');
                }
            }
            setFallbackRoute();
        }])
    .component("mdFabProgress", {
        template:
            "<md-button class='md-fab' ng-click='$ctrl.onClick()' ng-class=\"{'is-done': $ctrl.done}\">" +
            "<md-icon ng-if='!done' class=\"ion-checkmark\" md-font-icon=\"ion-checkmark\"></md-icon>" +
            "<md-icon ng-if='done' class=\"ion-upload\" md-font-icon=\"ion-upload\"></md-icon>" +
            "</md-button>" +
            "<md-progress-circular ng-class=\"{'is-active': $ctrl.active}\" value='{{$ctrl.value}}' md-mode='determinate' md-diameter='68'>" +
            "</md-progress-circular>",
        bindings: {
            "icon": "<",
            "iconDone": "<",
            "value": "<",
            "doAction": "&"
        },
        controller: function($scope){
            var that = this;
            that.active = false;
            that.done = false;
            that.onClick = function(){
                if(!that.active){
                    that.doAction();
                }
            };
            $scope.$watch(function(){
                return that.value;
            }, function(newValue){
                if(newValue >= 100){
                    that.done = true;
                    that.active = false;
                }else if(newValue === 0){
                    that.done = false;
                    that.active = false;
                }else if(!that.active){
                    that.active = true;
                }
            });
        }
    });
angular.module('exceptionOverride', []).factory('$exceptionHandler', function(){
    return function(exception, cause){
        if(typeof bugsnag !== "undefined"){
            window.bugsnagClient = bugsnag("ae7bc49d1285848342342bb5c321a2cf");
            bugsnagClient.notify(exception, {diagnostics: {cause: cause}});
        }
    };
});

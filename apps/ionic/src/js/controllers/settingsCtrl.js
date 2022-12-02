angular.module('starter').controller('SettingsCtrl', ["$state", "$scope", "$ionicPopover", "$ionicPopup", "$rootScope", "$http",
    "qmService", "ionicTimePicker", "$stateParams", "$ionicHistory", "$ionicLoading", "$ionicPlatform", "$mdDialog",
    function($state, $scope, $ionicPopover, $ionicPopup, $rootScope, $http, qmService, ionicTimePicker,
             $stateParams, $ionicHistory, $ionicLoading,
             //$ionicDeploy,
             $ionicPlatform, $mdDialog){
        $scope.controller_name = "SettingsCtrl";
        $scope.state = {
            title: "Settings",
            timezones: moment.tz.names(),
            updatePrimaryOutcomeVariable: function(ev){
                qm.help.getExplanation('primaryOutcomeVariable', null, function(explanation){
                    var dialogParameters = {
                        title: explanation.title,
                        helpText: explanation.textContent,
                        placeholder: "Search for an outcome...",
                        buttonText: "Select Outcome",
                        requestParams: {includePublic: true, outcome: true,  sort: "-numberOfUserVariables"}
                    };
                    qmService.showVariableSearchDialog(dialogParameters, function(v){
                        $rootScope.user.primaryOutcomeVariableId = v.id;
                        $rootScope.user.primaryOutcomeVariableName = v.name;
                        qmService.updateUserSettingsDeferred({primaryOutcomeVariableId: v.id});
                    }, null, ev);
                });
            }
        };
        $scope.userEmail = qm.urlHelper.getParam('userEmail');
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.$on('$ionicView.beforeEnter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.debug('beforeEnter state ' + $state.current.name, null);
            $scope.debugMode = qmLog.getDebugMode();
            $scope.drawOverAppsPopupEnabled = qmService.notifications.drawOverAppsPopupEnabled();
            $scope.backgroundLocationTracking = !!(qm.storage.getItem('bgGPS'));
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            if(qm.urlHelper.getParam('userEmail')){
                $scope.state.loading = true;
                qmService.showBlackRingLoader();
                qmService.refreshUserEmailPreferencesDeferred({userEmail: qm.urlHelper.getParam('userEmail')}, function(user){
                    qmService.rootScope.setUser(user);
                    $scope.state.loading = false;
                    qmService.hideLoader();
                }, function(error){
                    qmLog.error(error);
                    $scope.state.loading = false;
                    qmService.hideLoader();
                });
                return;
            }
            if(!$rootScope.user){
                qmService.login.sendToLoginIfNecessaryAndComeBack("No $rootScope.user in " + $state.current.name);
            } else {
                qm.timeHelper.guessTimeZoneIfNecessary(function (u) {
                    if(u){
                        qmService.setUser(u)
                    } else {
                        qmService.refreshUser();
                    }
                })
            }
        });
        $scope.$on('$ionicView.afterEnter', function(e){
            qmService.hideLoader();
        });
        $scope.completelyResetAppStateAndSendToLogin = function(reason){
            qmService.login.completelyResetAppStateAndSendToLogin(reason);
        };
        $scope.sendSharingInvitation = function(){
            var subjectLine = "I%27d%20like%20to%20share%20my%20data%20with%20you";
            var emailBody = "Hi!%20%20%0A%0AI%27m%20tracking%20my%20health%20and%20happiness%20with%20an%20app%20and%20I%27d%20like%20to%20share%20my%20data%20with%20you." +
                            "%20%20%0A%0APlease%20generate%20a%20data%20authorization%20URL%20at%20" +
                            encodeURIComponent(qm.api.getExpressOrigin()) + "%2Fapi%2Fv2%2Fphysicians%20and%20email%20it%20to%20me.%20%0A%0AThanks!%20%3AD";
            var fallbackUrl = qm.api.getQuantiModoUrl("api/v2/account/applications", true);
            var emailAddress = null;
            if($rootScope.platform.isMobile){
                qmService.sendWithEmailComposer(subjectLine, emailBody, emailAddress, fallbackUrl);
            }else{
                qmService.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
            }
        };
        $scope.sendBugReport = function(){
            qmService.sendBugReport();
        };
        $scope.contactUs = function(){
            window.location = '#app/feedback';
        };
        $scope.postIdea = function(){
            window.open('https://help.quantimo.do/forums/211661-general', '_blank');
        };
        $scope.combineNotificationChange = function(ev){
            qmService.updateUserSettingsDeferred({combineNotifications: $rootScope.user.combineNotifications});
            if($rootScope.user.combineNotifications){
                qmService.showMaterialAlert('Disabled Individual Notifications',
                    'You will only get a single generic notification instead of a separate notification for each reminder that you create.  All ' +
                    'tracking reminder notifications for specific reminders will still show up in your Reminder Inbox.', ev);
                qmService.cancelAllNotifications().then(function(){
                    qmLog.debug('SettingsCtrl combineNotificationChange: Disabled Multiple Notifications and now ' +
                        'refreshTrackingRemindersAndScheduleAlarms will schedule a single notification for highest ' +
                        "frequency reminder", null);
                    if(!qm.storage.getItem(qm.items.deviceTokenOnServer)){
                        console.warn("Could not find device token for push notifications so scheduling combined local notifications");
                        qm.reminderHelper.syncReminders();
                    }
                });
            }else{
                qmService.showMaterialAlert('Enabled Multiple Notifications', 'You will get a separate device notification for each reminder that you create.', ev);
                qmService.cancelAllNotifications().then(function(){
                    qm.reminderHelper.syncReminders();
                });
            }
        };
        $scope.getPreviewBuildsChange = function(){
            var params = {getPreviewBuilds: $rootScope.user.getPreviewBuilds};
            qmService.updateUserSettingsDeferred(params);
            //qmService.autoUpdateApp();
            qmService.deploy.fetchUpdate();
        };
        //$scope.updateApp = function(){qmService.updateApp();};
        var sendReminderNotificationEmailsChange = function(ev){
            var params = {sendReminderNotificationEmails: $rootScope.user.sendReminderNotificationEmails};
            if(qm.urlHelper.getParam('userEmail')){
                params.userEmail = qm.urlHelper.getParam('userEmail');
            }
            qmService.updateUserSettingsDeferred(params);
            if($rootScope.user.sendReminderNotificationEmails){
                qmService.showMaterialAlert('Reminder Emails Enabled', "If you forget to record a measurement for a reminder you've created, I'll send you a daily reminder email.", ev);
            }else{
                qmService.showMaterialAlert('Reminder Emails Disabled', "If you forget to record a measurement for a reminder you've created, I won't send you a daily reminder email.", ev);
            }
        };
        $scope.sendReminderNotificationEmailsChange = function(){
            verifyEmailAddressAndExecuteCallback(sendReminderNotificationEmailsChange);
        };
        var sendPredictorEmailsChange = function(ev){
            var params = {sendPredictorEmails: $rootScope.user.sendPredictorEmails};
            qmService.updateUserSettingsDeferred(params);
            if($rootScope.user.sendPredictorEmails){
                qmService.showMaterialAlert('Discovery Emails Enabled', "I'll send you a weekly email with new discoveries from your data.", ev);
            }else{
                qmService.showMaterialAlert('Discovery Emails Disabled', "I won't send you a weekly email with new discoveries from your data.", ev);
            }
        };
        $scope.sendPredictorEmailsChange = function(){
            verifyEmailAddressAndExecuteCallback(sendPredictorEmailsChange);
        };
        $scope.openEarliestReminderTimePicker = function(ev){
            $scope.state.earliestReminderTimePickerConfiguration = {
                callback: function(val){
                    if(typeof (val) === 'undefined'){
                        qmLog.debug('Time not selected');
                    }else{
                        var a = new Date();
                        var selectedTime = new Date(val * 1000);
                        a.setHours(selectedTime.getUTCHours());
                        a.setMinutes(selectedTime.getUTCMinutes());
                        qmLog.debug('Selected epoch is : ', val, 'and the time is ',
                            selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
                        var newEarliestReminderTime = moment(a).format('HH:mm:ss');
                        if(newEarliestReminderTime > $rootScope.user.latestReminderTime){
                            qmService.showMaterialAlert('Choose Another Time', 'Earliest reminder time cannot be greater than latest reminder time.  ' +
                                'Please change the latest reminder time and try again or select a different earliest reminder time.', ev);
                        }else if(newEarliestReminderTime !== $rootScope.user.earliestReminderTime){
                            $rootScope.user.earliestReminderTime = newEarliestReminderTime;
                            var params = qm.timeHelper.addTimeZoneOffsetProperty({earliestReminderTime: $rootScope.user.earliestReminderTime});
                            qmService.updateUserSettingsDeferred(params).then(function(){
                                qm.reminderHelper.syncReminders();
                            });
                            qmService.showMaterialAlert('Earliest Notification Time Updated', 'You should not receive device notifications before ' + moment(a).format('h:mm A') + '.', ev);
                        }
                    }
                },
                inputTime: qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteenFromLocalString($rootScope.user.earliestReminderTime),
                step: 15,
                closeLabel: 'Cancel'
            };
            ionicTimePicker.openTimePicker($scope.state.earliestReminderTimePickerConfiguration);
        };
        $scope.openLatestReminderTimePicker = function(ev){
            $scope.state.latestReminderTimePickerConfiguration = {
                callback: function(val){
                    if(typeof (val) === 'undefined'){
                        qmLog.debug('Time not selected', null);
                    }else{
                        var a = new Date();
                        var selectedTime = new Date(val * 1000);
                        a.setHours(selectedTime.getUTCHours());
                        a.setMinutes(selectedTime.getUTCMinutes());
                        qmLog.debug('Selected epoch is : ', val, 'and the time is ',
                            selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
                        var newLatestReminderTime = moment(a).format('HH:mm:ss');
                        if(newLatestReminderTime < $rootScope.user.earliestReminderTime){
                            qmService.showMaterialAlert('Choose Another Time', 'Latest reminder time cannot be less than earliest reminder time.  Please ' +
                                'change the earliest reminder time and try again or select a different latest reminder time.', ev);
                        }else if(newLatestReminderTime !== $rootScope.user.latestReminderTime){
                            $rootScope.user.latestReminderTime = newLatestReminderTime;
                            var params = qm.timeHelper.addTimeZoneOffsetProperty({latestReminderTime: $rootScope.user.latestReminderTime});
                            qmService.updateUserSettingsDeferred(params).then(function(){
                                qm.reminderHelper.syncReminders();
                            });
                            qmService.showMaterialAlert('Latest Notification Time Updated', 'You should not receive device notification after ' + moment(a).format('h:mm A') + '.', ev);
                        }
                    }
                },
                inputTime: qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteenFromLocalString($rootScope.user.latestReminderTime),
                step: 15,
                closeLabel: 'Cancel'
            };
            ionicTimePicker.openTimePicker($scope.state.latestReminderTimePickerConfiguration);
        };
        $scope.logout = function(ev){
            var showDataClearPopup = function(ev){
                var title = 'Log Out';
                var textContent = "Are you sure you want to log out? I'll miss you dearly!";
                function yesCallback(){
                    qmService.auth.completelyResetAppStateAndLogout();
                }
                function noCallback(){
                    //qmService.afterLogoutDoNotDeleteMeasurements();
                }
                qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
            };
            qmLog.debug('Logging out...');
            qmService.rootScope.setUser(null);
            showDataClearPopup(ev);
        };
        // Convert all data Array to a CSV object
        var convertToCSV = function(objArray){
            var array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
            var str = '';
            for(var i = 0; i < array.length; i++){
                var line = '';
                for(var index in array[i]){
                    if(line !== ''){
                        line += ',';
                    }
                    line += array[i][index];
                }
                str += line + '\r\n';
            }
            return str;
        };
        var verifyEmailAddressAndExecuteCallback = function(callback){
            if($rootScope.user.email || $rootScope.user.userEmail){
                callback();
                return;
            }
            qmService.updateEmailAndExecuteCallback(callback);
        };
        var exportRequestAlert = function(ev){
            qmService.showMaterialAlert('Export Request Sent!', 'Your data will be emailed to you within the next 24 hours.  Enjoy your life! So do we!', ev);
        };
        function exportMeasurements(type, ev){
            qmService.postMeasurementsExport(type, function(response){
                if(!response.success){
                    qmLog.error("Could not export measurements. Response: " + JSON.stringify(response));
                }
            }, function(error){
                qmLog.error("Could not export measurements. Response: " + JSON.stringify(error));
            });
            exportRequestAlert(ev);
        }
        var exportCsv = function(){
            exportMeasurements('csv');
        };
        var exportPdf = function(){
            exportMeasurements('pdf');
        };
        var exportXls = function(){
            exportMeasurements('xls');
        };
        $scope.exportMeasurements = function(type){
            if(type === 'csv'){
                verifyEmailAddressAndExecuteCallback(exportCsv);
            }
            if(type === 'pdf'){
                verifyEmailAddressAndExecuteCallback(exportPdf);
            }
            if(type === 'xls'){
                verifyEmailAddressAndExecuteCallback(exportXls);
            }
        };
        var webDowngrade = function(){
            qmService.showBlackRingLoader();
            qmService.postDowngradeSubscriptionDeferred().then(function(user){
                qmService.hideLoader();
                qmLog.debug(JSON.stringify(user), null);
                qmService.showMaterialAlert('Downgraded', 'Successfully downgraded to QuantiModo Lite');
            }, function(error){
                qmService.hideLoader();
                qmService.showMaterialAlert('Error', 'An error occurred while downgrading. Please email mike@quantimo.do');
                qmLog.debug(JSON.stringify(error), null);
            });
        };
        var androidDowngrade = function(){
            var confirmPopup = $ionicPopup.confirm({
                title: 'Google Play',
                template: "You subscribed through Google Play so I have to send you to a page that tells you how to " +
                    "unsubscribe from Play subscriptions"
            });
            confirmPopup.then(function(res){
                if(res){
                    qmService.postDowngradeSubscriptionDeferred().then(function(user){
                        qmLog.debug(JSON.stringify(user), null);
                    }, function(error){
                        qmLog.error(error);
                    });
                    window.open("https://support.google.com/googleplay/answer/7018481", '_blank', 'location=yes');
                }else{
                    console.log('You are not sure');
                }
            });
        };
        var appleDowngrade = function(){
            var confirmPopup = $ionicPopup.confirm({
                title: 'App Store',
                template: "You subscribed through the App Store so I have to send you to a page that tells you how to unsubscribe from App Store subscriptions"
            });
            confirmPopup.then(function(res){
                if(res){
                    $rootScope.user.stripeActive = false;
                    qmService.postDowngradeSubscriptionDeferred().then(function(user){
                        qmLog.debug(JSON.stringify(user), null);
                    }, function(error){
                        qmLog.error(error);
                    });
                    window.open("https://support.apple.com/en-us/HT202039", '_blank', 'location=yes');
                }else{
                    console.log('You are not sure');
                }
            });
        };
        var googleDowngradeDebug = false;
        $scope.downgrade = function(){
            if($rootScope.user.subscriptionProvider === 'google' || googleDowngradeDebug){
                androidDowngrade();
            }else if($rootScope.user.subscriptionProvider === 'apple'){
                appleDowngrade();
            }else{
                webDowngrade();
            }
        };
        if(qm.platform.isAndroid()){
            $scope.toggleDrawOverAppsPopup = function(ev){
                qmService.toggleDrawOverAppsPopup(ev);
            };
        }
        $scope.togglePushNotificationsEnabled = function(){
            // Toggle is done by the HTML
            //$rootScope.user.pushNotificationsEnabled = !$rootScope.user.pushNotificationsEnabled;
            qmService.updateUserSettingsDeferred({pushNotificationsEnabled: $rootScope.user.pushNotificationsEnabled});
            if($rootScope.user.pushNotificationsEnabled){
                qmService.showInfoToast('Push notifications enabled');
            }
            if(!$rootScope.user.pushNotificationsEnabled){
                qmService.showInfoToast('Push notifications disabled');
            }
        };
        $scope.shareAllDataChange = function(){
            qmService.updateUserSettingsDeferred({shareAllData: $rootScope.user.shareAllData});
            if($rootScope.user.shareAllData){
                qmService.showInfoToast('Measurements are now shared');
            }
            if(!$rootScope.user.shareAllData){
                qmService.showInfoToast('Measurements are now private');
            }
        };
        $scope.toggleDebugMode = function(){
            $scope.debugMode = !$scope.debugMode;
            qmLog.setDebugMode($scope.debugMode);
        };
        $scope.upgradeToggle = function(){
            qmService.premiumModeDisabledForTesting = !$rootScope.user.stripeActive;
            qmService.setUser($rootScope.user);
        };
        $scope.backgroundLocationChange = function(){
            $scope.backgroundLocationTracking = !$scope.backgroundLocationTracking;
            if($scope.backgroundLocationTracking){
                qm.storage.setItem('bgGPS', 1);
                qmLog.debug('Going to execute qmService.backgroundGeolocationStartIfEnabled if $ionicPlatform.ready');
                qmService.backgroundGeolocationStartIfEnabled();
                qmService.showInfoToast('Background location tracking enabled');
                qmService.updateLocationVariablesAndPostMeasurementIfChanged();
            }else{
                qm.storage.setItem('bgGPS', 0);
                qmService.showInfoToast('Background location tracking disabled');
                qmService.backgroundGeolocationStop();
            }
        };
        $scope.openDeleteUserAccountDialog = function(ev){
            qmLog.error("User clicked DELETE ACCOUNT!");
            // sendBugReport instead of dialog so we can get their actual email (in case they're logged in as the wrong user) and extra diagnostic info
            //qmService.sendBugReport();
            //return;
            //Appending dialog to document.body to cover sidenav in docs app
            var message = 'I really want to reduce suffering in the universe. So I would be eternally grateful to know how I could do better in the future?';
            var confirm = $mdDialog.prompt()
                .title('Are you sure you want to delete your data forever?')
                .textContent(message)
                .placeholder('What did you hate the most about me?')
                .ariaLabel('Deletion reason')
                //.initialValue('Buddy')
                .targetEvent(ev)
                .required(true)
                .ok('DELETE ALL MY DATA')
                .cancel('Give me another chance?');
            $mdDialog.show(confirm).then(function(reason) {
                qmLog.error("User DELETED ACCOUNT!  Reason for deletion: " + reason);
                qm.userHelper.deleteUserAccount(reason, function () {
                    qmService.auth.completelyResetAppStateAndLogout();
                });
            }, function(reason) {
                qmLog.error("User canceled DELETE ACCOUNT!  Reason for deletion: " + reason);
            });
        };
        $scope.state.showBioModalPromptPopup = function(ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.prompt()
                .title('Your Biography')
                .textContent('Will be displayed on your published studies')
                .placeholder('Your Biography')
                .ariaLabel('Your Biography')
                .initialValue(qm.getUser().description)
                .targetEvent(ev)
                .required(true)
                .ok('Okay!')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function(result) {
                qmService.showInfoToast("Bio updated!");
                qmService.updateUserSettingsDeferred({description: result})
            }, function() {
                qmService.showInfoToast("Canceled");
            });
        };
        $scope.state.updateTimezone = function() {
            qmService.showInfoToast("Timezone changed to "+$rootScope.user.timezone);
            qmService.updateUserSettingsDeferred({timezone: $rootScope.user.timezone})
        };
    }]);

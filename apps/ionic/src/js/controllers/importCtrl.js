angular.module('starter').controller('ImportCtrl', ["$scope", "$ionicLoading", "$state", "$rootScope", "qmService",
    "$cordovaOauth", "$ionicActionSheet", "Upload", "$timeout", "$ionicPopup", "$mdDialog",
    function($scope, $ionicLoading, $state, $rootScope, qmService, $cordovaOauth, $ionicActionSheet,
             Upload, $timeout, $ionicPopup, $mdDialog){
        $scope.controller_name = "ImportCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {
            connectors: null,
            searchText: '',
            connectorName: null,
            connectWithParams: function(connector){
                var params = connector.connectInstructions.parameters;
                qmService.showBasicLoader();
                qmService.connectors.connectWithParams(params, connector.name, function(){
                    var redirectUrl = qm.urlHelper.getParam('final_callback_url');
                    if(!redirectUrl){
                        redirectUrl = qm.urlHelper.getParam('redirect_uri')
                    }
                    if(redirectUrl){
                        window.location.href = redirectUrl;
                    }
                    $scope.state.connector = null;
                    qmService.hideLoader();
                }, function(error){
                    qmService.showMaterialAlert(error);
                    qmService.hideLoader();
                });
            }
        };
        $scope.$on('$ionicView.beforeEnter', function(e){
            if (document.title !== "Import") {document.title = "Import";}
            if(!$scope.helpCard || $scope.helpCard.title !== "Import Your Data"){
                $scope.helpCard = {
                    title: "Import Your Data",
                    bodyText: "Scroll down and press Connect for any apps or device you currently use.  Once you're finished, press the Done bar at the bottom.",
                    icon: "ion-ios-cloud-download"
                };
            }
            qmLog.debug('ImportCtrl beforeEnter', null);
            if(typeof $rootScope.hideNavigationMenu === "undefined"){
                qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            }
            $scope.state.searchText = qm.urlHelper.getParam('connectorName');
            if($scope.state.connectorName){
                qm.connectorHelper.getConnectorByName($scope.state.connectorName, function(connector){
                    $scope.state.connector = connector;
                    if(connector){
                        qmService.navBar.hideNavigationMenu();
                    }
                });
            }
            //if(qmService.login.sendToLoginIfNecessaryAndComeBack()){ return; }
            loadNativeConnectorPage();
            if(!userCanConnect()){
                qmService.refreshUser(); // Check if user upgrade via web since last user refresh
            }
        });
        $scope.$on('$ionicView.afterEnter', function(e){
            var message = qm.urlHelper.getParam('message');
            if(message){
                qmService.showMaterialAlert(decodeURIComponent(message), "You should begin seeing your imported data within an hour or so.")
            }
            updateNavigationMenuButton();
        });
        function userCanConnect(connector){
            if(!$rootScope.user){
                qmService.refreshUser();
                return true;
            }
            if(qmService.premiumModeDisabledForTesting){return false;}
            if($rootScope.user.stripeActive){return true;}
            if(qm.platform.isChromeExtension()){return true;}
            if(connector && !connector.premium){return true;}
            var needSubscription = qm.getAppSettings().additionalSettings.monetizationSettings.subscriptionsEnabled.value;
            var canConnect = !needSubscription;
            return canConnect;
        }
        $scope.hideImportHelpCard = function(){
            $scope.showImportHelpCard = false;
            window.qm.storage.setItem(qm.items.hideImportHelpCard, true);
        };
        var loadNativeConnectorPage = function(){
            $scope.showImportHelpCard = !qm.storage.getItem(qm.items.hideImportHelpCard);
            qmService.showBlackRingLoader();
            var connectors = qm.connectorHelper.getConnectorsFromLocalStorage();
            if(connectors){setConnectors(connectors);}
            $scope.refreshConnectors();
        };
        $scope.showActionSheetForConnector = function(connector){
            //debugger
            connector.showMessage = true;
            var connectorButtons = JSON.parse(JSON.stringify(connector.buttons));
            connectorButtons.push({
                text: '<i class="icon ' + ionIcons.history + '"></i>' + connector.displayName + ' History',
                id: 'history', state: qm.staticData.stateNames.historyAll, stateParams: {connectorId: connector.id}
            });
            connectorButtons = qmService.actionSheets.addHtmlToActionSheetButtonArray(connectorButtons);
            connectorButtons.map(function(button){
                button.connector = connector;
                return button;
            });
            var hideSheetForNotification = $ionicActionSheet.show({
                buttons: connectorButtons,
                destructiveText: (connector.connected) ? '<i class="icon ion-trash-a"></i>Disconnect ' : null,
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function(){
                    qmLog.debug('CANCELLED');
                },
                buttonClicked: function(index, button){
                    if(connectorButtons[index].state){
                        qmService.actionSheets.handleVariableActionSheetClick(connectorButtons[index]);
                    }else{
                        $scope.connectorAction(connector, connectorButtons[index]);
                    }
                    return true;
                },
                destructiveButtonClicked: function(){
                    disconnectConnector(connector)
                }
            });
        };
        $scope.uploadSpreadsheet = function(file, errFiles, connector, button){
            if(!userCanConnect(connector)){
                qmService.goToState('app.upgrade');
                return;
            }
            if(!file){
                qmLog.debug('No file provided to uploadAppFile', null);
                return;
            }
            $scope.f = file;
            $scope.errFile = errFiles && errFiles[0];
            if(file){
                button.text = "Uploading...";
                qmService.showBasicLoader();
                var body = {file: file, "connectorName": connector.name};
                file.upload = Upload.upload({
                    url: qm.api.getExpressOrigin() + '/api/v2/spreadsheetUpload?clientId=' +
                         $rootScope.appSettings.clientId + "&access_token=" + $rootScope.user.accessToken, data: body
                });
                file.upload.then(function(response){
                    button.text = "Import Scheduled";
                    connector.message = "You should start seeing your data within the next hour or so";
                    qmLog.debug('File upload response: ', null, response);
                    $timeout(function(){
                        file.result = response.data;
                    });
                    qmService.hideLoader();
                }, function(response){
                    qmService.hideLoader();
                    button.text = "Upload Complete";
                    qmService.showMaterialAlert("Upload complete!", "You should see the data on your history page within an hour or so");
                    if(response.status > 0){
                        button.text = "Upload Failed";
                        qmLog.error("Upload failed!");
                        qmService.showMaterialAlert("Upload failed!", "Please contact mike@quantimo.do and he'll fix it. ");
                        $scope.errorMsg = response.status + ': ' + response.data;
                    }
                }, function(evt){
                    file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                });
            }
        };
        var connectConnector = function(c, button, ev){
            qmLog.info("connectConnector: " + JSON.stringify(c), null, c);
            qmService.connector = c;
            if(!userCanConnect(c)){
                qmLog.info("connectConnector user cannot connect: " + JSON.stringify(c), null, c);
                qmService.goToState('app.upgrade');
                return;
            }
            c.loadingText = null;
            c.connecting = true;
            c.message = 'You should begin seeing any new data within an hour or so.';
            c.updateStatus = "CONNECTING"; // Need to make error message hidden
            if(qm.arrayHelper.inArray(c.mobileConnectMethod, ['oauth', 'facebook', 'google'])){
                qmLog.info("connectConnector is inArray('oauth', 'facebook', 'google'): " + JSON.stringify(c), null, c);
                qm.connectorHelper.webConnectViaRedirect(c, ev, {});
                button.text = "Connecting...";
                return;
            }
            qmLog.info("connectConnector is not inArray('oauth', 'facebook', 'google') no not using qmService.connectors.oAuthConnect: " +
                JSON.stringify(c), null, c);
            if(c.name.indexOf('weather') !== -1){
                button.text = "Import Scheduled";
                qmService.connectors.weatherConnect(c, $scope);
                return;
            }
            if(c.connectInstructions.parameters && c.connectInstructions.parameters.length){
                connectWithInputCredentials(c, button);
                return;
            }
            qmLog.error("Not sure how to handle this connector: " + JSON.stringify(c), null, c);
        };
        function amazonSettings(c, button, ev){
            qmLog.info("amazonSettings connector " + JSON.stringify(c), null, c);
            qmService.connector = c;
            function DialogController($scope, $mdDialog, qmService){
                var connector = qmService.connector;
                $scope.appSettings = qm.getAppSettings();
                var addAffiliateTag = connector.connectInstructions.parameters.find(function(obj){
                    return obj.key === 'addAffiliateTag';
                });
                $scope.addAffiliateTag = qm.stringHelper.isTruthy(addAffiliateTag.defaultValue);
                var importPurchases = connector.connectInstructions.parameters.find(function(obj){
                    return obj.key === 'importPurchases';
                });
                $scope.importPurchases = qm.stringHelper.isTruthy(importPurchases.defaultValue);
                $scope.onToggle = function(){
                    var params = {
                        importPurchases: $scope.importPurchases || false,
                        addAffiliateTag: $scope.addAffiliateTag || false
                    };
                    qmService.connectors.connectWithParams(params, connector.name);
                };
                var self = this;
                self.title = "Amazon Settings";
                $scope.hide = function(){
                    $mdDialog.hide();
                };
                $scope.cancel = function(){
                    $mdDialog.cancel();
                };
                $scope.getHelp = function(){
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
                controller: DialogController,
                templateUrl: 'templates/dialogs/amazon-settings.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: false // Only for -xs, -sm breakpoints.
            })
                .then(function(answer){
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function(){
                    $scope.status = 'You cancelled the dialog.';
                });
        }
        var disconnectConnector = function(c, button){
            qmLog.info("disconnectConnector connector " + JSON.stringify(c), null, c);
            button.text = 'Reconnect';
            qmService.showInfoToast("Disconnected " + c.displayName);
            qmService.disconnectConnectorDeferred(c.name).then(function(){
                $scope.refreshConnectors();
            }, function(error){
                qmLog.error("error disconnecting ", error);
            });
        };
        var updateConnector = function(c, button){
            qmLog.info("updateConnector connector " + JSON.stringify(c), null, c);
            button.text = 'Update Scheduled';
            c.message = "If you have new data, you should begin to see it in a hour or so.";
            qm.connectorHelper.update(c.name, function (r){
                setConnectors(r.connectors);
                if(r.measurements){
                    qmService.goToState(qm.staticData.stateNames.historyAll, {
                        "updatedMeasurementHistory": r.measurements,
                        "connectorId": c.id,
                        "sourceName": c.name,
                    })
                }
            });
            $scope.safeApply();
        };
        var getItHere = function(connector){
            qmLog.info("getItHere connector " + JSON.stringify(connector), null, connector);
            $scope.openUrl(connector.getItUrl, 'yes', '_system');
        };
        $scope.connectorAction = function(c, b, ev){
            qmLog.info("connectorAction button " + JSON.stringify(b), null, b);
            qmLog.info("connectorAction connector " + JSON.stringify(c), null, c);
            c.message = null;
            //debugger
            if(b.text.toLowerCase().indexOf('disconnect') !== -1){
                disconnectConnector(c, b);
            }else if(b.text.toLowerCase().indexOf('connect') !== -1
                     || b.text.toLowerCase().indexOf('import') !== -1){
                connectConnector(c, b, ev);
            }else if(b.text.toLowerCase().indexOf('settings') !== -1){
                amazonSettings(c, b, ev);
            }else if(b.text.toLowerCase().indexOf('get it') !== -1){
                getItHere(c, b);
            }else if(b.text.toLowerCase().indexOf('update') !== -1){
                updateConnector(c, b);
            }else if(b.text.toLowerCase().indexOf('upgrade') !== -1){
                qmService.goToState('app.upgrade');
            }else if(b.stateName){
                qmService.goToState(b.stateName, b.stateParams);
            }else if(b.link){
                if(b.link.indexOf('history-all') !== -1){
                    qmService.goToState(qm.staticData.stateNames.historyAll, {
                        "connectorId": c.id,
                        "sourceName": c.name,
                    });
                    return;
                }
                qmService.setLastStateAndUrl();
                qm.urlHelper.goToUrl(b.link);
            }else {
                qmLog.error("No action for this button: ", b)
            }
        };
        $rootScope.$on('broadcastRefreshConnectors', function(){
            qmLog.info('broadcastRefreshConnectors broadcast received..');
            $scope.refreshConnectors();
        });
        function setConnectors(connectors) {
            //debugger
            qmLog.info("Setting connectors: ", connectors)
            $scope.safeApply(function (){$scope.state.connectors = connectors;})
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            qmService.hideLoader();
            $scope.state.text = '';
        }
        $scope.refreshConnectors = function(){
            qmService.refreshConnectors()
                .then(function(connectors){
                    setConnectors(connectors);
                }, function(response){
                    qmLog.error(response);
                    $scope.$broadcast('scroll.refreshComplete');
                    qmService.hideLoader();
                });
        };
        function updateNavigationMenuButton(){
            $timeout(function(){
                qmService.rootScope.setShowActionSheetMenu(function(){
                    // Show the action sheet
                    var hideSheet = $ionicActionSheet.show({
                        buttons: [
                            qmService.actionSheets.actionSheetButtons.refresh,
                            qmService.actionSheets.actionSheetButtons.settings
                        ],
                        cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                        cancel: function(){
                            qmLog.debug('CANCELLED', null);
                        },
                        buttonClicked: function(index, button){
                            if(index === 0){
                                $scope.refreshConnectors();
                            }
                            if(index === 1){
                                qmService.goToState(qm.staticData.stateNames.settings);
                            }
                            return true;
                        }
                    });
                });
            }, 1);
        }
        function connectWithInputCredentials(c, button){
            function getHtmlForInput(parameters){
                var html ='';
                parameters.forEach(function (param) {
                    var ionIcon = param.ionIcon;
                    if (param.type === "password") {
                        ionIcon = 'ion-locked';
                    }
                    if (param.key.indexOf("user") !== -1) {
                        ionIcon = 'ion-person';
                    }
                    if (param.key.indexOf("mail") !== -1) {
                        ionIcon = 'ion-mail';
                    }
                    html += '<label class="item item-input">' +
                        '<i class="icon ' + ionIcon + 'placeholder-icon"></i>' +
                        '<input type="' + param.type + '" placeholder="' + param.displayName + '" ng-model="data.' + param.key + '">' +
                        '</label>';
                });
                return html;
            }
            var parameters = c.connectInstructions.parameters;
            $scope.data = {};
            parameters.forEach(function(param){
                $scope.data[param.key] = null;
            });
            function getEmptyProperty(data){
                for (var property in $scope.data) {
                    if ($scope.data.hasOwnProperty(property)) {
                        if(!$scope.data[property]){
                            return property;
                        }
                    }
                }
                return false;
            }
            var myPopup = $ionicPopup.show({
                template: getHtmlForInput(parameters),
                title: c.displayName,
                subTitle: c.connectInstructions.text || 'Enter your ' + c.displayName + ' credentials',
                scope: $scope,
                buttons: [
                    {text: 'Cancel'},
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e){
                            if(getEmptyProperty($scope.data)){
                                e.preventDefault();
                                return false;
                            } else{
                                return $scope.data;
                            }
                        }
                    }
                ]
            });
            myPopup.then(function(data){
                if(data){
                    button.text = "Import Scheduled";
                    qmService.connectors.connectWithParams(data, c.name);
                }
            });
        }
    }]);

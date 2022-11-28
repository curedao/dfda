angular.module('starter').controller('ConfigurationCtrl', function($state, $scope, $ionicPopover, $ionicPopup, $rootScope,
                                                                   qmService, configurationService,
                                                                   $ionicModal, $timeout,
                                                                   Upload, $ionicActionSheet, $mdDialog, $stateParams, $sce){
    $scope.controller_name = "ConfigurationCtrl";
    $scope.state = {
        clientId: getClientId(),
        reminderCard: configurationService.getReminderCard(),
    };
    $scope.menu = {
        addSubMenuItem: configurationService.menu.addSubMenuItem,
        moveMenuItemDown: function(menuItems, oldIndex){
            qm.menu.moveMenuItemDown(menuItems, oldIndex);
        },
        moveMenuItemUp: function(menuItems, oldIndex){
            qm.menu.moveMenuItemUp(menuItems, oldIndex);
        },
        onStateChange: qm.menu.onStateChange,
        onParameterChange: qm.menu.onParameterChange,
        variableNameStateParamSearch: function(menuItem, ev, successHandler){
            qmService.showVariableSearchDialog({
                title: "Select Variable",
                helpText: "You Can Select a Default Variable for this Page",
                requestParams: {includePublic: true}
            }, function(selectedVariable){
                if(successHandler){
                    successHandler(selectedVariable);
                }
                menuItem.params.variableName = selectedVariable.name;
                menuItem.icon = selectedVariable.ionIcon;
                menuItem.title = selectedVariable.displayName;
                qm.menu.onParameterChange(menuItem);
            }, null, ev);
        }
    };
    $scope.typeOf = function(value){
        return typeof value;
    };
    if(qmService.login.sendToLoginIfNecessaryAndComeBack()){
        return;
    }
    // noinspection JSUnusedLocalSymbols
    $scope.$on('$ionicView.beforeEnter', function(e){
        if (document.title !== "App Builder") {document.title = "App Builder";}
        qmLog.info("beforeEnter configuration state!");
        if(!$rootScope.user){
            qmService.refreshUser();
        }
        if(!$scope.state.clientId){
            $scope.state.clientId = getClientId();
        }
        if(!$scope.appList){ // Loading the first time instead of switching from another page
            populateAppsListFromLocalStorage();
            if(configurationService.allAppSettings){
                populateAppsListAndSwitchToSelectedApp(configurationService.allAppSettings);
            }else{
                qmService.showInfoToast("Loading your apps (this could take a minute)");
                qmService.showBlackRingLoader();
                refreshAppListAndSwitchToSelectedApp();
            }
            configurationService.updateAppComponents();
        }
        if($state.current.name === qm.staticData.stateNames.users){
            $scope.loadUserList();
        }
        if($stateParams.hideNavigationMenu === true){
            qmService.navBar.hideNavigationMenu();
        }
    });
    $scope.$on('$ionicView.afterEnter', function(e){
        if($stateParams.hideNavigationMenu !== true){
            qmService.navBar.showNavigationMenu();
        }
        setPopOutUrl();
    });
    // noinspection JSUnusedLocalSymbols
    $scope.$on('$ionicView.beforeLeave', function(e){
        qmLog.info("Leaving configuration state!");
    });
    function setPopOutUrl(){
        var query = '?clientId=' + getClientId() + '&apiOrigin=' +
            encodeURIComponent(qm.api.getApiOrigin()) +
            '&quantimodoAccessToken=' + qm.getUser().accessToken;
        var url = 'https://builder.quantimo.do/#/app/configuration' + query;
        // Why do we need this if we can just preview in the builder?
        //if(!qm.windowHelper.isIframe()){url = 'https://web.quantimo.do/index.html' + query;}
        if(!qm.windowHelper.isIframe()){
            return;
        }
        qmService.rootScope.setProperty('popOutUrl', url);
    }
    function getClientId(){
        var clientId = qm.urlHelper.getParam('clientId');
        if(!clientId){
            clientId = $stateParams.clientId;
        }
        if(!clientId){
            clientId = qm.stringHelper.after('configuration/');
        }
        if(!clientId){
            clientId = $rootScope.appSettings.clientId;
        }
        return clientId;
    }
    function populateAppsListFromLocalStorage(){
        var appList = configurationService.getAppsListFromLocalStorage();
        if(appList){
            $scope.appList = appList; // More efficient than updating scope a million times
            qmService.hideLoader();
        }
    }
    function populateAppsListFromAppSettingsArray(appSettingsArray){
        if(!appSettingsArray || !appSettingsArray.length){
            $scope.appList = [];
            return;
        }
        var appList = configurationService.convertAppSettingsToAppList(appSettingsArray);
        qm.storage.setItem(qm.items.appList, appList);
        $scope.appList = appList; // More efficient than updating scope a million times
    }
    function populateAppsListAndSwitchToSelectedApp(appSettingsArray){
        qmService.showInfoToast("Synced most recent versions of your " + appSettingsArray.length + " apps!");
        qmLog.info("populateAppsListAndSwitchToSelectedApp");
        populateAppsListFromAppSettingsArray(appSettingsArray);
        var appToSwitchTo = appSettingsArray.find(function(appSettingsObject){
            return appSettingsObject.clientId === qm.appsManager.getBuilderClientId();
        });
        if($rootScope.user.administrator && !appToSwitchTo && $rootScope.appSettings.clientId === qm.appsManager.getBuilderClientId()){
            // This happens when an admin is editing an app they aren't a collaborator of with clientId url param
            qmService.hideLoader();
            return;
        }
        if(!appToSwitchTo && appSettingsArray.length){
            appToSwitchTo = appSettingsArray[0];
        }
        configurationService.separateUsersAndConfigureAppSettings(appToSwitchTo);
        qmService.hideLoader();
    }
    function refreshAppListAndSwitchToSelectedApp(){
        qmLog.info("refreshAppListAndSwitchToSelectedApp...");
        qmService.showInfoToast("Downloading your apps...");
        configurationService.getAppSettingsArrayFromApi().then(function(allAppSettings){
            populateAppsListAndSwitchToSelectedApp(allAppSettings);
            qmService.hideLoader();
        });
    }
    $scope.loadUserList = function(){ // Delay loading user list because it's so big
        qmService.showBasicLoader();
        var users = configurationService.users;
        if(!users){
            var appSettings = qm.getAppSettings();
            users = appSettings.users;
        }
        if(users){
            $scope.state.users = users.slice(0, 20);
        }else{
            qmLog.error("No users!");
        }
        qmService.hideLoader();
    };
    $scope.appTypeChange = function(){
        configurationService.saveAppSettingsRevisionLocally(function(revisionList){
            $scope.revisionsList = revisionList;
            configurationService.updateAppComponentTypesAfterAppTypeChange();
            configurationService.updateAppComponents();
            //configurationService.saveRevisionAndPostAppSettingsAfterConfirmation($rootScope.appSettings);
        });
    };
    $scope.appComponentTypeChange = function(appComponentType){
        configurationService.saveAppSettingsRevisionLocally(function(revisionList){
            $scope.revisionsList = revisionList;
            if(appComponentType === "custom" || appComponentType !== $rootScope.appSettings.appType){
                $rootScope.appSettings.appType = "custom";
            }
            configurationService.updateAppComponents();
        });
    };
    $scope.appendDesignComponent = function(componentType, newComponent){
        var alreadyExists = false;
        for(var item in $rootScope.appSettings.appDesign[componentType].active){
            if(item.title === newComponent.title){
                alreadyExists = true;
            }
        }
        if(!alreadyExists){
            $rootScope.appSettings.appDesign[componentType].active.push(newComponent);
            qmService.showInfoToast("Added " + newComponent.title);
        }else{
            qmService.showInfoToast(newComponent.title + " already present");
        }
    };
    Array.prototype.move = function(old_index, new_index){
        if(new_index >= this.length){
            var k = new_index - this.length;
            while((k--) + 1){
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this; // for testing purposes
    };
    $scope.move = function(array, old_index, new_index){
        array.move(old_index, new_index);
    };
    $scope.removeFromArray = function(array, index){
        array.splice(index, 1);
    };
    $scope.duplicateElementOfArray = function(array, index){
        var newItem = JSON.parse(JSON.stringify(array[index]));
        newItem.title = "Copy of " + newItem.title;
        newItem.$$hashKey = "object:" + Math.random() * 1000;
        array.splice(index, 0, newItem);
    };
    $scope.undoPostAppSettings = function(ev){
        configurationService.separateUsersAndConfigureAppSettings($scope.state.appSettingsUndo);
        $scope.state.appSettingsUndo = null;
        configurationService.saveRevisionAndPostAppSettingsAfterConfirmation($rootScope.appSettings, ev);
    };
    function updateAppSettingInScope(appSettingName, appSettingValue, appSettingVariable){
        if(typeof $rootScope.appSettings.appDesign[appSettingName] !== "undefined"){
            $rootScope.appSettings.appDesign[appSettingName].custom = $rootScope.appSettings.appDesign[appSettingName].active = appSettingValue;
        }
        if(typeof $rootScope.appSettings.additionalSettings.appImages[appSettingName] !== "undefined"){
            $rootScope.appSettings.additionalSettings.appImages[appSettingName] = appSettingValue;
        }
        if(typeof $rootScope.appSettingObjectToEdit === "undefined"){
            qmLog.error("appSettingObjectToEdit not defined!");
            return false;
        }
        if($rootScope.appSettingObjectToEdit.appImages && typeof $rootScope.appSettingObjectToEdit.appImages[appSettingName] !== "undefined"){
            $rootScope.appSettingObjectToEdit.appImages[appSettingName] = appSettingValue;
        }
    }
    function uploadFile(file, fileName, successHandler, encrypt, ev){
        if(!file){
            qmLog.error('No file provided to uploadAppFile');
            return;
        }
        if(!encrypt){
            encrypt = false;
        }
        var body = {file: file};
        qmService.showBasicLoader();
        file.upload = Upload.upload({
            url: qm.api.getApiOrigin() + '/api/v2/upload?clientId=' + $rootScope.appSettings.clientId +
                '&filename=' + fileName + "&accessToken=" + $rootScope.user.accessToken + "&encrypt=" + encrypt,
            data: body
        });
        var displayName = fileName.replace('app_images_', '');
        displayName = qm.stringHelper.camelToTitleCase(displayName);
        qmService.showInfoToast("Uploading " + displayName + "...");
        file.upload.then(function(response){
            console.debug("File upload response: ", response);
            qmService.showInfoToast(displayName + " uploaded!");
            successHandler(response.data.url);
            qmService.hideLoader();
            configurationService.postAppSettingsAfterConfirmation($rootScope.appSettings, function(appSettingsUpdateResponse){
                qmLog.info("appSettings image UpdateResponse", appSettingsUpdateResponse);
            });
        }, function(response){
            qmService.hideLoader();
            if(response.status > 0){
                $scope.errorMsg = response.status + ': ' + response.data;
            }
        }, function(evt){
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
    }
    $scope.uploadAppImage = function(file, errFiles, imageType, imageObject, ev){
        if(imageObject.image && angular.isArray(imageObject.image)){
            imageObject.image = {};
        }
        function successHandler(url){
            if(imageObject.image){
                imageObject.image.url = url;
            }else{
                $rootScope.appSettings.additionalSettings.appImages[imageType] = url;
            }
        }
        var suffix = imageType;
        if(imageObject.image){
            suffix = qm.timeHelper.getUnixTimestampInSeconds();
        }
        var fileName = 'app_images_' + suffix;
        uploadFile(file, fileName, successHandler, false, ev);
    };
    $scope.uploadAppFile = function(file, errFiles, parentKey, childKey, appSettingParentVariable, encrypt, imageObject){
        if(!file){
            qmLog.error("No file provided to uploadAppFile!");
            return;
        }
        if($rootScope.appSettings.appDesign[parentKey]){
            $rootScope.appSettings.appDesign[parentKey].type = "custom";
        }
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        qmService.showBasicLoader();
        var fileName = parentKey + "_" + childKey + '_' + qm.timeHelper.getUnixTimestampInSeconds();
        var body = {file: file};
        if(encrypt){
            body.encrypt = true;
        }
        file.upload = Upload.upload({
            url: qm.api.getApiOrigin() + '/api/v2/upload?clientId=' + $rootScope.appSettings.clientId +
                '&filename=' + fileName + '&accessToken=' + $rootScope.user.accessToken, data: body
        });
        file.upload.then(function(response){
            console.debug("File upload response: ", response);
            qmService.showInfoToast(fileName + " uploaded!");
            $timeout(function(){
                file.result = response.data;
            });
            var originalSettingsParentVariableString = JSON.stringify(appSettingParentVariable);
            if(imageObject){
                imageObject.url = response.data.url;
            }
            if(appSettingParentVariable){
                appSettingParentVariable[childKey] = response.data.url;
            }
            if($rootScope.appSettingObjectToEdit){
                var newSettingsParentVariableString = JSON.stringify(appSettingParentVariable);
                var newAppSettingObjectToEditString = JSON.stringify($rootScope.appSettingObjectToEdit).replace(originalSettingsParentVariableString, newSettingsParentVariableString);
                $rootScope.appSettingObjectToEdit = JSON.parse(newAppSettingObjectToEditString);
            }
            configurationService.postAppSettingsAfterConfirmation();
            qmService.hideLoader();
        }, function(response){
            qmService.hideLoader();
            if(response.status > 0){
                $scope.errorMsg = response.status + ': ' + response.data;
            }
        }, function(evt){
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
    };
    $scope.saveToPc = function(data, filename, generic){
        data = JSON.parse(JSON.stringify(data));  //Prevent from updating $rootScope.appSettings
        if(generic){
            data.appDisplayName = "__APP_DISPLAY_NAME__";
            data.clientId = "__CONNECTOR_QUANTIMODO_CLIENT_ID__";
            data.appDescription = configurationService.defaultAppDescriptions[data.appType];
            filename = $rootScope.appSettings.appType;
        }
        filename = filename + ".config.json";
        if(!data){
            console.error('No data');
            return;
        }
        if(!filename){
            filename = 'download.json';
        }
        if(typeof data === 'object'){
            data = JSON.stringify(data, undefined, 2);
        }
        var blob = new Blob([data], {type: 'text/json'}); // jshint ignore:line
        if(window.navigator && window.navigator.msSaveOrOpenBlob){
            window.navigator.msSaveOrOpenBlob(blob, filename); // FOR IE:
        }else{
            var e = document.createEvent('MouseEvents'), a = document.createElement('a');
            a.download = filename;
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        }
    };
    var SelectIonIconDialogController = function($scope, $state, $rootScope, $stateParams, $filter, qmService, $q, $log, dataToPass, configurationService){
        var self = this;
        // list of `state` value/display objects
        self.items = loadAll();
        self.querySearch = querySearch;
        if(dataToPass.currentIcon){
            self.searchText = configurationService.formatIonIconName(dataToPass.currentIcon);
        }
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange = searchTextChange;
        self.title = dataToPass.title;
        self.minLength = 0;
        self.helpText = dataToPass.helpText;
        self.placeholder = dataToPass.placeholder;
        self.doNotCreateNewVariables = true;
        self.cancel = function(){
            self.items = null;
            $mdDialog.cancel();
        };
        self.finish = function(){
            self.items = null;
            $mdDialog.hide($scope.ionIcon);
        };
        function querySearch(query){
            if(!query){
                query = dataToPass.currentIcon;
            }
            self.notFoundText = "No ionIcons matching " + query + " were found.  Please try another wording or contact mike@quantimo.do.";
            var deferred = $q.defer();
            configurationService.getIonIcons(query)
                .then(function(results){
                    console.debug("Got " + results.length + " results matching " + query);
                    deferred.resolve(loadAll(results));
                });
            return deferred.promise;
        }
        function searchTextChange(text){
            console.debug('Text changed to ' + text);
        }
        function selectedItemChange(item){
            if(!item){
                return;
            }
            self.selectedItem = item;
            self.buttonText = dataToPass.buttonText;
            $scope.ionIcon = item.ionIcon;
            console.debug('Item changed to ' + item.ionIcon);
        }
        /**
         * Build `ionIcons` list of key/value pairs
         */
        function loadAll(ionIcons){
            if(!ionIcons){
                ionIcons = configurationService.getIonIcons();
            }
            if(!ionIcons || !ionIcons[0]){
                return [];
            }
            return ionIcons.map(function(ionIcon){
                return {
                    value: ionIcon.value,
                    name: ionIcon.name,
                    ionIcon: ionIcon.value
                };
            });
        }
    };
    $scope.selectIonIcon = function(ev, appSettingObjectToEdit){
        // noinspection JSCheckFunctionSignatures
        $mdDialog.show({
            controller: SelectIonIconDialogController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/dialogs/variable-search-dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {
                dataToPass: {
                    title: "Select an icon",
                    helpText: "Search for an icon...",
                    placeholder: "Search for an icon...",
                    buttonText: "Select icon",
                    requestParams: {},
                    currentIcon: appSettingObjectToEdit.icon
                }
            }
        }).then(function(newIcon){
            appSettingObjectToEdit.icon = newIcon;
            //updateAppSettingInScope(appSettingName, ionIcon, currentIcon);
            //configurationService.saveRevisionAndPostAppSettingsAfterConfirmation();
        }, function(){
            console.debug('User cancelled selection');
        });
    };
    $scope.postAppSettingsAfterConfirmation = function(){
        if($rootScope.appSettingObjectToEdit){
            var appSettingType = $rootScope.appSettingType;
            var newAppSetting = $rootScope.appSettingObjectToEdit;
            var originalAppSetting = $rootScope.originalAppSetting;
            configurationService.replaceAppSetting(appSettingType, originalAppSetting, JSON.stringify(newAppSetting));
            $rootScope.originalAppSetting = newAppSetting;  // Have to update so we can replace if we change something else
        }
        configurationService.saveRevisionAndPostAppSettingsAfterConfirmation($rootScope.appSettings, function(revisionList){
            $scope.revisionsList = revisionList;
        });
        for(var i = 0; i < $scope.appList.length; i++){
            if($scope.appList[i].clientId === $rootScope.appSettings.clientId){
                //$scope.appList[i] = $rootScope.appSettings;  // TODO: Why?
            }
        }
    };
    $scope.switchToPatientInIFrame = function(user){
        if(!user.accessToken){ // Temporary to deal with cached users without tokens
            var users = configurationService.users || qm.getAppSettings().users;
            user = users.find(function(oneUser){
                return oneUser.id === user.id;
            });
        }
        qmService.patient.switchToPatientInIFrame(user, $scope, $sce);
    };
    $scope.switchToPatientInNewTab = qm.patient.switchToPatientInNewTab;
    $scope.switchBackFromPatient = function(){
        qmService.patient.switchBackFromPatient($scope);
    };
    $scope.switchApp = function(selectedApp){
        //debugger
        if(selectedApp.clientId === $rootScope.appSettings.clientId){
            qmLog.info("Already using " + selectedApp.clientId);
            return false;
        }
        qmService.showBasicLoader();
        configurationService.switchApp(selectedApp, function(revisionList){
            qmService.hideLoader();
            $scope.revisionsList = revisionList;
        });
    };
    $scope.switchRevision = function(selectedRevision){
        configurationService.saveAppSettingsRevisionLocally(function(revisionList){
            $scope.revisionsList = revisionList;
            qmLog.info("Switching to selectedRevision", null, selectedRevision);
            qm.localForage.getItem(qm.items.appSettingsRevisions).then(function(revisions){
                for(var i = 0; i < revisions.length; i++){
                    if(revisions[i].revisionTime === selectedRevision.revisionTime){
                        qmService.processAndSaveAppSettings(revisions[i]);
                        break;
                    }
                }
                window.location.href = window.location.origin + window.location.pathname + '#/app/configuration/' + $rootScope.appSettings.clientId;
            });
        });
    };
    $scope.upgradeUser = function(user){
        qmService.showInfoToast("Account upgraded!");
        var userId = (user.userId) ? user.userId : user.id;
        user.stripeActive = true;
        configurationService.upgradeUser(userId);
    };
    $scope.addCollaborator = function(email){
        $scope.sentText = "Invitation sent to " + email;
        qmService.showInfoToast($scope.sentText);
        configurationService.addCollaborator(email);
    };
    $scope.deleteCollaborator = function(c){
        var userId = c.userId || c.id;
        var as = $rootScope.appSettings;
        /** @namespace $rootScope.appSettings.collaborators */
        $rootScope.appSettings.collaborators = $rootScope.appSettings.collaborators.filter(function(one){
            return one.id !== userId;
        });
        qmService.showInfoToast(c.displayName + ' removed from collaborators of ' + as.appDisplayName);
        configurationService.deleteCollaborator(userId, as.clientId);
    };
    $scope.deleteApp = function(appToDelete){
        var i;
        for(i = 0; i < $scope.appList.length; i++){
            if($scope.appList[i].clientId === appToDelete.clientId){
                $scope.appList.splice(i, 1);
                configurationService.appList = $scope.appList;
                console.debug("Removed " + appToDelete.clientId + " from $scope.appList", $scope.appList);
                break;
            }
        }
        qmService.showInfoToast(appToDelete.appDisplayName + ' removed from your list');
        configurationService.deleteCollaborator($rootScope.user.id, appToDelete.clientId);
    };
    $scope.deleteRevision = function(revisionToDelete){
        qm.localForage.getItem(qm.items.appSettingsRevisions).then(function(revisions){
            for(var i = 0; i < revisions.length; i++){
                if(revisions.revisionTime === revisionToDelete.revisionTime){
                    revisions.splice(i, 1);
                    qm.localForage.setItem(qm.items.appSettingsRevisions, revisions);
                    $scope.revisionsList = configurationService.convertAppSettingsRevisionsArrayToRevisionsList(revisions);
                    qmLog.debug("Removed " + revisionToDelete.revisionTime + " from $scope.revisions");
                    break;
                }
            }
            qmService.showInfoToast("Revision " + revisionToDelete.revisionTime + ' deleted');
        });
    };
    $scope.defaultDesigns = configurationService.defaultDesigns;
    $scope.sendEmail = function(subjectLine, emailAddress, emailBody){
        if($rootScope.isMobile){
            qmService.sendWithEmailComposer(subjectLine, emailBody, emailAddress);
        }else{
            qmService.sendWithMailTo(subjectLine, emailBody, emailAddress);
        }
    };
    $scope.copyIntegrationJsToClipboard = function(){
        $scope.copyToClipboard(configurationService.getEmbeddableJs(), 'javascript embed code');
        qmService.showMaterialAlert('Widget Embed Code Copied to Clipboard', "Now paste this JS code snippet within the " + "" +
            "footer section at the bottom the HTML page that you want your widget to appear on.  " +
            "Refresh and you should see your icon in the lower right corner.");
    };
    $scope.openEmbedPreview = function(){
        function openInNewTab(url){
            var win = window.open(url, '_blank');
            win.focus();
        }
        openInNewTab('https://app.quantimo.do/qm-connect/fab-preview.html?clientId=' +
            $rootScope.appSettings.clientId + "&previewUrl=" +
            $rootScope.appSettings.homepageUrl.replace('https://', '').replace('http://', ''));
    };
    $scope.showRedirectUriInfo = function(){
        qmService.showMaterialAlert("Redirect URI's", "The Redirect URI (A.K.A Callback URL) is used in the OAuth 2.0 authentication process. " +
            "It is the uri that our systems post your an authorization code to, which is then " +
            "exchanged for an access token which you can use to authenticate subsequent API calls.  If you have more than one redirect uri, you must specify " +
            "which one to use by adding a redirect_uri parameter in your OAuth request. Must include https:// or http://localhost");
    };
    function DialogController($scope, $mdDialog){
        $scope.hide = function(){
            $mdDialog.hide();
        };
        $scope.cancel = function(){
            $mdDialog.cancel();
        };
        $scope.answer = function(answer){
            $mdDialog.hide(answer);
        };
        $scope.createApp = function(newApp){
            $scope.creatingApp = true;
            $scope.errorMessage = null;
            configurationService.createApp(newApp).then(function(appSettings){
                configurationService.switchApp(appSettings, function(revisionList){
                    $scope.revisionsList = revisionList;
                    refreshAppListAndSwitchToSelectedApp(); // Need to update list
                });
            }, function(error){
                $scope.creatingApp = false;
                $scope.errorMessage = error;
            });
        };
    }
    $scope.openNewAppModalPopup = function(ev){
        // noinspection JSCheckFunctionSignatures
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'builder-templates/new-app-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: false // Only for -xs, -sm breakpoints.
        }).then(function(answer){
            $scope.status = 'You said the information was "' + answer + '".';
        }, function(){
            $scope.status = 'You cancelled the dialog.';
        });
    };
    $scope.addReminder = function(){
        configurationService.reminders.addReminder($state);
    };
    $scope.editReminder = function(reminder){
        configurationService.reminders.editReminder(reminder, $state);
    };
    $scope.deleteReminder = function(reminderToDelete){
        configurationService.reminders.deleteReminder(reminderToDelete);
    };
});

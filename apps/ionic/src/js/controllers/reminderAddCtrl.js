angular.module('starter').controller('ReminderAddCtrl', ["$scope", "$state", "$stateParams", "$ionicLoading",
    "$filter", "$timeout", "$rootScope", "$ionicActionSheet", "$ionicHistory", "qmService", "ionicTimePicker", "$interval",
    function($scope, $state, $stateParams, $ionicLoading, $filter, $timeout, $rootScope, $ionicActionSheet, $ionicHistory,
             qmService, ionicTimePicker, $interval){
        $scope.controller_name = "ReminderAddCtrl";
        qmLog.debug('Loading ' + $scope.controller_name, null);
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {
            units: qm.unitHelper.getProgressivelyMoreUnits(),
            showVariableCategorySelector: false,
            showUnits: false,
            selectedFrequencyName: 'Daily',
            selectedReminder: false,
            measurementSynonymSingularLowercase: 'measurement',
            defaultValueLabel: 'Default Value',
            defaultValuePlaceholderText: 'Enter typical value',
            selectedStopTrackingDate: null,
            showMoreOptions: false,
            showMoreUnits: false,
            title: "Add Reminder",
            trackingReminder: {
                variableId: null,
                variableName: null,
                combinationOperation: null
            },
            variableCategoryNames: qm.manualTrackingVariableCategoryNames,
            frequencies: [
                {id: 2, name: 'Daily'},  // Default Daily has to be first because As-Needed will be above the fold on Android
                {id: 1, name: 'As-Needed'},
                {id: 3, name: 'Every 12 hours'},
                {id: 4, name: 'Every 8 hours'},
                {id: 5, name: 'Every 6 hours'},
                {id: 6, name: 'Every 4 hours'},
                {id: 7, name: 'Every 3 hours'},
                {id: 8, name: 'Every 2 hours'},
                {id: 9, name: 'Hourly'},
                {id: 10, name: 'Every 30 minutes'},
                {id: 11, name: 'Every other day'},
                {id: 12, name: 'Weekly'},
                {id: 13, name: 'Every 2 weeks'},
                {id: 14, name: 'Every 4 weeks'}
            ]
        };
        var u = $rootScope.user;
        if(qm.userHelper.isTestUserOrAdmin()){$scope.state.frequencies.push({id: 15, name: 'Minutely'});}
        if(!u){qmService.refreshUser();}
        $scope.$on('$ionicView.beforeEnter', function(){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.info('ReminderAddCtrl beforeEnter...');
            if($stateParams.reminder){
                $scope.state.trackingReminder = $stateParams.reminder;
            }
            if($stateParams.trackingReminder){
                $scope.state.trackingReminder = $stateParams.trackingReminder;
            }
            if($stateParams.trackingReminderId){
                $scope.state.trackingReminder = $stateParams;
                $scope.state.trackingReminder.id = $stateParams.trackingReminderId;
            }
            $scope.state.savingText = 'Save';
            $scope.state.variableCategories = qm.variableCategoryHelper.getVariableCategories();
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            qmService.login.sendToLoginIfNecessaryAndComeBack("beforeEnter in " + $state.current.name);
            $stateParams.variableCategoryName = getVariableCategoryName();
            $scope.stateParams = $stateParams;
            setTitle();
            var reminderIdUrlParameter = qm.urlHelper.getParam('reminderId');
            var variableIdUrlParameter = qm.urlHelper.getParam('variableId');
            if($stateParams.variableObject){
                $scope.state.variableObject = $stateParams.variableObject;
                setupByVariableObject($stateParams.variableObject);
            }else if(reminderIdUrlParameter){
                setupReminderEditingFromUrlParameter(reminderIdUrlParameter);
            }else if(variableIdUrlParameter){
                setupReminderEditingFromVariableId(variableIdUrlParameter);
            }else if($stateParams.variableName){
                setupByVariableObject({variableName: $stateParams.variableName});
            }else if(getVariableCategoryName()){
                $scope.state.trackingReminder.variableCategoryName = getVariableCategoryName();
                setupVariableCategory(getVariableCategoryName());
            }else if(qm.getPrimaryOutcomeVariable()){
                $scope.state.variableObject = qm.getPrimaryOutcomeVariable();
                setupByVariableObject(qm.getPrimaryOutcomeVariable());
            }else{
                $scope.goBack();
            }
            if(typeof $scope.state.trackingReminder.reminderFrequency === "undefined"){
                $scope.state.trackingReminder.reminderFrequency = 86400;
            }
        });
        $scope.$on('$ionicView.afterEnter', function(){
            qmLog.info('ReminderAddCtrl beforeEnter...');
            qmService.hideLoader();
            qm.storage.setItem(qm.items.lastReminder, $scope.state.trackingReminder);
            setHideDefaultValueField();
            if($state.current.name !== qm.staticData.stateNames.favoriteAdd){
                setupEditReminder($scope.state.trackingReminder);
            }  // Needed to set dates
            qmLog.info("tracking reminder after setup: ", $scope.state.trackingReminder);
            setTitle();
        });
        $scope.showMoreOptions = function(){
            $scope.state.showMoreOptions = true;
            setHideDefaultValueField();
        };
        if(u){
            $scope.state.firstReminderStartTimeLocal = u.earliestReminderTime;
            $scope.state.firstReminderStartTimeEpochTime = qmService.getEpochTimeFromLocalStringRoundedToHour('20:00:00');
            $scope.state.firstReminderStartTimeMoment = moment($scope.state.firstReminderStartTimeEpochTime * 1000);
        }
        function getVariableCategoryName(){
            return qm.variableCategoryHelper.getNameFromStateParamsOrUrl(
                $scope.state.trackingReminder, $stateParams, $stateParams.variableObject);
        }
        $scope.openReminderStartTimePicker = function(order){
            var a = new Date();
            setupReminderTimes(order, a);
        };
        function setupReminderTimes(order, a) {
            if (order === 'first') {
                $scope.state.firstReminderStartTimeEpochTime = a.getTime() / 1000;
                $scope.state.firstReminderStartTimeLocal = moment(a).format('HH:mm:ss');
                $scope.state.firstReminderStartTimeMoment = moment(a);
            }
            if (order === 'second') {
                $scope.state.secondReminderStartTimeEpochTime = a.getTime() / 1000;
                $scope.state.secondReminderStartTimeLocal = moment(a).format('HH:mm:ss');
                $scope.state.secondReminderStartTimeMoment = moment(a);
            }
            if (order === 'third') {
                $scope.state.hideAdditionalReminderTimeButton = true;
                $scope.state.thirdReminderStartTimeEpochTime = a.getTime() / 1000;
                $scope.state.thirdReminderStartTimeLocal = moment(a).format('HH:mm:ss');
                $scope.state.thirdReminderStartTimeMoment = moment(a);
            }
        }
        $scope.oldOpenReminderStartTimePicker = function(order){
            var defaultStartTimeInSecondsSinceMidnightLocal =
                qmService.getSecondsSinceMidnightLocalFromLocalString($rootScope.user.earliestReminderTime);
            if(order === 'first' && $scope.state.firstReminderStartTimeLocal){
                defaultStartTimeInSecondsSinceMidnightLocal =
                    qmService.getSecondsSinceMidnightLocalFromLocalString($scope.state.firstReminderStartTimeLocal);
            }
            if(order === 'second' && $scope.state.secondReminderStartTimeLocal){
                defaultStartTimeInSecondsSinceMidnightLocal =
                    qmService.getSecondsSinceMidnightLocalFromLocalString($scope.state.secondReminderStartTimeLocal);
            }
            if(order === 'third' && $scope.state.thirdReminderStartTimeLocal){
                defaultStartTimeInSecondsSinceMidnightLocal =
                    qmService.getSecondsSinceMidnightLocalFromLocalString($scope.state.thirdReminderStartTimeLocal);
            }
            defaultStartTimeInSecondsSinceMidnightLocal =
                qmService.getSecondsSinceMidnightLocalRoundedToNearestFifteen(defaultStartTimeInSecondsSinceMidnightLocal);
            $scope.state.timePickerConfiguration = {
                callback: function(val){
                    if(typeof (val) === 'undefined'){
                        qmLog.debug('Time not selected', null);
                    }else{
                        var a = new Date();
                        var selectedTime = new Date(val * 1000);
                        a.setHours(selectedTime.getUTCHours());
                        a.setMinutes(selectedTime.getUTCMinutes());
                        a.setSeconds(0);
                        qmLog.debug('Selected epoch is: ', val, 'and the time is ',
                            selectedTime.getUTCHours(), 'H :', selectedTime.getUTCMinutes(), 'M');
                        setupReminderTimes(order, a);
                    }
                },
                inputTime: defaultStartTimeInSecondsSinceMidnightLocal,
                step: 15,
                closeLabel: 'Cancel'
            };
            ionicTimePicker.openTimePicker($scope.state.timePickerConfiguration);
        };
        var setupByVariableObject = function(selectedVariable){
            var r = $scope.state.trackingReminder;
            var v = $scope.state.variableObject = selectedVariable;
            qmLog.info('remindersAdd.setupByVariableObject: ' + v.name, null);
            setupVariableCategory(v.variableCategoryName);
            if(v.unitAbbreviatedName){
                r.unitAbbreviatedName = v.unitAbbreviatedName;
            }else if(v.id){
                qmLog.error("selectedVariable does not have unitAbbreviatedName", v)
            }
            if(v.combinationOperation){r.combinationOperation = v.combinationOperation;}
            if(v.id){r.variableId = v.id;}
            if(v.name){r.variableName = v.name;}
            if(v.variableName){r.variableName = v.variableName; }
            if(v.upc){ r.upc = v.upc;}
            setHideDefaultValueField();
            if(v.valence){r.valence = v.valence;}
            showMoreUnitsIfNecessary();
        };
        $scope.showAdditionalReminderTime = function(){
            if(!$scope.state.secondReminderStartTimeEpochTime){
                $scope.openReminderStartTimePicker('second');
                return;
            }
            if(!$scope.state.thirdReminderStartTimeEpochTime){
                $scope.openReminderStartTimePicker('third');
            }
        };
        $scope.oldShowAdditionalReminderTime = function(){
            if(!$scope.state.secondReminderStartTimeEpochTime){
                $scope.oldOpenReminderStartTimePicker('second');
                return;
            }
            if(!$scope.state.thirdReminderStartTimeEpochTime){
                $scope.oldOpenReminderStartTimePicker('third');
            }
        };
        var validationFailure = function(message){
            qmService.showMaterialAlert('Whoops!', message);
            qmLog.error(message, {trackingReminder: $scope.state.trackingReminder});
        };
        var validReminderSettings = function(){
            var r = $scope.state.trackingReminder;
            if(!r.variableCategoryName){
                validationFailure('Please select a variable category');
                return false;
            }
            if(!getVariableName($scope)){
                validationFailure('Please enter a variable name');
                return false;
            }
            if(!r.unitAbbreviatedName){
                validationFailure('Please select a unit for ' + r.variableName);
                return false;
            }else{
                r.unitId = getUnit($scope).id;
            }
            var unit = getUnit($scope);
            if(unit && typeof unit.minimumValue !== "undefined" && unit.minimumValue !== null){
                if(r.defaultValue !== null && r.defaultValue < unit.minimumValue){
                    validationFailure(unit.minimumValue + ' is the smallest possible value for the unit ' + unit.name +
                        ".  Please select another unit or value.");
                    return false;
                }
            }
            if(unit && typeof unit.maximumValue !== "undefined" && unit.maximumValue !== null){
                if(r.defaultValue !== null && r.defaultValue > unit.maximumValue){
                    validationFailure(unit.maximumValue + ' is the largest possible value for the unit ' + unit.name +
                        ".  Please select another unit or value.");
                    return false;
                }
            }
            if($scope.state.selectedStopTrackingDate && $scope.state.selectedStartTrackingDate && $scope.state.selectedStopTrackingDate < $scope.state.selectedStartTrackingDate){
                validationFailure("Start date cannot be later than the end date");
                return false;
            }
            return true;
        };
        var configureReminderTimeSettings = function(trackingReminder, reminderStartTimeEpochTime){
            var r = trackingReminder;
            r.reminderStartTimeEpochTime = reminderStartTimeEpochTime;
            r.reminderStartTimeLocal = moment(reminderStartTimeEpochTime * 1000).format('HH:mm:ss');
            // if(r.reminderStartTimeLocal < $rootScope.user.earliestReminderTime){
            //     validationFailure(r.reminderStartTimeLocal + " is earlier than your earliest allowed " +
            //         "notification time.  You can change your earliest notification time on the settings page.");
            // }
            // if(r.reminderStartTimeLocal > $rootScope.user.latestReminderTime){
            //     validationFailure(r.reminderStartTimeLocal + " is later than your latest allowed " +
            //         "notification time.  You can change your latest notification time on the settings page.");
            // }
            r.valueAndFrequencyTextDescriptionWithTime = qm.reminderHelper.getValueAndFrequencyTextDescriptionWithTime(r);
            r.reminderStartTime = qm.timeHelper.getUtcTimeStringFromLocalString(r.reminderStartTimeLocal);
            r.reminderStartTimeEpochSeconds = reminderStartTimeEpochTime;
            r.nextReminderTimeEpochSeconds = reminderStartTimeEpochTime;
            return r;
        };
        function getFrequencySecondsFromFrequencyName(frequencyName){
            var frequencyChart = {
                "As-Needed": 0,
                "Every 12 hours": 12 * 60 * 60,
                "Every 8 hours": 8 * 60 * 60,
                "Every 6 hours": 6 * 60 * 60,
                "Every 4 hours": 4 * 60 * 60,
                "Every 3 hours": 180 * 60,
                "Every 30 minutes": 30 * 60,
                "Every minute": 60,
                "Hourly": 60 * 60,
                "Daily": 24 * 60 * 60,
                "Twice a day": 12 * 60 * 60,
                "Three times a day": 8 * 60 * 60,
                "Minutely": 60,
                "Every other day": 172800,
                'Weekly': 7 * 86400,
                'Every 2 weeks': 14 * 86400,
                'Every 4 weeks': 28 * 86400
            };
            return frequencyChart[frequencyName];
        }
        $scope.save = function(){
            var r = $scope.state.trackingReminder = qm.unitHelper.updateAllUnitPropertiesOnObject(
                $scope.state.trackingReminder.unitAbbreviatedName, $scope.state.trackingReminder);
            qmLog.info('Clicked save reminder');
            if($stateParams.favorite){
                r.reminderFrequency = 0;
                r.valueAndFrequencyTextDescription = "As Needed";
            }
            if(!validReminderSettings()){
                return false;
            }
            r.reminderFrequency = getFrequencySecondsFromFrequencyName($scope.state.selectedFrequencyName);
            r.valueAndFrequencyTextDescription = $scope.state.selectedFrequencyName;
            function applySelectedDatesToReminder(){
                var dateFormat = 'YYYY-MM-DD';
                r.stopTrackingDate = r.startTrackingDate = null;
                if($scope.state.selectedStopTrackingDate){
                    r.stopTrackingDate = moment($scope.state.selectedStopTrackingDate).format(dateFormat);
                }
                if($scope.state.selectedStartTrackingDate){
                    r.startTrackingDate = moment($scope.state.selectedStartTrackingDate).format(dateFormat);
                }
            }
            applySelectedDatesToReminder();
            var remindersArray = [];
            if(typeof r.defaultValue === "undefined"){r.defaultValue = null;}
            remindersArray[0] = JSON.parse(JSON.stringify(r));
            function applyReminderTimesToReminder(){
                if($scope.state.firstReminderStartTimeMoment){
                    $scope.state.firstReminderStartTimeMoment = moment($scope.state.firstReminderStartTimeMoment);
                    $scope.state.firstReminderStartTimeEpochTime = parseInt($scope.state.firstReminderStartTimeMoment.format("X"));
                }
                remindersArray[0] = configureReminderTimeSettings(remindersArray[0], $scope.state.firstReminderStartTimeEpochTime);
                if($scope.state.secondReminderStartTimeMoment){
                    $scope.state.secondReminderStartTimeMoment = moment($scope.state.secondReminderStartTimeMoment);
                    $scope.state.secondReminderStartTimeEpochTime = parseInt($scope.state.secondReminderStartTimeMoment.format("X"));
                }
                if($scope.state.secondReminderStartTimeEpochTime){
                    remindersArray[1] = JSON.parse(JSON.stringify(r));
                    remindersArray[1].id = null;
                    remindersArray[1] = configureReminderTimeSettings(remindersArray[1], $scope.state.secondReminderStartTimeEpochTime);
                }
                if($scope.state.thirdReminderStartTimeMoment){
                    $scope.state.thirdReminderStartTimeMoment = moment($scope.state.thirdReminderStartTimeMoment);
                    $scope.state.thirdReminderStartTimeEpochTime = $scope.state.thirdReminderStartTimeMoment.format("X");
                }
                if($scope.state.thirdReminderStartTimeEpochTime){
                    remindersArray[2] = JSON.parse(JSON.stringify(r));
                    remindersArray[2].id = null;
                    remindersArray[2] = configureReminderTimeSettings(remindersArray[2], $scope.state.thirdReminderStartTimeEpochTime);
                }
            }
            applyReminderTimesToReminder();
            $scope.state.savingText = "Saving " + getVariableName($scope) + '...';
            qmService.showInfoToast($scope.state.savingText);
            if(qm.editReminderCallback){  // For saving default reminders created by physician or app builder
                qm.editReminderCallback(r);
                return;
            }
            if(r.id){qm.storage.deleteById('trackingReminders', r.id);}
            qm.reminderHelper.addToQueue(remindersArray);
            qm.reminderHelper.syncReminders(true).then(function(){});
            var toastMessage = getVariableName($scope) + ' saved';
            qmService.showInfoToast(toastMessage);
            qmService.hideLoader();
            if($stateParams.doneState){
                delete $stateParams.variableCategoryName; // Don't redirect to category inbox
                delete $stateParams.variableCategoryId; // Don't redirect to category inbox
                qmService.goToState($stateParams.doneState, $stateParams);
            } else {
                $scope.goBack(); // We can't go back until we get new notifications
            }
        };
        function getFrequencyNameFromFrequencySeconds(frequencyName){
            var reverseFrequencyChart = {
                604800: 'Weekly',
                1209600: 'Every 2 weeks',
                2419200: 'Every 4 weeks',
                172800: "Every other day",
                86400: "Daily",
                43200: "Every 12 hours",
                28800: "Every 8 hours",
                21600: "Every 6 hours",
                14400: "Every 4 hours",
                10800: "Every 3 hours",
                7200: "Every 2 hours",
                3600: "Hourly",
                1800: "Every 30 minutes",
                60: "Every minute",
                0: "As-Needed"
            };
            return reverseFrequencyChart[frequencyName];
        }
        var setupEditReminder = function(trackingReminder){
            var r = $scope.state.trackingReminder = trackingReminder;
            setupVariableCategory(r.variableCategoryName);
            r.firstDailyReminderTime = null;
            r.secondDailyReminderTime = null;
            r.thirdDailyReminderTime = null;
            if(trackingReminder.reminderStartTime){
                $scope.state.firstReminderStartTimeLocal = qmService.getLocalTimeStringFromUtcString(trackingReminder.reminderStartTime);
            }else{
                $scope.state.firstReminderStartTimeLocal = '20:00:00';
            }
            $scope.state.firstReminderStartTimeEpochTime = qmService.getEpochTimeFromLocalString($scope.state.firstReminderStartTimeLocal);
            $scope.state.firstReminderStartTimeMoment = moment($scope.state.firstReminderStartTimeEpochTime * 1000);
            //$scope.state.reminderEndTimeStringLocal = trackingReminder.reminderEndTime;
            if(trackingReminder.stopTrackingDate){
                $scope.state.selectedStopTrackingDate = new Date(trackingReminder.stopTrackingDate);
                var stopTrackingDateMoment = moment($scope.state.selectedStopTrackingDate);
                var beforeNow = stopTrackingDateMoment.isBefore();
                r.enabled = (!beforeNow);
            }else{
                r.enabled = true;
            }
            if(trackingReminder.startTrackingDate){
                $scope.state.selectedStartTrackingDate = new Date(trackingReminder.startTrackingDate);
            }
            if(r.reminderFrequency !== null){
                $scope.state.selectedFrequencyName = getFrequencyNameFromFrequencySeconds(r.reminderFrequency);
            }
            setHideDefaultValueField();
        };
        $scope.variableCategorySelectorChange = function(variableCategoryName){
            $scope.state.variableCategoryObject = qm.variableCategoryHelper.findByNameIdObjOrUrl(variableCategoryName);
            $scope.state.trackingReminder.unitAbbreviatedName = $scope.state.variableCategoryObject.defaultUnitAbbreviatedName;
            $scope.state.defaultValuePlaceholderText = 'Enter most common value';
            $scope.state.defaultValueLabel = 'Default Value';
            setupVariableCategory(variableCategoryName);
            showMoreUnitsIfNecessary();
        };
        var showMoreUnitsIfNecessary = function(){
            var name = getUnitAbbreviatedName($scope);
            $scope.state.units = qm.unitHelper.getUnitArrayContaining(name);
        };
        var setupVariableCategory = function(variableCategoryName){
            qmLog.debug('remindersAdd.setupVariableCategory ' + variableCategoryName, null);
            if(variableCategoryName === 'Anything'){
                variableCategoryName = null;
            }
            if(!variableCategoryName){
                return;
            }
            var r = $scope.state.trackingReminder;
            r.variableCategoryName = variableCategoryName;
            $scope.state.variableCategoryObject = qm.variableCategoryHelper.findByNameIdObjOrUrl(variableCategoryName);
            if(!r.unitAbbreviatedName){
                r.unitAbbreviatedName = $scope.state.variableCategoryObject.defaultUnitAbbreviatedName;
            }
            $scope.state.measurementSynonymSingularLowercase = $scope.state.variableCategoryObject.measurementSynonymSingularLowercase;
            if($scope.state.variableCategoryObject.defaultValueLabel){
                $scope.state.defaultValueLabel = $scope.state.variableCategoryObject.defaultValueLabel;
            }
            if($scope.state.variableCategoryObject.defaultValuePlaceholderText){
                $scope.state.defaultValuePlaceholderText = $scope.state.variableCategoryObject.defaultValuePlaceholderText;
            }
            qm.api.addVariableCategoryAndUnit(r)
            $scope.state.trackingReminder = r;
            showMoreUnitsIfNecessary();
            setHideDefaultValueField();
        };
        function setupReminderEditingFromVariableId(variableId){
            if(variableId){
                qm.variablesHelper.getVariableByIdFromApi(variableId)
                    .then(function(variables){
                        $scope.state.variableObject = variables[0];
                        qmLog.debug('setupReminderEditingFromVariableId got this variable object ' + JSON.stringify($scope.state.variableObject), null);
                        setupByVariableObject($scope.state.variableObject);
                        qmService.hideLoader();
                    }, function(){
                        qmService.hideLoader();
                        qmLog.error('ERROR: failed to get variable with id ' + variableId);
                    });
            }
        }
        function setupReminderEditingFromUrlParameter(reminderIdUrlParameter){
            qm.reminderHelper.findReminder(reminderIdUrlParameter)
                .then(function(reminder){
                    if(!reminder){
                        validationFailure("Reminder id " + reminderIdUrlParameter + " not found!", 'assertive');
                        $scope.goBack();
                    }
                    $stateParams.reminder = reminder;
                    setupEditReminder($stateParams.reminder);
                    qmService.hideLoader();
                }, function(){
                    qmService.hideLoader();
                    qmLog.error('ERROR: failed to get reminder with reminderIdUrlParameter ' + reminderIdUrlParameter);
                });
        }
        var setTitle = function(){
            if($stateParams.favorite || $state.current.name === qm.staticData.stateNames.favoriteAdd){
                $scope.state.selectedFrequencyName = 'As-Needed';
                if($stateParams.reminder){
                    if(getVariableCategoryName() === 'Treatments'){
                        $scope.state.title = "Modify As-Needed Med";
                    }else{
                        $scope.state.title = "Edit Favorite";
                    }
                }else{
                    if(getVariableCategoryName() === 'Treatments'){
                        $scope.state.title = "Add As-Needed Med";
                    }else{
                        $scope.state.title = "Add Favorite";
                    }
                }
            }else{
                if($stateParams.reminder){
                    $scope.state.title = "Edit Reminder Settings";
                }else{
                    $scope.state.title = "Add Reminder";
                }
            }
        };
        $scope.deleteReminder = function(){
            qmService.storage.deleteById('trackingReminders', $scope.state.trackingReminder.id).then(function(){
                $scope.goBack();
            });
            qm.reminderHelper.deleteReminder($scope.state.trackingReminder);
        };
        function setHideDefaultValueField(){
            var hide = false;
            var r = $scope.state.trackingReminder;
            var variableName = getVariableName($scope);
            if(variableName && variableName.toLowerCase().indexOf('blood pressure') > -1){
                hide = true;
            }
            var unitName = getUnitAbbreviatedName($scope);
            if(unitName === '/5' || unitName === '/10' || unitName === 'yes/no'){
                hide = true;
            }
            if(!$scope.state.showMoreOptions){
                var number = getNumberOfUniqueValues($scope);
                if(number && number > 30){hide = true;}
            }
            $scope.state.hideDefaultValueField = hide;
        }
        function showMoreUnits(){
            var r = $scope.state.trackingReminder;
            $scope.state.units = qm.unitHelper.getProgressivelyMoreUnits($scope.state.units);
            r.unitAbbreviatedName = null;
            r.unitName = null;
            r.unitId = null;
        }
        function getVariableName(scope){
            scope = scope || $scope; // Not sure why this is necessary but $scope is undefined sometimes
            var r = scope.state.trackingReminder;
            if(r && r.variableName){return r.variableName;}
            var v = scope.state.variableObject;
            if(v && v.name){return v.name;}
            qmLog.errorAndExceptionTestingOrDevelopment("Could not get variable name!");
            return null;
        }
        function getUnitAbbreviatedName(scope){
            scope = scope || $scope; // Not sure why this is necessary but $scope is undefined sometimes
            var r = scope.state.trackingReminder;
            if(r && r.unitAbbreviatedName){return r.unitAbbreviatedName;}
            var v = scope.state.variableObject;
            if(v && v.unitAbbreviatedName){return v.unitAbbreviatedName;}
            return null;
            //qmLog.errorAndExceptionTestingOrDevelopment("Could not get getUnitAbbreviatedName!");
        }
        function getUnit(scope){
            scope = scope || $scope; // Not sure why this is necessary but $scope is undefined sometimes
            return qm.unitHelper.getByNameAbbreviatedNameOrId(getUnitAbbreviatedName(scope));
        }
        function getNumberOfUniqueValues(scope){
            scope = scope || $scope; // Not sure why this is necessary but $scope is undefined sometimes
            var r = scope.state.trackingReminder;
            if(r && r.numberOfUniqueValues){return r.numberOfUniqueValues;}
            var v = scope.state.variableObject;
            if(v && v.numberOfUniqueValues){return v.numberOfUniqueValues;}
            if(v && v.commonNumberOfUniqueValues){return v.commonNumberOfUniqueValues;}
            return null;
        }
        $scope.unitSelected = function(){
            var r = $scope.state.trackingReminder;
            $scope.state.showVariableCategorySelector = true;  // Need to show category selector in case someone picks a nutrient like Magnesium and changes the unit to pills
            var n = r.unitAbbreviatedName;
            if(n === 'Show more units'){
                showMoreUnits();
            }else{
                qmLog.debug('selecting_unit: '+ n);
                r = $scope.state.trackingReminder = qm.unitHelper.updateAllUnitPropertiesOnObject(n, r);
                r.defaultValue = null;
            }
            setHideDefaultValueField();
        };
        $scope.frequencySelected = function(){
            $scope.state.trackingReminder.reminderFrequency = getFrequencySecondsFromFrequencyName($scope.state.selectedFrequencyName);
        };
        $scope.showUnitsDropDown = function(){
            $scope.showUnitsDropDown = true;
        };
        qmService.rootScope.setShowActionSheetMenu(function(){
            var r = $scope.state.trackingReminder;
            $scope.state.variableObject = r;
            $scope.state.variableObject.variableId = r.variableId;
            $scope.state.variableObject.name = getVariableName($scope);
            qmLog.debug('ReminderAddCtrl.showActionSheetMenu:   $scope.state.variableObject: ', null, $scope.state.variableObject);
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    qmService.actionSheets.actionSheetButtons.measurementAddVariable,
                    qmService.actionSheets.actionSheetButtons.charts,
                    qmService.actionSheets.actionSheetButtons.historyAllVariable,
                    qmService.actionSheets.actionSheetButtons.variableSettings,
                    {text: '<i class="icon ion-settings"></i>' + 'Show More Units'}
                ],
                destructiveText: '<i class="icon ion-trash-a"></i>Delete Favorite',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function(){
                    qmLog.debug('CANCELLED', null);
                },
                buttonClicked: function(index, button){
                    if(index === 0){
                        qmService.goToState('app.measurementAddVariable', {
                            variableObject: $scope.state.variableObject,
                            variableName: getVariableName($scope)
                        });
                    }
                    if(index === 1){
                        qmService.goToState('app.charts', {
                            variableObject: $scope.state.variableObject,
                            variableName: getVariableName($scope)
                        });
                    }
                    if(index === 2){
                        qmService.goToState('app.historyAllVariable', {
                            variableObject: $scope.state.variableObject,
                            variableName: getVariableName($scope)
                        });
                    }
                    if(index === 3){
                        qmService.goToVariableSettingsByName(getVariableName($scope));
                    }
                    if(index === 4){
                        showMoreUnits();
                    }
                    return true;
                },
                destructiveButtonClicked: function(){
                    $scope.deleteReminder();
                    return true;
                }
            });
            qmLog.debug('Setting hideSheet timeout', null);
            $timeout(function(){
                hideSheet();
            }, 20000);
        });
        $scope.resetSaveAnimation = (function fn(){
            $scope.value = 0;
            $interval(function(){
                $scope.value++;
            }, 5, 100);
            return fn;
        })();
        $scope.toggleReminderEnabled = function(){
            if(!$scope.state.trackingReminder.enabled){
                $scope.state.selectedStopTrackingDate = moment().subtract(1, 'days');
            }else{
                $scope.state.selectedStopTrackingDate = null;
            }
        }
    }]);

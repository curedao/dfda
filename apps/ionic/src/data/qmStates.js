var qmStates = [
    {
        "name": "",
        "url": "^",
        "views": null,
        "abstract": true
    },
    {
        "url": "/app",
        "templateUrl": "templates/menu.html",
        "controller": "AppCtrl",
        "resolve": {},
        "name": "app"
    },
    {
        "url": "/login",
        "templateUrl": "templates/login-page.html",
        "controller": "LoginCtrl",
        "resolve": {},
        "name": "login"
    },
    {
        "cache": true,
        "url": "/welcome",
        "views": {
            "menuContent": {
                "templateUrl": "templates/welcome.html",
                "controller": "WelcomeCtrl"
            }
        },
        "name": "app.welcome"
    },
    {
        "url": "/login",
        "params": {
            "fromState": null,
            "fromUrl": null,
            "title": "Login",
            "ionIcon": "ion-log-in"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/login-page.html",
                "controller": "LoginCtrl"
            }
        },
        "name": "app.login"
    },
    {
        "cache": false,
        "url": "/intro",
        "params": {
            "doNotRedirect": true,
            "title": "Intro",
            "ionIcon": "ion-log-in"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/intro-tour-new.html",
                "controller": "IntroCtrl"
            }
        },
        "resolve": {},
        "name": "app.intro"
    },
    {
        "url": "/track",
        "cache": false,
        "params": {
            "showAds": true,
            "title": "Track Primary Outcome",
            "ionIcon": "ion-compose"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/track-primary-outcome-variable.html",
                "controller": "TrackPrimaryOutcomeCtrl"
            }
        },
        "name": "app.track"
    },
    {
        "url": "/search",
        "params": {
            "excludeDuplicateBloodPressure": true,
            "variableSearchParameters": {
                "limit": 50,
                "includePublic": true
            },
            "title": "Select a Variable",
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-search.html",
                "controller": "VariableSearchCtrl"
            }
        },
        "name": "app.search"
    },
    {
        "url": "/search-page",
        "cache": false,
        "params": {
            "variableSearchParameters": {
                "limit": 50,
                "includePublic": true
            },
            "title": "Select a Variable",
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/search-page.html",
                "controller": "SearchPageCtrl"
            }
        },
        "name": "app.searchPage"
    },
    {
        "url": "/search-bar",
        "cache": false,
        "params": {
            "variableSearchParameters": {
                "limit": 50,
                "includePublic": true
            },
            "title": "Select a Variable",
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/search-bar.html",
                "controller": "SearchBarCtrl"
            }
        },
        "name": "app.searchBar"
    },
    {
        "url": "/measurement-add-search",
        "cache": false,
        "params": {
            "showAds": true,
            "reminder": null,
            "fromState": null,
            "measurement": null,
            "variableObject": null,
            "nextState": "app.measurementAdd",
            "variableCategoryName": null,
            "excludeDuplicateBloodPressure": true,
            "variableSearchParameters": {
                "limit": 50,
                "includePublic": true,
                // Don't do this or blood pressure doesn't show up. Plus we just put manualTracking at the top anyway.  "manualTracking": true
            },
            "hideNavigationMenu": null,
            "doneState": null,
            "title": "Select a Variable",
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-search.html",
                "controller": "VariableSearchCtrl"
            }
        },
        "name": "app.measurementAddSearch"
    },
    {
        "url": "/reminder-search",
        "cache": false,
        "params": {
            "showAds": true,
            "variableCategoryName": null,
            "fromState": null,
            "fromUrl": null,
            "measurement": null,
            "reminderSearch": true,
            "nextState": "app.reminderAdd",
            "excludeDuplicateBloodPressure": true,
            "variableSearchParameters": {
                "limit": 50,
                "includePublic": true,
                // Don't do this or blood pressure doesn't show up. Plus we just put manualTracking at the top anyway.  "manualTracking": true
            },
            "hideNavigationMenu": null,
            "skipReminderSettingsIfPossible": null,
            "doneState": null,
            "title": "Select a Variable",
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-search.html",
                "controller": "VariableSearchCtrl"
            }
        },
        "name": "app.reminderSearch"
    },
    {
        "url": "/favorite-search",
        "cache": false,
        "params": {
            "showAds": true,
            "variableCategoryName": null,
            "fromState": null,
            "fromUrl": null,
            "measurement": null,
            "favoriteSearch": true,
            "nextState": "app.favoriteAdd",
            "pageTitle": "Add a favorite",
            "excludeDuplicateBloodPressure": true,
            "variableSearchParameters": {
                "limit": 50,
                "includePublic": true,
                // Don't do this or blood pressure doesn't show up. Plus we just put manualTracking at the top anyway.  "manualTracking": true
            },
            "hideNavigationMenu": null,
            "doneState": null,
            "title": "Select a Variable",
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-search.html",
                "controller": "VariableSearchCtrl"
            }
        },
        "name": "app.favoriteSearch"
    },
    {
        "url": "/measurement-add",
        "cache": false,
        "params": {
            "showAds": true,
            "trackingReminder": null,
            "reminderNotification": null,
            "fromState": null,
            "fromUrl": null,
            "measurement": null,
            "variableObject": null,
            "variableName": null,
            "currentMeasurementHistory": null,
            "title": "Record a Measurement",
            "ionIcon": "ion-compose"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/measurement-add.html",
                "controller": "MeasurementAddCtrl"
            }
        },
        "name": "app.measurementAdd"
    },
    {
        "url": "/measurement-add-variable-name/:variableName",
        "cache": false,
        "params": {
            "showAds": true,
            "trackingReminder": null,
            "reminderNotification": null,
            "fromState": null,
            "fromUrl": null,
            "measurement": null,
            "variableObject": null,
            "title": "Record a Measurement",
            "ionIcon": "ion-compose"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/measurement-add.html",
                "controller": "MeasurementAddCtrl"
            }
        },
        "name": "app.measurementAddVariable"
    },
    {
        "url": "/variable-settings",
        "cache": true,
        "params": {
            "showAds": true,
            "fromState": null,
            "fromUrl": null,
            "variableObject": null,
            "variableName": null,
            "variableId": null,
            "title": "Variable Settings",
            "ionIcon": "ion-settings"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-settings.html",
                "controller": "VariableSettingsCtrl"
            }
        },
        "name": "app.variableSettings"
    },
    {
        "url": "/variable-settings/:variableName",
        "cache": false,
        "params": {
            "showAds": true,
            "fromState": null,
            "fromUrl": null,
            "variableObject": null,
            "variableName": null,
            "variableId": null,
            "title": "Variable Settings",
            "ionIcon": "ion-settings"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-settings.html",
                "controller": "VariableSettingsCtrl"
            }
        },
        "name": "app.variableSettingsVariableName"
    },
    {
        "url": "/import",
        "cache": false,
        "params": {
            "showAds": true,
            "title": "Import Data",
            "ionIcon": "ion-ios-cloud-download-outline"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/import-data.html",
                "controller": "ImportCtrl"
            }
        },
        "name": "app.import"
    },
    {
        "url": "/chart-search",
        "cache": false,
        "params": {
            "showAds": true,
            "variableCategoryName": null,
            "fromState": null,
            "fromUrl": null,
            "measurement": null,
            "nextState": "app.charts",
            "doNotShowAddVariableButton": true,
            "excludeSingularBloodPressure": true,
            "variableSearchParameters": {
                "limit": 50,
                "includePublic": false
            },
            "hideNavigationMenu": null,
            "title": "Select a Variable",
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-search.html",
                "controller": "VariableSearchCtrl"
            }
        },
        "name": "app.chartSearch"
    },
    {
        "url": "/predictor-search",
        "cache": false,
        "params": {
            "showAds": true,
            "title": "Outcomes",
            "variableSearchPlaceholderText": "Search for an outcome...",
            "helpText": "Search for an outcome like overall mood or a symptom that you want to know the causes of...",
            "variableCategoryName": null,
            "nextState": "app.predictorsAll",
            "doNotShowAddVariableButton": true,
            "excludeSingularBloodPressure": true,
            "noVariablesFoundCard": {
                "body": "I don't have enough data to determine the top predictors of __VARIABLE_NAME__, yet. I generally need about a month of data to produce significant results so start tracking!"
            },
            "variableSearchParameters": {
                "includePublic": true,
                "fallbackToAggregatedCorrelations": true,
                "numberOfCorrelationsAsEffect": "(gt)1",
                "sort": "-numberOfCorrelationsAsEffect",
                "outcome": true
            },
            "hideNavigationMenu": null,
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-search.html",
                "controller": "VariableSearchCtrl"
            }
        },
        "name": "app.predictorSearch"
    },
    {
        "url": "/tagee-search",
        "cache": false,
        "params": {
            "showAds": true,
            "userTagVariableObject": null,
            "title": "Select Tagee",
            "variableSearchPlaceholderText": "Search for a variable to tag...",
            "variableCategoryName": null,
            "nextState": "app.tagAdd",
            "fromState": null,
            "fromStateParams": null,
            "doNotShowAddVariableButton": true,
            "excludeSingularBloodPressure": true,
            "noVariablesFoundCard": {
                "body": "I can't find __VARIABLE_NAME__. Please try another"
            },
            "variableSearchParameters": {
                "includePublic": true
            },
            "hideNavigationMenu": null,
            "doneState": null,
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-search.html",
                "controller": "VariableSearchCtrl"
            }
        },
        "name": "app.tageeSearch"
    },
    {
        "url": "/tag-search",
        "cache": false,
        "params": {
            "showAds": true,
            "userTaggedVariableObject": null,
            "title": "Tags",
            "variableSearchPlaceholderText": "Search for a tag...",
            "variableCategoryName": null,
            "nextState": "app.tagAdd",
            "fromState": null,
            "fromStateParams": null,
            "doNotShowAddVariableButton": true,
            "excludeSingularBloodPressure": true,
            "noVariablesFoundCard": {
                "body": "I can't find __VARIABLE_NAME__. Please try another"
            },
            "variableSearchParameters": {
                "includePublic": true
            },
            "hideNavigationMenu": null,
            "doneState": null,
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-search.html",
                "controller": "VariableSearchCtrl"
            }
        },
        "name": "app.tagSearch"
    },
    {
        "url": "/tag-add",
        "cache": false,
        "params": {
            "showAds": true,
            "tagConversionFactor": null,
            "fromState": null,
            "fromStateParams": null,
            "fromUrl": null,
            "userTagVariableObject": null,
            "userTaggedVariableObject": null,
            "variableObject": null,
            "helpText": "Say I want to track how much sugar I consume and see how that affects me.  I don't need to check the label every time.  I can just tag Candy Bar and Lollypop with the amount sugar. Then during analysis the sugar from those items will be included.  Additionally if I have multiple variables that are basically the same thing like maybe a drug and it's generic name, I can tag those and then the measurements from both variables will be included in the analysis.",
            "title": "Tag a Variable",
            "ionIcon": "ion-pricetag"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/tag-add.html",
                "controller": "TagAddCtrl"
            }
        },
        "name": "app.tagAdd"
    },
    {
        "url": "/outcome-search",
        "cache": false,
        "params": {
            "showAds": true,
            "title": "Predictors",
            "variableSearchPlaceholderText": "Search for an predictor...",
            "helpText": "Search for a predictor like a food or treatment that you want to know the effects of...",
            "variableCategoryName": null,
            "nextState": "app.outcomesAll",
            "doNotShowAddVariableButton": true,
            "excludeSingularBloodPressure": true,
            "noVariablesFoundCard": {
                "body": "I don't have enough data to determine the top outcomes of __VARIABLE_NAME__, yet. I generally need about a month of data to produce significant results so start tracking!"
            },
            "variableSearchParameters": {
                "includePublic": true,
                "fallbackToAggregatedCorrelations": true,
                //"numberOfCorrelationsAsCause": "(gt)1",  Don't require this or we can't search for variables that haven't been correlated yet and trigger correlation
                "sort": "-numberOfCorrelationsAsCause"
            },
            "hideNavigationMenu": null,
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-search.html",
                "controller": "VariableSearchCtrl"
            }
        },
        "name": "app.outcomeSearch"
    },
    {
        "url": "/search-variables-with-user-predictors",
        "cache": false,
        "params": {
            "showAds": true,
            "variableCategoryName": null,
            "nextState": "app.predictorsAll",
            "doNotShowAddVariableButton": true,
            "excludeSingularBloodPressure": true,
            "variableSearchParameters": {
                "includePublic": false,
                "numberOfUserCorrelations": "(gt)1"
            },
            "hideNavigationMenu": null,
            "title": "Select a Variable",
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-search.html",
                "controller": "VariableSearchCtrl"
            }
        },
        "name": "app.searchVariablesWithUserPredictors"
    },
    {
        "url": "/search-variables-with-common-predictors",
        "cache": false,
        "params": {
            "showAds": true,
            "variableCategoryName": null,
            "nextState": "app.predictorsAll",
            "doNotShowAddVariableButton": true,
            "excludeSingularBloodPressure": true,
            "variableSearchParameters": {
                "includePublic": true,
                "numberOfAggregatedCorrelations": "(gt)1"
            },
            "hideNavigationMenu": null,
            "title": "Select a Variable",
            "ionIcon": "ion-search"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/variable-search.html",
                "controller": "VariableSearchCtrl"
            }
        },
        "name": "app.searchVariablesWithCommonPredictors"
    },
    {
        "url": "/charts/:variableName",
        "cache": false,
        "params": {
            "showAds": true,
            "trackingReminder": null,
            "variableObject": null,
            "measurementInfo": null,
            "noReload": false,
            "fromState": null,
            "fromUrl": null,
            "refresh": null,
            "title": "Charts",
            "ionIcon": "ion-arrow-graph-up-right",
            "hideLineChartWithoutSmoothing": false,
            "hideLineChartWithSmoothing": false,
            "hideMonthlyColumnChart": false,
            "hideWeekdayColumnChart": false,
            "hideDistributionColumnChart": false,
            "variableName": null
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/charts-page.html",
                "controller": "ChartsPageCtrl"
            }
        },
        "name": "app.charts"
    },
    {
        "url": "/studies",
        "params": {
            "showAds": true,
            "aggregated": null,
            "variableObject": null,
            "causeVariableName": null,
            "effectVariableName": null,
            "requestParams": {
                "correlationCoefficient": null
            },
            "title": "Studies",
            "ionIcon": "ion-ios-book"
        },
        "cache": true,
        "views": {
            "menuContent": {
                "templateUrl": "templates/studies-list-page.html",
                "controller": "StudiesCtrl"
            }
        },
        "name": "app.studies"
    },
    {
        "url": "/studies/open",
        "params": {
            "showAds": true,
            "aggregated": null,
            "variableObject": null,
            "causeVariableName": null,
            "effectVariableName": null,
            "open": true,
            "requestParams": {
                "correlationCoefficient": null
            },
            "title": "Open Studies",
            "ionIcon": "ion-ios-book"
        },
        "cache": true,
        "views": {
            "menuContent": {
                "templateUrl": "templates/studies-list-page.html",
                "controller": "StudiesCtrl"
            }
        },
        "name": "app.studiesOpen"
    },
    {
        "url": "/studies/created",
        "params": {
            "showAds": true,
            "aggregated": null,
            "variableObject": null,
            "causeVariableName": null,
            "effectVariableName": null,
            "created": true,
            "requestParams": {
                "correlationCoefficient": null
            },
            "title": "Your Studies",
            "ionIcon": "ion-ios-book"
        },
        "cache": true,
        "views": {
            "menuContent": {
                "templateUrl": "templates/studies-list-page.html",
                "controller": "StudiesCtrl"
            }
        },
        "name": "app.studiesCreated"
    },
    {
        "url": "/predictors/:effectVariableName",
        "params": {
            "showAds": true,
            "aggregated": false,
            "variableObject": null,
            "causeVariableName": null,
            "effectVariableName": null,
            "requestParams": {
                "correlationCoefficient": null
            },
            "title": "Top Predictors",
            "ionIcon": "ion-ios-book"
        },
        "cache": true,
        "views": {
            "menuContent": {
                "templateUrl": "templates/studies-list-page.html",
                "controller": "StudiesCtrl"
            }
        },
        "name": "app.predictorsAll"
    },
    {
        "url": "/outcomes/:causeVariableName",
        "params": {
            "showAds": true,
            "aggregated": false,
            "variableObject": null,
            "causeVariableName": null,
            "effectVariableName": null,
            "requestParams": {
                "correlationCoefficient": null
            },
            "title": "Top Outcomes",
            "ionIcon": "ion-ios-book"
        },
        "cache": true,
        "views": {
            "menuContent": {
                "templateUrl": "templates/studies-list-page.html",
                "controller": "StudiesCtrl"
            }
        },
        "name": "app.outcomesAll"
    },
    {
        "url": "/predictors-positive",
        "params": {
            "showAds": true,
            "aggregated": false,
            "valence": "positive",
            "variableObject": null,
            "causeVariableName": null,
            "effectVariableName": null,
            "fallBackToPrimaryOutcome": true,
            "requestParams": {
                "correlationCoefficient": "(gt)0"
            },
            "title": "Positive Predictors",
            "ionIcon": "ion-ios-book"
        },
        "cache": true,
        "views": {
            "menuContent": {
                "templateUrl": "templates/studies-list-page.html",
                "controller": "StudiesCtrl"
            }
        },
        "name": "app.predictorsPositive"
    },
    {
        "url": "/predictors-positive-variable/:effectVariableName",
        "params": {
            "showAds": true,
            "aggregated": false,
            "valence": "positive",
            "variableObject": null,
            "causeVariableName": null,
            "effectVariableName": null,
            "fallBackToPrimaryOutcome": true,
            "requestParams": {
                "correlationCoefficient": "(gt)0"
            },
            "title": "Positive Predictors",
            "ionIcon": "ion-ios-book"
        },
        "cache": true,
        "views": {
            "menuContent": {
                "templateUrl": "templates/studies-list-page.html",
                "controller": "StudiesCtrl"
            }
        },
        "name": "app.predictorsPositiveVariable"
    },
    {
        "url": "/predictors-negative",
        "params": {
            "showAds": true,
            "aggregated": false,
            "valence": "negative",
            "variableObject": null,
            "causeVariableName": null,
            "effectVariableName": null,
            "fallBackToPrimaryOutcome": true,
            "requestParams": {
                "correlationCoefficient": "(lt)0"
            },
            "title": "Negative Predictors",
            "ionIcon": "ion-ios-book"
        },
        "cache": true,
        "views": {
            "menuContent": {
                "templateUrl": "templates/studies-list-page.html",
                "controller": "StudiesCtrl"
            }
        },
        "name": "app.predictorsNegative"
    },
    {
        "url": "/predictors-negative-variable/:effectVariableName",
        "params": {
            "showAds": true,
            "aggregated": false,
            "valence": "negative",
            "variableObject": null,
            "causeVariableName": null,
            "effectVariableName": null,
            "fallBackToPrimaryOutcome": true,
            "requestParams": {
                "correlationCoefficient": "(lt)0"
            },
            "title": "Negative Predictors",
            "ionIcon": "ion-ios-book"
        },
        "cache": true,
        "views": {
            "menuContent": {
                "templateUrl": "templates/studies-list-page.html",
                "controller": "StudiesCtrl"
            }
        },
        "name": "app.predictorsNegativeVariable"
    },
    {
        "url": "/predictors/user/:effectVariableName",
        "params": {
            "showAds": true,
            "aggregated": false,
            "variableObject": null,
            "causeVariableName": null,
            "effectVariableName": null,
            "fallBackToPrimaryOutcome": true,
            "requestParams": {
                "correlationCoefficient": null
            },
            "title": "Your Predictors",
            "ionIcon": "ion-ios-book"
        },
        "cache": true,
        "views": {
            "menuContent": {
                "templateUrl": "templates/studies-list-page.html",
                "controller": "StudiesCtrl"
            }
        },
        "name": "app.predictorsUser"
    },
    {
        "url": "/predictors/aggregated/:effectVariableName",
        "params": {
            "showAds": true,
            "aggregated": true,
            "variableObject": null,
            "fallBackToPrimaryOutcome": true,
            "requestParams": {
                "causeVariableName": null,
                "effectVariableName": null,
                "correlationCoefficient": null
            },
            "title": "Common Predictors",
            "ionIcon": "ion-ios-book"
        },
        "cache": true,
        "views": {
            "menuContent": {
                "templateUrl": "templates/studies-list-page.html",
                "controller": "StudiesCtrl"
            }
        },
        "name": "app.predictorsAggregated"
    },
    {
        "cache": false,
        "url": "/study",
        "params": {
            "showAds": true,
            "causeVariableName": null,
            "effectVariableName": null,
            "type": null,
            "refresh": null,
            "study": null,
            "title": "Study",
            "ionIcon": "ion-ios-book"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/study-page.html",
                "controller": "StudyCtrl"
            }
        },
        "name": "app.study"
    },
    {
        "cache": true,
        "url": "/study-join",
        "params": {
            "causeVariableName": null,
            "effectVariableName": null,
            "type": null,
            "study": null,
            "title": "Join Study",
            "ionIcon": "ion-ios-book"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/study-join-page.html",
                "controller": "StudyJoinCtrl"
            }
        },
        "name": "app.studyJoin"
    },
    {
        "cache": true,
        "url": "/study-creation",
        "params": {
            "showAds": true,
            "causeVariable": null,
            "effectVariable": null,
            "type": null,
            "study": null,
            "title": "Create Study",
            "ionIcon": "ion-ios-book"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/study-creation-page.html",
                "controller": "StudyCreationCtrl"
            }
        },
        "name": "app.studyCreation"
    },
    {
        "url": "/settings",
        "params": {
            "title": "Settings",
            "ionIcon": "ion-settings"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/settings.html",
                "controller": "SettingsCtrl"
            }
        },
        "name": "app.settings"
    },
    {
        "url": "/notificationPreferences",
        "params": {
            "title": "Notification Settings",
            "ionIcon": "ion-android-notifications"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/notification-preferences.html",
                "controller": "SettingsCtrl"
            }
        },
        "name": "app.notificationPreferences"
    },
    {
        "url": "/map",
        "params": {
            "title": "Map",
            "ionIcon": "ion-map"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/map.html",
                "controller": "MapCtrl"
            }
        },
        "name": "app.map"
    },
    {
        "url": "/help",
        "params": {
            "title": "Help",
            "ionIcon": "ion-help"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/help.html",
                "controller": "ExternalCtrl"
            }
        },
        "name": "app.help"
    },
    {
        "url": "/feedback",
        "params": {
            "title": "Feedback",
            "ionIcon": "ion-speakerphone"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/feedback.html",
                "controller": "ExternalCtrl"
            }
        },
        "name": "app.feedback"
    },
    {
        "url": "/contact",
        "params": {
            "title": "Feedback",
            "ionIcon": "ion-android-chat"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/contact.html",
                "controller": "ExternalCtrl"
            }
        },
        "name": "app.contact"
    },
    {
        "url": "/history",
        "cache": false,
        "params": {
            "showAds": true,
            "updatedMeasurementHistory": null,
            "variableObject": null,
            "refresh": null,
            "variableCategoryName": null,
            "connectorId": null,
            "sourceName": null,
            "title": "History",
            "ionIcon": "ion-ios-list-outline"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/history-all.html",
                "controller": "historyAllMeasurementsCtrl"
            }
        },
        "name": "app.history"
    },
    {
        "url": "/history-all",
        "cache": true,
        "params": {
            "showAds": true,
            "variableCategoryName": null,
            "connectorId": null,
            "sourceName": null,
            "updatedMeasurementHistory": null,
            "refresh": null,
            "title": "History",
            "ionIcon": "ion-ios-list-outline"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/history-all.html",
                "controller": "historyAllMeasurementsCtrl"
            }
        },
        "name": "app.historyAll"
    },
    {
        "url": "/history-all-category/:variableCategoryName",
        "cache": false,
        "params": {
            "showAds": true,
            "variableCategoryName": null,
            "updatedMeasurementHistory": null,
            "refresh": null,
            "title": "History",
            "ionIcon": "ion-ios-list-outline"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/history-all.html",
                "controller": "historyAllMeasurementsCtrl"
            }
        },
        "name": "app.historyAllCategory"
    },
    {
        "url": "/history-all-variable/:variableName",
        "cache": false,
        "params": {
            "showAds": true,
            "variableObject": null,
            "updatedMeasurementHistory": null,
            "refresh": null,
            "title": "History",
            "ionIcon": "ion-ios-list-outline"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/history-all.html",
                "controller": "historyAllMeasurementsCtrl"
            }
        },
        "name": "app.historyAllVariable"
    },
    {
        "url": "/reminders-inbox",
        "cache": true,
        "params": {
            "showAds": true,
            "title": "Reminder Inbox",
            "reminderFrequency": null,
            "unit": null,
            "variableCategoryName": null,
            "dateTime": null,
            "value": null,
            "fromUrl": null,
            "showHelpCards": true,
            "ionIcon": "ion-android-inbox"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminders-inbox.html",
                "controller": "RemindersInboxCtrl"
            }
        },
        "name": "app.remindersInbox"
    },
    {
        "url": "/reminders-inbox-compact",
        "cache": false,
        "params": {
            "title": "Reminder Inbox",
            "reminderFrequency": null,
            "unit": null,
            "variableCategoryName": null,
            "dateTime": null,
            "value": null,
            "fromUrl": null,
            "showHelpCards": false,
            "hideNavigationMenu": true,
            "ionIcon": "ion-android-inbox"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminders-inbox-compact.html",
                "controller": "RemindersInboxCtrl"
            }
        },
        "name": "app.remindersInboxCompact"
    },
    {
        "url": "/favorites",
        "cache": false,
        "params": {
            "showAds": true,
            "reminderFrequency": 0,
            "unit": null,
            "variableName": null,
            "dateTime": null,
            "value": null,
            "fromUrl": null,
            "title": "Favorites",
            "ionIcon": "ion-star"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/favorites.html",
                "controller": "FavoritesCtrl"
            }
        },
        "name": "app.favorites"
    },
    {
        "cache": true,
        "url": "/configuration/:clientId",
        "params": {
            "title": "App Builder",
            "ionIcon": "ion-settings"
        },
        "views": {
            "menuContent": {
                "templateUrl": "builder-templates/configuration.html",
                "controller": "ConfigurationCtrl"
            }
        },
        "name": "app.configurationClientId"
    },
    {
        "cache": true,
        "url": "/configuration",
        "params": {
            "title": "App Builder",
            "ionIcon": "ion-settings"
        },
        "views": {
            "menuContent": {
                "templateUrl": "builder-templates/configuration.html",
                "controller": "ConfigurationCtrl"
            }
        },
        "name": "app.configuration"
    },
    {
        "cache": true,
        "url": "/clients",
        "params": {
            "title": "API Clients",
            "ionIcon": "ion-settings",
            "hideNavigationMenu": true,
        },
        "views": {
            "menuContent": {
                "templateUrl": "builder-templates/clients.html",
                "controller": "ConfigurationCtrl"
            }
        },
        "name": "app.clients"
    },
    {
        "cache": true,
        "url": "/api-portal/:clientId",
        "params": {
            "title": "API Portal",
            "ionIcon": "ion-settings",
            hideNavigationMenu: true,
        },
        "views": {
            "menuContent": {
                "templateUrl": "builder-templates/api-portal.html",
                "controller": "ApiPortalCtrl"
            }
        },
        "name": "app.apiPortalClientId"
    },
    {
        "cache": true,
        "url": "/api-portal",
        "params": {
            "title": "API Portal",
            "ionIcon": "ion-settings",
            hideNavigationMenu: true,
        },
        "views": {
            "menuContent": {
                "templateUrl": "builder-templates/api-portal.html",
                "controller": "ApiPortalCtrl"
            }
        },
        "name": "app.apiPortal"
    },
    {
        "cache": true,
        "url": "/physician",
        "params": {
            "title": "Physician Dashboard",
            "ionIcon": "ion-medkit"
        },
        "views": {
            "menuContent": {
                "templateUrl": "builder-templates/physician.html",
                "controller": "PhysicianCtrl"
            }
        },
        "name": "app.physician"
    },
    {
        "cache": true,
        "url": "/users",
        "params": {
            "title": "Users",
            "ionIcon": "ion-android-people"
        },
        "views": {
            "menuContent": {
                "templateUrl": "builder-templates/users.html",
                "controller": "ConfigurationCtrl"
            }
        },
        "name": "app.users"
    },
    {
        "url": "/reminders-inbox-today",
        "params": {
            "showAds": true,
            "unit": null,
            "variableCategoryName": null,
            "dateTime": null,
            "value": null,
            "fromUrl": null,
            "today": true,
            "title": "Inbox",
            "ionIcon": "ion-android-inbox"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminders-inbox.html",
                "controller": "RemindersInboxCtrl"
            }
        },
        "name": "app.remindersInboxToday"
    },
    {
        "url": "/manage-scheduled-meds",
        "params": {
            "showAds": true,
            "title": "Manage Scheduled Meds",
            "helpText": "Here you can add and manage your scheduled medications.  Long-press on a medication for more options.  You can drag down to refresh.",
            "addButtonText": "Add scheduled medication",
            "variableCategoryName": "Treatments",
            "trackingReminders": null,
            "ionIcon": "ion-android-notifications-none"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminders-manage.html",
                "controller": "RemindersManageCtrl"
            }
        },
        "name": "app.manageScheduledMeds"
    },
    {
        "url": "/today-med-schedule",
        "params": {
            "showAds": true,
            "title": "Today's Med Schedule",
            "helpText": "Here you can see and record today's scheduled doses.",
            "today": true,
            "variableCategoryName": "Treatments",
            "ionIcon": "ion-android-notifications-none"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminders-inbox.html",
                "controller": "RemindersInboxCtrl"
            }
        },
        "name": "app.todayMedSchedule"
    },
    {
        "url": "/as-needed-meds",
        "params": {
            "showAds": true,
            "title": "As Needed Meds",
            "variableCategoryName": "Treatments",
            "ionIcon": "ion-star"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/favorites.html",
                "controller": "FavoritesCtrl"
            }
        },
        "name": "app.asNeededMeds"
    },
    {
        "cache": false,
        "url": "/reminders-manage",
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminders-manage.html",
                "controller": "RemindersManageCtrl"
            }
        },
        "params": {
            "showAds": true,
            "variableCategoryName": null,
            "trackingReminders": null,
            "title": "Manage Reminders",
            "ionIcon": "ion-android-notifications-none"
        },
        "name": "app.remindersManage"
    },
    {
        "cache": false,
        "url": "/reminders-manage-category/:variableCategoryName",
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminders-manage.html",
                "controller": "RemindersManageCtrl"
            }
        },
        "params": {
            "showAds": true,
            "trackingReminders": null,
            "title": "Manage Reminders",
            "variableCategoryName": null,
            "ionIcon": "ion-android-notifications-none"
        },
        "name": "app.remindersManageCategory"
    },
    {
        "cache": false,
        "url": "/reminders-list",
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminders-list.html",
                "controller": "RemindersManageCtrl"
            }
        },
        "params": {
            "showAds": true,
            "variableCategoryName": null,
            "trackingReminders": null,
            "title": "Manage Reminders",
            "ionIcon": "ion-android-notifications-none"
        },
        "name": "app.remindersList"
    },
    {
        "cache": false,
        "url": "/reminders-list-category/:variableCategoryName",
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminders-list.html",
                "controller": "RemindersManageCtrl"
            }
        },
        "params": {
            "showAds": true,
            "trackingReminders": null,
            "variableCategoryName": null,
            "title": "Manage Reminders",
            "ionIcon": "ion-android-notifications-none"
        },
        "name": "app.remindersListCategory"
    },
    {
        "cache": true,
        "url": "/variable-list",
        "params": {
            "showAds": true,
            "variableCategoryName": null,
            "trackingReminders": null,
            "title": "Manage Variables",
            "ionIcon": "ion-android-notifications-none"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminders-list.html",
                "controller": "RemindersManageCtrl"
            }
        },
        "name": "app.variableList"
    },
    {
        "cache": true,
        "url": "/variable-list-category/:variableCategoryName",
        "params": {
            "showAds": true,
            "trackingReminders": null,
            "variableCategoryName": null,
            "title": "Manage Variables",
            "ionIcon": "ion-android-notifications-none"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminders-list.html",
                "controller": "RemindersManageCtrl"
            }
        },
        "name": "app.variableListCategory"
    },
    {
        "url": "/reminder-add/:variableName",
        "cache": false,
        "params": {
            "doneState": null,
            "favorite": false,
            "fromState": null,
            "fromUrl": null,
            "ionIcon": "ion-android-notifications-none",
            "measurement": null,
            "reminder": null,
            "skipReminderSettingsIfPossible": null,
            "stopTrackingDate": null,
            "startTrackingData": null,
            "title": "Add Reminder",
            "trackingReminder": null,
            "trackingReminderId": null,
            "unitAbbreviatedName": null,
            "unitName": null,
            "unitId": null,
            "variableId": null,
            "variableCategoryName": null,
            "variableName": null,
            "variableObject": null
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminder-add.html",
                "controller": "ReminderAddCtrl"
            }
        },
        "name": "app.reminderAdd"
    },
    {
        "url": "/onboarding",
        "cache": true,
        "params": {
            "title": "Getting Started",
            "ionIcon": "ion-android-notifications-none"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/onboarding-page.html",
                "controller": "OnboardingCtrl"
            }
        },
        "name": "app.onboarding"
    },
    {
        "url": "/upgrade",
        "cache": true,
        "params": {
            "litePlanState": null,
            "title": "Upgrade",
            "ionIcon": "ion-star"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/upgrade-page-cards.html",
                "controller": "UpgradeCtrl"
            }
        },
        "name": "app.upgrade"
    },
    {
        "url": "/data-sharing",
        "cache": true,
        "params": {
            "title": "Manage Data Sharing",
            "ionIcon": "ion-locked"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/data-sharing-page.html",
                "controller": "DataSharingCtrl"
            }
        },
        "name": "app.dataSharing"
    },
    {
        "url": "/tabs",
        "cache": true,
        "params": {},
        "views": {
            "menuContent": {
                "templateUrl": "templates/tabs.html",
                "controller": "TabsCtrl"
            }
        },
        "name": "app.tabs"
    },
    {
        "url": "/chat",
        "cache": true,
        "params": {
            "title": "Talk to Dr. Modo",
            "ionIcon": "ion-chatbox"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/chat.html",
                "controller": "ChatCtrl"
            }
        },
        "name": "app.chat"
    },
    {
        "url": "/feed",
        "cache": true,
        "params": {
            "title": "Talk to Dr. Modo",
            "ionIcon": "ion-chatbox"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/feed.html",
                "controller": "FeedCtrl"
            }
        },
        "name": "app.feed"
    },
    {
        "url": "/favorite-add",
        "cache": false,
        "params": {
            "reminder": null,
            "variableCategoryName": null,
            "reminderNotification": null,
            "fromState": null,
            "fromUrl": null,
            "measurement": null,
            "variableObject": null,
            "favorite": true,
            "doneState": null,
            "skipReminderSettingsIfPossible": null,
            "title": "Add Favorite",
            "ionIcon": "ion-star"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/reminder-add.html",
                "controller": "ReminderAddCtrl"
            }
        },
        "name": "app.favoriteAdd"
    },
    {
        "url": "/votes",
        "cache": false,
        "params": {
            "title": "Your Votes",
            "ionIcon": "ion-star"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/feed.html",
                "controller": "VoteCtrl"
            }
        },
        "name": "app.votes"
    },
    {
        "url": "/sharers",
        "params": {
            "title": "Data Sharers",
            "ionIcon": "ion-people"
        },
        "views": {
            "menuContent": {
                "templateUrl": "templates/sharers.html",
                "controller": "SharersCtrl"
            }
        },
        "name": "app.sharers"
    }
]
if (typeof window !== "undefined") {
    window.qmStates = qmStates;
    window.qm.qmStaticData = window.qm.qmStaticData || {};
    window.qm.qmStaticData.states = qmStates;
} else {
    global.qmStates = qmStates;
    module.exports = qmStates;
    global.qm.qmStaticData = global.qm.qmStaticData || {};
    global.qm.qmStaticData.states = qmStates;
}

angular.module('starter').controller('StudyCreationCtrl', ["$scope", "$state", "qmService", "clipboard", "$mdDialog", "$stateParams", "$rootScope",
    function($scope, $state, qmService, clipboard, $mdDialog, $stateParams, $rootScope){
        $scope.$on('$ionicView.beforeEnter', function(){
            $scope.state = {
                title: 'Create a Study',
                color: qmService.colors.blue,
                image: {url: "img/robots/quantimodo-robot-waving.svg", height: "85", width: "85"},
                bodyText: "After selecting a predictor and outcome variable, " +
                          "you'll be given a shareable url that you can use to " +
                          "recruit participants. You'll also get a link to the full " +
                          "study which will update in real time as " +
                          "more participants anonymously share their data.",
                study: null,
                causeVariable: null,
                effectVariable: null,
                typesDescription: ""
            };
            if(!qm.getUser()){
                qmService.login.sendToLoginIfNecessaryAndComeBack("no user in study creation state beforeEnter");
            }
            if($stateParams.causeVariable){
                $scope.state.causeVariable = $stateParams.causeVariable;
            }
            if($stateParams.effectVariable){
                $scope.state.effectVariable = $stateParams.effectVariable;
            }
            // qm.apiHelper.getPropertyDescription('StudyCreationBody', 'type', function(description){
            //     $scope.state.title = "What kind of study do you want to create?";
            //     $scope.state.bodyText = description.textContent;
            // });
        });
        $scope.$on('$ionicView.afterEnter', function(){
            qmLog.debug('StudyCreationCtrl afterEnter in state ' + $state.current.name);
            qmService.hideLoader();
        });
        if(!clipboard.supported){
            qmLog.debug('Sorry, copy to clipboard is not supported');
            $scope.hideClipboardButton = true;
        }
        $scope.copyLinkText = 'Copy Shareable Link';
        $scope.copyStudyUrlToClipboard = function(causeVariableName, effectVariableName, study){
            $scope.copyLinkText = 'Copied!';
            var url = qmService.getStudyLinkStatic(causeVariableName, effectVariableName, study);
            clipboard.copyText(url);
        };
        function setOutcomeVariable(variable){
            $scope.state.effectVariable = variable;
            //qm.urlHelper.addUrlParamsToCurrentUrl('effectVariableName', variable.name);  // Doesn't work
            qmLog.debug('Selected outcome ' + variable.name);
            //showTypesExplanation();
        }
        function setPredictorVariable(variable){
            $scope.state.causeVariable = variable;
            //qm.urlHelper.addUrlParamsToCurrentUrl('causeVariableName', variable.name);  // Doesn't work
            qmLog.debug('Selected predictor ' + variable.name);
            showTypesExplanation();
        }
        function showTypesExplanation(){
            if($scope.state.causeVariable && $scope.state.effectVariable){
                qm.apiHelper.getPropertyDescription('StudyCreationBody', 'type', function(description){
                    $scope.state.title = "What kind of study do you want to create?";
                    $scope.state.bodyText = description.bodyText;
                });
            }
        }
        $scope.selectOutcomeVariable = function(ev){
            qm.help.getExplanation('outcomeSearch', null, function(explanation){
                var dialogParameters = {
                    title: explanation.title,
                    helpText: explanation.textContent,
                    placeholder: "Search for an outcome...",
                    buttonText: "Select Variable",
                    requestParams: {includePublic: true, sort: "-numberOfCorrelationsAsEffect"}
                };
                qmService.showVariableSearchDialog(dialogParameters, setOutcomeVariable, null, ev);
            });
        };
        $scope.selectPredictorVariable = function(ev){
            qm.help.getExplanation('predictorSearch', null, function(explanation){
                var dialogParameters = {
                    title: explanation.title,
                    helpText: explanation.textContent,
                    placeholder: "Search for a predictor...",
                    buttonText: "Select Variable",
                    requestParams: {includePublic: true, sort: "-numberOfCorrelationsAsCause"}
                };
                qmService.showVariableSearchDialog(dialogParameters, setPredictorVariable, null, ev);
            });
        };
        $scope.createStudy = function(type){
            $scope.state.creatingStudy = true;
            let causeVariableName = getCauseVariableName();
            let effectVariableName = getEffectVariableName();
            let name = 'Clicked createStudy for ' + causeVariableName + ' and ' + effectVariableName;
            $scope.state.title = 'Creating '+ type + ' study!';
            $scope.state.bodyText = 'One moment please...';
            qmLog.info(name);
            qmService.showInfoToast("Creating study (this could take a minute)", 45);
            //qmService.showBasicLoader(60);
            var body = new Quantimodo.StudyCreationBody(causeVariableName, effectVariableName, type);
            body.causeVariableName = body.predictorVariableName || body.causeVariableName;
            body.effectVariableName = body.outcomeVariableName || body.effectVariableName;
            qm.studiesCreated.createStudy(body, function(study){
                qmService.hideLoader();
                if(study.statistics){
                    //debugger
                    qmService.goToState('app.study', {study: study});
                    //qm.studyHelper.goToStudyPageViaStudy(study); // Need to use goToStudyPageViaStudy so url
                    // params are populated
                } else {
                    qm.studyHelper.goToJoinStudy(study);
                }
            }, function(error){
                qmService.hideLoader();
                qmService.auth.showErrorAlertMessageOrSendToLogin("Could Not Create Study", error);
            });
        };
        function getEffectVariableName(){
            return qm.studyHelper.getEffectVariableName($stateParams, $scope, $rootScope);
        }
        function getCauseVariableName(){
            return qm.studyHelper.getCauseVariableName($stateParams, $scope, $rootScope);
        }
    }]);

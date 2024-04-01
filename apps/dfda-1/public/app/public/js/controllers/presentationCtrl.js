angular.module('starter').controller('PresentationCtrl', ["$scope", "$state", "$ionicSlideBoxDelegate", "$ionicLoading",
    "$rootScope", "$stateParams", "qmService", "appSettingsResponse", "$timeout",
    "$document", '$sce',
    function($scope, $state, $ionicSlideBoxDelegate, $ionicLoading,
             $rootScope, $stateParams, qmService, appSettingsResponse, $timeout, $document, $sce){
        qmService.initializeApplication(appSettingsResponse);
        qmService.navBar.setFilterBarSearchIcon(false);
        var audio, continuousAudio;
        var audioEnded = true;
        var speechEnded = true;
        var videoEnded = true;
        function checkAndProceed() {
            var done = audioEnded && speechEnded && videoEnded;
            if(done){
                $timeout(function(){
                    if($scope.state.autoplay){
                        $scope.state.next();
                    }
                },0.2 * 1000);
            }
        }
        function formatSpeech(speech){
            speech = speech.replace(" AI ", " eh eye ");
            return speech.replace(".", ",");
        }

        function humanTalk(slide, errorHandler) {
            speechEnded = false;
            human.talkHuman(
                formatSpeech(slide.humanSpeech),
                function () {
                    speechEnded = true;
                    checkAndProceed();
                },                 function (error) {
                    qmLog.info('Could not read intro slide because: ', error);
                    if(errorHandler){
                        errorHandler(error);
                    }
                }
            );
        }

        function playContinuousAudio(slide) {
            var alreadyPlaying = continuousAudio &&
                continuousAudio.src.indexOf(slide.continuousAudio) > 0;
            if(alreadyPlaying){return;}
            if(continuousAudio){continuousAudio.pause();}
            continuousAudio = new Audio(slide.continuousAudio);
            if (slide.continuousAudioVolume) {
                continuousAudio.volume = slide.continuousAudioVolume;
            }
            continuousAudio.loop = false;
            continuousAudio.play();
        }

        function playAudio(slide) {
            audioEnded = false;
            audio = new Audio(slide.audio);
            if (slide.volume) {
                audio.volume = slide.volume;
            }
            audio.play().then(function() {
                // slide.audio = null;
                // audioEnded = true;
                // checkAndProceed();
            });
            audio.onended = function () {
                audioEnded = true;
                checkAndProceed();
            };
        }

        $scope.state = {
            autoPlayMusic: true,
            autoplay: true,
            playing: false,
            title: null,
            image: null,
            music: $stateParams.music,
			backgroundImg: null,
            showTriangle: false,
            backgroundVideo: null,
            showHuman: null,
            triangleName: {
                lineOne: "FDA",
                lineTwo: "Ai"
            },
	        slideIndex: 0,
            toggleMusic: function(){
                if(qm.music.isPlaying($stateParams.music)){
                    qm.music.fadeOut($stateParams.music);
                }else{
                    qm.music.play($stateParams.music);
                }
            },
            pause: function(){
                if($scope.state.playing) {
                    $scope.state.autoplay = false;
                    $scope.state.playing = false;
                    qm.speech.shutUpRobot();
                } else {
                    $scope.state.autoplay = true;
                    $scope.state.playing = true;
                    $scope.state.slideChanged($scope.state.slideIndex);
                }
            },
	        start: function(){
                $scope.state.slideIndex = 0;
                $scope.state.slideChanged($scope.state.slideIndex);
	        },
	        next: function(){
		        $ionicSlideBoxDelegate.next();
                setSlideIndex($scope.state.slideIndex + 1);
                $scope.state.slideChanged($scope.state.slideIndex);
	        },
	        previous: function(){
		        $ionicSlideBoxDelegate.previous();
                setSlideIndex($scope.state.slideIndex - 1);
                $scope.state.slideChanged($scope.state.slideIndex);
	        },
	        slideChanged: function(){
                var index = $scope.state.slideIndex;
                slide = $scope.state.slides[index];
                setSlideIndex(index);
                human.closeMouth()
                if(!$scope.state.playing){$scope.state.playing = true;}
                var lastSlide = $scope.state.slides[index - 1];
                if(lastSlide && lastSlide.cleanup){
                    lastSlide.cleanup($scope);
                }
                audioEnded = videoEnded = speechEnded = true;
                qm.speech.shutUpRobot();
                if(!qm.music.isPlaying($stateParams.music) && index === 1 && $stateParams.music){
                    qm.music.play($stateParams.music);
                }
                //qm.music.play();
				//debugger
		        //qm.visualizer.showCircleVisualizer()
                //qm.visualizer.showSiriVisualizer();
                if(slide.goToState){
                    qmService.goToState(slide.goToState);
                }
                if(audio){
                    fadeOut(audio, 1);
                    audio = null;
                }
                if(slide.showHuman === true){$scope.state.showHuman = true;}
                if(slide.showTriangle !== "undefined"){$scope.state.showTriangle = slide.showTriangle;}
                if(slide.showHuman === false){$scope.state.showHuman = false;}
                if(slide.autoplay !== undefined){
                    $scope.state.autoplay = slide.autoplay;
                }
				if(slide.animation){slide.animation($scope);}
                var bgImg = null
                if($stateParams.backgroundImg){bgImg = $stateParams.backgroundImg;}
                if(slide.backgroundImg !== "undefined"){bgImg = slide.backgroundImg;}
                if(bgImg !== $scope.state.backgroundImg){
                    if(bgImg){
                        $scope.state.backgroundImg = $sce.trustAsResourceUrl(bgImg);
                    } else {
                        $scope.state.backgroundImg = false;
                    }
                }
                $scope.state.title = slide.title || null;
                $scope.state.image = slide.img ? $sce.trustAsResourceUrl(slide.img) : null;
                $scope.state.backgroundVideo = slide.backgroundVideo  ? $sce.trustAsResourceUrl(slide.backgroundVideo) : null;
                $scope.state.video = slide.video  ? $sce.trustAsResourceUrl(slide.video) : null;
                if(slide.audio){playAudio(slide);}
                if(slide.continuousAudio){playContinuousAudio(slide);}
                if(slide.continuousAudio === false && continuousAudio){
                    continuousAudio.pause();
                }
                if(slide.humanSpeech){
                    humanTalk(slide);
                }
                if(!slide.robotSpeech){return;}
                //qm.robotSpeech.setCaption(slide.robotSpeech)
                //qm.robot.openMouth();
                speechEnded = false;
		        qm.speech.talkRobot(
                    formatSpeech(slide.robotSpeech),
                    function(){
                        speechEnded = true;
                        checkAndProceed();
                    }
			        , function(error){
				        qmLog.info("Could not read intro slide because: ", error);
			        }, false, false
		        );
	        },
	        slides: []
        };
        $scope.$on('$ionicView.beforeEnter', function(e){
            $rootScope.hideNavigationMenu = true;
	        qmService.rootScope.setProperty('speechEnabled', true);
	        $scope.showRobot = true;
	        qm.speech.setSpeechEnabled(true);
            if($stateParams.slides === 'slidesConvo'){
                $scope.state.slides = slidesConvo;
            }else {
                $scope.state.slides = slides;
            }
            if($stateParams.autoplay !== undefined){
                $scope.state.autoplay = $stateParams.autoplay;
            }
        });
        function setSlideIndex(index){
            if(index < 0){
                console.error("Slide index cannot be less than 0");
                index = 0;
            }
            if(index > slides.length - 1){
                console.error("Slide index cannot be greater than the number of slides");
                index = 0;
            }
            $scope.state.slideIndex = index;
            //qm.storage.setItem('presentationSlideIndex', index);
        }
        $scope.$on('$ionicView.afterEnter', function(){
            //setSlideIndex(qm.storage.getItem('presentationSlideIndex') || 0);
            qmService.navBar.hideNavigationMenu();
            qm.robot.onRobotClick = $scope.state.next;
			qmService.hideLoader();
            if($stateParams.showHuman){
                //human.showHuman();
                $scope.state.showHuman = true;
            }
            if($stateParams.backgroundImg){
                $scope.state.backgroundImg = $sce.trustAsResourceUrl($stateParams.backgroundImg);
            }
            if($stateParams.showTriangle){$scope.state.showTriangle = true;}
        });
        $scope.$on('$ionicView.beforeLeave', function(){
            qm.music.fadeOut();
            qm.robot.onRobotClick = null;
			qmService.showFullScreenLoader();
        });
        function updateVideo(newValue, oldValue, id){
            if(!oldValue){oldValue = null;}
            if(!newValue){newValue = null;}
            if (newValue !== oldValue) {
                var videoElement = document.getElementById(id);
                if (videoElement) {
                    var slide = $scope.state.slides[$scope.state.slideIndex];
                    videoElement.playbackRate = 1;
                    if(slide.playbackRate){
                        videoElement.playbackRate = slide.playbackRate;
                    }
                    videoElement.muted = false;
                    videoElement.loop = false;
                    if(newValue){
                        setVideoEnded(false, slide);
                    }
                    videoElement.load();
                    videoElement.addEventListener('error', function(event) {
                        setVideoEnded(true, slide);
                        console.error("Video error occurred: ", event);
                    });
                    // Add event listener for 'ended' event
                    videoElement.addEventListener('ended', function() {
                        if(videoEnded){
                            console.error("Video ended called twice");
                            return;
                        }
                        this.loop = false; // prevent looping after video ends
                        setVideoEnded(true, slide);
                        checkAndProceed();
                    }, false);
                }
            }
        }
        function setVideoEnded(value, slide){
            videoEnded = value;
            console.log("Setting videoEnded to: ", value, "slide: ", slide);
        }
        $scope.$watch('state.backgroundVideo', function(newValue, oldValue) {
            updateVideo(newValue, oldValue, 'presentation-background-video');
        });
        $scope.$watch('state.video', function(newValue, oldValue) {
            updateVideo(newValue, oldValue, 'presentation-video')
        });

        $document.bind("keydown", function(event) {
            switch(event.which) {
                case 32: // Spacebar code
                case 39: // Right arrow code
                    $scope.$apply(function () {
                        $scope.state.next();
                    });
                    break;
                case 37: // Left arrow code
                    $scope.$apply(function () {
                        $scope.state.previous();
                    });
                    break;
            }
        });
        // Fade out function
        function fadeOut(audio, duration) {
            audio.pause();
            return;
            var step = 0.01; // volume change step
            duration = duration || 1; // duration in seconds
            var interval = duration * 1000 / (1/step); // calculate interval length
            var fade = setInterval(function() {
                if (audio.volume > 0) {
                    if(audio.volume - step < 0) {
                        audio.volume = 0;
                    } else {
                        audio.volume -= step;
                    }
                } else {
                    // Stop the audio when volume reaches 0
                    audio.pause();
                    audio.currentTime = 0;
                    clearInterval(fade);
                }
            }, interval);
        }
    }]);

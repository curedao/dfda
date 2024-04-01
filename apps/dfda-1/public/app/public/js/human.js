const human = {
    talkHuman(text, successHandler, errorHandler) {
        if (!window.speechSynthesis) {
            errorHandler('Speech synthesis not supported');
            return;
        }
        let mouth = document.querySelector('.human-mouth');
        mouth.classList.add('human-mouth-open');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.5;
        utterance.voice = speechSynthesis.getVoices()
            //.find(voice => voice.lang === 'en-US' && voice.gender === 'male')
            .find(voice => voice.voiceURI === 'Microsoft Mark - English (United States)')

        utterance.onend = successHandler;
        utterance.onerror = errorHandler;

        human.openMouth();
        document.getElementById('human-mouth').style.animation = 'moveMouth 0.2s infinite';

        speechSynthesis.speak(utterance);

        utterance.onend = () => {
            document.getElementById('human-mouth').style.animation = '';
            human.closeMouth();
            successHandler();
        };
    },
    shutUpHuman() {
        speechSynthesis.cancel();
        let mouth = document.querySelector('.human-mouth');
        mouth.classList.remove('human-mouth-open');
    },
    showHuman() {
        document.getElementById('human-container').style.display = 'block';
    },
    hideHuman() {
        document.getElementById('human-container').style.display = 'none';
    },
    showing: false,
    openMouth: function(){
        if(human.getClass()){
            human.getClass().classList.add('human_speaking');
            let element = document.getElementById("human-tongue");
            if(element){
                element.style.display = "block";
            }
        }
    },
    frown: function(){
        // Make a frown
        if(human.getClass()){
            human.getClass().classList
                .add('human_frown');
        }
    },
    closeMouth: function(){
        if(human.getClass()){
            human.getClass().classList.remove('human_speaking');
        }
        let element = document.getElementById("human-tongue");
        if(element){
            element.style.display = "none";
        }
        let mouth = document.querySelector('#human-mouth');
        mouth.classList.remove('human-mouth-talking');
    },
    hideRobot: function(){
        qmLog.info("Hiding human");
        if(human.getElement()){
            human.getElement().style.display = "none";
        }
        human.showing = qm.rootScope.showRobot = false;
    },
    showRobot: function(){
        if(!qm.speech.getSpeechAvailable()){
            return;
        }
        var human = human.getElement();
        if(!human){
            qmLog.info("No human!");
            return false;
        }
        qmLog.info("Showing human");
        human.getElement().style.display = "block";
        human.showing = qm.rootScope.showRobot = true;
    },
    getElement: function(){
        var element = document.querySelector('#human');
        return element;
    },
    getClass: function(){
        var element = document.querySelector('.human');
        return element;
    },
    toggle: function(){
        if(human.showing){
            human.hideRobot();
        }else{
            human.showRobot();
        }
    },
    onRobotClick: function(){
        qmLog.info("onRobotClick called but not defined");
    }
};

// Example usage:
// human.talkHuman('Hello world', () => console.log('Finished speaking'), (error) => console.log(error));

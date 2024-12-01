define(["underscore"], (function() {
    if(!window.soundPlayer)
    {
        window.soundPlayer = {
            audioCache: {},
            instances: [],
            DEFAULT_VOLUME: 0.5,
            play: function(file)
            {
                let audio = null;
                if(Game.soundUri + file in this.audioCache)
                {
                    audio = this.audioCache[Game.soundUri + file];
                    audio.currentTime = 0; // reset position
                    // clear if already playing
                    let i = this.instances.indexOf(audio);
                    if(i != -1) this.instances.splice(i, 1);
                }
                else
                {
                    audio = new Audio(Game.soundUri + file);
                    this.audioCache[Game.soundUri + file] = audio;
                    audio.addEventListener('ended', this.audioEnded);
                    audio.volume = this.DEFAULT_VOLUME;
                }
                audio.muted = !sfxState;
                audio.playbackRate = action_speed;
                audio.play();
                this.instances.push(audio);
            },
            stop: function()
            {
            },
            getLocalVolume: function(audio)
            {
            },
            setLocalVolume: function(audio, value)
            {
            },
            // below are custom functions implemented for the player purpose
            audioEnded: function() // automatic cleanup
            {
                let i = window.soundPlayer.instances.indexOf(this);
                if(i != -1) window.soundPlayer.instances.splice(i, 1);
            },
            clearAll: function() // stop and clear all audios
            {
                for(let i = 0; i < this.instances.length; ++i)
                    this.instances[i].pause();
                this.instances = [];
            },
            pauseAll: function() // pause all
            {
                for(let i = 0; i < this.instances.length; ++i)
                    this.instances[i].pause();
            },
            resumeAll: function() // resume all
            {
                for(let i = 0; i < this.instances.length; ++i)
                    this.instances[i].play();
            },
            setAllSpeed: function(speed) // set playback speed
            {
                for(let i = 0; i < this.instances.length; ++i)
                    this.instances[i].playbackRate = speed;
            },
            enableAll: function(bool)
            {
                for(let i = 0; i < this.instances.length; ++i)
                    this.instances[i].muted = !bool;
            }
        };
    }
    return window.soundPlayer;
}));
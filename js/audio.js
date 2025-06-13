define([], (function() {
	if(!window.audio)
	{
		window.audio = {
			disabled: (config.audio_disabled ?? false), // if true, audios won't play
			audio_cache: {}, // cache audio files, for reuse
			instances: [], // currently playing files
			volume: 0.5,
			// the following functions are needed for the animation playback
			// they are called from inside GBF files
			play: function(file)
			{
				if(this.disabled)
					return;
				try
				{
					let audio = null;
					if(file in this.audio_cache) // if cached
					{
						audio = this.audio_cache[file];
						// if already playing
						let i = this.instances.indexOf(audio);
						if(i != -1)
							this.instances.splice(i, 1); // remove from playing
						audio.currentTime = 0; // reset head position
					}
					else
					{
						// create new audio
						audio = new Audio(Game.soundUri + "/" + file);
						this.audio_cache[file] = audio; // add to cache
						audio.addEventListener('ended', this.audio_ended); // add listener
					}
					audio.volume = this.volume; // set volume to master
					audio.muted = !player.is_audio_enabled(); // set muted attribute
					audio.playbackRate = player.get_speed(); // set speed (seems to work between 0.01 ~ 4.0)
					audio.play(); // play the audio
					this.instances.push(audio); // add to playing
				} catch(err) {
					console.error("Error attempting to play " + file, err);
				}
			},
			stop: function() // leave it unimplemented, we handle it on our own
			{
			},
			getLocalVolume: function(name) // leave it unimplemented
			{
				return 1.0;
			},
			setLocalVolume: function(alias, value) // leave it unimplemented
			{
			},
			// below are our custom functions implemented for the player purpose
			reset: function()
			{
				this.stop_all();
				this.instances = [];
				this.audio_cache = {};
			},
			set_master_volume: function(value)
			{
				// check bounds and set volume
				if(value > 1.0)
					this.volume = 1.0;
				else if(value < 0.0)
					this.volume = 0.0;
				else
					this.volume = value;
				// apply to playing instances
				for(let i = 0; i < this.instances.length; ++i)
				{
					this.instances[i].volume = this.volume;
				}
			},
			audio_ended: function() // automatic cleanup called by the event listener
			{
				let i = window.audio.instances.indexOf(this);
				if(i != -1)
					window.audio.instances.splice(i, 1);
			},
			stop_all: function() // "stop" and clear all playing audios
			{
				for(let i = 0; i < this.instances.length; ++i)
					this.instances[i].pause();
				this.instances = [];
			},
			pause_all: function() // pause all
			{
				for(let i = 0; i < this.instances.length; ++i)
					this.instances[i].pause();
			},
			resume_all: function() // resume all
			{
				for(let i = 0; i < this.instances.length; ++i)
					this.instances[i].play();
			},
			set_playback_speed: function() // set playback speed
			{
				for(let i = 0; i < this.instances.length; ++i)
					this.instances[i].playbackRate = player.get_speed();
			},
			update_mute: function() // update unmute status
			{
				for(let i = 0; i < this.instances.length; ++i)
					this.instances[i].muted = !player.is_audio_enabled();
			}
		};
	}
	return window.audio;
}));
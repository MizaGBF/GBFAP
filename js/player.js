// variable to fix some specific enemies (enemy_4100663, enemy_4100753, enemy_4100933, enemy_4101033)
var attack_num = 0;
// variable to fix a skill for SR Richard (3030267000)
var highlow_result = 0;
// see view/raid/constant.js in GBF code for those exceptions above

// enum to pass to the player on creation
const PlayerLayoutMode = Object.freeze({
	normal: 0, // regular player
	enemy: 1, // enemy mode
	mypage: 2 // my page mode
});

// the animation player
class Player
{
	// constants
	static c_canvas_size = Object.freeze(900); // canvas size, width and height
	static c_gbf_animation_width = Object.freeze(640); // GBF animation width
	static c_enemy_shift = Object.freeze({ // constant to shift enemies around
		x:71,
		y:117
	});
	// enum, z_index shorthand
	static c_zindex = Object.freeze({
		BOTTOM: 0,
		MIDDLE: 1,
		TOP: 2
	});
	
	// constant associated with in-game motion names.
	// the list is non exhaustive.
	static c_animations = Object.freeze({
		// special ones added for the player innerworkings
		// for summon
		SUMMON_ATTACK: "summon_atk", 
		SUMMON_DAMAGE: "summon_dmg",
		// for boss appear animations
		RAID_APPEAR_0: "raid_appear_0",
		RAID_APPEAR_1: "raid_appear_1",
		RAID_APPEAR_2: "raid_appear_2",
		RAID_APPEAR_3: "raid_appear_3",
		RAID_APPEAR_4: "raid_appear_4",
		RAID_APPEAR_5: "raid_appear_5",
		RAID_APPEAR_6: "raid_appear_6",
		RAID_APPEAR_7: "raid_appear_7",
		RAID_APPEAR_8: "raid_appear_8",
		RAID_APPEAR_9: "raid_appear_9",
		// GBF ones
		WAIT: "wait",
		WAIT_2: "wait_2",
		WAIT_3: "wait_3",
		TO_STB_WAIT: "setup",
		STB_WAIT: "stbwait",
		STB_WAIT_ADV: "stbwait_adv",
		CHARA_SELECT: "chara_select",
		CHARA_IN: "chara_in",
		CHARA_OUT: "chara_out",
		CHARGE: "charge",
		ABILITY: "ability",
		ABILITY_WAIT: "ability_wait",
		MORTAL: "mortal",
		MORTAL_A: "mortal_A",
		MORTAL_A_1: "mortal_A_1",
		MORTAL_A_2: "mortal_A_2",
		MORTAL_B: "mortal_B",
		MORTAL_B_1: "mortal_B_1",
		MORTAL_B_2: "mortal_B_2",
		MORTAL_C: "mortal_C",
		MORTAL_C_1: "mortal_C_1",
		MORTAL_C_2: "mortal_C_2",
		MORTAL_D: "mortal_D",
		MORTAL_D_1: "mortal_D_1",
		MORTAL_D_2: "mortal_D_2",
		MORTAL_E: "mortal_E",
		MORTAL_E_1: "mortal_E_1",
		MORTAL_E_2: "mortal_E_2",
		MORTAL_F: "mortal_F",
		MORTAL_F_1: "mortal_F_1",
		MORTAL_F_2: "mortal_F_2",
		MORTAL_G: "mortal_G",
		MORTAL_G_1: "mortal_G_1",
		MORTAL_G_2: "mortal_G_2",
		MORTAL_H: "mortal_H",
		MORTAL_H_1: "mortal_H_1",
		MORTAL_H_2: "mortal_H_2",
		MORTAL_I: "mortal_I",
		MORTAL_I_1: "mortal_I_1",
		MORTAL_I_2: "mortal_I_2",
		MORTAL_J: "mortal_J",
		MORTAL_J_1: "mortal_J_1",
		MORTAL_J_2: "mortal_J_2",
		MORTAL_K: "mortal_K",
		MORTAL_K_1: "mortal_K_1",
		MORTAL_K_2: "mortal_K_2",
		ATTACK: "attack",
		ATTACK_SHORT: "short_attack",
		ATTACK_SHORT_ADV: "short_attack_adv",
		ATTACK_DOUBLE: "double",
		ATTACK_TRIPLE: "triple",
		ATTACK_QUADRUPLE: "quadruple",
		SPECIAL_ATTACK: "attack_2",
		ENEMY_ATTACK: "attack_3",
		CHANGE: "change",
		CHANGE_TO: "change_1",
		CHANGE_FROM: "change_2",
		CHANGE_TO_2: "change_1_2",
		CHANGE_FROM_2: "change_2_2",
		DEAD: "dead",
		DEAD_2: "dead_2",
		DAMAGE: "damage",
		DAMAGE_1: "damage_1",
		DAMAGE_2: "damage_2",
		DAMAGE_3: "damage_3",
		DAMAGE_4: "damage_4",
		DAMAGE_5: "damage_5",
		WIN: "win",
		WIN1: "win1",
		WIN2: "win2",
		WIN_1: "win_1",
		WIN_2: "win_2",
		WIN_3: "win_3",
		INVISIBLE: "invisible",
		HIDE: "hide",
		DOWN: "down",
		WAIT_SPECIAL: "pf",
		WAIT_SPECIAL_1: "pf_1",
		WAIT_SPECIAL_2: "pf_2",
		WAIT_SPECIAL_3: "pf_3",
		WAIT_SPECIAL_4: "pf_4",
		WAIT_SPECIAL_5: "pf_5",
		MISS: "miss",
		SUMMON: "summon",
		ABILITY_MOTION_OLD: "attack_noeffect",
		ABILITY_MOTION: "ab_motion",
		ABILITY_MOTION_2: "ab_motion_2",
		ABILITY_MOTION_3: "ab_motion_3",
		ABILITY_MOTION_4: "ab_motion_4",
		VS_MOTION_1: "vs_motion_1",
		VS_MOTION_2: "vs_motion_2",
		VS_MOTION_3: "vs_motion_3",
		VS_MOTION_4: "vs_motion_4",
		VS_MOTION_5: "vs_motion_5",
		VS_MOTION_6: "vs_motion_6",
		ENEMY_PHASE_1: "setin",
		ENEMY_PHASE_2: "setin_2",
		ENEMY_PHASE_3: "setin_3",
		ENEMY_PHASE_4: "setin_4",
		ENEMY_PHASE_5: "setin_5",
		ENEMY_FORM_CHANGE: "form_change",
		ENEMY_STANDBY_A: "standby_A",
		ENEMY_STANDBY_B: "standby_B",
		ENEMY_STANDBY_C: "standby_C",
		ENEMY_STANDBY_D: "standby_D",
		ENEMY_BREAK_STANDBY_A: "break_standby_A",
		ENEMY_BREAK_STANDBY_B: "break_standby_B",
		ENEMY_BREAK_STANDBY_C: "break_standby_C",
		ENEMY_BREAK_STANDBY_D: "break_standby_D",
		ENEMY_DAMAGE_STANDBY_A: "damage_standby_A",
		ENEMY_DAMAGE_STANDBY_B: "damage_standby_B",
		ENEMY_DAMAGE_STANDBY_C: "damage_standby_C",
		ENEMY_DAMAGE_STANDBY_D: "damage_standby_D",
		LINK_PHASE_1: "setin_link",
		LINK_PHASE_1_2: "setin_link_2",
		LINK_PHASE_1_F2: "setin_link_f2",
		LINK_PHASE_1_F2_2: "setin_link_f2_2",
		LINK_PHASE_2: "setin_2_link",
		LINK_PHASE_2_2: "setin_2_link_2",
		LINK_PHASE_2_F2: "setin_2_link_f2",
		LINK_PHASE_2_F2_2: "setin_2_link_f2_2",
		LINK_PHASE_3: "setin_3_link",
		LINK_PHASE_3_2: "setin_3_link_2",
		LINK_PHASE_3_F2: "setin_3_link_f2",
		LINK_PHASE_3_F2_2: "setin_3_link_f2_2",
		LINK_PHASE_4: "setin_4_link",
		LINK_PHASE_4_2: "setin_4_link_2",
		LINK_PHASE_4_F2: "setin_4_link_f2",
		LINK_PHASE_4_F2_2: "setin_4_link_f2_2",
		LINK_PHASE_5: "setin_5_link",
		LINK_PHASE_5_2: "setin_5_link_2",
		LINK_PHASE_5_F2: "setin_5_link_f2",
		LINK_PHASE_5_F2_2: "setin_5_link_f2_2",
		LINK_DAMAGE: "damage_link",
		LINK_DAMAGE_2: "damage_link_2",
		LINK_DEAD: "dead_link",
		LINK_DEAD_1: "dead_1_link",
		LINK_DEAD_2: "dead_2_link",
		LINK_DEAD_3: "dead_3_link",
		LINK_DEAD_A: "dead_link_1",
		LINK_DEAD_B: "dead_link_2",
		LINK_DEAD_C: "dead_link_3",
		LINK_MORTAL_A: "mortal_A_link",
		LINK_MORTAL_A_2: "mortal_A_link_2",
		LINK_MORTAL_A_F2: "mortal_A_link_f2",
		LINK_MORTAL_A_F2_2: "mortal_A_link_f2_2",
		LINK_MORTAL_B: "mortal_B_link",
		LINK_MORTAL_B_2: "mortal_B_link_2",
		LINK_MORTAL_B_F2: "mortal_B_link_f2",
		LINK_MORTAL_B_F2_2: "mortal_B_link_f2_2",
		LINK_MORTAL_C: "mortal_C_link",
		LINK_MORTAL_C_2: "mortal_C_link_2",
		LINK_MORTAL_C_F2: "mortal_C_link_f2",
		LINK_MORTAL_C_F2_2: "mortal_C_link_f2_2",
		LINK_MORTAL_D: "mortal_D_link",
		LINK_MORTAL_D_2: "mortal_D_link_2",
		LINK_MORTAL_D_F2: "mortal_D_link_f2",
		LINK_MORTAL_D_F2_2: "mortal_D_link_f2_2",
		LINK_MORTAL_E: "mortal_E_link",
		LINK_MORTAL_E_2: "mortal_E_link_2",
		LINK_MORTAL_E_F2: "mortal_E_link_f2",
		LINK_MORTAL_E_F2_2: "mortal_E_link_f2_2",
		LINK_MORTAL_F: "mortal_F_link",
		LINK_MORTAL_F_2: "mortal_F_link_2",
		LINK_MORTAL_F_F2: "mortal_F_link_f2",
		LINK_MORTAL_F_F2_2: "mortal_F_link_f2_2",
		LINK_MORTAL_G: "mortal_G_link",
		LINK_MORTAL_G_2: "mortal_G_link_2",
		LINK_MORTAL_G_F2: "mortal_G_link_f2",
		LINK_MORTAL_G_F2_2: "mortal_G_link_f2_2",
		LINK_MORTAL_H: "mortal_H_link",
		LINK_MORTAL_H_2: "mortal_H_link_2",
		LINK_MORTAL_H_F2: "mortal_H_link_f2",
		LINK_MORTAL_H_F2_2: "mortal_H_link_f2_2",
		LINK_MORTAL_I: "mortal_I_link",
		LINK_MORTAL_I_2: "mortal_I_link_2",
		LINK_MORTAL_I_F2: "mortal_I_link_f2",
		LINK_MORTAL_I_F2_2: "mortal_I_link_f2_2",
		LINK_MORTAL_J: "mortal_J_link",
		LINK_MORTAL_J_2: "mortal_J_link_2",
		LINK_MORTAL_J_F2: "mortal_J_link_f2",
		LINK_MORTAL_J_F2_2: "mortal_J_link_f2_2",
		LINK_MORTAL_K: "mortal_K_link",
		LINK_MORTAL_K_2: "mortal_K_link_2",
		LINK_MORTAL_K_F2: "mortal_K_link_f2",
		LINK_MORTAL_K_F2_2: "mortal_K_link_f2_2",
		LINK_ATTACK: "attack_link",
		LINK_ATTACK_2: "attack_link_2",
		LINK_ATTACK_F2: "attack_link_f2",
		LINK_ATTACK_F2_2: "attack_link_f2_2",
		LINK_FORM_CHANGE: "form_change_link",
		LINK_FORM_CHANGE_2: "form_change_link_2",
		MY_PAGE: "mypage",
	});
	
	// PlayerLayoutMode must be passed in parameter
	// it will affect the player behavior
	constructor(mode = PlayerLayoutMode.normal)
	{
		// the HTML ui is separated in another instance
		this.ui = new PlayerUI(this);
		this.init_attributes(mode);
	}
	
	init_attributes(mode)
	{
		this.m_layout_mode = mode;
		// player size
		this.m_width = 0;
		this.m_height = 0;
		// player state
		this.m_paused = true;
		this.m_loading = true;
		this.m_setting_enabled = false;
		// player callbacks
		this.m_tick_callback = null;
		this.m_animation_completed_callback = this.animation_completed.bind(this);
		// player settings
		this.m_speed = 1.0; // play speed
		this.m_audio_enabled = false; // audio mute state
		this.m_looping = true; // looping mode (false means we stay on the same animation)
		this.m_ability_target = false; // ability effect positioning flag
		this.m_ability_mode = 0; // ability effect play mode
		this.m_ability_index = 0; // current playing ability effect
		this.m_enemy_shift = false; // enemy positioning flag
		this.m_scaling = 1.0; // unmodifiable at runtime
		// various positions (initialized in another function)
		this.m_fullscreen_scale = 0.0; // scale fullscreen animations
		this.m_offset = {
			position: {
				x : 0.0,
				y : 0.0
			},
			target: {
				x : 0.0,
				y : 0.0
			},
			fullscreen: {
				x : 0.0,
				y : 0.0
			},
			special: {
				x : 0.0,
				y : 0.0
			},
			fullscreen_shift: {
				x : 0.0,
				y : 0.0
			}
		};
		// the createjs stage
		this.m_stage = null;
		// animations
		this.m_animations = []; // store the Animations data
		this.m_cjs = []; // store the instantied associated objects
		this.m_current_cjs = 0; // indicate which one is on screen right now
		this.m_motion_lists = []; // list of list of available motions for all animations
		this.m_weapon_textures = []; // list of weapon texture per version
		// motions
		this.m_current_motion_list = []; // the current play list of motions
		this.m_current_motion = 0; // the currently playing motion in the list
		
		// internal use
		this.m_main_tween = null; // main animation tween
		// recording storage
		this.m_recording = null;
		// texture swapping container
		this.m_texture_state = {};
		// sub tweens
		this.m_child_tweens = []; // contains the tweens
		this.m_tween_sources = []; // contains the source
		// the playing summon/ charge attack / special
		this.m_special_cjs = null;
		// custom playlist content
		this.m_playlist = [];
		// animation stack
		this.m_dispatch_stack = [];
		this.m_looping_index = null;
	}
	
	// create the stage and set the ticker framerate
	init_stage()
	{
		createjs.Ticker.framerate = 30 * this.m_speed;
		if(!this.ui.m_canvas)
			throw new Error("No canvas initialized");
		this.m_stage = new createjs.Stage(this.ui.m_canvas);
	}
	
	// reset the player to a near starting state
	restart(mode = PlayerLayoutMode.normal)
	{
		// pause the player
		this.pause();
		// remove listeners
		for(const cjs of this.m_cjs)
			cjs.removeEventListener("animationComplete", this.m_animation_completed_callback);
		if(this.m_tick_callback != null)
			createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
		// clean createjs
		this.m_stage.removeAllEventListeners();
		this.m_stage.removeAllChildren();
		createjs.Tween.removeAllTweens();
		createjs.Ticker.removeEventListener("tick", this.m_stage);
		createjs.Ticker.reset();
		// reset everything
		this.init_attributes(mode);
		loader.reset();
		if(window.audio)
			window.audio.reset();
		this.ui.reset();
		
		// set speed
		this.m_speed = parseFloat(this.ui.m_speed.value) / 100.0;
		// restart the ticker
		createjs.Ticker.on("tick", createjs.Tween);
	}
	
	// return if the player is loading or busy recording
	is_busy()
	{
		return this.m_loading || (this.m_recording != null);
	}
	
	// return the player speed
	get_speed()
	{
		return this.m_speed;
	}
	
	// return if audio can be played
	is_audio_enabled()
	{
		return this.m_audio_enabled;
	}
	
	load_settings()
	{
		if((config.save_setting_key ?? null) != null)
		{
			this.m_setting_enabled = true;
			let settings = localStorage.getItem(config.save_setting_key);
			if(settings != null)
			{
				let tmp = config.save_setting_key; // to disable saving
				config.save_setting_key = null
				try
				{
					settings = JSON.parse(settings);
					// volume
					this.ui.m_audio.value = settings.volume;
					this.ui.control_audio_update();
					// background
					if(this.m_layout_mode == PlayerLayoutMode.mypage)
					{
						if(settings.mypage_background)
						{
							this.ui.m_background.src = settings.mypage_background;
							this.ui.update_mypage_background_mask();
						}
					}
					else
					{
						if(settings.background)
							this.ui.m_background.src = settings.background;
					}
					// beep
					beep_enabled = settings.beep;
					this.ui.m_buttons.beep.classList.toggle("player-button-warning", !beep_enabled);
					// audio
					this.m_audio_enabled = settings.audio;
					this.ui.m_buttons.sound.classList.toggle("player-button-enabled", this.m_audio_enabled);
				} catch(err) {
					console.error("Failed to load localStorage settings with key " + config.save_setting_key, err);
				}
				// re-enable saving
				config.save_setting_key = tmp;
			}
		}
	}
	
	save_settings()
	{
		if((config.save_setting_key ?? null) != null)
		{
			let past_settings = localStorage.getItem(config.save_setting_key);
			if(past_settings != null)
			{
				settings = JSON.parse(past_settings);
			}
			else
			{
				settings = {};
			}
			// volume
			settings.volume = this.ui.m_audio.value;
			// background
			if(this.m_layout_mode == PlayerLayoutMode.mypage)
			{
				settings.mypage_background = this.ui.m_background.src;
			}
			else
			{
				settings.background = this.ui.m_background.src;
			}
			// audio
			settings.beep = beep_enabled;
			settings.audio = this.m_audio_enabled;
			// set
			settings = JSON.stringify(settings);
			if(settings != past_settings)
				localStorage.setItem(config.save_setting_key, settings);
		}
	}
	
	// return an object containing the animation data and its associated animation
	get_current_animation_cjs()
	{
		if(this.m_current_cjs >= this.m_cjs.length)
			return null;
		return {
			animation:this.m_animations[this.m_current_cjs],
			cjs:this.m_cjs[this.m_current_cjs]
		};
	}
	
	// change the player size
	set_size(w, h, scaling = 1.0)
	{
		if(w > Player.c_canvas_size || h > Player.c_canvas_size)
			throw new Error("Player size can't be greater than " + Player.c_canvas_size);
		
		this.m_width = w;
		this.m_height = h;
		this.m_scaling = scaling;
		// set visible player size
		this.ui.set_canvas_container_size(w, h);
		
		const center = Player.c_canvas_size / 2.0;
		// initialize offsets
		this.m_fullscreen_scale = w / Player.c_gbf_animation_width;
		switch(this.m_layout_mode)
		{
			// note: Math.floor is used below for pixel snapping
			case PlayerLayoutMode.enemy:
			{
				// enemy is on the left, target on the right
				this.m_offset.position.x = Math.round(
					center - w * 0.30 * this.m_scaling
				);
				this.m_offset.position.y = Math.round(
					center + h * 0.50 * this.m_scaling
				);
				this.m_offset.target.x = Math.round(
					center + w * 0.25 * this.m_scaling
				);
				this.m_offset.target.y = Math.round(
					center + h * 0.40 * this.m_scaling
				);
				this.m_offset.fullscreen.x = Math.round(
					center - w * 0.5 / this.m_scaling
				);
				this.m_offset.fullscreen.y = Math.round(
					center - h * 0.5 / this.m_scaling
				);
				this.m_offset.special.y = Math.round(
					0.15 * w / this.m_scaling
				);
				this.m_offset.special.y = Math.round(
					0.15 * h / this.m_scaling
				);
				break;
			}
			case PlayerLayoutMode.mypage:
			{
				// there is no target or other effect
				// the offset is simply the top left corner
				this.m_offset.position.x = Math.round(
					center - w * 0.5
				);
				this.m_offset.position.y = Math.round(
					center - h * 0.5
				);
				break;
			}
			default: // normal mode
			{
				// element is on the right, target on the left
				this.m_offset.position.x = Math.round(
					center + w * 0.25 * this.m_scaling
				);
				this.m_offset.position.y = Math.round(
					center + h * 0.15 * this.m_scaling
				);
				this.m_offset.target.x = Math.round(
					center - w * 0.10 * this.m_scaling
				);
				this.m_offset.target.y = Math.round(
					center + h * 0.30 * this.m_scaling
				);
				this.m_offset.fullscreen.x = Math.round(
					center - w * 0.5 / this.m_scaling
				);
				this.m_offset.fullscreen.y = Math.round(
					center - h * 0.5 / this.m_scaling
				);
				this.m_offset.special.y = Math.round(
					0.15 * w / this.m_scaling
				);
				this.m_offset.special.y = Math.round(
					0.15 * h / this.m_scaling
				);
				break;
			}
		}
	}
	
	// return the Animation datas
	get_animations()
	{
		return this.m_animations;
	}
	
	// set the Animation datas
	set_animations(animations)
	{
		this.m_animations = animations;
		if(animations[0].weapon != null)
		{
			for(const animation of this.m_animations)
			{
				this.m_weapon_textures.push(animation.weapon);
			}
		}
		this.ui.set_version(); // set the version Select
		// load the files
		loader.load_animations();
	}
	
	// start playing
	start_animation()
	{
		// reset some variables
		this.m_playlist = [];
		this.m_current_motion = 0;
		this.m_current_cjs = 0;
		// set texture container
		this.m_texture_state = {}
		for(const [name, img] of Object.entries(window.images))
		{
			this.m_texture_state[name] = {
				ori: img.src,
				version: null,
				swap: null
			}
		}
		// priming textures
		for(let fn of Object.keys(lib)) // instantiate everything once
		{
			let elem = new lib[fn];
			try
			{
				this.m_stage.addChild(elem); // and add to stage
				this.m_stage.update(); // force renderer update
			}
			catch(unused)
			{
			}
			this.m_stage.removeChild(elem);
			
		}
		
		// instantiate all main animations
		for(let i = 0; i < this.m_animations.length; ++i)
		{
			this.m_cjs.push(this.add_element(this.m_animations[i].cjs));
			if(i == 0) // add the first element
			{
				this.m_stage.addChild(this.m_cjs[0]);
			}
		}
		// start with the first version on default animations
		if(this.m_cjs.length > 0)
		{
			// fetch and store the motion list for all animations
			this.set_motion_lists();
			// make sure the state is reset
			this.reset();
			// reset motion (else it will be set to the last one, because reset is intended for use DURING playing)
			this.m_current_motion = 0;
			// set list of playing motion to demo
			this.m_current_motion_list = this.m_animations[this.m_current_cjs].demo_motions;
			// initialize playlist
			for(const motion of this.m_current_motion_list)
			{
				this.m_playlist.push([0, motion]);
			}
			// play our animation
			this.play(this.m_current_motion_list[this.m_current_motion]);
			//this.m_stage.update();
			this.ui.update_motion_control(this.m_motion_lists[this.m_current_cjs]);
			// update ui
			this.ui.update_ability_control(this.m_animations[0].abilities);
			this.ui.update_enemy_control(this.m_animations[0].is_enemy);
			this.ui.set_texture_list();
			this.ui.set_playlist_versions();
			// unlock button
			this.ui.set_control_lock(false);
			// disable loading
			this.m_loading = false;
			// disable pause
			this.resume();
		}
	}
	
	// retrieve the animation duration (in frames)
	get_animation_duration(cjs)
	{
		if(!cjs instanceof createjs.MovieClip) // shouldn't happen
			return null;
		else if(cjs.timeline.duration)
			return +cjs.timeline.duration;
		else // default for fallback purpose
			return +cjs.timeline.Id;
	}
	
	// return the next motion in the play list
	next_motion()
	{
		let next_index = this.m_current_motion + 1;
		if(next_index >= this.m_current_motion_list.length)
			next_index = 0;
		return this.m_current_motion_list[next_index];
	}
	
	// allow the user to shift the enemy position to the top right a bit
	// controlled by a button
	enemy_shift_toggle()
	{
		this.m_enemy_shift = !this.m_enemy_shift;
		// enemies don't have multiple version so no need to care which one we grab
		let cjs = this.get_current_animation_cjs().cjs;
		if(this.m_enemy_shift) // apply shift
		{
			cjs.x += Player.c_enemy_shift.x;
			cjs.y -= Player.c_enemy_shift.y;
		}
		else // move back
		{
			cjs.x -= Player.c_enemy_shift.x;
			cjs.y += Player.c_enemy_shift.y;
		}
		return this.m_enemy_shift;
	}
	
	// instantiate the main element (i.e. the main animation, character, etc...)
	add_element(cjs)
	{
		let element = new lib[cjs];
		element.name = cjs; // set name
		// set position to position offset
		element.x = this.m_offset.position.x;
		element.y = this.m_offset.position.y;
		// apply scaling
		element.scaleX *= this.m_scaling;
		element.scaleY *= this.m_scaling;
		// apply mypage scaling
		if(this.m_layout_mode == PlayerLayoutMode.mypage)
		{
			element.scaleX *= this.m_fullscreen_scale;
			element.scaleY *= this.m_fullscreen_scale;
		}
		// note: zindex default to 0 (BOTTOM)
		// return it
		return element;
	}
	
	// instantiate an auto attack effect (phit file)
	add_attack(cjs)
	{
		if(cjs == null) // invalid
			return;
		let atk = new lib[cjs];
		atk.name = cjs; // set name
		// set position to target offset
		atk.x = this.m_offset.target.x;
		atk.y = this.m_offset.target.y;
		// apply scaling
		atk.scaleX *= this.m_scaling;
		atk.scaleY *= this.m_scaling;
		// add to stage
		this.m_stage.addChild(atk);
		// set zindex to be on top
		this.m_stage.setChildIndex(atk, Player.c_zindex.TOP);
		// play the animation
		atk[cjs].gotoAndPlay(6); // always 6
		return atk;
	}
	
	// instantiate a charge attack (sp file)
	add_special(cjs, animation) // must pass the associated animation data
	{
		let special = new lib[cjs];
		special.name = cjs; // set name
		// add to stage
		this.m_stage.addChild(special);
		if(animation.is_enemy) // if it's an enemy animation
		{
			special.x = this.m_offset.target.x;
			special.y = this.m_offset.target.y;
			this.m_stage.setChildIndex(special, Player.c_zindex.TOP);
		}
		else // else player or weapon
		{
			// newer "fullscreen" animations cover all the screen
			// and have s2 or s3 in their file names
			if(cjs.includes("_s2") || cjs.includes("_s3"))
			{
				special.x = this.m_offset.fullscreen.x;
				special.y = this.m_offset.fullscreen.y;
				special.scaleX *= this.m_fullscreen_scale;
				special.scaleY *= this.m_fullscreen_scale;
			}
			else // regular ones
			{
				special.x = this.m_offset.target.x;
				special.y = this.m_offset.target.y + this.m_offset.special.y;
				this.m_stage.setChildIndex(special, Player.c_zindex.BOTTOM);
			}
		}
		// apply scaling
		special.scaleX *= this.m_scaling;
		special.scaleY *= this.m_scaling;
		// play the animation
		if(animation.is_main_character && animation.weapon != null)
		{
			// for main character with specific weapon
			// the animation we went is nested a bit further
			special[cjs][cjs + "_special"].gotoAndPlay("special");
		}
		else
		{
			special[cjs].gotoAndPlay(6);
		}
		return special;
	}
	
	// instantiate a summon
	add_summon(cjs)
	{
		let summon = new lib[cjs];
		summon.name = cjs; // set name
		// add to stage
		this.m_stage.addChild(summon);
		// the newer files are in two files (attack and damage)
		// both seems to use the fullscreen offset
		if(cjs.includes("_attack") || cjs.includes("_damage"))
		{
			summon.x = this.m_offset.fullscreen.x;
			summon.y = this.m_offset.fullscreen.y;
			summon.scaleX *= this.m_fullscreen_scale;
			summon.scaleY *= this.m_fullscreen_scale;
		}
		else // old summons (N, R, ...)
		{
			// set to target
			summon.x = this.m_offset.target.x;
			summon.y = this.m_offset.target.y;
			this.m_stage.setChildIndex(summon, Player.c_zindex.TOP);
			summon.gotoAndPlay(0);
		}
		// apply scaling
		summon.scaleX *= this.m_scaling;
		summon.scaleY *= this.m_scaling;
		return summon;
	}
	
	// instantiate a skill effect
	add_ability(cjs, is_aoe) // must pass if it's an aoe ability
	{
		let skill = new lib[cjs];
		skill.name = cjs; // set name
		// add to stage
		this.m_stage.addChild(skill);
		// display on top
		this.m_stage.setChildIndex(skill, Player.c_zindex.TOP);
		// aoe are like fullscreen special
		if(is_aoe)
		{
			skill.x = this.m_offset.fullscreen.x;
			skill.y = this.m_offset.fullscreen.y;
			skill.scaleX *= this.m_fullscreen_scale;
			skill.scaleY *= this.m_fullscreen_scale;
		}
		else
		{
			// set position according to m_ability_target state
			if(this.m_ability_target)
			{
				skill.x = this.m_offset.position.x;
				skill.y = this.m_offset.position.y;
			}
			else
			{
				skill.x = this.m_offset.target.x;
				skill.y = this.m_offset.target.y;
			}
		}
		// apply scaling
		skill.scaleX *= this.m_scaling;
		skill.scaleY *= this.m_scaling;
		return skill;
	}
	
	// instantiate a raid appear animation
	add_appear(cjs)
	{
		let appear = new lib[cjs];
		appear.name = cjs; // set name
		// add to stage
		this.m_stage.addChild(appear);
		// display on top
		this.m_stage.setChildIndex(appear, Player.c_zindex.TOP);
		// fullscreen
		appear.x = this.m_offset.fullscreen.x;
		appear.y = this.m_offset.fullscreen.y;
		appear.scaleX *= this.m_fullscreen_scale;
		appear.scaleY *= this.m_fullscreen_scale;
		// apply scaling
		appear.scaleX *= this.m_scaling;
		appear.scaleY *= this.m_scaling;
		return appear;
	}
	
	// create a tween for N duration and store it
	add_child_tween(tween_source, duration)
	{
		var _player_ = this;
		const ref = tween_source;
		this.m_tween_sources.push(tween_source);
		const child_tween = createjs.Tween.get(tween_source, {
			useTicks: true,
			paused: this.m_paused
		}).wait(duration).call(function () {
			_player_.clean_tween(ref, child_tween);
		});
		this.m_child_tweens.push(child_tween);
	}
	
	// remove/clean up a specific tween
	clean_tween(tween_source, child_tween)
	{
		let i = this.m_tween_sources.indexOf(tween_source);
		if(i != -1)
			this.m_tween_sources.splice(i, 1);
		this.m_stage.removeChild(tween_source);
		i = this.m_child_tweens.indexOf(child_tween);
		if(i != -1)
			this.m_child_tweens.splice(i, 1);
	}
	
	// play an animation
	// the most important function
	// motion is the specific animation to play
	play(motion)
	{
		// first, we check if motion starts with switch_version_
		// switch_version_ is used by the play list system to switch character version automatically
		// if the motion is set to switch_version_INDEX where INDEX is a number, then we must switch character version
		if(motion.startsWith("switch_version_"))
		{
			let version_str = motion.substring("switch_version_".length);
			// remove current one from stage
			this.m_stage.removeChild(this.m_cjs[this.m_current_cjs]);
			// update current_cjs
			this.m_current_cjs = parseInt(version_str);
			// add current one to stage
			this.m_stage.addChild(this.m_cjs[this.m_current_cjs]);
			// update ui
			this.ui.m_version.value = version_str;
			this.ui.update_motion_control(this.m_motion_lists[this.m_current_cjs]);
			// update mainhands
			this.update_main_hand_weapon();
			// increase current_motion index
			this.m_current_motion++;
			// play the next animation
			this.play(this.m_current_motion_list[this.m_current_motion]);
			return;
		}
		// retrieve the current animation data and instance
		let data = this.get_current_animation_cjs()
		if(data == null)
			return;
		// retrieve further down for clarity
		let name = data.cjs.name;
		var cjs = data.cjs[name];
		const animation = data.animation;
		// check if it's a valid animation
		if(!cjs instanceof createjs.MovieClip)
			return;
		// default to visible
		cjs.visible = true;
		// reset looping index
		this.m_looping_index = null;
		// duration will contain the animation duration
		let duration = 0;
		// check which motion it is
		switch(motion)
		{
			// Charge attacks / specials
			case Player.c_animations.MORTAL:
			case Player.c_animations.MORTAL_A:
			case Player.c_animations.MORTAL_A_1:
			case Player.c_animations.MORTAL_A_2:
			case Player.c_animations.MORTAL_B:
			case Player.c_animations.MORTAL_B_1:
			case Player.c_animations.MORTAL_B_2:
			case Player.c_animations.MORTAL_C:
			case Player.c_animations.MORTAL_C_1:
			case Player.c_animations.MORTAL_C_2:
			case Player.c_animations.MORTAL_D:
			case Player.c_animations.MORTAL_D_1:
			case Player.c_animations.MORTAL_D_2:
			case Player.c_animations.MORTAL_E:
			case Player.c_animations.MORTAL_E_1:
			case Player.c_animations.MORTAL_E_2:
			case Player.c_animations.MORTAL_F:
			case Player.c_animations.MORTAL_F_1:
			case Player.c_animations.MORTAL_F_2:
			case Player.c_animations.MORTAL_G:
			case Player.c_animations.MORTAL_G_1:
			case Player.c_animations.MORTAL_G_2:
			case Player.c_animations.MORTAL_H:
			case Player.c_animations.MORTAL_H_1:
			case Player.c_animations.MORTAL_H_2:
			case Player.c_animations.MORTAL_I:
			case Player.c_animations.MORTAL_I_1:
			case Player.c_animations.MORTAL_I_2:
			case Player.c_animations.MORTAL_J:
			case Player.c_animations.MORTAL_J_1:
			case Player.c_animations.MORTAL_J_2:
			case Player.c_animations.MORTAL_K:
			case Player.c_animations.MORTAL_K_1:
			case Player.c_animations.MORTAL_K_2:
			{
				// get the duration in the element
				duration = this.get_animation_duration(cjs[name + "_" + motion]);
				// if it has at least a special file
				if(animation.specials.length > 0)
				{
					// retrieve index
					// example: mortal_A is index 0, mortal_B is index 1...
					let special_index = motion.split('_')[1].charCodeAt()-65;
					// check if index is in bound, else default to 0
					if(special_index >= animation.specials.length)
						special_index = 0;
					// play the special file
					let special_cjs = this.add_special(animation.specials[special_index], animation);
					// store it in class attriute
					this.m_special_cjs = special_cjs;
					// add file duration if it's a weapon animation
					if(animation.is_main_character && animation.weapon != null)
					{
						duration += this.get_animation_duration(special_cjs[special_cjs.name][special_cjs.name + "_special"]);
					}
				}
				break;
			}
			// Summon files
			// Note: this isn't native and kinda hacked on top
			case Player.c_animations.SUMMON_ATTACK:
			case Player.c_animations.SUMMON_DAMAGE:
			{
				let summon_cjs_name = motion == Player.c_animations.SUMMON_DAMAGE
					? animation.specials[0].replace("attack", "damage") // update attack to damage accordingly
					: animation.specials[0];
				
				// play the summon file
				let summon_cjs = this.add_summon(summon_cjs_name);
				// store it in class attriute
				this.m_special_cjs = summon_cjs;
				// get duration
				if(!(summon_cjs_name in summon_cjs[summon_cjs_name])) // faisafe for old summons
				{
					for(const k in summon_cjs[summon_cjs_name]) // go over each key
					{
						if(k.includes("_attack")) // find the one named attack
						{
							summon_cjs[summon_cjs_name].gotoAndPlay("attack");
							duration = this.get_animation_duration(summon_cjs[summon_cjs_name][k]);
							break;
						}
					}
				}
				else
				{
					duration = this.get_animation_duration(summon_cjs[summon_cjs_name][summon_cjs_name]);
				}
				break;
			}
			// auto attack animation
			case Player.c_animations.ATTACK:
			case Player.c_animations.ATTACK_SHORT:
			case Player.c_animations.ATTACK_SHORT_ADV:
			case Player.c_animations.ATTACK_DOUBLE:
			case Player.c_animations.ATTACK_TRIPLE:
			case Player.c_animations.ATTACK_QUADRUPLE:
			case Player.c_animations.SPECIAL_ATTACK:
			case Player.c_animations.ENEMY_ATTACK:
			{
				// retrieve and play file
				let atk = this.add_attack(animation.attack);
				// get the duration
				let atk_duration = this.get_animation_duration(atk[animation.attack][animation.attack + "_effect"]);
				// set tween with the attack duration
				this.add_child_tween(atk, atk_duration);
				// set combo
				// i.e. if the following move is another attack...
				let next_motion = this.next_motion();
				if([
					Player.c_animations.ATTACK_DOUBLE,
					Player.c_animations.ATTACK_TRIPLE,
					Player.c_animations.ATTACK_QUADRUPLE
				].includes(next_motion))
				{
					duration = 10; // limit to 10 frames so that they follow right away
				}
				else
				{
					// else set duration normally
					duration = this.get_animation_duration(cjs[name + "_" + motion]);
				}
				// cycling atk num here (it seems to control which arm attack, see line 1 for concerned monsters)
				attack_num = (attack_num + 1) % 2;
				break;
			}
			// form change
			case Player.c_animations.CHANGE:
			case Player.c_animations.CHANGE_FROM:
			case Player.c_animations.CHANGE_FROM_2:
			{
				// Note: does nothing different from default
				// keeping it this way in case it must be changed / improved
				duration = this.get_animation_duration(cjs[name + "_" + motion]);
				break;
			}
			// skill / ability use
			case Player.c_animations.ABILITY_MOTION:
			case Player.c_animations.ABILITY_MOTION_2:
			case Player.c_animations.ABILITY_MOTION_3:
			case Player.c_animations.ABILITY_MOTION_4:
			case Player.c_animations.VS_MOTION_1:
			case Player.c_animations.VS_MOTION_2:
			case Player.c_animations.VS_MOTION_3:
			case Player.c_animations.VS_MOTION_4:
			case Player.c_animations.VS_MOTION_5:
			case Player.c_animations.VS_MOTION_6:
			{
				// get the animation duration
				let base_duration = this.get_animation_duration(cjs[name + "_" + motion]);
				// check if animation got skill effects AND ui ability select is not set on None
				if(this.m_ability_mode > 0 && animation.abilities.length > 0)
				{
					// get file to play
					let skill_cjs = animation.abilities[this.m_ability_index];
					let is_aoe = skill_cjs.includes("_all_");
					// instantiate
					const skill = this.add_ability(skill_cjs, is_aoe);
					// get duration
					// note: name change between aoe and single target files
					let skill_duration = is_aoe ?
						this.get_animation_duration(skill[skill_cjs][skill_cjs + "_end"]) :
						this.get_animation_duration(skill[skill_cjs][skill_cjs + "_effect"]);
					// add tween for this duration
					this.add_child_tween(skill, skill_duration);
					// get the highest duration between the element and skill effect
					duration = Math.max(base_duration, skill_duration);
					if(this.m_ability_mode == 1) // if set to Cycle mode
					{
						// increase index
						this.m_ability_index = (this.m_ability_index + 1) % animation.abilities.length;
					}
					if(skill_cjs == "ab_all_3030267000_01") // SR Richard highlow skill
					{
						// cycling highlow_result here (it determines if Richard's skill is a win or not)
						highlow_result = (highlow_result + 1) % 2;
					}
				}
				else // else the duration is just the base animation's
				{
					duration = base_duration;
				}
				break;
			}
			case Player.c_animations.RAID_APPEAR_0:
			case Player.c_animations.RAID_APPEAR_1:
			case Player.c_animations.RAID_APPEAR_2:
			case Player.c_animations.RAID_APPEAR_3:
			case Player.c_animations.RAID_APPEAR_4:
			case Player.c_animations.RAID_APPEAR_5:
			case Player.c_animations.RAID_APPEAR_6:
			case Player.c_animations.RAID_APPEAR_7:
			case Player.c_animations.RAID_APPEAR_8:
			case Player.c_animations.RAID_APPEAR_9:
			{
				let appear_index = parseInt(motion.split('_')[2]);
				// get file to play
				let appear_cjs = animation.raid_appear[appear_index];
				// instantiate
				const appear = this.add_appear(appear_cjs);
				// get duration
				duration = this.get_animation_duration(appear[appear_cjs][appear_cjs]);
				// set as special
				this.m_special_cjs = appear;
				// add tween for this duration
				this.add_child_tween(appear, duration);
				// make character invisible
				cjs.visible = false;
				break;
			}
			default: // default behavior
			{
				// we just set the duration to the animation's
				duration = this.get_animation_duration(cjs[name + "_" + motion]);
				break;
			}
		};
		// update displayed animation name
		this.ui.set_motion(this.translate_motion(motion));
		// update displayed duration
		this.ui.set_duration(duration);
		
		// set listener for animation completion
		cjs.addEventListener("animationComplete", this.m_animation_completed_callback);
		// play animation
		if(![
				Player.c_animations.SUMMON_ATTACK,
				Player.c_animations.SUMMON_DAMAGE,
				Player.c_animations.RAID_APPEAR_0,
				Player.c_animations.RAID_APPEAR_1,
				Player.c_animations.RAID_APPEAR_2,
				Player.c_animations.RAID_APPEAR_3,
				Player.c_animations.RAID_APPEAR_4,
				Player.c_animations.RAID_APPEAR_5,
				Player.c_animations.RAID_APPEAR_6,
				Player.c_animations.RAID_APPEAR_7,
				Player.c_animations.RAID_APPEAR_8,
				Player.c_animations.RAID_APPEAR_9
				
			].includes(motion))
		{
			// the check is a hack to avoid character moving during summoning
			cjs.gotoAndPlay(motion);
		}
		// handle dispatch stack
		let flag = true;
		let index;
		for(index = 0; index < this.m_dispatch_stack.length; index++)
		{
			if(this.m_dispatch_stack[index] == 0)
			{
				this.m_dispatch_stack[index] = _.max(this.m_dispatch_stack) + 1
				flag = false
				break
			}
		}
		if(flag)
		{
			this.m_dispatch_stack[index] = _.max(this.m_dispatch_stack) + 1
		};
		
		// create main tween
		// all the tweens are merely used to keep track of the animation durations
		this.m_main_tween = createjs.Tween.get(this.m_stage, {
			useTicks: true,
			override: true,
			paused: this.m_paused
		}).wait(duration).call(function (p, index) {
			p.m_looping_index = index;
			if(p.m_looping)
				p.play_next(cjs);
		}, [this, index]);
	}
	
	// change which character to play animations from
	change_version(index, motion)
	{
		if(index == this.m_current_cjs) // same as current one, abort
			return;
		// check if it exists for upcoming version
		if(motion != "default" && !this.m_motion_lists[index].includes(motion))
			motion = "default";
		// terminate previous animation
		let previous_cjs = this.m_cjs[this.m_current_cjs];
		previous_cjs.dispatchEvent("animationComplete");
		// remove everything from the stage
		this.m_stage.removeAllChildren();
		this.m_special_cjs = null;
		this.m_tween_sources = [];
		this.m_child_tweens = [];
		// stop on going audios
		if(window.audio)
			window.audio.stop_all();
		// select new cjs and add to stage
		this.m_current_cjs = index;
		this.m_stage.addChild(this.m_cjs[this.m_current_cjs]);
		// update motion control
		this.ui.update_motion_control(this.m_motion_lists[this.m_current_cjs]);
		// set playlist
		if(motion == "default")
			this.m_current_motion_list = this.get_animations()[index].demo_motions;
		else
			this.m_current_motion_list = [motion];
		// update current motion (if needed)
		if(this.m_current_motion >= this.m_current_motion_list.length)
			this.m_current_motion = 0;
		// update main character main_hand
		this.update_main_hand_weapon();
		// play animation
		this.play(this.m_current_motion_list[this.m_current_motion]);
	}
	
	// called when a main tween is over to play the next animation
	play_next(cjs)
	{
		if(this.m_looping_index == null)
			return;
		if(this.m_dispatch_stack[this.m_looping_index] == _.max(this.m_dispatch_stack))
		{
			this.m_dispatch_stack[this.m_looping_index] = 0;
			cjs.dispatchEvent("animationComplete");
		}
		else
		{
			this.m_dispatch_stack[this.m_looping_index] = 0;
			if(!this.m_looping) // if not looping, we fire
				cjs.dispatchEvent("animationComplete");
		}
	}
	
	// called when the animation is completed
	animation_completed(event)
	{
		// clean up listener
		event.target.removeEventListener("animationComplete", this.m_animation_completed_callback);
		// if there is a special
		if(this.m_special_cjs != null) // clean up
		{
			this.m_stage.removeChild(this.m_special_cjs);
			this.m_special_cjs = null;
		}
		// increase motion index
		this.m_current_motion++;
		if(this.m_current_motion >= this.m_current_motion_list.length)
			this.m_current_motion = 0;
		// play next motion
		this.play(this.m_current_motion_list[this.m_current_motion]);
	}
	
	// update the main hand texture
	update_main_hand_weapon()
	{
		for(const [name, alt] of [["weapon", "weapon_version_"], ["weapon_l", "weapon_version_l_"], ["weapon_r", "weapon_version_r_"], ["weapon2a", "weapon_version_2a_"], ["weapon2b", "weapon_version_2b_"], ["familiar", "familiar_version_"], ["shield", "shield_version_"]])
		{
			if(name in this.m_texture_state)
			{
				if(this.m_current_cjs == 0)
				{
					this.m_texture_state[name].version == null;
					if(this.m_texture_state[name].swap == null)
						images[name].src = this.m_texture_state[name].ori;
					else
						images[name].src = this.m_texture_state[name].swap.url;
				}
				else if(alt + this.m_current_cjs in this.m_texture_state)
				{
					
					this.m_texture_state[name].version = alt + this.m_current_cjs;
					if(this.m_texture_state[this.m_texture_state[name].version].swap == null)
						images[name].src = this.m_texture_state[this.m_texture_state[name].version].ori;
					else
						images[name].src = this.m_texture_state[this.m_texture_state[name].version].swap.url;
				}
			}
		}
	}
	
	// set a texture for a particular element
	set_texture(name, blob)
	{
		if(this.m_texture_state[name].swap != null)
		{
			URL.revokeObjectURL(this.m_texture_state[name].swap.url);
		}
		else
		{
			this.m_texture_state[name].swap = {
				blob: null,
				url : null
			}
		}
		this.m_texture_state[name].swap.blob = blob;
		this.m_texture_state[name].swap.url = URL.createObjectURL(this.m_texture_state[name].swap.blob);
		images[name].src = this.m_texture_state[name].swap.url;
		// update main hand if we updated ones of those
		if(["weapon", "weapon_l", "weapon_r", "weapon2a", "weapon2b", "familiar", "shield"].includes(name) || name.startsWith("weapon_version_") || name.startsWith("familiar_version_") || name.startsWith("shield_version"))
			this.update_main_hand_weapon();
	}
	
	// reset a texture to its original
	reset_texture(name)
	{
		if(this.m_texture_state[name].swap != null)
		{
			URL.revokeObjectURL(this.m_texture_state[name].swap.url);
			delete this.m_texture_state[name].swap.blob;
			this.m_texture_state[name].swap = null;
			if(this.m_texture_state[name].version != null)
			{
				images[name].src = this.m_texture_state[this.m_texture_state[name].version].ori;
			}
			else
			{
				images[name].src = this.m_texture_state[name].ori;
			}
			return true;
		}
		else
		{
			return false;
		}
	}
	
	// read the list of animation from each instance and store it in m_motion_lists
	set_motion_lists()
	{
		let new_lists = [];
		for(let i = 0; i < this.m_cjs.length; ++i)
		{
			const animation = this.m_animations[i];
			let cjs = this.m_cjs[i];
			let motion_list = [];
			// special "hacky" exception for summons
			if(animation.summon != null)
			{
				// there are two types
				// attack + damage
				// and old ones
				if(animation.specials.length >= 1
					&& animation.specials[0].includes("_attack"))
				{
					// set list to character summon, summon atk and summon dmg
					motion_list = ["summon", "summon_atk", "summon_dmg"];
				}
				else
				{
					// set list to character summon and summon atk
					motion_list = ["summon", "summon_atk"];
				}
			}
			else // normal way
			{
				let unsorted_motions = [];
				for(const motion in cjs[cjs.name]) // iterate over all keys
				{
					// a motion always start with the file name
					let motion_str = motion.toString();
					if(motion_str.startsWith(cjs.name))
					{
						// hack to disable ougi options on mc beside mortal_B
						if(animation.is_main_character
							&& motion_str.includes("mortal")
							&& (
								(
									animation.weapon == null
								&& !motion_str.endsWith("_mortal_B")
								) ||
								(
									animation.weapon != null
								&&  ["_1", "_2"].includes(motion_str.slice(-2))
								)
							)
						)
							continue;
						// remove the file name part
						motion_str = motion_str.substr(cjs.name.length + 1);
						// add to list
						unsorted_motions.push(motion_str);
					}
				}
				// add appear animation
				if(animation.is_enemy)
				{
					for(let i = 0; i < animation.raid_appear.length; ++i)
					{
						unsorted_motions.push("raid_appear_" + i);
					}
				}
				// create a table of translate name and motion
				let table = {};
				for(const m of unsorted_motions)
				{
					table[this.translate_motion(m)] = m;
				}
				// get a list of sorted translated name
				const keys = Object.keys(table).sort();
				// build motion list according to sorted order
				for(const k of keys)
				{
					motion_list.push(table[k]);
				}
			}
			// append list to motion list
			new_lists.push(motion_list);
		}
		// update m_motion_lists
		this.m_motion_lists = new_lists;
	}
	
	// translate animation to more humanly readable names.
	// Unofficial/Made up and Non exhaustive.
	translate_motion(motion)
	{
		switch(motion)
		{
			// specials
			case Player.c_animations.SUMMON_ATTACK: return "Summon Call";
			case Player.c_animations.SUMMON_DAMAGE: return "Summon Damage";
			case Player.c_animations.RAID_APPEAR_0: return "Appear";
			case Player.c_animations.RAID_APPEAR_1: return "Appear A";
			case Player.c_animations.RAID_APPEAR_2: return "Appear B";
			case Player.c_animations.RAID_APPEAR_3: return "Appear C";
			case Player.c_animations.RAID_APPEAR_4: return "Appear D";
			case Player.c_animations.RAID_APPEAR_5: return "Appear E";
			case Player.c_animations.RAID_APPEAR_6: return "Appear F";
			case Player.c_animations.RAID_APPEAR_7: return "Appear G";
			case Player.c_animations.RAID_APPEAR_8: return "Appear H";
			case Player.c_animations.RAID_APPEAR_9: return "Appear I";
			// game
			case Player.c_animations.WAIT: return "Idle";
			case Player.c_animations.WAIT_2: return "Idle (Overdrive)";
			case Player.c_animations.WAIT_3: return "Idle (Break)";
			case Player.c_animations.TO_STB_WAIT: return "Weapon Drew";
			case Player.c_animations.STB_WAIT: return "Wpn. Drew (Idle)";
			case Player.c_animations.STB_WAIT_ADV: return "Wpn. Drew (Idle)(Adv)";
			case Player.c_animations.CHARA_SELECT: return "Selection";
			case Player.c_animations.CHARA_IN: return "Fade In";
			case Player.c_animations.CHARA_OUT: return "Fade Out";
			case Player.c_animations.CHARGE: return "Charged";
			case Player.c_animations.ABILITY: return "C.A. Charged";
			case Player.c_animations.ABILITY_WAIT: return "Skill (Wait)";
			case Player.c_animations.MORTAL: return "Charge Attack";
			case Player.c_animations.MORTAL_A: return "Charge Attack A";
			case Player.c_animations.MORTAL_A_1: return "Charge Attack A1";
			case Player.c_animations.MORTAL_A_2: return "Charge Attack A2";
			case Player.c_animations.MORTAL_B: return "Charge Attack B";
			case Player.c_animations.MORTAL_B_1: return "Charge Attack B1";
			case Player.c_animations.MORTAL_B_2: return "Charge Attack B2";
			case Player.c_animations.MORTAL_C: return "Charge Attack C";
			case Player.c_animations.MORTAL_C_1: return "Charge Attack C1";
			case Player.c_animations.MORTAL_C_2: return "Charge Attack C2";
			case Player.c_animations.MORTAL_D: return "Charge Attack D";
			case Player.c_animations.MORTAL_D_1: return "Charge Attack D1";
			case Player.c_animations.MORTAL_D_2: return "Charge Attack D2";
			case Player.c_animations.MORTAL_E: return "Charge Attack E";
			case Player.c_animations.MORTAL_E_1: return "Charge Attack E1";
			case Player.c_animations.MORTAL_E_2: return "Charge Attack E2";
			case Player.c_animations.MORTAL_F: return "Charge Attack F";
			case Player.c_animations.MORTAL_F_1: return "Charge Attack F1";
			case Player.c_animations.MORTAL_F_2: return "Charge Attack F2";
			case Player.c_animations.MORTAL_G: return "Charge Attack G";
			case Player.c_animations.MORTAL_G_1: return "Charge Attack G1";
			case Player.c_animations.MORTAL_G_2: return "Charge Attack G2";
			case Player.c_animations.MORTAL_H: return "Charge Attack H";
			case Player.c_animations.MORTAL_H_1: return "Charge Attack H1";
			case Player.c_animations.MORTAL_H_2: return "Charge Attack H2";
			case Player.c_animations.MORTAL_I: return "Charge Attack I";
			case Player.c_animations.MORTAL_I_1: return "Charge Attack I1";
			case Player.c_animations.MORTAL_I_2: return "Charge Attack I2";
			case Player.c_animations.MORTAL_J: return "Charge Attack J";
			case Player.c_animations.MORTAL_J_1: return "Charge Attack J1";
			case Player.c_animations.MORTAL_J_2: return "Charge Attack J2";
			case Player.c_animations.MORTAL_K: return "Charge Attack K";
			case Player.c_animations.MORTAL_K_1: return "Charge Attack K1";
			case Player.c_animations.MORTAL_K_2: return "Charge Attack K2";
			case Player.c_animations.ATTACK: return "Attack";
			case Player.c_animations.ATTACK_SHORT: return "Attack 1";
			case Player.c_animations.ATTACK_SHORT_ADV: return "Attack 1 (Adv)";
			case Player.c_animations.ATTACK_DOUBLE: return "Attack 2";
			case Player.c_animations.ATTACK_TRIPLE: return "Attack 3";
			case Player.c_animations.ATTACK_QUADRUPLE: return "Attack 4";
			case Player.c_animations.SPECIAL_ATTACK: return "Attack B (Alt/OD)";
			case Player.c_animations.ENEMY_ATTACK: return "Attack C (Break)";
			case Player.c_animations.CHANGE: return "Change Form";
			case Player.c_animations.CHANGE_TO: return "Change Form 1";
			case Player.c_animations.CHANGE_FROM: return "Change Form 2";
			case Player.c_animations.CHANGE_TO_2: return "Change Form 3";
			case Player.c_animations.CHANGE_FROM_2: return "Change Form 4";
			case Player.c_animations.DEAD: return "Dead";
			case Player.c_animations.DEAD_1: return "Dead 1";
			case Player.c_animations.DEAD_2: return "Dead 2";
			case Player.c_animations.DAMAGE: return "Damaged";
			case Player.c_animations.DAMAGE_1: return "Damaged A";
			case Player.c_animations.DAMAGE_2: return "Damaged B (OD)";
			case Player.c_animations.DAMAGE_3: return "Damaged C (Break)";
			case Player.c_animations.DAMAGE_4: return "Damaged D";
			case Player.c_animations.DAMAGE_5: return "Damaged E";
			case Player.c_animations.WIN: return "Win";
			case Player.c_animations.WIN1: return "Win 1";
			case Player.c_animations.WIN2: return "Win 2";
			case Player.c_animations.WIN_1: return "Win Alt. 1";
			case Player.c_animations.WIN_2: return "Win Alt. 2";
			case Player.c_animations.WIN_3: return "Win Alt. 3";
			case Player.c_animations.INVISIBLE: return "Invisible";
			case Player.c_animations.HIDE: return "Hide";
			case Player.c_animations.DOWN: return "Low HP";
			case Player.c_animations.WAIT_SPECIAL: return "Idle (Spe)";
			case Player.c_animations.WAIT_SPECIAL_1: return "Idle (Spe) A";
			case Player.c_animations.WAIT_SPECIAL_2: return "Idle (Spe) B";
			case Player.c_animations.WAIT_SPECIAL_3: return "Idle (Spe) C";
			case Player.c_animations.WAIT_SPECIAL_4: return "Idle (Spe) D";
			case Player.c_animations.WAIT_SPECIAL_5: return "Idle (Spe) E";
			case Player.c_animations.MISS:  return "Miss";
			case Player.c_animations.SUMMON: return "Summoning";
			case Player.c_animations.ABILITY_MOTION_OLD: return "Miss (Old)";
			case Player.c_animations.ABILITY_MOTION: return "Skill A";
			case Player.c_animations.ABILITY_MOTION_2: return "Skill B";
			case Player.c_animations.ABILITY_MOTION_3: return "Skill C";
			case Player.c_animations.ABILITY_MOTION_4: return "Skill D";
			case Player.c_animations.VS_MOTION_1: return "Custom Skill A";
			case Player.c_animations.VS_MOTION_2: return "Custom Skill B";
			case Player.c_animations.VS_MOTION_3: return "Custom Skill C";
			case Player.c_animations.VS_MOTION_4: return "Custom Skill D";
			case Player.c_animations.VS_MOTION_5: return "Custom Skill E";
			case Player.c_animations.VS_MOTION_6: return "Custom Skill F";
			case Player.c_animations.ENEMY_PHASE_1: return "Phase 1 (Entry)";
			case Player.c_animations.ENEMY_PHASE_2: return "Phase 2 (OD)";
			case Player.c_animations.ENEMY_PHASE_3: return "Phase 3 (Break)";
			case Player.c_animations.ENEMY_PHASE_4: return "Phase 4";
			case Player.c_animations.ENEMY_PHASE_5: return "Phase 5";
			case Player.c_animations.ENEMY_FORM_CHANGE: return "Form Change";
			case Player.c_animations.ENEMY_STANDBY_A: return "Standby A";
			case Player.c_animations.ENEMY_STANDBY_B: return "Standby B";
			case Player.c_animations.ENEMY_STANDBY_C: return "Standby C";
			case Player.c_animations.ENEMY_STANDBY_D: return "Standby D";
			case Player.c_animations.ENEMY_BREAK_STANDBY_A: return "Standby A (Break)";
			case Player.c_animations.ENEMY_BREAK_STANDBY_B: return "Standby B (Break)";
			case Player.c_animations.ENEMY_BREAK_STANDBY_C: return "Standby C (Break)";
			case Player.c_animations.ENEMY_BREAK_STANDBY_D: return "Standby D (Break)";
			case Player.c_animations.ENEMY_DAMAGE_STANDBY_A: return "Standby A (Dmgd)";
			case Player.c_animations.ENEMY_DAMAGE_STANDBY_B: return "Standby B (Dmgd)";
			case Player.c_animations.ENEMY_DAMAGE_STANDBY_C: return "Standby C (Dmgd)";
			case Player.c_animations.ENEMY_DAMAGE_STANDBY_D: return "Standby D (Dmgd)";
			case Player.c_animations.LINK_PHASE_1: return "Phase 1 (Entry)(Lk)";
			case Player.c_animations.LINK_PHASE_1_2: return "Phase 1B (Entry)(Lk)";
			case Player.c_animations.LINK_PHASE_1_F2: return "Phase 1C (Entry)(Lk)";
			case Player.c_animations.LINK_PHASE_1_F2_2: return "Phase 1D (Entry)(Lk)";
			case Player.c_animations.LINK_PHASE_2: return "Phase 2 (OD)(Lk)";
			case Player.c_animations.LINK_PHASE_2_2: return "Phase 2B (OD)(Lk)";
			case Player.c_animations.LINK_PHASE_2_F2: return "Phase 2C (OD)(Lk)";
			case Player.c_animations.LINK_PHASE_2_F2_2: return "Phase 2D (OD)(Lk)";
			case Player.c_animations.LINK_PHASE_3: return "Phase 3 (Break)(Lk)";
			case Player.c_animations.LINK_PHASE_3_2: return "Phase 3B (Break)(Lk)";
			case Player.c_animations.LINK_PHASE_3_F2: return "Phase 3C (Break)(Lk)";
			case Player.c_animations.LINK_PHASE_3_F2_2: return "Phase 3D (Break)(Lk)";
			case Player.c_animations.LINK_PHASE_4: return "Phase 4 (Lk)";
			case Player.c_animations.LINK_PHASE_4_2: return "Phase 4B (Lk)";
			case Player.c_animations.LINK_PHASE_4_F2: return "Phase 4C (Lk)";
			case Player.c_animations.LINK_PHASE_4_F2_2: return "Phase 4D (Lk)";
			case Player.c_animations.LINK_PHASE_5: return "Phase 5 (Lk)";
			case Player.c_animations.LINK_PHASE_5_2: return "Phase 5B (Lk)";
			case Player.c_animations.LINK_PHASE_5_F2: return "Phase 5C (Lk)";
			case Player.c_animations.LINK_PHASE_5_F2_2: return "Phase 5D (Lk)";
			case Player.c_animations.LINK_DAMAGE: return "Damaged (Link)";
			case Player.c_animations.LINK_DAMAGE_2: return "Damaged 2 (Link)";
			case Player.c_animations.LINK_DEAD: return "Dead (Link)";
			case Player.c_animations.LINK_DEAD_1: return "Dead 1 (Link)";
			case Player.c_animations.LINK_DEAD_2: return "Dead 2 (Link)";
			case Player.c_animations.LINK_DEAD_3: return "Dead 3 (Link)";
			case Player.c_animations.LINK_DEAD_A: return "Dead 1B (Link)";
			case Player.c_animations.LINK_DEAD_B: return "Dead 2B (Link)";
			case Player.c_animations.LINK_DEAD_C: return "Dead 3B (Link)";
			case Player.c_animations.LINK_MORTAL_A: return "Charge Atk. A (Lk)";
			case Player.c_animations.LINK_MORTAL_A_2: return "Charge Atk. A2 (Lk)";
			case Player.c_animations.LINK_MORTAL_A_F2: return "Charge Atk. A3 (Lk)";
			case Player.c_animations.LINK_MORTAL_A_F2_2: return "Charge Atk. A4 (Lk)";
			case Player.c_animations.LINK_MORTAL_B: return "Charge Atk. B (Lk)";
			case Player.c_animations.LINK_MORTAL_B_2: return "Charge Atk. B2 (Lk)";
			case Player.c_animations.LINK_MORTAL_B_F2: return "Charge Atk. B3 (Lk)";
			case Player.c_animations.LINK_MORTAL_B_F2_2: return "Charge Atk. B4 (Lk)";
			case Player.c_animations.LINK_MORTAL_C: return "Charge Atk. C (Lk)";
			case Player.c_animations.LINK_MORTAL_C_2: return "Charge Atk. C2 (Lk)";
			case Player.c_animations.LINK_MORTAL_C_F2: return "Charge Atk. C3 (Lk)";
			case Player.c_animations.LINK_MORTAL_C_F2_2: return "Charge Atk. C4 (Lk)";
			case Player.c_animations.LINK_MORTAL_D: return "Charge Atk. D (Lk)";
			case Player.c_animations.LINK_MORTAL_D_2: return "Charge Atk. D2 (Lk)";
			case Player.c_animations.LINK_MORTAL_D_F2: return "Charge Atk. D3 (Lk)";
			case Player.c_animations.LINK_MORTAL_D_F2_2: return "Charge Atk. D4 (Lk)";
			case Player.c_animations.LINK_MORTAL_E: return "Charge Atk. E (Lk)";
			case Player.c_animations.LINK_MORTAL_E_2: return "Charge Atk. E2 (Lk)";
			case Player.c_animations.LINK_MORTAL_E_F2: return "Charge Atk. E3 (Lk)";
			case Player.c_animations.LINK_MORTAL_E_F2_2: return "Charge Atk. E4 (Lk)";
			case Player.c_animations.LINK_MORTAL_F: return "Charge Atk. F (Lk)";
			case Player.c_animations.LINK_MORTAL_F_2: return "Charge Atk. F2 (Lk)";
			case Player.c_animations.LINK_MORTAL_F_F2: return "Charge Atk. F3 (Lk)";
			case Player.c_animations.LINK_MORTAL_F_F2_2: return "Charge Atk. F4 (Lk)";
			case Player.c_animations.LINK_MORTAL_G: return "Charge Atk. G (Lk)";
			case Player.c_animations.LINK_MORTAL_G_2: return "Charge Atk. G2 (Lk)";
			case Player.c_animations.LINK_MORTAL_G_F2: return "Charge Atk. G3 (Lk)";
			case Player.c_animations.LINK_MORTAL_G_F2_2: return "Charge Atk. G4 (Lk)";
			case Player.c_animations.LINK_MORTAL_H: return "Charge Atk. H (Lk)";
			case Player.c_animations.LINK_MORTAL_H_2: return "Charge Atk. H2 (Lk)";
			case Player.c_animations.LINK_MORTAL_H_F2: return "Charge Atk. H3 (Lk)";
			case Player.c_animations.LINK_MORTAL_H_F2_2: return "Charge Atk. H4 (Lk)";
			case Player.c_animations.LINK_MORTAL_I: return "Charge Atk. I (Lk)";
			case Player.c_animations.LINK_MORTAL_I_2: return "Charge Atk. I2 (Lk)";
			case Player.c_animations.LINK_MORTAL_I_F2: return "Charge Atk. I3 (Lk)";
			case Player.c_animations.LINK_MORTAL_I_F2_2: return "Charge Atk. I4 (Lk)";
			case Player.c_animations.LINK_MORTAL_J: return "Charge Atk. J (Lk)";
			case Player.c_animations.LINK_MORTAL_J_2: return "Charge Atk. J2 (Lk)";
			case Player.c_animations.LINK_MORTAL_J_F2: return "Charge Atk. J3 (Lk)";
			case Player.c_animations.LINK_MORTAL_J_F2_2: return "Charge Atk. J4 (Lk)";
			case Player.c_animations.LINK_MORTAL_K: return "Charge Atk. K (Lk)";
			case Player.c_animations.LINK_MORTAL_K_2: return "Charge Atk. K2 (Lk)";
			case Player.c_animations.LINK_MORTAL_K_F2: return "Charge Atk. K3 (Lk)";
			case Player.c_animations.LINK_MORTAL_K_F2_2: return "Charge Atk. K4 (Lk)";
			case Player.c_animations.LINK_ATTACK: return "Attack (Link)";
			case Player.c_animations.LINK_ATTACK_2: return "Attack B (Link)";
			case Player.c_animations.LINK_ATTACK_F2: return "Attack C (Link)";
			case Player.c_animations.LINK_ATTACK_F2_2: return "Attack D (Link)";
			case Player.c_animations.LINK_FORM_CHANGE: return "Form Change (Link)";
			case Player.c_animations.LINK_FORM_CHANGE_2: return "Form Change 2 (Link)"
			case Player.c_animations.MY_PAGE: return "My Page"
			// Unknown name
			default: return "??? (" + motion + ")";
		};
	}
	
	// pause the player
	pause()
	{
		if(!this.m_paused)
		{
			this.m_paused = true;
			// remove tick
			createjs.Ticker.removeEventListener("tick", this.m_stage);
			// pause all tweens
			if(this.m_main_tween)
				this.m_main_tween.paused = true;
			for(let child of this.m_child_tweens)
				child.paused = true;
			this.ui.m_buttons.pause.classList.toggle("player-button-warning", true);
		}
	}
	
	// unpause the player
	resume()
	{
		if(this.m_paused)
		{
			this.m_paused = false;
			// add tick
			createjs.Ticker.addEventListener("tick", this.m_stage);
			// unpause all tweens
			if(this.m_main_tween)
				this.m_main_tween.paused = false;
			for(let child of this.m_child_tweens)
				child.paused = false;
			this.ui.m_buttons.pause.classList.toggle("player-button-warning", false);
		}
	}
	
	// reset the stage state
	reset()
	{
		// clean up extra animations
		for(let ex of this.m_tween_sources)
			this.m_stage.removeChild(ex);
		this.m_tween_sources = [];
		this.m_child_tweens = [];
		// update stage to apply
		this.m_stage.update();
		// stop playing audio
		if(window.audio)
			window.audio.stop_all();
		// set current motion to last one
		this.m_current_motion = this.m_current_motion_list.length - 1;
		// fire animation complete
		// it will do additional clean up and cycle the animation to the first one (0)
		this.m_cjs[this.m_current_cjs].children[0].dispatchEvent("animationComplete");
	}
	
	// play the animation until the next frame. Must be paused beforehand.
	next_frame()
	{
		if(this.m_tick_callback == null)
		{
			if(this.m_paused)
				this.resume();
			this.m_tick_callback = this.pause_next_tick.bind(this);
			createjs.Ticker.addEventListener("tick", this.m_tick_callback);
		}
	}
	
	// called at the next tick
	pause_next_tick()
	{
		this.pause(); // can't use this, use player instead
		createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
		this.m_tick_callback = null;
	}
	
	record()
	{
		try
		{
			if(this.m_tick_callback != null)
				return;
			// pause the player first
			this.pause();
			// detect the mimetype
			let mimetype = null;
			// list of format/codecs we are trying.
			for(let m of ["video/webm;codecs=vp8", "video/webm;codecs=h264", "video/webm", "video/mp4"])
			{
				if(MediaRecorder.isTypeSupported(m))
				{
					mimetype = m;
					break;
				}
			}
			// error check if no supported mimetype
			if(mimetype == null)
			{
				console.error("This feature isn't supported on your device/browser.");
				if(typeof push_popup !== "undefined")
					push_popup("This feature isn't supported on your device/browser.");
				return;
			}
			// set callback
			this.m_tick_callback = this.record_next_frame.bind(this);
			createjs.Ticker.addEventListener("tick", this.m_tick_callback);
			// restart current animation playlist
			this.reset();
			// container
			this.m_recording = {
				motions: new Set(), // will contain the list of motion already played
				position: -1, // the last played frame
				frames: 0, // the number of frames added to the recording
				canvas: null, // the canvas used for the recording
				ctx: null, // the canvas context
				stream: null, // the recording stream
				rec: null, // the media recorder instance
				chunks: [], // video chunks
				mimetype: mimetype, // the mimetype
				extension: mimetype.split(';')[0].split('/')[1], // the file extension
				use_background: this.ui.m_background.src.startsWith(window.location.origin), // true if we can use the background
				old_framerate: createjs.Ticker.framerate, // keep track of the framerate
				error: false // error flag
			};
			// reset the framerate to 30
			createjs.Ticker.framerate = 30;
			// create a canvas on which we'll draw
			this.m_recording.canvas = document.createElement("canvas");
			// the size is exactly the visible window
			this.m_recording.canvas.width = this.m_width;
			this.m_recording.canvas.height = this.m_height;
			// create the 2d context
			this.m_recording.ctx = this.m_recording.canvas.getContext("2d");
			// set to 0 fps to disable automatic capture
			this.m_recording.stream = this.m_recording.canvas.captureStream(0);
			// create and set media recorder
			this.m_recording.rec = new MediaRecorder(this.m_recording.stream, {mimeType: this.m_recording.mimetype, videoBitsPerSecond:50*1024*1024}); // 50mbps
			// set events
			this.m_recording.rec.ondataavailable = e => {
				// when new data is available
				if(e.data) // add data to chunks
					this.m_recording.chunks.push(e.data);
			}
			this.m_recording.rec.onstop = e => {
				// when recording is stopped
				if(!this.m_recording.error) // check if it's due to an error
				{
					// create blob from chunks and download it
					this.download_video(new Blob(this.m_recording.chunks, {type: this.m_recording.mimetype}), this.m_recording.extension);
				}
				this.m_recording = null;
			};
			// start (using 1s chunks)
			this.m_recording.rec.start(1);
			// note current position
			this.m_recording.position = this.m_main_tween.position;
			// update stage to apply the reset
			this.m_stage.update();
			// send popup to user
			if(typeof push_popup !== "undefined")
				push_popup("Generating the video, be patient...");
			// lock the controls
			this.ui.set_control_lock(true);
			// resume play
			this.resume()
		}
		catch(err) // error handling
		{
			// clean up
			createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
			this.m_tick_callback = null;
			if(this.m_recording)
			{
				createjs.Ticker.framerate = this.m_recording.old_framerate;
				this.m_recording.error = true;
				this.m_recording = null;
			}
			// pause
			this.pause();
			// unlock the controls in case they're locked
			this.ui.set_control_lock(false);
			// send error messages
			console.error("Exception thrown", err.stack);
			if(typeof push_popup !== "undefined")
				push_popup("An error occured. This feature might be unavailable on your device/browser.");
		}
	}
	
	record_next_frame()
	{
		try
		{
			let segment = "" + this.m_current_cjs + "#" + this.m_current_motion;
			// "segment" will be something like VERSION_INDEX#MOTION_INDEX
			// it's done this way to ensure we won't have weird overlaps
			
			// next we check if either:
			// - it's the very first frame (no motions seen and frames captured at 0)
			// - the frame has changed (if it did, this mean the animation progressed)
			// - if the current segment is stored in motions (if it's not, this means we haven't seen it yet)
			
			if(
				(this.m_recording.motions.length == 0 && this.m_recording.frames == 0)
				|| (this.m_recording.position != this.m_main_tween.position)
				|| (!this.m_recording.motions.has(segment))
			)
			{
				// update position
				this.m_recording.position = this.m_main_tween.position;
				// pause animation
				this.pause();
				// here we check if the animation is over
				// if the segment is already in motions, it means we have looped back
				// AND if the position is back to zero (meaning we just looped back to the start of another animation)
				// AND the frames captured is non null (meaning it's not the beginning)
				if(this.m_recording.motions.has(segment) && this.m_main_tween.position == 0 && this.m_recording.frames > 0)
				{
					// cleanup
					createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
					this.m_tick_callback = null;
					// add popup
					if(typeof push_popup !== "undefined")
						push_popup("Finalizing...");
					// We wait a bit before ending the this.m_recording
					// The delay is needed for to let MediaRecorder finishes what it's doing or frames might be missing
					const _player_ = this;
					setTimeout(function() {
							_player_.record_end();
						},
						2000
					);
					return; // exit here
				}
				// this.m_recording isn't over
				// add segment to motions
				this.m_recording.motions.add(segment);
				// clear our canvas
				// DON'T use clearRect, videos don't really support transparency
				/*if(alpha_video) // debug flag to emulate v8 and below behavior
				{
					this.m_recording.ctx.clearRect(0, 0, this.m_width,this.m_height);
				}
				else
				{
					if(this.m_recording.use_background) // if local background
					{
						this.m_recording.ctx.drawImage(this.ui.m_background, 0, 0, this.m_width, this.m_height);
					}
					else // else just fill it black
					{
						this.m_recording.ctx.rect(0, 0, this.m_width,this.m_height);
						this.m_recording.ctx.fillStyle = "black";
						this.m_recording.ctx.fill();
					}
				}*/
				// copy a crop of the player stage canvas to our canvas
				this.m_recording.ctx.drawImage(
					this.m_stage.canvas,
					(Player.c_canvas_size - this.m_width) / 2,
					(Player.c_canvas_size - this.m_height) / 2,
					this.m_width,
					this.m_height,
					0,
					0,
					this.m_width,
					this.m_height)
				;
				// request the frame to capture it
				this.m_recording.stream.getVideoTracks()[0].requestFrame();
				// increase our frame counter
				this.m_recording.frames++;
				// resume playing
				this.resume();
			}
		}
		catch(err) // error handling
		{
			// cleanup
			createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
			this.m_tick_callback = null;
			// reset framerate
			createjs.Ticker.framerate = this.m_recording.old_framerate;
			// stop everything
			this.m_recording.error = true;
			this.m_recording.rec.stop();
			// unlock controls
			this.ui.set_control_lock(false);
			// send error messages
			console.error("Exception thrown", err.stack);
			if(typeof push_popup !== "undefined")
				push_popup("An error occured. This feature might be unavailable on your device/browser.");
		}
	}
	
	// recording is over
	record_end()
	{
		// clean up
		createjs.Ticker.removeEventListener("tick", this.m_tick_callback);
		this.m_tick_callback = null;
		// reset framerate
		createjs.Ticker.framerate = this.m_recording.old_framerate;
		// unlock controls
		this.ui.set_control_lock(false);
		// stop the recording
		// it will fire the onstop event
		this.m_recording.rec.stop();
	}
	
	// called by the recording onstop event
	download_video(blob, extension)
	{
		// create an objectUrl from the blob
		let url = URL.createObjectURL(blob);
		// create a 'a' tag/link
		let link = document.createElement('a');
		link.href = url; // set url to our object url
		link.download = 'gbfap_' + Date.now() + '.' + extension; // and the file name
		// trigger the click to download
		link.click();
		// add popup
		if(typeof push_popup !== "undefined")
			push_popup("Video saved as " + link.download);
		// clean up object url
		URL.revokeObjectURL(url);
	}
};

// function to create the player instance and initialize the html and stage
function init_player(mode = PlayerLayoutMode.normal)
{
	if(player != null)
	{
		player.restart(mode);
	}
	else
	{
		player = new Player(mode);
		player.ui.set_html();
	}
	player.init_stage();
	player.load_settings();
}
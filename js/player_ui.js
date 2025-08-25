var frame_interval = null;

class PlayerUI
{
	constructor(parent)
	{
		// the player instance
		this.player = parent;
		// the top containers, canvas and background image
		this.m_html = document.getElementById("player-container");
		this.m_canvas_container = null;
		this.m_canvas = null;
		this.m_background = null;
		this.m_background_part = null;
		// the top 3 select
		this.m_version = null;
		this.m_motion = null;
		this.m_ability = null;
		// the 3 text display
		this.m_frame = null;
		this.m_motion_text = null;
		this.m_duration = null;
		// the sliders
		this.m_speed = null;
		this.m_speed_label = null;
		this.m_audio = null;
		this.m_audio_label = null;
		// the rest
		this.m_buttons = {};
		this.m_backgrounds = {};
		this.m_menus = {};
		this.m_debug = null;
		// others
		this.m_last_background_mode = null;
		setInterval(this.update_debug_infos.bind(this), 300);
	}
	
	reset()
	{
		// lock controls
		this.set_control_lock(true);
		// reset style
		this.m_version.parentNode.style.display = "none";
		this.m_motion.parentNode.style.display = "none";
		this.m_ability.parentNode.style.display = "none";
		this.m_buttons.enemy_position.style.display = "none";
		this.m_duration.parentNode.classList.toggle("player-button-warning", false);
		this.m_buttons.pause.classList.toggle("player-button-warning", false);
		// reset select
		this.m_version.value = "0";
		this.m_motion.value = "default";
		this.m_ability.value = "default";
		// reset texts
		this.m_motion_text.innerHTML = config.loading_html ? config.loading_html : "Loading";
		this.m_duration.innerText = "Downloading...";
		// reset background
		this.init_background_elements();
		// cleat the canvas
		this.m_canvas.getContext("2d").clearRect(0, 0, Player.c_canvas_size, Player.c_canvas_size);
	}
	
	
	set_html()
	{
		// check if html is already populated
		if(this.m_html.innerHTML.trim() != "")
			throw new Error("Element player-container is already populated.");
		// ref for callbacks
		const _player_ = this.player;
		const _ui_ = this;
		// create fragment
		let fragment = document.createDocumentFragment();
		// Canvas container
		this.m_canvas_container = add_to(fragment, "div", {id:"canvas-container"});
		// canvas
		this.m_canvas = add_to(this.m_canvas_container, "canvas", {id:"canvas-player"});
		this.m_canvas.width = Player.c_canvas_size; // canvas size default is part of Player
		this.m_canvas.height = Player.c_canvas_size;
		this.m_canvas.style.maxWidth = "" + Player.c_canvas_size + "px";
		this.m_canvas.style.maxHeight = "" + Player.c_canvas_size + "px";
		// background
		let bg = add_to(this.m_canvas_container, "div", {id:"canvas-bg"});
		this.m_background = add_to(bg, "img", {id:"background-image"});
		
		// player controls
		let controls = add_to(fragment, "div", {id:"player-controls"});
		// top part
		let top_part = add_to(controls, "div", {cls:["player-control-hpart"]});
		let part = add_to(top_part, "div", {cls:["player-control-vpart"]});
		// version control
		let span = add_to(part, "span", {cls:["player-control-span"]});
		span.style.display = "none";
		let label = add_to(span, "label", {cls:["player-control-label"]});
		label.htmlFor = "player-version-select";
		label.innerText = "Version";
		this.m_version = add_to(
			span,
			"select",
			{
				cls:["player-select"],
				id:"player-version-select"
			}
		);
		this.m_version.onchange = function() {
			_ui_.select_version();
		};
		this.m_version.onkeydown = function(event) {
			_ui_.ignore_alpha(event)
		};
		
		// motion control
		span = add_to(part, "span", {cls:["player-control-span"]});
		span.style.display = "none";
		label = add_to(span, "label", {cls:["player-control-label"]});
		label.htmlFor = "player-motion-select";
		label.innerText = "Motion";
		this.m_motion = add_to(
			span,
			"select",
			{
				cls:["player-select"],
				id:"player-motion-select"
			}
		);
		this.m_motion.onchange = function() {
			_ui_.select_motion();
		};
		this.m_motion.onkeydown = function(event) {
			_ui_.ignore_alpha(event)
		};
		
		// ability control
		span = add_to(part, "span", {cls:["player-control-span"]});
		// this button is added as part of the span
		this.m_buttons.ability_target = add_to(
			span,
			"button",
			{
				cls:["player-control-button"],
				title:"Change the position of Targeted Skills\n(Shortcut: S)",
				innerhtml:this.get_button_html("ability_target"),
				onclick:function() {
					_ui_.control_ability_toggle();
				}
			}
		);
		
		span.style.display = "none";
		label = add_to(span, "label", {cls:["player-control-label", "player-control-label-small"]}); // add player-control-label-small to reduce label size
		label.htmlFor = "player-ability-select";
		label.innerText = "Skill Effect";
		this.m_ability = add_to(
			span,
			"select",
			{
				cls:["player-select"],
				id:"player-ability-select"
			}
		);
		this.m_ability.onchange = function() {
			_ui_.select_ability();
		};
		this.m_ability.onkeydown = function(event) {
			_ui_.ignore_alpha(event)
		};
		
		// other displays
		part = add_to(top_part, "div", {cls:["player-control-vpart"]});
		span = add_to(part, "span", {cls:["player-control-hpart", "player-control-span"]});
		add_to(span, "span", {cls:["player-control-text"], innertext:"Loop Frame"});
		this.m_frame = add_to(
			span,
			"span",
			{cls:["player-control-text"], id:"player-control-frame"}
		);
		this.m_frame.innerText = "0";
		
		span = add_to(part, "span", {cls:["player-control-hpart", "player-control-span"]});
		add_to(span, "span", {cls:["player-control-text"], innertext:"Current"});
		this.m_motion_text = add_to(
			span,
			"span",
			{cls:["player-control-text"], id:"player-control-motion"}
		);
		this.m_motion_text.innerHTML = config.loading_html ? config.loading_html : "Loading";
		
		span = add_to(part, "span", {cls:["player-control-hpart", "player-control-span"]});
		add_to(span, "span", {cls:["player-control-text"], innertext:"Duration"});
		this.m_duration = add_to(
			span,
			"span",
			{cls:["player-control-text"], id:"player-control-duration"}
		);
		this.m_duration.innerText = "Downloading...";
		
		// other controls
		part = add_to(controls, "div", {cls:["player-control-part", "player-control-hpart"]});
		// speed slider
		span = add_to(part, "span", {cls:["player-control-hpart", "player-control-slider-container"]});
		this.m_buttons.reset = add_to(
			span,
			"button",
			{
				cls:["player-control-button"],
				title:"Reset the Speed to 100%\n(Shortcut: R)",
				innerhtml:this.get_button_html("reset"),
				onclick:function() {
					_ui_.control_speed_reset();
				}
			}
		);
		let sub_span = add_to(span, "span", {cls:["player-control-vpart", "player-control-sub-column"]});
		this.m_speed = add_to(sub_span, "input", {cls:["player-control-slider"], id:"player-control-speed"});
		this.m_speed.type = "range";
		this.m_speed.min = "10";
		this.m_speed.max = "300";
		this.m_speed.step = "5";
		this.m_speed.value = "100";
		this.m_speed.onmouseup = function() {
			_ui_.control_speed_update();
		};
		this.m_speed.ontouchend = function() { // mobile
			_ui_.control_speed_update();
		};
		this.m_speed_label = add_to(sub_span, "label", {cls:["player-control-label"]});
		this.m_speed_label.htmlFor = "player-control-speed";
		this.m_speed_label.innerText = "100% Speed";
		
		// volume slider
		span = add_to(part, "span", {cls:["player-control-hpart", "player-control-slider-container"]});
		this.m_buttons.sound = add_to(
			span,
			"button",
			{
				cls:["player-control-button", "player-button-warning"],
				title:"Toggle the Animation Audios\n(Shortcut: M)",
				innerhtml:this.get_button_html("sound"),
				onclick:function() {
					_ui_.control_audio_toggle();
				}
			}
		);
		
		sub_span = add_to(span, "span", {cls:["player-control-vpart", "player-control-sub-column"]});
		
		this.m_audio = add_to(sub_span, "input", {cls:["player-control-slider"], id:"player-control-audio"});
		this.m_audio.type = "range";
		this.m_audio.min = "0";
		this.m_audio.max = "100";
		this.m_audio.step = "1";
		this.m_audio.value = "50";
		this.m_audio.onmouseup = function() {
			_ui_.control_audio_update();
		};
		this.m_audio.ontouchend = function() { // mobile
			_ui_.control_audio_update();
		};
		this.m_audio_label = add_to(sub_span, "label", {cls:["player-control-label"]});
		this.m_audio_label.htmlFor = "player-control-audio";
		this.m_audio_label.innerText = "50% Audio";
		
		// control buttons
		part = add_to(controls, "div", {cls:["player-control-part"]});
		span = add_to(part, "span", {cls:["player-control-hpart", "player-control-button-container"]});
		
		this.m_buttons.pause = add_to(
			span,
			"button",
			{
				cls:["player-control-button"],
				title:"Toggle the Pause\n(Shortcut: Space)",
				innerhtml:this.get_button_html("pause"),
				onclick:function() {
					_ui_.control_pause_toggle();
				}
			}
		);
		
		this.m_buttons.frame = add_to(
			span,
			"button",
			{
				cls:["player-control-button"],
				title:"Frame Advance\n(Shortcut: F)",
				innerhtml:this.get_button_html("frame"),
				onclick:function() {
					_ui_.control_next_frame();
				}
			}
		);
		
		this.m_buttons.loop = add_to(
			span,
			"button",
			{
				cls:["player-control-button", "player-button-enabled"],
				title:"Toggle the Animation Loop\n(Shortcut: L)",
				innerhtml:this.get_button_html("loop"),
				onclick:function() {
					_ui_.control_loop_toggle();
				}
			}
		);
		
		this.m_buttons.beep = add_to(
			span,
			"button",
			{
				cls:["player-control-button"],
				title:"Mute the beep\n(Shortcut: Shift+M)",
				innerhtml:this.get_button_html("beep")
			}
		);
		if(typeof toggle_beep === "undefined") // toggle_beep is defined in GBFML
		{
			this.m_buttons.beep.style.display = "none"; // remove button if it doesn't exist
		}
		else
		{
			this.m_buttons.beep.onclick = function() {
				_ui_.control_beep_toggle();
			}
		}
		
		this.m_buttons.enemy_position = add_to(
			span,
			"button",
			{
				cls:["player-control-button"],
				title:"Shift the Enemy position\n(Shortcut: E)",
				innerhtml:this.get_button_html("enemy_position"),
				onclick:function() {
					_ui_.control_enemy_shift();
				}
			}
		);
		this.m_buttons.enemy_position.style.display = "none";
		
		this.m_buttons.bound_box = add_to(
			span,
			"button",
			{
				cls:["player-control-button"],
				title:"Toggle the Bounding boxes\n(Shortcut: B)",
				innerhtml:this.get_button_html("bound_box"),
				onclick:function() {
					_ui_.control_bound_toggle();
				}
			}
		);
		
		this.m_buttons.playlist = add_to(
			span,
			"button",
			{
				cls:["player-control-button"],
				title:"Open the Playlist menu\n(Shortcut: P)",
				innerhtml:this.get_button_html("playlist"),
				onclick:function() {
					_ui_.control_playlist_open();
				}
			}
		);
		
		this.m_buttons.texture = add_to(
			span,
			"button",
			{
				cls:["player-control-button"],
				title:"Open the Texture menu\n(Shortcut: T)",
				innerhtml:this.get_button_html("texture"),
				onclick:function() {
					_ui_.control_texture_open();
				}
			}
		);
		
		this.m_buttons.download = add_to(
			span,
			"button",
			{
				cls:["player-control-button"],
				title:"Download the Canvas\n(Shortcut: Shift+D)",
				innerhtml:this.get_button_html("download"),
				onclick:function() {
					_ui_.control_download();
				}
			}
		);
		
		this.m_buttons.record = add_to(
			span,
			"button",
			{
				cls:["player-control-button"],
				title:"Save the current playlist as a WEBM file\n(Shortcut: Shift+W)",
				innerhtml:this.get_button_html("record"),
				onclick:function() {
					_ui_.control_record();
				}
			}
		);
		// backgrounds
		this.m_background_part = add_to(controls, "div", {cls:["player-control-part"]});
		this.init_background_elements();
		
		// playlist menu
		this.m_menus.playlist = add_to(fragment, "div", {cls:["player-menu", "player-control-hpart"]});
		this.m_menus.playlist.style.display = "none";
		
		part = add_to(this.m_menus.playlist, "div", {cls:["player-control-vpart"]});
		add_to(part, "b", {innertext:"Playlist"});
		this.m_menus.playlist_list = add_to(part, "div", {cls:["player-scroll-list", "player-scroll-list-playlist"], innertext:"Playlist"});
		
		part = add_to(this.m_menus.playlist, "div", {cls:["player-control-vpart"]});
		this.m_menus.playlist_versions = add_to(part, "select", {cls:["player-select"]});
		this.m_menus.playlist_versions.onchange = function() {
			_ui_.playlist_update_motion();
		};
		
		this.m_menus.playlist_motions = add_to(part, "select", {cls:["player-select"]});
		add_to(
			part,
			"button",
			{
				cls:["player-menu-button"],
				innertext:"Add",
				onclick:function() {
					_ui_.playlist_add();
				}
			}
		);
		add_to(
			part,
			"button",
			{
				cls:["player-menu-button"],
				innertext:"Play",
				onclick:function() {
					_ui_.playlist_play();
				}
			}
		);
		add_to(
			part,
			"button",
			{
				cls:["player-menu-button"],
				innertext:"Close",
				onclick:function() {
					_ui_.playlist_close();
				}
			}
		);
		add_to(
			part,
			"button",
			{
				cls:["player-menu-button"],
				innertext:"Reset",
				onclick:function() {
					_ui_.playlist_reset();
				}
			}
		);
		
		// texture menu
		this.m_menus.texture = add_to(fragment, "div", {cls:["player-menu", "player-control-hpart"]});
		this.m_menus.texture.style.display = "none";
		part = add_to(this.m_menus.texture, "div", {cls:["player-control-vpart"]});
		this.m_menus.texture_list = add_to(part, "div", {cls:["player-control-vpart", "player-scroll-list", "player-scroll-list-texture"]});
		part = add_to(part, "div", {cls:["player-control-vpart"]});
		add_to(
			part,
			"button",
			{
				cls:["player-menu-button"],
				innertext:"Close",
				onclick:function() {
					_ui_.texture_close();
				}
			}
		);
		
		// init
		if(frame_interval == null)
		{
			setInterval(function() {
					_ui_.update_frame_counter();
				}, 
				30
			);
		}
		
		if(this.player.m_loading)
			this.set_control_lock(true);
		
		document.addEventListener("keydown", function(event){
			_ui_.space_key_fix(event);
		});
		document.addEventListener("keyup", function(event){
			_ui_.key_bind_handler(event);
		});
		
		// apply fragment next frame
		update_next_frame(function() {
			_player_.ui.m_html.innerHTML = "";
			_player_.ui.m_html.appendChild(fragment);
			_player_.ui.m_canvas_container.scrollIntoView();
			document.dispatchEvent(new Event("player-html-ready"));
		});
	}
	
	init_background_elements()
	{
		const _ui_ = this;
		if(this.player.m_layout_mode != this.m_last_background_mode)
		{
			let is_mypage = this.player.m_layout_mode == PlayerLayoutMode.mypage;
			// default background image
			if(is_mypage)
			{
				if("default_mypage_background" in config)
				{
					this.m_background.src = config.default_mypage_background;
					this.update_mypage_background_mask();
				}
			}
			else
			{
				if("default_background" in config)
					this.m_background.src = config.default_background;
			}
			// background buttons
			// available backgrounds are defined in config
			const background_config_key = is_mypage ? "mypage_backgrounds" : "backgrounds";
			const background_search_callback_mode = +is_mypage;
			if(background_config_key in config)
			{
				this.m_background_part.style.display = "";
				this.m_background_part.innerHTML = "";
				let span = add_to(this.m_background_part, "span", {cls:["player-control-hpart", "player-control-button-container"]});
				for(const [icon, target] of Object.entries(config[background_config_key]))
				{
					this.m_backgrounds[icon] = add_to(span, "button", {cls:["player-control-button"], innerhtml:icon});
					if(target == null) // the "search" button
					{
						// open_background_search must be defined in your own code
						if(typeof open_background_search !== "undefined")
							this.m_backgrounds[icon].onclick = function() {
								// pause player
								_ui_.player.pause();
								// use callback
								open_background_search(background_search_callback_mode);
							};
						else // else button won't show
							this.m_backgrounds[icon].style.display = "none";
					}
					else if(target.startsWith("./")) // local files
					{
						this.m_backgrounds[icon].onclick = function() {
							_ui_.set_background(target);
						};
					}
					else // remote files
					{
						this.m_backgrounds[icon].onclick = function() {
							_ui_.set_background(Game.bgUri + "/" + target);
						};
					}
				}
			}
			else
			{
				this.m_background_part.style.display = "none";
			}
			this.m_last_background_mode = this.player.m_layout_mode;
		}
	}
	
	// set the background image
	set_background(url)
	{
		this.m_background.src = url;
		this.update_mypage_background_mask();
		this.player.save_settings();
	}
	
	// to emulate the white mask over the mypage town images
	update_mypage_background_mask()
	{
		if(this.player.m_layout_mode == PlayerLayoutMode.mypage && (config.mypage_background_allow_mask ?? true))
		{
			this.m_background.classList.toggle("background-mypage-mask", !this.m_background.src.includes("assets/backgrounds"));
		}
	}
	
	// set the canvas container size (the visible window)
	set_canvas_container_size(w, h)
	{
		this.m_canvas_container.style.minWidth = "" + w + "px";
		this.m_canvas_container.style.minHeight = "" + h + "px";
		this.m_canvas_container.style.maxWidth = "" + w + "px";
		this.m_canvas_container.style.maxHeight = "" + h + "px";
		// purely for any css styling
		this.m_html.classList.toggle("player-container-normal", this.player.m_layout_mode != PlayerLayoutMode.mypage);
		this.m_html.classList.toggle("player-container-mypage", this.player.m_layout_mode == PlayerLayoutMode.mypage); 
	}
	
	// set the loading progress in the duration text element
	set_loading_progress(count, total)
	{
		this.m_duration.innerText = "" + count + " / " + total;
	}
	
	// to indicate the player is in an error start
	set_error(count, total)
	{
		this.m_duration.innerText = "ERROR";
		this.m_duration.parentNode.classList.toggle("player-button-warning", true);
	}
	
	// clear the loading state in the motion text element
	clear_loading_progress()
	{
		this.m_motion_text.innerHTML = "";
	}
	
	// set the current motion text
	set_motion(motion)
	{
		if(motion != this.m_motion_text.innerText)
			this.m_motion_text.innerText = motion;
	}
	
	// set the duration text, duration is in frames
	set_duration(duration)
	{
		const duration_text = isNaN(duration) ? "???" : (duration / 30).toFixed(2) + "s";
		if(duration_text != this.m_duration.innerText)
			this.m_duration.innerText = duration_text;
	}
	
	// set the content of the version select
	set_version()
	{
		this.m_version.innerHTML = "";
		for(let i = 0; i < this.player.get_animations().length; ++i)
		{
			let option = add_to(this.m_version, "option");
			option.value = ""+i;
			option.innerHTML = this.player.get_animations()[i].name;
		}
		// don't display if only one version available
		if(this.player.get_animations().length <= 1)
			this.m_version.parentNode.style.display = "none";
		else
			this.m_version.parentNode.style.display = "";
	}
	
	// set the content of the motion select
	update_motion_control(motion_list)
	{
		if(motion_list.length <= 1) // don't display and do anything if only one motion
		{
			this.m_motion.parentNode.style.display = "none";
		}
		else
		{
			let current = this.m_motion.value;
			this.m_motion.parentNode.style.display = "";
			this.m_motion.innerHTML = "";
			
			let found_previous = false; // flag if previous setting exist in new list
			
			// add Demo option
			let opt = add_to(this.m_motion, "option");
			opt.value = "default";
			opt.innerText = "Demo";
			if(current == "default")
			{
				opt.selected = true;
				found_previous = true;
			}
			// add motions
			for(const i in motion_list)
			{
				opt = add_to(this.m_motion, "option");
				opt.value = "" + motion_list[i];
				opt.innerText = this.player.translate_motion(motion_list[i]);
				if(opt.value == current)
				{
					opt.selected = true;
					found_previous = true;
				}
			}
			// if not found, select the first one (Demo)
			if(!found_previous)
				this.m_motion.options[0].selected = true;
		}
	}
	
	// set the content of the ability select
	update_ability_control(abilities)
	{
		if(abilities.length == 0) // don't display if no skill
		{
			this.m_ability.parentNode.style.display = "none";
		}
		else
		{
			this.m_ability.parentNode.style.display = "";
			this.m_ability.innerHTML = "";
			// add None option
			let opt = add_to(this.m_ability, "option");
			opt.value = "default";
			opt.innerText = "None";
			opt.selected = true;
			// add Cycle option
			opt = add_to(this.m_ability, "option");
			opt.value = "cycle";
			opt.innerText = "Cycle";
			// add others
			for(const i in abilities)
			{
				let split_ab = abilities[i].split("_");
				opt = add_to(this.m_ability, "option");
				opt.value = ""+i;
				if(abilities[i].includes("_all_"))
					opt.innerText = "AOE " + split_ab[split_ab.length - 1];
				else
					opt.innerText = "Targeted " + split_ab[split_ab.length - 1];
			}
		}
	}
	
	// update the display of the enemy shift button
	update_enemy_control(is_enemy)
	{
		if(is_enemy)
			this.m_buttons.enemy_position.style.display = "";
		else
			this.m_buttons.enemy_position.style.display = "none";
	}
	
	// get the innerhtml of a button based on given key found in config
	get_button_html(txt)
	{
		if("buttons" in config)
		{
			if(txt in config.buttons) // return text found in config
				return config.buttons[txt];
		}
		// if not found
		if(txt == "")
			return "?";
		// else return first letter, capitalized
		return txt.slice(0, 1).toUpperCase();
	}
	
	// m_version onchange callback
	select_version()
	{
		this.player.change_version(parseInt(this.m_version.value), this.m_motion.value);
		beep();
	}
	
	// m_motion onchange callback
	select_motion()
	{
		// stop on going audios
		if(window.audio)
			window.audio.stop_all();
		let motion = this.m_motion.value;
		if(motion == "default")
			this.player.m_current_motion_list = this.player.get_animations()[this.player.m_current_cjs].demo_motions;
		else
			this.player.m_current_motion_list = [motion];
		this.player.get_current_animation_cjs().cjs.children[0].dispatchEvent("animationComplete");
		beep();
	}
	
	// m_ability onchange callback
	select_ability()
	{
		// stop on going audios
		if(window.audio)
			window.audio.stop_all();
		let index = this.m_ability.value;
		switch(index)
		{
			case "default":
				this.player.m_ability_mode = 0;
				break;
			case "cycle":
				this.player.m_ability_mode = 1;
				break;
			default:
				this.player.m_ability_index = parseInt(index);
				this.player.m_ability_mode = 2;
				break;
		};
		beep();
	}
	
	// reset button
	control_speed_reset()
	{
		// reset to default 100
		this.m_speed.value = "100";
		this.control_speed_update();
		beep();
	}
	
	// speed slider onmouseup/ontouchend event
	control_speed_update()
	{
		// set value
		this.player.m_speed = parseFloat(this.m_speed.value) / 100.0;
		// apply value to audio and player framerate
		if(window.audio)
			window.audio.set_playback_speed(this.player.m_speed);
		createjs.Ticker.framerate = 30 * this.player.m_speed;
		// update label
		this.m_speed_label.innerText = this.m_speed.value + "% Speed";
	}
	
	// audio toggle button
	control_audio_toggle()
	{
		this.player.m_audio_enabled = !this.player.m_audio_enabled;
		if(window.audio)
			window.audio.update_mute();
		this.m_buttons.sound.classList.toggle("player-button-enabled", this.player.m_audio_enabled);
		this.m_buttons.sound.classList.toggle("player-button-warning", !this.player.m_audio_enabled);
		this.player.save_settings();
		beep();
	}
	
	// volume slider onmouseup/ontouchend event
	control_audio_update()
	{
		if(window.audio)
		{
			// set volume
			window.audio.set_master_volume(parseFloat(this.m_audio.value) / 100.0);
			// update label
			this.m_audio_label.innerText = this.m_audio.value + "% Audio";
			this.player.save_settings();
		}
	}
	
	// pause button
	control_pause_toggle()
	{
		if(this.player.m_paused)
			this.player.resume();
		else
			this.player.pause();
		this.m_buttons.pause.classList.toggle("player-button-warning", this.player.m_paused);
		beep();
	}
	
	// frame advance button
	control_next_frame()
	{
		this.player.next_frame();
		this.m_buttons.pause.classList.toggle("player-button-warning", this.player.m_paused);
		beep();
	}
	
	// loop toggle button
	control_loop_toggle()
	{
		this.player.m_looping = !this.player.m_looping;
		if(this.player.m_looping)
		{
			let cjs = this.player.get_current_animation_cjs().cjs;
			this.player.play_next(cjs[cjs.name]);
		}
		this.m_buttons.loop.classList.toggle("player-button-enabled", this.player.m_looping);
		beep();
	}
	
	// beep toggle button
	control_beep_toggle()
	{
		toggle_beep();
		this.m_buttons.beep.classList.toggle("player-button-warning", !beep_enabled);
		this.player.save_settings();
		beep();
	}
	
	// ability position toggle button
	control_ability_toggle()
	{
		this.player.m_ability_target = !this.player.m_ability_target;
		this.m_buttons.ability_target.classList.toggle("player-button-enabled", this.player.m_ability_target);
		beep();
	}
	
	// enemy shift toggle
	control_enemy_shift()
	{
		this.player.enemy_shift_toggle();
		this.m_buttons.enemy_position.classList.toggle("player-button-enabled", this.player.m_enemy_shift);
		beep();
	}
	
	// update displayed frame counter
	update_frame_counter()
	{
		let txt;
		if(this.player.m_loading)
		{
			txt = "0"; // default to 0 during loading
		}
		else
		{
			if(this.player.m_looping)
				txt = "" + this.player.m_main_tween.position; // show frame
			else
				txt = "Loop paused";
		}
		// if the text changed, apply it
		if(txt != this.m_frame.innerText)
			this.m_frame.innerText = txt;
	}
	
	// set playlist menu version select
	set_playlist_versions()
	{
		this.m_menus.playlist_versions.innerHTML = "";
		if(this.player.get_animations().length <= 1)
		{
			this.m_menus.playlist_versions.style.display = "none";
		}
		// iterate over all animation datas
		for(let i in this.player.get_animations())
		{
			// set an option for each version
			let opt = add_to(this.m_menus.playlist_versions, "option");
			opt.value = i;
			opt.innerText = this.player.get_animations()[i].name;
			opt.selected = i == this.player.m_current_cjs;
		}
	}
	
	// open the playlist menu
	control_playlist_open()
	{
		// remove display "none"
		this.m_menus.playlist.style.display = "";
		// update motion list (if needed)
		this.playlist_update_motion();
		// update displayed playlist
		this.playlist_update_menu();
		// lock controls
		this.set_control_lock(true);
		beep();
	}
	
	// update the playlist menu motion select
	playlist_update_motion()
	{
		// get motions of selected version
		let motions = this.player.m_motion_lists[parseInt(this.m_menus.playlist_versions.value)];
		// update the selection
		this.m_menus.playlist_motions.innerHTML = "";
		for(let i in motions)
		{
			let opt = add_to(this.m_menus.playlist_motions, "option");
			opt.value = motions[i];
			opt.innerText = this.player.translate_motion(motions[i]);
		}
	}
	
	// update the left part of the playlist menu
	// the actual on-going playlist
	playlist_update_menu()
	{
		const _ui_ = this;
		var fragment = document.createDocumentFragment(); // use a fragment to make it clean
		let has_multi_versions = this.player.get_animations().length > 1;
		// loop over the content of m_playlist
		// m_playlist entries are [VERSION_INDEX, MOTION_NAME_STRING]
		for(let i = 0; i < this.player.m_playlist.length; ++i)
		{
			const ci = i;
			let span = add_to(fragment, "span", {cls:["player-control-hpart"]});
			// add delete button
			add_to(span, "button", {cls:["player-control-button"], innerhtml:this.get_button_html("delete"), onclick:function() {
				_ui_.playlist_del(ci);
			}});
			// add text
			span.appendChild(document.createTextNode(
				has_multi_versions
				? (
					this.player.get_animations()[this.player.m_playlist[i][0]].name // version name
					+ " - " +
					this.player.translate_motion(this.player.m_playlist[i][1]) // translated motion name
				) : this.player.translate_motion(this.player.m_playlist[i][1])
			));
			// note: we don't display the version name is there is only one version
		}
		// add it next frame
		update_next_frame(function() {
			_ui_.m_menus.playlist_list.innerHTML = "";
			_ui_.m_menus.playlist_list.appendChild(fragment);
		});
	}
	
	// playlist menu "play" button
	playlist_play()
	{
		// check if playlist is empty
		if(this.player.m_playlist.length == 0) // can't remove
		{
			if(typeof push_popup !== "undefined")
				push_popup("The playlist is empty.");
			return
		}
		// not empty
		let last_version = null; // last character version encountered
		this.player.m_current_motion_list = []; // clear m_current_motion_list
		for(const [version, motion] of this.player.m_playlist)
		{
			if(version != last_version) // if current version different from last version
			{
				// append special switch_version instruction
				this.player.m_current_motion_list.push("switch_version_" + version);
				last_version = version; // update last version
			}
			// append the motion
			this.player.m_current_motion_list.push(motion);
		}
		// send message
		if(typeof push_popup !== "undefined")
			push_popup("Your selection will now play.");
		// close menu
		this.playlist_close();
		// call player reset to go back to the start of the playlist
		this.player.reset();
		// unpause if needed
		this.player.resume();
		beep();
	}
	
	// playlist menu add button
	playlist_add()
	{
		if(this.player.m_playlist.length >= 50) // limit to 50 steps
		{
			if(typeof push_popup !== "undefined")
				push_popup("You can't add more motions.");
		}
		else
		{
			// append character version and motion
			this.player.m_playlist.push(
				[
					parseInt(this.m_menus.playlist_versions.value),
					this.m_menus.playlist_motions.value
				]
			);
			// update displayed playlist
			this.playlist_update_menu();
		}
		beep();
	}
	
	// playlist menu del buttons
	playlist_del(i)
	{
		// remove entry
		this.player.m_playlist.splice(i, 1);
		// update menu
		this.playlist_update_menu();
		beep();
	}
	
	// playlist menu reset button
	playlist_reset()
	{
		// reset playlist to current version demo animations
		const version = this.player.m_current_cjs;
		const motions = this.player.get_animations()[version].demo_motions;
		this.player.m_playlist = [];
		for(let i = 0; i < motions.length; ++i)
		{
			this.player.m_playlist.push([0, motions[i]]);
		}
		// update displayed playlist
		this.playlist_update_menu();
		beep();
	}
	
	// playlist menu close button
	playlist_close()
	{
		// hide menu
		this.m_menus.playlist.style.display = "none";
		// unlock control
		this.set_control_lock(false);
		beep();
	}
	
	// bounding box toggle button
	control_bound_toggle()
	{
		bounding_box_state = !bounding_box_state;
		this.m_buttons.bound_box.classList.toggle("player-button-enabled", bounding_box_state);
		beep();
	}
	
	// download button
	control_download()
	{
		// pause the player
		this.player.pause()
		try
		{
			// convert stage canvas to blob
			this.player.m_stage.canvas.toBlob((blob) => {
				// create object url
				const url = URL.createObjectURL(blob);
				// create link
				let link = document.createElement('a');
				link.href = url;
				link.download = 'gbfap_' + Date.now() + '.png';
				// click it
				link.click();
				// clean object url
				URL.revokeObjectURL(url);
				// send message
				if(typeof push_popup !== "undefined")
					push_popup("Image saved as " + link.download);
			}, "image/png");
		}
		catch(err) // error handling
		{
			console.error("Exception thrown", err.stack);
			if(typeof push_popup !== "undefined")
				push_popup("An error occured. This feature might be unavailable on your device/browser.");
		}
		this.m_buttons.pause.classList.toggle("player-button-warning", this.player.m_paused);
		beep();
	}
	
	// record button
	control_record()
	{
		this.player.record();
		this.m_buttons.pause.classList.toggle("player-button-warning", true);
		beep();
	}
	
	set_texture_list()
	{
		const _ui_ = this;
		// list all images in the cache and sort
		let keys = Object.keys(images);
		keys.sort();
		// list them in the menu
		let fragment = document.createDocumentFragment();
		for(const name of keys)
		{
			let span = add_to(fragment, "span", {cls:["player-control-hpart", "player-control-width"]});
			// generate a special name for the weapons
			let display_name = name;
			switch(name)
			{
				case "weapon":
				{
					display_name = "Weapon (" + this.player.m_animations[0].name + ")";
					break;
				}
				case "familiar":
				{
					display_name = "Manatura (" + this.player.m_animations[0].name + ")";
					break;
				}
				case "shield":
				{
					display_name = "Shield (" + this.player.m_animations[0].name + ")";
					break;
				}
				case "weapon_l":
				{
					display_name = "Weapon L (" + this.player.m_animations[0].name + ")";
					break;
				}
				case "weapon_r":
				{
					display_name = "Weapon R (" + this.player.m_animations[0].name + ")";
					break;
				}
				case "weapon2a":
				{
					display_name = "Weapon 2A (" + this.player.m_animations[0].name + ")";
					break;
				}
				case "weapon2b":
				{
					display_name = "Weapon 2B (" + this.player.m_animations[0].name + ")";
					break;
				}
				default:
				{
					if(name.startsWith("familiar_version_"))
					{
						let name_split = name.split("_");
						display_name = "Manatura (" + this.player.m_animations[parseInt(name_split[name_split.length - 1])].name + ")";
					}
					else if(name.startsWith("shield_version_"))
					{
						let name_split = name.split("_");
						display_name = "Shield (" + this.player.m_animations[parseInt(name_split[name_split.length - 1])].name + ")";
					}
					else if(name.startsWith("weapon_version_"))
					{
						let suffix = "";
						if(name.includes("_l_"))
						{
							suffix = " L";
						}
						else if(name.includes("_2a_"))
						{
							suffix = " 2A";
						}
						else if(name.includes("_2b_"))
						{
							suffix = " 2B";
						}
						else if(name.includes("_r_"))
						{
							suffix = " R";
						}
						let name_split = name.split("_");
						display_name = "Weapon" + suffix + " (" + this.player.m_animations[parseInt(name_split[name_split.length - 1])].name + ")";
					}
					break;
				}
			}
			const c_display_name = display_name;
			// reset button
			let btn = add_to(
				span,
				"button",
				{
					cls:["player-control-button", "player-control-texture-delete-button"],
					innerhtml:this.get_button_html("delete"),
					onclick:function() {
						_ui_.texture_reset(name, c_display_name)
					},
					id:display_name
				}
			);
			btn.disabled = true;
			// upload button
			add_to(
				span,
				"button",
				{
					cls:["player-control-button"],
					innerhtml:this.get_button_html("upload"),
					onclick:function() {
						_ui_.texture_upload(name, c_display_name)
					}
				}
			);
			// add link to original
			let a = add_to(
				span,
				"a",
				{
					innertext:c_display_name
				}
			);
			const split = images[name].src.split("/");
			a.href = Game.externUri + "/img/sp/cjs/" + split[split.length - 1];
			a.target="_blank";
		}
		update_next_frame(function() {
			_ui_.m_menus.texture_list.innerHTML = "";
			_ui_.m_menus.texture_list.appendChild(fragment);
		});
	}
	
	// texture swap menu open button
	control_texture_open()
	{
		// unhide
		this.m_menus.texture.style.display = "";
		// lock controls
		this.set_control_lock(true);
		beep();
	}
	
	// texture swap menu close button
	texture_close()
	{
		// hide menu
		this.m_menus.texture.style.display = "none";
		// lock controls
		this.set_control_lock(false);
		beep();
	}
	
	// texture swap menu upload buttons
	texture_upload(name, display_name)
	{
		if(typeof beep !== "undefined")
			beep();
		// create file dialog
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/png'; // Accept only PNG
		// add change event
		input.addEventListener('change', (event) => {
			try
			{
				// Get the selected file
				const file = event.target.files[0];
				if(file)
				{
					this.player.set_texture(name, new Blob([file], {type: file.type}));
					document.getElementById(display_name).disabled = false;
					// send message
					if(typeof push_popup !== "undefined")
						push_popup(display_name + " has been replaced by your texture.");
				}
			}
			catch(err)
			{
				if(typeof push_popup !== "undefined")
					push_popup("An error occured. Report it if it persists.");
				console.error("Exception thrown", err.stack);
			}
		});
		// trigger it
		input.click();
	}
	
	// texture reset button
	texture_reset(name, display_name)
	{
		// check if texture has been swapped
		if(this.player.reset_texture(name))
		{
			if(typeof push_popup !== "undefined")
				push_popup(display_name + " has been reset.");
			document.getElementById(display_name).disabled = true;
		}
		else
		{
			if(typeof push_popup !== "undefined")
				push_popup(display_name + " is already set to its original image.");
		}
		beep();
	}
	
	// un/lock ui buttons and inputs
	set_control_lock(disabled)
	{
		// selects
		this.m_version.disabled = disabled;
		this.m_motion.disabled = disabled;
		this.m_ability.disabled = disabled;
		// sliders
		this.m_speed.disabled = disabled;
		this.m_audio.disabled = disabled;
		// buttons
		for(const b of Object.values(this.m_buttons))
		{
			b.disabled = disabled;
		}
		for(const b of Object.values(this.m_backgrounds))
		{
			b.disabled = disabled;
		}
	}
	
	// to disable keyboard on select elements
	ignore_alpha(e)
	{
		if(!e)
		{
			e = window.event;
		}
		if(e.keyCode >= 65 && e.keyCode <= 90) // A to Z
		{
			e.returnValue = false;
			e.cancel = true;
		}
	}
	
	// event callback to prevent the space bar key to trigger buttons
	space_key_fix(event)
	{
		if(event.code == "Space" && event.target == document.body)
			event.preventDefault();
	}
	
	// the shortcut processing function
	key_bind_handler(event)
	{
		// we don't use anything using those keys
		if(event.ctrlKey || event.altKey || event.metaKey || event.target.tagName.toLowerCase() == "input")
			return;
		switch(event.key)
		{
			case "r": case "R": // speed reset
			{
				if(!event.shiftKey)
				{
					event.preventDefault();
					this.m_buttons.reset.click();
				}
				return;
			}
			case "+": // speed/sound up
			{
				if(!event.shiftKey && !this.m_speed.disabled)
				{
					this.m_speed.value = JSON.stringify(
						Math.min(
							parseFloat(this.m_speed.max),
							parseFloat(this.m_speed.value)
							+ parseFloat(this.m_speed.step)
						)
					);
					this.control_speed_update();
				}
				else if(event.shiftKey && !this.m_audio.disabled)
				{
					this.m_audio.value = JSON.stringify(
						Math.min(
							parseFloat(this.m_audio.max),
							parseFloat(this.m_audio.value)
							+ parseFloat(this.m_audio.step)
						)
					);
					this.control_audio_update();
				}
				return;
			}
			case "-": // speed/sound down
			{
				if(!event.shiftKey && !this.m_speed.disabled)
				{
					this.m_speed.value = JSON.stringify(
						Math.max(
							parseFloat(this.m_speed.min),
							parseFloat(this.m_speed.value)
							- parseFloat(this.m_speed.step)
						)
					);
					this.control_speed_update();
				}
				else if(event.shiftKey && !this.m_audio.disabled)
				{
					this.m_audio.value = JSON.stringify(
						Math.max(
							parseFloat(this.m_audio.min),
							parseFloat(this.m_audio.value)
							- parseFloat(this.m_audio.step)
						)
					);
					this.control_audio_update();
				}
				return;
			}
			case " ": // pause
			{
				if(!event.shiftKey)
				{
					event.preventDefault();
					this.m_buttons.pause.click();
				}
				return;
			}
			case "l": case "L": // loop toggle
			{
				if(!event.shiftKey)
				{
					event.preventDefault();
					this.m_buttons.loop.click();
				}
				return;
			}
			case "m": case "M": // audio / beep toggle
			{
				if(!event.shiftKey) // m
				{
					event.preventDefault();
					this.m_buttons.sound.click();
				}
				else if(event.shiftKey) // shift+m
				{
					event.preventDefault();
					this.m_buttons.beep.click();
				}
				return;
			}
			case "s": case "S": // skill position toggle
			{
				if(!event.shiftKey)
				{
					event.preventDefault();
					this.m_buttons.ability_target.click();
				}
				return;
			}
			case "p": case "P": // open custom playlist
			{
				if(!event.shiftKey)
				{
					event.preventDefault();
					this.m_buttons.playlist.click();
				}
				return;
			}
			case "b": case "B": // toggle bounding boxes
			{
				if(!event.shiftKey)
				{
					event.preventDefault();
					this.m_buttons.bound_box.click();
				}
				return;
			}
			case "e": case "E": // shift enemy position
			{
				if(!event.shiftKey && is_enemy)
				{
					event.preventDefault();
					this.m_buttons.enemy_position.click();
				}
				return;
			}
			case "f": case "F": // frame advance
			{
				if(!event.shiftKey)
				{
					event.preventDefault();
					this.m_buttons.frame.click();
				}
				return;
			}
			case "d": case "D": // download canvas
			{
				if(event.shiftKey) // use shift key!
				{
					event.preventDefault();
					this.m_buttons.download.click();
				}
				return;
			}
			case "w": case "W": // record webm
			{
				if(event.shiftKey) // use shift key!
				{
					event.preventDefault();
					this.m_buttons.record.click();
				}
				return;
			}
			case "t": case "T": // texture list
			{
				if(!event.shiftKey)
				{
					event.preventDefault();
					this.m_buttons.texture.click();
				}
				return;
			}
			case "x": case "X": // debug
			{
				if(event.shiftKey)
				{
					event.preventDefault();
					if(this.m_debug == null)
					{
						this.m_debug = document.getElementById("debug-panel");
						if(this.m_debug != null)
						{
							this.update_debug_infos();
							this.m_debug.style.display = "";
						}
					}
					else
					{
						this.m_debug.style.display = "none";
						this.m_debug = null;
					}
				}
				return;
			}
		}
	}
	
	update_debug_infos()
	{
		if(this.m_debug)
		{
			let str = "";
			if(this.player.m_loading)
			{
				str = "State: Loading";
			}
			else
			{
				if(this.player.m_paused)
				{
					str = "State: Paused";
				}
				else
				{
					str = "State: Running";
				}
				str += "<br>Version: " + this.player.m_animations[this.player.m_current_cjs].cjs;
				if((this.player.m_debug.motion ?? null) != null)
				{
					str += "<br>Duration: " + this.player.m_debug.duration + "f<br>Motion: " + this.player.m_debug.motion;
					if(this.player.m_debug.extra != null)
					{
						str += "<br>Extra: " + this.player.m_debug.extra;
					}
				}
			}
			
			if(str != this.m_debug.innerHTML)
			{
				this.m_debug.innerHTML = str;
			}
		}
	}
}
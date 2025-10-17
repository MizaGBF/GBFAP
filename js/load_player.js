var config = null; // contains the loaded config
var Game = null; // contains various url, follow the in-game format
var player = null; // the player instance
var loader = null; // the loaded instance
var _ = null; // contains underscore 3rd party library

// starting point of the animation player
function load_player(animations, override_config = null)
{
	// if a config is provided
	if(override_config != null)
	{
		// process directly
		process_config(override_config, animations);
	}
	else
	{
		// else load the configuration from the json folder
		fetchJSON("json/config.json?" + Date.now()).then((value) => {
			process_config(value, animations);
		});
	}
}

// next step after loading the config
function process_config(obj, animations)
{
	config = obj;
	if(config == null)
		throw new Error("No configuration loaded");
	// parse the content
	if(!load_config())
		return;
	
	test_proxy(animations);
}

function test_proxy(animations)
{
	if((Game.testUri ?? null) != null)
	{
		if(typeof player_test_start != "undefined")
			player_test_start();
		var xhr = new XMLHttpRequest();
		xhr.ontimeout = function () {
			if(typeof player_test_start != "undefined")
				player_test_end(false);
			console.error("The proxy didn't respond.");
		};
		xhr.onload = function() {
			if(xhr.readyState === 4)
			{
				if(xhr.status === 200)
				{
					if(typeof player_test_start != "undefined")
						player_test_end(true);
					player_start_fire(animations);
				}
				else
				{
					if(typeof player_test_start != "undefined")
						player_test_end(false);
					console.error("HTTP Error " + xhr.status + " was received while testing the proxy.");
				}
			}
		};
		xhr.onerror = function() {
			if(typeof player_test_start != "undefined")
				player_test_end(false);
			console.error("An unexpected error occured while testing the proxy.");
		};
		xhr.open("GET", Game.testUri, true);
		xhr.timeout = 150000; // long timeout on purpose
		xhr.send(null);
	}
	else
	{
		player_start_fire(animations);
	}
}

var require_is_configured = false;
function player_start_fire(animations)
{
	// setup requirejs paths
	if(!require_is_configured)
	{
		require.config({
		  baseUrl: "",
		  paths: {
			"createjs":				"js/vendors/createjs",
			"jquery":				"js/vendors/jquery",
			"underscore":			"js/vendors/underscore",
			"backbone":				"js/vendors/backbone",
			"lib/raid/extension":	"js/raid_extension",
			"lib/sound":			"js/audio"
		  }
		});
		require_is_configured = true;
	}
	// load createjs
	require(["createjs"], function() {
		// apply monkeypatches
		monkeypatch_createjs();
		// load needed files
		require(["jquery","underscore","backbone","js/player","js/player_ui","js/loader","lib/sound","lib/raid/extension"], function($, underscore, backbone) {
			_ = underscore;
			// Note: GBF width is around 640 px, so this is ideal to avoid scaling
			// If you want to go higher than 900px, you must increase the canvas size
			// set_size can take an extra parameter to set the global scaling but it's untested
			if(animations[0].is_enemy)
			{
				init_player(PlayerLayoutMode.enemy);
				player.set_size(640, 640);
			}
			else if(animations[0].is_mypage)
			{
				init_player(PlayerLayoutMode.mypage);
				player.set_size(640, 900);
			}
			else
			{
				init_player();
				player.set_size(640, 640);
			}
			player.set_animations(animations);
			if(typeof player_start_end !== "undefined")
			{
				player_start_end();
			}
		});
	});
}

// init the Game variable according to the content of config.json
function load_config()
{
	try
	{
		// intend to replace Game
		let new_game = {};
		// read the cors proxy, if set
		// config.use_game_config points to which url config we use
		let cors_proxy = config.game[config.use_game_config]["corsProxy"] ?? "";
		// for each key in
		for(const [key, val] of Object.entries(config.game[config.use_game_config]))
		{
			if(key != "corsProxy")
			{
				if(val != null)
					new_game[key] = val.replace("CORS/", cors_proxy); // we set the cors proxy in the url
				else
					new_game[key] = null;
			}
		}
		Game = new_game; // set to Game
		return true;
	} catch(err) {
		console.error("Bad config error", err);
		return false;
	}
}

// apply various patches to modern createjs for compatibility with gbf
var _createjs_overloaded_func_ = {}; // store the original functions
var create_js_monkeypatch_applied = false;
function monkeypatch_createjs()
{
	if(create_js_monkeypatch_applied)
	{
		return;
	}
	// new bitmap initialize
	_createjs_overloaded_func_["bitmap_init"] = window.createjs.Bitmap.prototype.initialize;
	window.createjs.Bitmap.prototype.initialize = function(image) {
		let tmp = this.sourceRect; // store the source rect
		// call the original function
		_createjs_overloaded_func_["bitmap_init"].call(this, image);
		if(tmp) this.sourceRect = tmp; // now set the source rect AFTER (to avoid a bug)
		// add bouding box logic
		add_bounding_box(this);
	};
	
	// add getStage method to DisplayObject
	window.createjs.DisplayObject.prototype.getStage = function() {
		return player.m_stage;
	}
	create_js_monkeypatch_applied = true;
}

// Code to add bounding boxes to the animations
var bounding_box_state = false;
// Function to add a bounding box to a Bitmap
function add_bounding_box(displayObject) {
	if (!displayObject || displayObject._bounding_box)
		return;
	// add a Shape in a custom parameter
	displayObject._bounding_box = new createjs.Shape();
	displayObject._bounding_box.mouseEnabled = false; // not sure if needed
	displayObject._bounding_box.visible = bounding_box_state; // set visibility according to global variable
	// on each tick, draw our box (see below)
	displayObject.on("tick", draw_object_bounding_box);
	displayObject.on("removed", remove_bounding_box);
}

// Function to draw the bounding box
function draw_object_bounding_box()
{
	// update visibility if needed
	if(this._bounding_box.visible != bounding_box_state)
	{
		this._bounding_box.visible = bounding_box_state;
	}
	// if visible
	if(this._bounding_box.visible && this.parent)
	{
		// update parent if needed
		if(this._bounding_box.parent != this.parent)
		{
			// remove from box parent (if it exists)
			if(this._bounding_box.parent != null)
				this._bounding_box.parent.removeChild(this._bounding_box);
			// move to object parent (if it exists)
			if(this.parent != null)
				this.parent.addChild(this._bounding_box);
		}
		if(this._bounding_box.parent != null) // if parent exists (aka it's displayed)
		{
			const bounds = this.getBounds?.(); // get object bound
			if(bounds)
			{
				// draw a green rectangle copying those bounds
				// don't worry about transformations, they are propagated from parents
				this._bounding_box.graphics
				.clear()
				.setStrokeStyle(1)
				.beginStroke("green")
				.drawRect(bounds.x, bounds.y, bounds.width, bounds.height)
				.endStroke();
			}
		}
	}
	else if(this._bounding_box.parent)
	{
		// If the box shouldn't be visible
		this._bounding_box.parent.removeChild(this._bounding_box);
	}
}

// function to clean the bounding box when the owner is removed to avoid a memory leak
function remove_bounding_box()
{
	// remove the tick
	this.off("tick", draw_object_bounding_box);
	// remove from stage
	if(this._bounding_box.parent)
		this._bounding_box.parent.removeChild(this._bounding_box);
}
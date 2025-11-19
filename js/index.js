/*jshint esversion: 11 */

var settings = {};
var gbf = null;
var search = null;
var timestamp = Date.now(); // last updated timestamp
var index = null;
const updated_key = "gbfap-updated";
const bookmark_key = "gbfap-bookmark";
var bookmark_onclick = null;
const history_key = "gbfap-history";
var history_onclick = null;
const search_save_key = "gbfap-search";
var last_id = null;
var last_target = null;
var waiting_player = false;
// proxy waiting logic
var wake_interval = null;
var wake_counter = 110; // 100s

function init() // entry point, called by body onload
{
	document.addEventListener("player-html-ready", () => {
			scale_player();
		},
		false
	);
	window.addEventListener('resize', scale_player);
	window.addEventListener('orientationchange', scale_player);
	
	// init var
	gbf = new GBF();
	bookmark_onclick = index_onclick;
	history_onclick = index_onclick;
	
	// apply GBFML patches
	override_GBFML();
	
	// open tab
	open_tab('index'); // set to this tab by default
	
	// get json
	Promise.all([
		fetchJSON("json/config.json?" + timestamp),
		fetchJSON("json/changelog.json?" + timestamp)
	]).then((values) => {
		let conf = values[0];
		let changelog = values[1];
		if(conf == null) // GBFAL is broken
		{
			crash();
		}
		else
		{
			load(conf, changelog);
		}
	});
}

function load(conf, changelog)
{
	if(conf.hasOwnProperty("banned"))
	{
		gbf.banned_ids = conf.banned;
	}
	if(changelog)
	{
		timestamp = changelog.timestamp; // start the clock
		clock(); // start the clock
		if(changelog.hasOwnProperty("issues")) // write issues if any
		{
			issues(changelog);
		}
		if(conf.hasOwnProperty("help_form"))
		{
			help_form = conf.help_form;
		}
		if(help_form && changelog.hasOwnProperty("help") && changelog.help)
		{
			help_wanted(conf);
		}
	}
	fetchJSON("json/data.json?" + timestamp).then((value) => {
		index = value;
		if(index == null)
		{
			crash();
		}
		else
		{
			start(conf, changelog);
		}
	});
	fetchJSON("../GBFML/json/jukebox.json").then((value) => {
		let node = document.getElementById("jukebox");
		jukebox = new AudioJukeboxPlayer(node, value);
		document.getElementById("tab-jukebox").style.display = "";
	});
}

function start(conf, changelog)
{
	search = new Search(
		document.getElementById("filter"),
		document.getElementById("search-area"),
		search_save_key,
		{
			"wpn":["Weapon", GBFType.weapon],
			"sum":["Summon", GBFType.summon],
			"cha":["Character", GBFType.character],
			"skn":["Skin", "skins"],
			"job":["Protagonist", GBFType.job],
			"bss":["Enemy", GBFType.enemy]
		},
		[
			GBFType.weapon,
			GBFType.summon,
			GBFType.character,
			GBFType.job,
			GBFType.enemy
		],
		(conf.allow_id_input ?? false)
	);
	search.populate_search_area();
	init_lists(changelog, index_onclick);
	init_index(conf, changelog, index_onclick);
	// set config now
	config = conf;
	// if id is in url parameter
	let id = get_url_params().get("id");
	if(id != null)
	{
		// look it up
		lookup_player(id);
	}
}

function index_onclick()
{
	if(window.event.ctrlKey) // open new window
	{
		window.open("?id="+this.onclickid, '_blank').focus();
	}
	else
	{
		lookup_player(this.onclickid);
	}
}

// separated from lookup to make sure the user doesn't accidently start the player
function lookup_player(id)
{
	try
	{
		let type = gbf.lookup_string_to_element(id);
		let target = null;
		if(type != GBFType.unknown)
		{
			switch(type)
			{
				case GBFType.job:
					target = "job";
					break;
				case GBFType.weapon:
					target = "weapons";
					break;
				case GBFType.summon:
					target = "summons";
					break;
				case GBFType.character:
					if(gbf.is_character_skin(id))
						target = "skins";
					else
						target = "characters";
					break;
				case GBFType.enemy:
					target = "enemies";
					break;
				case GBFType.partner:
					target = "partners";
					break;
				default:
					console.error("Unsupported type " + type);
					break;
			};
			id = gbf.remove_prefix(id, type);
		};
		if(target != null && gbf.is_banned(id))
			return;
		// execute
		if(target != null && id in index[target])
		{
			if(id != last_id)
			{
				if(typeof player !== "undefined" && player != null)
				{
					if(waiting_player || player.is_busy())
					{
						push_popup("The player is busy, wait until it's available.");
					}
					else
					{
						init_load_element(id, target);
					}
				}
				else
				{
					if(waiting_player)
					{
						push_popup("The player is busy, wait until it's available.");
					}
					else
					{
						init_load_element(id, target);
					}
				}
			}
		}
	} catch(err) {
		console.error("Exception thrown", err.stack);
	}
}

function init_load_element(id, target, is_mypage = null)
{
	if(is_mypage == null && "mypage" in index && id in index["mypage"])
	{
		// set this to true to not attempt to load two elements at the same time
		waiting_player = true;
		if(player != null)
			player.ui.set_control_lock(true);
		document.getElementById("mypage-select").style.display = "";
		document.getElementById("animation-select-battle").onclick = function() {
			document.getElementById("mypage-select").style.display = "none";
			init_load_element(id, target, false);
		};
		document.getElementById("animation-select-mypage").onclick = function() {
			document.getElementById("mypage-select").style.display = "none";
			init_load_element(id, target, true);
		};
		document.getElementById("animation-select-cancel").onclick = function() {
			document.getElementById("mypage-select").style.display = "none";
			if(player != null)
				player.ui.set_control_lock(false);
			waiting_player = false;
		};
		return;
	}
	else if(is_mypage == null)
	{
		is_mypage = false;
	}
	// set this to true to not attempt to load two elements at the same time
	waiting_player = true;
	// memorize what we clicked
	last_id = id;
	last_target = target;
	if(player)
		push_popup("Reloading the player...");
	// remove fav button before loading
	init_bookmark_button(false);
	// load element and player
	load_element(id, (is_mypage ? "mypage" : target), index[target][id], is_mypage);
}

function load_element(id, target, data, is_mypage = false)
{
	// generate the Animations
	let animations = [];
	if(is_mypage)
	{
		animations = list_animation(target, index["mypage"][id]);
	}
	else
	{
		animations = list_animation(target, data);
		// add styles if they exist
		if((index.styles ?? null) && id in index.styles)
		{
			animations = animations.concat(list_animation(target, index.styles[id]))
		}
	}
	if(animations.length == 0)
		throw new Error("Element " + id + " doesn't have any animations.");
	// display player tab
	document.getElementById("tab-view").style.display = "";
	// set bookmark, history and query
	update_query(id);
	let type = gbf.index_to_type(target);
	update_history(id, type);
	init_bookmark_button(true, id, type);
	// load the player
	load_player(animations, config);
	// open tab
	open_tab("view");
	// set the background index category to visible (next frame after index is done generating)
	update_next_frame(function() {
		if(is_mypage)
		{
			document.getElementById("mypage-background").style.display = "";
		}
		else
		{
			document.getElementById("normal-background").style.display = "";
		}
	});
}

function list_animation(target, data)
{
	let animations = [];
	// constants
	const summon = data.s ?? null;
	const is_main_character = ["summons", "weapons", "job"].includes(target);
	const is_enemy = target == "enemies";
	const is_mypage = target == "mypage";
	const raid_appear = data.ra ?? [];
	// list of demo motions
	let demo_list = [];
	if(is_mypage)
	{
		demo_list = ["mypage"];
	}
	else if(is_enemy)
	{
		if(data.v[0][4].length == 0)
		{
			demo_list = ["setin", "wait", "attack", "mortal_A", "dead"];
		}
		else
		{
			demo_list = ["setin", "wait", "attack", "dead"];
		}
		if(raid_appear.length > 0)
			demo_list.unshift("raid_appear_0");
	}
	else if(summon == null)
	{
		if(["weapons", "job"].includes(target))
			demo_list = ["ability", "mortal_A", "stbwait", "attack", "double", "triple"];
		else
			demo_list = ["ability", "mortal_A", "stbwait", "short_attack", "double", "triple"];
	}
	// create an Animation for each version
	for(let i = 0; i < data.v.length; ++i)
	{
		const version = data.v[i];
		let current_demo = demo_list;
		let weapon = null;
		if(data.w ?? null)
			weapon = data.w[i];
		let ultimate = null;
		if(data.u ?? null)
			ultimate = data.u[i];
		if(summon) // set special demo motions
		{
			if(version[4].length > 0 && version[4][0].includes("_attack"))
			{
				current_demo = ["summon", "summon_atk", "summon_dmg"];
			}
			else
			{
				current_demo = ["summon", "summon_atk"];
			}
		}
		else if(version[2] != null && version[2] != "mortal_A") // fix mortal if different
		{
			let copied = false;
			for(let j = 0; j < current_demo.length; ++j)
			{
				if(current_demo[j].startsWith("mortal"))
				{
					if(!copied)
					{
						current_demo = [...demo_list];
						copied = true;
					}
					current_demo[j] = version[2];
				}
			}
		}
		animations.push(new Animation(version[0], {
			demo_motions: current_demo,
			cjs: version[1],
			attack: version[3],
			specials: version[4],
			abilities: data.ab ?? [],
			weapon: weapon,
			summon: summon,
			is_main_character: is_main_character,
			is_enemy: is_enemy,
			is_mypage: is_mypage,
			raid_appear: raid_appear,
			ultimate: ultimate
		}));
	}
	return animations;
}

// open the background category
function open_background_search(is_mypage)
{
	// open index tab
	open_tab("index");
	// grab the category we want
	let elem;
	if(is_mypage)
	{
		elem = document.getElementById("mypage-background");
	}
	else
	{
		elem = document.getElementById("normal-background");
	}
	// open it
	if(!elem.open)
	{
		elem.firstChild.click();
		elem.open = true;
	}
	// scroll
	elem.scrollIntoView();
}

// called when the proxy test start
function player_test_start()
{
	wake_interval = setInterval(update_waking, 1000); // call update_waking every second
	let container = document.getElementById('player-header');
	container.innerHTML = 'Loading...';
}

// called when the proxy test end
function player_test_end(result)
{
	if(wake_interval)
	{
		clearInterval(wake_interval);
		wake_interval = null;
	}
	let container = document.getElementById('player-header');
	if(!result)
	{
		container.innerHTML = "An unexpected error occured.<br>Try to reload and contact the author if the issue persists.";
	}
	waiting_player = false;
}

function update_waking()
{
	let container = document.getElementById('player-header');
	if(container)
	{
		// set a message to tell the user what's going on if it's taking too long
		if(wake_counter <= 0)
		{
			clearInterval(wake_interval);
			wake_interval = null;
			container.innerHTML = "The proxy server is waking up.<br>If nothing happens soon, try reloading the page.<br>You can also try CTRL+F5 to reload this page with a clean cache.<br>If the issue persists, try again later or contact me.";
		}
		else if(wake_counter <= 100)
		{
			container.innerHTML = "The proxy server is waking up.<br>Please wait " + wake_counter + "s before reloading the page.";
		}
		--wake_counter;
	}
	else
	{
		clearInterval(wake_interval);
		wake_interval = null;
	}
}

function player_start_end()
{
	const container = document.getElementById('player-header');
	const fragment = document.createDocumentFragment();
	let gbfal_prefix = "";
	if(last_target == "enemies")
		gbfal_prefix = "e";
	
	let div = build_header(
		fragment,
		{
			id: last_id,
			target: last_target,
			create_div:false,
			navigation:true,
			lookup:true,
			related:true,
			link:true,
			extra_links:[["Assets for " + last_id, "../GBFAL/assets/icon.png", "../GBFAL/?id=" + gbfal_prefix + last_id]]
		}
	);
	if("mypage" in index && last_id in index["mypage"])
	{
		add_to(div.getElementById("container-header-element-links"), "img", {
			cls:["clickable", "img-link", "animation-switcher"],
			title:"Load other animations",
			onclick: function() {
				if(player == null || waiting_player || player.is_busy())
				{
					push_popup("The player is busy, wait until it's available.");
				}
				else
				{
					waiting_player = true;
					player.ui.set_control_lock(true);
					document.getElementById("mypage-select-toggle").style.display = "";
					document.getElementById("animation-toggle-confirm").onclick = function() {
						document.getElementById("mypage-select-toggle").style.display = "none";
						init_load_element(last_id, last_target, player.m_layout_mode != PlayerLayoutMode.mypage);
					};
					document.getElementById("animation-toggle-cancel").onclick = function() {
						document.getElementById("mypage-select-toggle").style.display = "none";
						player.ui.set_control_lock(false);
						waiting_player = false;
					};
				}
			}
		}).src = "../GBFML/assets/ui/mypage.png";
	}
	
	update_next_frame(function() {
		container.innerHTML = "";
		container.appendChild(fragment);
	});
}

// intended for mobile portrait
function scale_player()
{
	if(player)
	{
		if (window.matchMedia("((hover: none) or (pointer: coarse)) and (orientation: portrait)").matches)
		{
			let scale = player.ui.m_html.parentNode.clientWidth / 840;
			if(scale > 1)
			{
				player.ui.m_html.style.transform = "none";
				player.ui.m_html.style.marginBottom = "auto";
			}
			else
			{
				player.ui.m_html.style.transform = "scale(" + scale + ")";
				player.ui.m_html.style.marginBottom = "" + (- player.ui.m_html.clientHeight * scale) + "px";
			}
		}
		else
		{
			player.ui.m_html.style.transform = "none";
			player.ui.m_html.style.marginBottom = "auto";
		}
	}
}
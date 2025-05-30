// constant
const LOCAL = false; // set to true if assets are on the same machine
const CORS = 'https://gbfcp2.onrender.com/' // CORS Proxy to use (if LOCAL is true)
const HISTORY_LENGTH = 20; // size limit of the history
const ENDPOINTS = [ // possible asset endpoints, used for the index
	"https://prd-game-a-granbluefantasy.akamaized.net/",
	"https://prd-game-a1-granbluefantasy.akamaized.net/",
	"https://prd-game-a2-granbluefantasy.akamaized.net/",
	"https://prd-game-a3-granbluefantasy.akamaized.net/",
	"https://prd-game-a4-granbluefantasy.akamaized.net/",
	"https://prd-game-a5-granbluefantasy.akamaized.net/"
];
// html index related (copied from GBFAL)
const CHARACTERS = [
	["Year 2025 (Snake)", "assets/ui/index_icon/year_2025_(snake).png", [0, -1, 0, -1, 571, 999]],
	["Year 2024 (Dragon)", "assets/ui/index_icon/year_2024_(dragon).png", [75, 76, 0, -1, 504, 571]],
	["Year 2023 (Rabbit)", "assets/ui/index_icon/year_2023_(rabbit).png", [0, -1, 0, -1, 443, 504]],
	["Year 2022 (Tiger)", "assets/ui/index_icon/year_2022_(tiger).png", [0, -1, 0, -1, 379, 443]],
	["Year 2021 (Ox)", "assets/ui/index_icon/year_2021_(ox).png", [74, 75, 0, -1, 316, 379]],
	["Year 2020 (Rat)", "assets/ui/index_icon/year_2020_(rat).png", [73, 74, 281, 323, 256, 316]],
	["Year 2019 (Pig)", "assets/ui/index_icon/year_2019_(pig).png", [72, 73, 263, 281, 199, 256]],
	["Year 2018 (Dog)", "assets/ui/index_icon/year_2018_(dog).png", [71, 72, 233, 263, 149, 199]],
	["Year 2017 (Chicken)", "assets/ui/index_icon/year_2017_(chicken).png", [0, -1, 173, 233, 108, 149]],
	["Year 2016 (Monkey)", "assets/ui/index_icon/year_2016_(monkey).png", [47, 71, 113, 173, 72, 108]],
	["Year 2015 (Sheep)", "assets/ui/index_icon/year_2015_(sheep).png", [30, 47, 51, 113, 30, 72]],
	["Year 2014", "assets/ui/index_icon/year_2014.png", [0, 30, 0, 51, 0, 30]]
];
const SKINS = [
	["ID 200 to 299", [200, 300]],
	["ID 100 to 199", [100, 200]],
	["ID 000 to 099", [0, 100]]
];
const SUMMONS = [
	["SSR ID 400 to 599", "4", [400, 600], "assets/ui/icon/ssr.png"],
	["SSR ID 200 to 399", "4", [200, 400], "assets/ui/icon/ssr.png"],
	["SSR ID 000 to 199", "4", [0, 200], "assets/ui/icon/ssr.png"],
	["SR", "3", [0, 1000], "assets/ui/icon/sr.png"],
	["R", "2", [0, 1000], "assets/ui/icon/r.png"],
	["N", "1", [0, 1000], "assets/ui/icon/n.png"]
];
const WEAPONS_RARITY = [
	["SSR", "4", "assets/ui/icon/ssr.png"],
	["SR", "3", "assets/ui/icon/sr.png"],
	["R", "2", "assets/ui/icon/r.png"],
	["N", "1", "assets/ui/icon/n.png"]
];
const WEAPONS = [
	["Sword", "0", "assets/ui/icon/sword.png"],
	["Dagger", "1", "assets/ui/icon/dagger.png"],
	["Spear", "2", "assets/ui/icon/spear.png"],
	["Axe", "3", "assets/ui/icon/axe.png"],
	["Staff", "4", "assets/ui/icon/staff.png"],
	["Gun", "5", "assets/ui/icon/gun.png"],
	["Melee", "6", "assets/ui/icon/melee.png"],
	["Bow", "7", "assets/ui/icon/bow.png"],
	["Harp", "8", "assets/ui/icon/harp.png"],
	["Katana", "9", "assets/ui/icon/katana.png"]
];
const ENEMIES = [
	["Beasts and Animals", "1", "assets/ui/index_icon/1.png", [["Flying", "assets/ui/index_icon/flying.png"], ["Beasts", "assets/ui/index_icon/beasts.png"], ["Monstrosities", "assets/ui/index_icon/monstrosities.png"]]],
	["Plants and Insects", "2", "assets/ui/index_icon/2.png", [["Plants", "assets/ui/index_icon/plants.png"], ["Insects", "assets/ui/index_icon/insects.png"], ["???", "assets/ui/index_icon/unkn.png"]]],
	["Fishes and Sea Life", "3", "assets/ui/index_icon/3.png", [["Sea Life", "assets/ui/index_icon/sea_life.png"], ["???", "assets/ui/index_icon/unkn.png"], ["???", "assets/ui/index_icon/unkn.png"]]],
	["Golems and Robots", "4", "assets/ui/index_icon/4.png", [["Golems", "assets/ui/index_icon/golems.png"], ["Aberrations", "assets/ui/index_icon/aberrations.png"], ["Machines", "assets/ui/index_icon/machines.png"]]],
	["Undeads and Otherworlders", "5", "assets/ui/index_icon/5.png", [["Otherwordly", "assets/ui/index_icon/otherwordly.png"], ["Undeads", "assets/ui/index_icon/undeads.png"], ["???", "assets/ui/index_icon/unkn.png"]]],
	["Humans and Humanoids", "6", "assets/ui/index_icon/6.png", [["Goblins", "assets/ui/index_icon/goblins.png"], ["People", "assets/ui/index_icon/people.png"], ["Fairies", "assets/ui/index_icon/fairies.png"]]],
	["Dragons and Wyverns", "7", "assets/ui/index_icon/7.png", [["Dragons", "assets/ui/index_icon/dragons.png"], ["Reptiles", "assets/ui/index_icon/reptiles.png"], ["True Dragons", "assets/ui/index_icon/true_dragons.png"]]],
	["Primal Beasts", "8", "assets/ui/index_icon/8.png", [["Primals", "assets/ui/index_icon/primals.png"], ["Elementals", "assets/ui/index_icon/elementals.png"], ["Angel Cores", "assets/ui/index_icon/angel_cores.png"]]],
	["Astrals and Others", "9", "assets/ui/index_icon/9.png", [["Others", "assets/ui/index_icon/others.png"], ["???", "assets/ui/index_icon/unkn.png"], ["???", "assets/ui/index_icon/unkn.png"]]]
];
const BACKGROUNDS = [
	["Mains", "main"],
	["Commons", "common"],
	["Events", "event"],
	["Others", ""]
];

// animation player data
var AnimeID = null; // will contain the Character id
var AnimeData = null; // will contain the Character data for the player
var Game = LOCAL ? // Game variable used by GBF scripts
{
	xjsUri: '',
	jsUri: '',
	imgUri: 'img',
	soundUri: "sound/",
	externUri: 'https://prd-game-a1-granbluefantasy.akamaized.net/assets_en', // direct access to GBF, replace if you want to direct to your server
	bgUri: './', // for backgrounds
	testUri: 'assets/test.png', // to test if the server is setup
	setting: {}
} :
{
	xjsUri: 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
	jsUri: CORS + 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
	imgUri: CORS + 'https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img',
	soundUri: "https://prd-game-a5-granbluefantasy.akamaized.net/assets_en/sound/",
	externUri: 'https://prd-game-a1-granbluefantasy.akamaized.net/assets_en', // direct access to GBF
	bgUri: 'https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/', // for backgrounds
	testUri: CORS + 'assets/test.png', // to test if the server is setup
	setting: {}
};
var debug_path = null;
// global variables
var updated = {}; // latest updated elements
var index = {}; // data index (loaded from data.json)
var timestamp = Date.now(); // timestamp (loaded from changelog.json)
var lastsearches = []; // history
var bookmarks = []; // bookmarks
var wakeInterval = null; // for the proxy wake up message
var wakeCounter = 110;
var is_partner = false; // set to true for special partner characters
var is_mc = false; // set to true if we are dealing with main character animations
var is_enemy = false; // set to true if we are dealing with enemy animations
var mc_id = null; // used by classes only
var mc_wpn = null; // used by weapons and classes
var mc_summon = null; // used by summons
var abilityList = []; // used by classes and characters, list of skill effects
// for audio
var muteBeep = false;
var beepAudio = new Audio("assets/audio/beep.ogg"); // contains last played audio sfx

// ========================================================================
// utility
function beep() // play a sound effect
{
	if(!muteBeep)
	{
		if(!beepAudio.paused) return;
		beepAudio.play();
	}
}

// generic xhr request function
// id is passed to the callbacks
// default timeout is 120s
function get(url, callback, err_callback, id) {
	var xhr = new XMLHttpRequest();
	xhr.ontimeout = function () {
		err_callback.apply(xhr);
	};
	xhr.onload = function() {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				callback.apply(xhr, [id]);
			} else {
				err_callback.apply(xhr, [id]);
			}
		}
	};
	xhr.onerror = function() {
		err_callback.apply(xhr, [id]);
	};
	xhr.open("GET", url, true);
	xhr.timeout = 150000;
	xhr.send(null);
}

// function to remove child elements
function removeChilds(element)
{
	let child = element.lastElementChild; 
	while (child) {
		element.removeChild(child);
		child = element.lastElementChild;
	}
}

// function to get current page parameters
function getID()
{
	let params = new URLSearchParams(window.location.search);
	return params.get("id");
}

// debug only, ignore
function getDebug()
{
	let params = new URLSearchParams(window.location.search);
	return params.get("debug");
}

// return an asset endpoint
function getEndpoint(endpointIndex)
{
	return endpoints[endpointIndex % endpoints.length];
}

// ========================================================================
// entry point / loading
function init()
{
	if(getID() == null)
	{
		hideOutput();
	}
	get("json/changelog.json?" + timestamp, initChangelog, initChangelog, null);
}

function hideOutput() // hide output tab
{
	document.getElementById('view').remove();
	document.getElementById('tab-view').remove();
}

// set the last update time
function initChangelog(unusued)
{
	try
	{
		let json = JSON.parse(this.response);
		if(json.hasOwnProperty("new"))
			updated = json["new"]
		timestamp = json.timestamp;
		setInterval(clock, 1000);
	}
	catch(err)
	{
		console.error("Exception thrown", err.stack);
	}
	get("json/data.json?" + timestamp, initIndex, initIndex, null);
}

function initIndex(unused)
{
	try
	{
		index = JSON.parse(this.response);
		// init Updated list
		let new_node = document.getElementById('new');
		for(const [key, value] of Object.entries(updated))
		{
			let div = document.createElement("div");
			div.classList.add("mobile-big");
			div.classList.add("updated-header");
			div.innerText = key;
			new_node.appendChild(div);
			updateList(new_node, value.reverse(), false);
		}
		// init bookmark, history ...
		updateHistory(null, null);
		toggleBookmark(null, null);
	}
	catch(err)
	{
		console.error("Exception thrown", err.stack);
		// put a message if GBFAP is broken
		let el = document.getElementById("issues");
		el.innerHTML = '<p>A critical error occured, please report the issue if it persists.<br><a href="https://mizagbf.github.io/">Home Page</a><br><a href="https://github.com/MizaGBF/GBFAP/issues">Github</a></p>'
		el.style.display = null;
		return;
	}
	// init index
	let content = document.getElementById('index');
	let parents = null;
	let inter = null;
	let elems = null;
	parents = makeIndexSummary(content, "Characters", true, 0, "assets/ui/icon/characters.png");
	for(let i of CHARACTERS)
	{
		elems = makeIndexSummary(parents[0], i[0], false, 1, i[1]);
		const tmp = [elems[0], i[2]];
		elems[1].onclick = function (){
			display(tmp[0], 'characters', tmp[1], null, false, true);
			this.onclick = null;
		};
	}
	parents = makeIndexSummary(content, "Skins", true, 0, "assets/ui/icon/skins.png");
	for(let i of SKINS)
	{
		elems = makeIndexSummary(parents[0], i[0], false, 1);
		const tmp = [elems[0], i[1]];
		elems[1].onclick = function (){
			display(tmp[0], 'skins', tmp[1], null, false, true);
			this.onclick = null;
		};
	}
	parents = makeIndexSummary(content, "Partners", false, 0, "assets/ui/icon/partners.png");
	{
		const tmp = [parents[0]];
		parents[1].onclick = function (){
			display(tmp[0], 'partners', null, null, false, true, "Only some partners have been added, in no particular order.");
			this.onclick = null;
		};
	}
	parents = makeIndexSummary(content, "Summons", true, 0, "assets/ui/icon/summons.png");
	for(let i of SUMMONS)
	{
		elems = makeIndexSummary(parents[0], i[0], false, 1, i[3]);
		const tmp = [elems[0], i[1], i[2]];
		elems[1].onclick = function (){
			display(tmp[0], 'summons', tmp[1], tmp[2], false, true);
			this.onclick = null;
		};
	}
	parents = makeIndexSummary(content, "Weapons", true, 0, "assets/ui/icon/weapons.png");
	for(let i of WEAPONS_RARITY)
	{
		let inter = makeIndexSummary(parents[0], i[0], true, 1, i[2]);
		for(let j of WEAPONS)
		{
			elems = makeIndexSummary(inter[0], j[0], false, 2, j[2]);
			const tmp = [elems[0], i[1], j[1]];
			elems[1].onclick = function (){
				display(tmp[0], 'weapons', tmp[1], tmp[2], false, true);
				this.onclick = null;
			};
		}
	}
	elems = makeIndexSummary(content, "Main Character", false, 0, "assets/ui/icon/classes.png");
	{
		const tmp = elems[0];
		elems[1].onclick = function (){
			display(tmp, 'job', null, null, false, true, "Descending ID Order");
			this.onclick = null;
		};
	}
	parents = makeIndexSummary(content, "Enemies", true, 0, "assets/ui/icon/enemies.png");
	for(let i of ENEMIES)
	{
		let inter = makeIndexSummary(parents[0], i[0], true, 1, i[2]);
		for(let j = 0; j < 3; ++j)
		{
			let k = i[3][j];
			elems = makeIndexSummary(inter[0], k[0], false, 2, k[1]);
			const tmp = [elems[0], i[1], j+1];
			elems[1].onclick = function (){
				display(tmp[0], 'enemies', tmp[1], tmp[2], false, true);
				this.onclick = null;
			};
		}
	}
	parents = makeIndexSummary(content, "Backgrounds", true, 0, "assets/ui/icon/backgrounds.png");
	parents[0].parentNode.id = "background-index";
	for(let i of BACKGROUNDS)
	{
		elems = makeIndexSummary(parents[0], i[0], false, 1);
		const tmp = [elems[0], i[1], i[2]];
		elems[1].onclick = function (){
			display(tmp[0], 'background', tmp[1], tmp[2], true, true);
			this.onclick = null;
		};
	}
	// load id
	let id = getID();
	if(id != null)
	{
		document.getElementById('tab-view').style.display = "";
		openTab("view");
		let el = id.split("_");
		AnimeID = id;
		if(!isNaN(el[0]) && el[0].length >= 10 && ["389", "388", "382", "383", "384", "302", "303", "304", "371", "101", "102", "103", "104", "201", "202", "203", "204"].includes(el[0].slice(0, 3)))
		{
			loadCharacter(id);
		}
		else if(id.length == 6 && !isNaN(id))
		{
			loadMC(id);
		}
		else if(id.length == 7 && !isNaN(id))
		{
			loadEnemy(id);
		}
		else
		{
			AnimeID = null;
			document.getElementById('background-index').remove();
			document.getElementById('output').innerHTML = "Error: Invalid ID or Character not found.";
		}
	}
	else
	{
		document.getElementById('background-index').remove();
		openTab("index");
	}
}

function loadCharacter(id)
{
	let el = id.split("_");
	let style = "";
	if(el.length == 2)
	{
		id = el[0];
		style = "_"+el[1];
	}
	if(id+style in index)
	{
		AnimeData = [];
		AnimeData.push([]);
		AnimeData.push([]);
		AnimeData.push({1: {1: ""},2: {1: ""}});
		const data = index[id+style];
		if(id.startsWith("38")) is_partner = true;
		updateHistory(id+style, is_partner ? 6 : parseInt(id[0]));
		abilityList = "ab" in data ? data["ab"] : abilityList;
		if('w' in data)
		{
			is_mc = true;
			mc_wpn = data['w'];
		}
		else if('s' in data)
		{
			is_mc = true;
			mc_summon = data['s'];
		}
		for(let d of data['v'])
		{
			let is_old_summon = mc_summon != null && !d[4][0].includes('attack');
			AnimeData[0].push(d[0]); // name
			const p = AnimeData[1].length;
			AnimeData[1].push({});
			AnimeData[1][p]["cjs"] = [d[1]]; // cjs
			if(mc_summon == null) AnimeData[1][p]['action_label_list'] = ['ability', d[2], 'stbwait', 'short_attack', 'double', 'triple']; // mortal
			else if(!is_old_summon) AnimeData[1][p]['action_label_list'] = ['summon', 'summon_atk', 'summon_dmg'];
			else AnimeData[1][p]['action_label_list'] = ['summon', 'summon_atk'];
			AnimeData[1][p]['effect'] = []; // phit
			if(d[3] != null) AnimeData[1][p]['effect'].push(d[3]);
			AnimeData[1][p]['special'] = [];
			for(let sp of d[4])
			{
				if(sp.startsWith('nsp'))
				{
					let i = sp[sp.length-1].charCodeAt();
					if(i < 'a'.charCodeAt() || i > 'z'.charCodeAt())
						i = 0;
					else
						i -= 'a'.charCodeAt();
					while(AnimeData[1][p]['special'].length < i - 1) AnimeData[1][p]['special'].push({"random":0,"list":[]});
				}
				AnimeData[1][p]['special'].push({"random":0,"list":[{"target":"them","cjs":sp,"fixed_pos_owner_bg":0,"full_screen":+d[5]}]});
			}
			if(mc_summon != null && d[4].includes('attack')) AnimeData[1][p]['special'].push({"random":0,"list":[{"target":"them","cjs":d[4].replace('attack', 'damage'),"fixed_pos_owner_bg":0,"full_screen":0}]});
			AnimeData[1][p]['cjs_pos'] = [{"y":0,"x":0}];
			AnimeData[1][p]['special_pos'] = [[{"y":0,"x":0}]];
		}
		successLoading(id+style);
	}
	else // fail
	{
		document.getElementById('output').innerHTML = "Error: Couldn't load ID " + id + style;
		if(id.length == 10 && id.startsWith("20"))
			document.getElementById('output').innerHTML += "<br>Note: This summon might be unsupported or has identical animations on another ID.";
		else if(id.length == 7)
			document.getElementById('output').innerHTML += "<br>Note: This enemy might be unsupported or has identical animations on another ID.";
	}
}

function loadMC(id)
{
	if(id in index)
	{
		updateHistory(id, 0);
		AnimeData = [];
		AnimeData.push([]);
		AnimeData.push([]);
		AnimeData.push({1: {1: ""},2: {1: ""}});
		const data = index[id];
		is_mc = true;
		abilityList = "ab" in data ? data["ab"] : abilityList;
		if('w' in data) mc_wpn = data['w'];
		mc_id = id;
		for(let d of data['v'])
		{
			AnimeData[0].push(d[0]); // name
			const p = AnimeData[1].length;
			AnimeData[1].push({});
			AnimeData[1][p]["cjs"] = [d[1]]; // cjs
			AnimeData[1][p]['action_label_list'] = ['ability', d[2], 'stbwait', 'short_attack', 'double', 'triple']; // mortal
			AnimeData[1][p]['effect'] = [d[3]]; // phit
			AnimeData[1][p]['special'] = [];
			if(d[4].length > 0)
				AnimeData[1][p]['special'].push({"random":0,"list":[{"target":"them","cjs":d[4][0],"fixed_pos_owner_bg":0,"full_screen":+d[5]}]}); // special, fullscreen
			AnimeData[1][p]['cjs_pos'] = [{"y":0,"x":0}];
			AnimeData[1][p]['special_pos'] = [[{"y":0,"x":0}]];
		}
		successLoading(id);
	}
	else // fail
	{
		document.getElementById('output').innerHTML = "Error: Couldn't load ID " + id;
	}
}

function loadEnemy(id)
{
	if(id in index)
	{
		updateHistory(id, 4);
		AnimeData = [];
		AnimeData.push([]);
		AnimeData.push([]);
		AnimeData.push({1: {1: ""},2: {1: ""}});
		const data = index[id]; // NOTE: format is different
		is_enemy = true;
		mc_id = id;
		AnimeData[0].push(""); // empty name
		AnimeData[1].push({});
		AnimeData[1][0]["cjs"] = ["enemy_" + id]; // cjs
		AnimeData[1][0]['action_label_list'] = data['sp'].length > 0 ? ['setin', 'wait', 'attack', 'mortal_A', 'dead'] : ['setin', 'wait', 'attack', 'dead'];
		AnimeData[1][0]['effect'] = [data['ehit']]; // phit
		AnimeData[1][0]['special'] = [];
		for(let sp of data['sp'])
		{
			let i = parseInt(sp.split('_')[2]);
			while(AnimeData[1][0]['special'].length < i - 1) AnimeData[1][0]['special'].push({"random":0,"list":[]});
			AnimeData[1][0]['special'].push({"random":0,"list":[{"target":"them","cjs":sp,"fixed_pos_owner_bg":0,"full_screen":0}]});
		}
		AnimeData[1][0]['cjs_pos'] = [{"y":0,"x":0}];
		AnimeData[1][0]['special_pos'] = [[{"y":0,"x":0}]];
		successLoading(id);
	}
	else // fail
	{
		document.getElementById('output').innerHTML = "Error: Couldn't load ID " + id;
	}
}

function updateWaking() // update waking up message
{
	let wake = document.getElementById('wakeup');
	if(wake)
	{
		if(wakeCounter <= 0)
		{
			clearInterval(wakeInterval);
			wakeInterval = null;
			wake.innerHTML = "The proxy server is waking up.<br>If nothing happens soon, try reloading the page.<br>You can also try CTRL+F5 to reload this page with a clean cache.<br>If the issue persists, try again later or contact me.";
		}
		else if(wakeCounter <= 100)
		{
			wake.innerHTML = "The proxy server is waking up.<br>Please wait " + wakeCounter + "s before reloading the page.";
		}
		--wakeCounter;
	}
	else
	{
		clearInterval(wakeInterval);
		wakeInterval = null;
	}
}

// on success loading the player
function successLoading(id)
{
	// try to access CORS proxy by requesting a dummy asset
	wakeInterval = setInterval(updateWaking, 1000);
	get(Game.testUri + "?" + Date.now(), startplayer, playerFail, id);
}

// on error loading the player
function failLoading(id)
{
	document.getElementById('temp').remove();
	output = document.getElementById('output');
	removeChilds(output);
	output.appendChild(document.createTextNode("Error: Couldn't load the ID, please reload the page"));
}

function startplayer(id)
{
	beep();
	if(id.startsWith("38") && id.length >= 10)
	{
		const sid = id.slice(0, 7) + "000";
		document.getElementById('output').innerHTML = '<button id="fav-btn"></button><br><a href="https://mizagbf.github.io/GBFAL/?id=' + sid + '" title="Assets for ' + sid + '"><img class="img-link" src="assets/ui/icon/GBFAL.png"></a><div id="AnimationPlayer"></div>';
	}
	else
	{
		const sid = id.split('_')[0];
		const is_wiki = ('wiki' in index && sid in index['wiki']);
		document.getElementById('output').innerHTML = '<button id="fav-btn"></button><br><a href="https://gbf.wiki/'+ (is_wiki ? index['wiki'][sid] : 'index.php?title=Special:Search&search=' + sid) + '" title="' + (is_wiki ? "Wiki page for " + index['wiki'][sid].replaceAll("_", " ") : "Wiki search for " + sid) + '"><img class="img-link" src="assets/ui/icon/wiki.png"></a><a href="https://mizagbf.github.io/GBFAL/?id=' + (id.length == 7 ? 'e'+id : id) + '" title="Assets for ' + id + '"><img class="img-link" src="assets/ui/icon/GBFAL.png"></a><div id="AnimationPlayer"></div>';
	}
	let img = document.createElement("img"); // add character thumbnail on top
	output.insertBefore(img, output.firstChild);
	img.id = "loading";
	img.onload = function() {
		this.id = "character";
	}
	let el = id.split("_");
	if(id.length == 6)
		img.src = Game.externUri + "/img_low/sp/assets/leader/m/" + el[0] + "_01.jpg";
	else if(id.length == 7)
	{
		img.src = Game.externUri + "/img/sp/assets/enemy/s/" + el[0] + ".png";
		img.classList.add('preview');
	}
	else if(id.startsWith("10"))
		img.src = Game.externUri + "/img_low/sp/assets/weapon/m/" + id + ".jpg";
	else if(id.startsWith("20"))
		img.src = Game.externUri + "/img_low/sp/assets/summon/m/" + id + ".jpg";
	else if(id.startsWith("389"))
	{
		img.src = Game.externUri + "/img_low/sp/assets/npc/raid_normal/" + id + "_01_0.jpg";
		img.classList.add('preview');
	}
	else if(id.startsWith("38"))
	{
		img.src = Game.externUri + "/img_low/sp/assets/npc/raid_normal/" + id + "_01.jpg";
		img.classList.add('preview');
	}
	else if(el.length == 1)
		img.src = Game.externUri + "/img_low/sp/assets/npc/m/" + id + "_01.jpg";
	else
		img.src = Game.externUri + "/img_low/sp/assets/npc/m/" + el[0] + "_01_" + el[1] + ".jpg";
	img.onerror = function() { // can't be loaded? character doesn't exist
		document.getElementById('output').innerHTML = "Error: The element isn't accessible yet.";
	}
	// enable favorite
	favButton(true, id, id.length == 7 ? 4 : id.startsWith('10') ? 1 : id.startsWith('20') ? 2 : id.startsWith('38') ? 6 : (id.startsWith('30') || id.startsWith('37') ? 3 : 0));

	// load everything and start!
	require(['createjs'], function() {
		hotfix_createjs(); // apply fix (see below)
		require(["jquery","underscore","backbone", 'player', 'view/cjs', 'script', 'jquery', 'underscore', 'model/cjs-loader']);
	});
}

// Code to add bounding boxes to the animations
var boundingBox_enabled = false;
// Function to add a bounding box to a Bitmap
function addBoundingBox(displayObject) {
	if (!displayObject || displayObject._boundingBox) return;

	// Create a Shape for the bounding box
	const boundingBox = new createjs.Shape();
	boundingBox.mouseEnabled = false; // not sure if needed
	boundingBox.visible = boundingBox_enabled;

	// Update the bounding box on tick or bounds change
	function updateBoundingBox() {
		if(boundingBox.visible)
		{
			const bounds = displayObject.getBounds?.();
			if(bounds) {
				boundingBox.graphics
					.clear()
					.setStrokeStyle(1)
					.beginStroke("green")
					.drawRect(bounds.x, bounds.y, bounds.width, bounds.height)
					.endStroke();
			}
		}
	}

	displayObject.on("tick", updateBoundingBox);
	displayObject._boundingBox = boundingBox;

	// Add the bounding box as a child (it won't affect visual stacking order)
	if(displayObject.parent) {
		displayObject.parent.addChild(boundingBox);
		boundingBox.x = displayObject.x;
		boundingBox.y = displayObject.y;
	}

	// Keep the bounding box synchronized with the displayObject's position
	displayObject.on("added", () => {
		if(displayObject.parent) {
			displayObject.parent.addChild(boundingBox);
			boundingBox.x = displayObject.x;
			boundingBox.y = displayObject.y;
		}
	});

	displayObject.on("removed", () => {
		if(boundingBox.parent)
			boundingBox.parent.removeChild(boundingBox);
	});
	
	displayObject.on("boundtoggle", () => {
		if(boundingBox.parent)
			boundingBox.visible = boundingBox_enabled;
	});
	createjs.Ticker.on("boundingBoxToggle", event => {
		boundingBox.visible = boundingBox_enabled;
	});
}
// Function to fire the boundingBoxToggle, to toggle the visible states of our bounding boxes
function toggle_boundingBox_fireevent()
{
	boundingBox_enabled = !boundingBox_enabled;
	createjs.Ticker.dispatchEvent(new createjs.Event("boundingBoxToggle")); 
}

// Code to patch the createjs 1.0 functions. Some are missing or behave differently from what GBF animations expect.
var createjs_overloaded_func = {};
function hotfix_createjs()
{
	createjs_overloaded_func["bitmap_init"] = window.createjs.Bitmap.prototype.initialize;
	window.createjs.Bitmap.prototype.initialize = function(image) {
		let tmp = this.sourceRect;
		if(!LOCAL && image && image.crossOrigin == null) image.crossOrigin = "anonymous"; // set origin
		createjs_overloaded_func["bitmap_init"].call(this, image);
		if(tmp) this.sourceRect = tmp; // set the source rect AFTER
		addBoundingBox(this);
	};
	
	window.createjs.DisplayObject.prototype.getStage = function() {
		return cjsViewList[animeVersion].stage;
	}
}

function playerFail(id)
{
	document.getElementById('output').innerHTML = "Error: Failed to load the player.<br>Try reloading the page or report the issue if it persists.";
}

// on success requesting a debug character json
function successJSON(id)
{
	is_mc = (!id.startsWith("3") || (id.length == 6));
	AnimeData = JSON.parse(this.response); // parse the data
	if('id' in AnimeData[1][0]) mc_id = AnimeData[1][0]['id'];
	if('wpn' in AnimeData[1][0]) mc_wpn = AnimeData[1][0]['wpn'];
	startplayer(id);
}

// on error requesting a debug character json
function failJSON(id)
{
	document.getElementById('output').innerHTML = "Error: Couldn't load ID " + id;
}

function updateList(node, elems, clear_node = true) // update a list of elements
{
	if(clear_node)
		node.innerHTML = "";
	for(let e of elems)
	{
		switch(e[1])
		{
			case 3: // character, skin, ...
			{
				let r = ((e[0].slice(0, 3) == "371") ? display_skins(e[0], [0, 1000]) : display_characters(e[0], [0, 1000, 0, 1000, 0, 1000]));
				if(r != null)
				{
					for(const el of r)
					{
						addIndexImage(node, el[1], el[0], el[2]);
					}
				}
				break;
			}
			case 2: // summon
			{
				let r = display_summons(e[0], null, [0, 1000]);
				if(r != null)
				{
					for(const el of r)
					{
						addIndexImage(node, el[1], el[0], el[2]);
					}
				}
				break;
			}
			case 1: // weapon
			{
				addIndexImage(node, "GBF/assets_en/img_low/sp/assets/weapon/m/" + e[0] + ".jpg", e[0]);
				break;
			}
			case 0: // mc
			{
				addIndexImage(node, "GBF/assets_en/img_low/sp/assets/leader/m/" + e[0].split('_')[0] + "_01.jpg", e[0]);
				break;
			}
			case 4: // enemy
			{
				addIndexImage(node, "GBF/assets_en/img/sp/assets/enemy/s/" + e[0] + ".png", e[0]).onload = function() {
					this.classList.remove("loading");
					this.classList.add("clickable");
					this.classList.add("preview");
				};
				break;
			}
			case 6: // partner
			{
				
				addIndexImage(node, "GBF/assets_en/img_low/sp/assets/npc/raid_normal/" + e[0] + "_01" + (e[0].startsWith("389") ? "_0" : "") + ".jpg", e[0]).onload = function() {
					this.classList.remove("loading");
					this.classList.add("clickable");
					this.classList.add("preview");
				};
				break;
			}
		}
	}
}

function setBackground(url) // change battle background
{
	let anibg = document.getElementById('canvas-bg');
	if(anibg == null) return;
	anibg.innerHTML = '<img style="width:100%" src="'+url+'">'
	pushPopup("Battle background set to " + url.split('/').slice(-1));
	openTab("view");
	var rect = anibg.getBoundingClientRect();
	if(
		rect.bottom < 0 ||
		rect.right < 0 ||
		rect.top > (window.innerHeight || document.documentElement.clientHeight) ||
		rect.left > (window.innerWidth || document.documentElement.clientWidth)
	)
		anibg.scrollIntoView();
	localStorage.setItem("gbfap-background", url);
};

function addIndexImage(node, path, id, onerr, is_bg = false) // add an image to an index. path must start with "GBF/" if it's not a local asset.
{
	if(is_bg) // two behavior based on is_bg
	{
		let img = document.createElement("img");
		node.appendChild(img);
		img.title = id;
		img.classList.add("loading");
		img.setAttribute('loading', 'lazy');
		if(onerr != null)
			img.onerror = onerr;
		else
			img.onerror = function() {
				this.remove();
			};
		img.src = path.replace("GBF/", idToEndpoint(id));
		img.onload = function() {
			this.classList.remove("loading");
			this.classList.add("clickable");
			this.classList.add("index-image");
			this.classList.add("preview");
			this.onclick = function()
			{
				setBackground(Game.bgUri + img.src.split('assets_en/')[1].replace('img_low', 'img'));
			};
		};
		return img;
	}
	else
	{
		let a = document.createElement("a");
		let img = document.createElement("img");
		a.appendChild(img);
		node.appendChild(a);
		img.classList.add("loading");
		img.setAttribute('loading', 'lazy');
		img.onload = function() {
			this.classList.remove("loading");
			this.classList.add("clickable");
			this.classList.add("index-image");
		};
		if(onerr != null)
			img.onerror = onerr;
		else
			img.onerror = function() {
				this.parentNode.remove();
				this.remove();
			};
		img.src = path.replace("GBF/", idToEndpoint(id));
		img.title = id;
		a.href = "?id="+id;
		return img;
	}
}

// =================================================================================================
// visual elements management
function display(node, key, argA, argB, pad, reverse, specific_text = null) // generic function to display the index lists
{
	let callback = null;
	let target = null;
	let start = null;
	let lengths = null;
	let onload = null;
	switch(key)
	{
		case "characters":
			callback = display_characters;
			target = index;
			start = "30";
			lengths = [10, 14];
			break;
		case "skins":
			callback = display_skins;
			target = index;
			start = "37";
			lengths = [10, 14];
			break;
		case "partners":
			callback = display_partners;
			target = index;
			start = "38";
			lengths = [10];
			onload = function() {
				this.classList.remove("loading");
				this.classList.add("clickable");
				this.classList.add("preview");
			};
			break;
		case "summons":
			callback = display_summons;
			target = index;
			start = "20";
			lengths = [10];
			break;
		case "weapons":
			callback = display_weapons;
			target = index;
			start = "10";
			lengths = [10, 13];
			break;
		case "job":
			callback = display_mc;
			target = index;
			start = "";
			lengths = [6];
			break;
		case "enemies":
			callback = display_enemies;
			target = index;
			start = "" + argA + argB;
			lengths = [7];
			onload = function() {
				this.classList.remove("loading");
				this.classList.add("clickable");
				this.classList.add("preview");
			};
			break;
		case "background":
			callback = display_backgrounds;
			target = index["background"];
			break;
		default:
			return;
	}
	let slist = {};
	for(const id in target)
	{
		if((lengths != null && !lengths.includes(id.length)) || (start != null && !id.startsWith(start))) continue;
		let r = callback(id, argA, argB);
		if(r != null)
		{
			if(pad) slist[id.padStart(20, "0")] = r;
			else slist[id] = r;
		}
	}
	const keys = reverse ? Object.keys(slist).sort().reverse() : Object.keys(slist).sort();
	if(keys.length > 0)
	{
		if(specific_text != null) node.innerHTML = "<div>" + specific_text + "</div>";
		else node.innerHTML = reverse ? "<div>Newest first</div>" : "<div>Oldest first</div>";
	}
	else node.innerHTML = '<div>Empty</div><img src="assets/ui/sorry.png">'
	for(const k of keys)
	{
		for(let r of slist[k])
		{
			let img = addIndexImage(node, r[1], r[0], r[2], (key == "background"));
			if(onload != null) img.onload = onload;
		}
	}
}

function default_onerror()
{
	this.parentNode.remove()
	this.remove();
}

function display_characters(id, range, unused = null)
{
	let e = id.split("_");
	let val = parseInt(e[0].slice(4, 7));
	switch(id[2])
	{
		case '4':
			if(val < range[4] || val >= range[5]) return null;
			break;
		case '3':
			if(val < range[2] || val >= range[3]) return null;
			break;
		case '2':
			if(val < range[0] || val >= range[1]) return null;
			break;
		default:
			return null;
	}
	let u = "01";
	try
	{
		switch(index[id]['v'][index[id]['v'].length - 1][0][0])
		{
			case "5": u = "03"; break;
			case "6": u = "04"; break;
			default: break;
		}
	} catch(err) {
		console.error("Exception thrown", err.stack);
	}
	let onerr = default_onerror;
	if(u != "01")
	{
		onerr = function() {
			this.src = this.src.replace('_'+u, '_'+u+'_01'); // hack for lyria and equivalent
			this.onerror = function() {
				this.src.replace('_'+u+'_01', '_01');
				this.onerror = default_onerror;
			}
		}
	}
	return [[id, "GBF/assets_en/img_low/sp/assets/npc/m/" + e[0] + "_" + u + (e.length == 2 ? "_"+e[1] : "") + ".jpg", onerr]];
}

function display_skins(id, range, unused = null)
{
	let val = parseInt(id.slice(4, 7));
	if(val < range[0] || val >= range[1]) return null;
	return [[id, "GBF/assets_en/img_low/sp/assets/npc/m/" + id + "_01.jpg", default_onerror]];
}

function display_partners(id, prefix, unused = null)
{
	if(id.startsWith("389"))
		return [[id, "GBF/assets_en/img_low/sp/assets/npc/raid_normal/" + id + "_01_0.jpg", default_onerror]];
	else
		return [[id, "GBF/assets_en/img_low/sp/assets/npc/raid_normal/" + id + "_01.jpg", default_onerror]];
}

function display_summons(id, rarity, range)
{
	if(rarity != null && id[2] != rarity) return null;
	let val = parseInt(id.slice(4, 7));
	if(val < range[0] || val >= range[1]) return null;
	let u = "";
	try
	{
		switch(index[id]['v'][index[id]['v'].length - 1][0][0])
		{
			case "4": u = "_02"; break;
			case "5": u = "_02"; break;
			case "6": u = "_04"; break;
			default: break;
		}
	} catch(err) {
		console.error("Exception thrown", err.stack);
	}
	let onerr = default_onerror;
	if(u != "")
	{
		onerr = function() {
			if(u == "_04")
			{
				u = "_02";
				this.src = this.src.replace("_04", "_02");
				this.onerror = function() {
					this.src = this.src.replace(u, "");
					this.onerror = default_onerror;
				}
			}
			else
			{
				this.src = this.src.replace(u, "");
				this.onerror = default_onerror;
			}
		}
	}
	return [[id, "GBF/assets_en/img_low/sp/assets/summon/m/" + id + u + ".jpg", onerr]];
}

function display_weapons(id, rarity, proficiency)
{
	if(id[2] != rarity || id[4] != proficiency) return null;
	return [[id, "GBF/assets_en/img_low/sp/assets/weapon/m/"+id+".jpg", default_onerror]];
}

function display_mc(id, unusedA = null, unusedB = null)
{
	return [[id, "GBF/assets_en/img_low/sp/assets/leader/m/" + id + "_01.jpg", default_onerror]];
}

function display_enemies(id, unusedA = null, unusedB = null)
{
	return [[id, "GBF/assets_en/img/sp/assets/enemy/s/" + id + ".png", default_onerror]];
}

function display_backgrounds(id, key, unused = null)
{
	let path = null;
	switch(id.split('_')[0])
	{
		case "common":
			if(key != "common") return null;
			path = ["sp/raid/bg/", ".jpg"];
			break;
		case "main":
			if(key != "main") return null;
			path = ["sp/guild/custom/bg/", ".png"];
			break;
		case "event":
			if(key != "event") return null;
			path = ["sp/raid/bg/", ".jpg"];
			break;
		default:
			if(key != "") return null;
			path = ["sp/raid/bg/", ".jpg"];
			break;
	};
	let ret = [];
	let onerr = function()
	{
		this.remove();
	};
	for(let i of index['background'][id][0])
	{
		ret.push([i, "GBF/assets_en/img_low/" + path[0] + i + path[1], onerr]);
	}
	return ret;
}

// =================================================================================================
// Below is code reused from GBFAL

// =================================================================================================
// bookmark, history
function favButton(state, id = null, search_type = null) // favorite button control
{
	let fav = document.getElementById('fav-btn');
	if(state)
	{
		fav.style.display = null;
		fav.onclick = function() { toggleBookmark(id, search_type); };
		for(let e of bookmarks)
		{
			if(e[0] == id)
			{
				setBookmarkButton(true);
				return;
			}
		}
		setBookmarkButton(false);
	}
	else
	{
		fav.style.display = "none";
		fav.onclick = null;
	}
}

function updateBookmark() // update bookmark list
{
	let node = document.getElementById('bookmark');
	if(bookmarks.length == 0)
	{
		node.innerHTML = "";
		node.appendChild(document.createTextNode("No bookmarked elements."));
		return;
	}
	updateList(node, bookmarks);
	node.appendChild(document.createElement("br"));
	let div = document.createElement("div");
	div.classList.add("std-button-container");
	let btn = document.createElement("button");
	btn.className = "std-button";
	btn.innerHTML = "Clear";
	btn.onclick = clearBookmark;
	div.appendChild(btn);
	btn = document.createElement("button");
	btn.className = "std-button";
	btn.innerHTML = "Export";
	btn.onclick = exportBookmark;
	div.appendChild(btn);
	btn = document.createElement("button");
	btn.className = "std-button";
	btn.innerHTML = "Import";
	btn.onclick = importBookmark;
	div.appendChild(btn);
	node.appendChild(div);
}

function clearBookmark() // clear the bookmark list
{
	localStorage.removeItem('gbfap-bookmark');
	let fav = document.getElementById('fav-btn');
	if(fav != null)
	{
		fav.classList.remove("fav-on");
		fav.innerHTML = "☆";
	}
	bookmarks = [];
	updateBookmark();
}

function exportBookmark() // export the bookmark list to the clipboard
{
	try
	{
		bookmarks = localStorage.getItem("gbfap-bookmark");
		if(bookmarks == null)
		{
			bookmarks = [];
		}
		else
		{
			bookmarks = JSON.parse(bookmarks);
		}
		navigator.clipboard.writeText(JSON.stringify(bookmarks));
		pushPopup("Bookmarks have been copied");
	}
	catch(err)
	{
		console.error("Exception thrown", err.stack);
		bookmarks = [];
	}
}

function importBookmark() // import the bookmark list from the clipboard. need localhost or a HTTPS host
{
	navigator.clipboard.readText().then((clipText) => {
		try
		{
			let tmp = JSON.parse(clipText);
			if(typeof tmp != 'object') return;
			let val = false;
			let i = 0;
			while(i < tmp.length)
			{
				let e = tmp[i];
				if(typeof e != 'object' || e.length != 2 || typeof e[0] != 'string' || typeof e[1] != 'number') return;
				if(AnimeID == e[0]) val = true;
				++i;
			}
			bookmarks = tmp;
			localStorage.setItem("gbfap-bookmark", JSON.stringify(bookmarks));
			setBookmarkButton(val);
			updateBookmark();
			pushPopup("Bookmarks have been imported with success");
		}
		catch(err)
		{
			console.error("Exception thrown", err.stack);
		}
	});
}

function pushPopup(string) // display a popup on the top left corner
{
	let div = document.createElement('div');
	div.className = 'popup';
	div.textContent = string;
	document.body.appendChild(div);
	setTimeout(rmPopup, 2500, div);
}

function rmPopup(popup) // remove a popup
{
	popup.parentNode.removeChild(popup);
}

function toggleBookmark(id = null, search_type = null) // toggle bookmark state
{
	try
	{
		bookmarks = localStorage.getItem("gbfap-bookmark");
		if(bookmarks == null)
		{
			bookmarks = [];
		}
		else
		{
			bookmarks = JSON.parse(bookmarks);
		}
	}
	catch(err)
	{
		bookmarks = [];
	}
	if(id != null)
	{
		let fav = document.getElementById('fav-btn');
		if(!fav.classList.contains("fav-on"))
		{
			bookmarks.push([id, search_type]);
			setBookmarkButton(true);
			pushPopup("" + id + " has been bookmarked.");
		}
		else
		{
			for(let i = 0; i < bookmarks.length; ++i)
			{
				if(bookmarks[i][0] == id)
				{
					bookmarks.splice(i, 1);
					break;
				}
			}
			setBookmarkButton(false);
			pushPopup("" + id + " has been removed from the bookmarks.");
		}
		localStorage.setItem("gbfap-bookmark", JSON.stringify(bookmarks));
	}
	updateBookmark();
}

function setBookmarkButton(val) // set bookmark button state
{
	let fav = document.getElementById('fav-btn');
	if(fav != null)
	{
		if(val)
		{
			fav.classList.add("fav-on");
			fav.innerHTML = "★";
		}
		else
		{
			fav.classList.remove("fav-on");
			fav.innerHTML = "☆";
		}
	}
}

function clearHistory() // clear the history
{
	localStorage.removeItem('gbfap-history');
	updateHistory();
}

function updateHistory(id = null, search_type = null) // update the history list
{
	// update local storage
	try
	{
		searchHistory = localStorage.getItem("gbfap-history");
		if(searchHistory == null)
		{
			searchHistory = [];
		}
		else
		{
			searchHistory = JSON.parse(searchHistory);
			if(searchHistory.length > HISTORY_LENGTH) searchHistory = searchHistory.slice(searchHistory.length - HISTORY_LENGTH); // resize if too big to not cause problems
		}
	}
	catch(err)
	{
		searchHistory = [];
	}
	if(id != null)
	{
		for(let e of searchHistory)
		{
			if(e[0] == id) return; // don't update if already in
		}
		searchHistory.push([id, search_type]);
		if(searchHistory.length > HISTORY_LENGTH) searchHistory = searchHistory.slice(searchHistory.length - HISTORY_LENGTH);
		localStorage.setItem("gbfap-history", JSON.stringify(searchHistory));
	}
	let node = document.getElementById('history');
	if(searchHistory.length == 0)
	{
		node.innerHTML = "";
		node.appendChild(document.createTextNode("No elements in your history."));
		return;
	}
	updateList(node, searchHistory.slice().reverse());
	node.appendChild(document.createElement("br"));
	let div = document.createElement("div");
	div.classList.add("std-button-container");
	let btn = document.createElement("button");
	btn.innerHTML = "Clear";
	btn.className = "std-button";
	btn.onclick = clearHistory;
	div.appendChild(btn);
	node.appendChild(div);
}

// =================================================================================================
// html related
function clock() // update the "last updated" clock
{
	let now = new Date();
	let elapsed = (now - (new Date(timestamp))) / 1000;
	let msg = ""
	if(elapsed < 120) msg = Math.trunc(elapsed) + " seconds ago.";
	else if(elapsed < 7200) msg = Math.trunc(elapsed / 60) + " minutes ago.";
	else if(elapsed < 172800) msg = Math.trunc(elapsed / 3600) + " hours ago.";
	else if(elapsed < 5270400) msg = Math.trunc(elapsed / 86400) + " days ago.";
	else if(elapsed < 63115200) msg = Math.trunc(elapsed / 2635200) + " months ago.";
	else msg = Math.trunc(elapsed / 31557600) + " years ago.";
	document.getElementById('timestamp').textContent = "Last update: " + msg;
}

function resetTabs() // reset the tab state
{
	let tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++)
		tabcontent[i].style.display = "none";
	let tabbuttons = document.getElementsByClassName("tabbutton");
	for (let i = 0; i < tabbuttons.length; i++)
		tabbuttons[i].classList.remove("active");
}

function openTab(tabName) // reset and then select a tab
{
	resetTabs();
	document.getElementById(tabName).style.display = "";
	document.getElementById("tab-"+tabName).classList.add("active");
}

// =================================================================================================
// utility
function idToEndpoint(id) // use the id as a seed to return one of the endpoints (to benefit from the sharding)
{
	return ENDPOINTS[parseInt(id.replace(/\D/g,'')) % ENDPOINTS.length];
}

function makeIndexSummary(node, name, is_parent, sub_level, icon = null) // used for the html. make the details/summary elements.
{
	let details = document.createElement("details");
	let summary = document.createElement("summary");
	summary.classList.add("element-detail");
	if(sub_level > 0)
	{
		summary.classList.add("sub-detail");
		if(sub_level > 1) summary.classList.add("sub-detail-child");
	}
	if(icon != null)
	{
		let img = document.createElement("img");
		img.classList.add(sub_level ? "sub-detail-icon" : "detail-icon");
		img.src = icon;
		summary.appendChild(img);
	}
	else
	{
		let div = document.createElement("span");
		div.classList.add(sub_level ? "sub-detail-icon" : "detail-icon");
		summary.appendChild(div);
	}
	summary.appendChild(document.createTextNode(name));
	details.appendChild(summary);
	node.appendChild(details);
	if(is_parent)
	{
		let div = document.createElement("div");
		div.className = "subdetails";
		details.appendChild(div);
		return [div, details];
	}
	else
	{
		let h3 = document.createElement("h3");
		h3.className = "container mobile-big";
		details.appendChild(h3);
		return [h3, details];
	}
}
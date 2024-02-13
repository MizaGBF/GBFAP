// constant
const LOCAL = false; // set to true if assets are on the same machine
const CORS = 'https://gbfcp2.onrender.com/' // CORS Proxy to use (if LOCAL is true)
const HISTORY_LENGTH = 20; // size limit of the history
const PLAYER_ENEMIES = ["enemy_9100211", "enemy_9100221", "enemy_6204152"]; // rotating enemies
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
    ["Year 2024 (Dragon)", [0, -1, 0, -1, 504, 999]],
    ["Year 2023 (Rabbit)", [0, -1, 0, -1, 443, 504]],
    ["Year 2022 (Tiger)", [0, -1, 0, -1, 379, 443]],
    ["Year 2021 (Ox)", [74, 75, 0, -1, 316, 379]],
    ["Year 2020 (Rat)", [73, 74, 281, 323, 256, 316]],
    ["Year 2019 (Pig)", [72, 73, 263, 281, 199, 256]],
    ["Year 2018 (Dog)", [71, 72, 233, 263, 149, 199]],
    ["Year 2017 (Chicken)", [0, -1, 173, 233, 108, 149]],
    ["Year 2016 (Monkey)", [47, 71, 113, 173, 72, 108]],
    ["Year 2015 (Sheep)", [30, 47, 51, 113, 30, 72]],
    ["Year 2014", [0, 30, 0, 51, 0, 30]]
];
const SKINS = [
    ["ID 200 to 299", [200, 300]],
    ["ID 100 to 199", [100, 200]],
    ["ID 000 to 099", [0, 100]]
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
const BACKGROUNDS = [
    ["Mains", "main"],
    ["Commons", "common"],
    ["Events", "event"],
    ["Others", ""]
];

// animation player data
var AnimeID = null; // will contain the Character id
var AnimeData = null; // will contain the Character data for the player
var AnimeDebug = false; // debug only, ignore it
var AnimeEnemy = PLAYER_ENEMIES[Math.floor(Math.random() * PLAYER_ENEMIES.length)];
var Game = LOCAL ? // Game variable used by GBF scripts
{
    xjsUri: '',
    jsUri: '',
    imgUri: 'img',
    gbfapUri: '/',
    setting: {}
} :
{
    xjsUri: 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
    jsUri: CORS + 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
    imgUri: CORS + 'https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img',
    gbfapUri: '/GBFAP/',
    setting: {}
};
var debug_path = null;
// global variables
var index = {} // data index (loaded from data.json)
var timestamp = Date.now(); // timestamp (loaded from changelog.json)
var lastsearches = []; // history
var bookmarks = []; // bookmarks
var intervals = []; // on screen notifications
var is_mc = false; // set to true if we are dealing with main character animations
var mc_id = null; // used by classes only
var mc_wpn = null; // used by weapons and classes

// ========================================================================
// utility

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
    xhr.timeout = 120000;
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

function switchToDebug()
{
    if(!AnimeDebug)
    {
        let d = getDebug();
        if(d == null) return false;
        Game = {
            xjsUri: 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
            jsUri: CORS + d +'/debug/https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
            imgUri: CORS + d + '/debug/https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img',
            gbfapUri: '/GBFAP/',
            setting: {}
        };
        debug_path = d;
        AnimeDebug = true;
        return true;
    }
    else return true;
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
    updateHistory(null, null);
    toggleBookmark(null, null);
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
        {
            updated = json["new"].reverse();
            if(updated.length > 0) // init Updated list
            {
                updateList(document.getElementById('new'), updated);
            }
        }
        timestamp = json.timestamp;
        clock();
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
    parents = makeIndexSummary(content, "Characters", true, false, "assets/ui/icon/characters.png");
    for(let i of CHARACTERS)
    {
        elems = makeIndexSummary(parents[0], i[0], false, true);
        const tmp = [elems[0], i[1]];
        elems[1].onclick = function (){
            display(tmp[0], 'characters', tmp[1], null, false, true);
            this.onclick = null;
        };
    }
    parents = makeIndexSummary(content, "Skins", true, false, "assets/ui/icon/skins.png");
    for(let i of SKINS)
    {
        elems = makeIndexSummary(parents[0], i[0], false, true);
        const tmp = [elems[0], i[1]];
        elems[1].onclick = function (){
            display(tmp[0], 'skins', tmp[1], null, false, true);
            this.onclick = null;
        };
    }
    parents = makeIndexSummary(content, "Weapons", true, false, "assets/ui/icon/weapons.png");
    for(let i of WEAPONS_RARITY)
    {
        let inter = makeIndexSummary(parents[0], i[0], true, true, i[2]);
        for(let j of WEAPONS)
        {
            elems = makeIndexSummary(inter[0], j[0], false, true, j[2]);
            const tmp = [elems[0], i[1], j[1]];
            elems[1].onclick = function (){
                display(tmp[0], 'weapons', tmp[1], tmp[2], false, true);
                this.onclick = null;
            };
        }
    }
    elems = makeIndexSummary(content, "Classes", false, false, "assets/ui/icon/classes.png");
    {
        const tmp = elems[0];
        elems[1].onclick = function (){
            display(tmp, 'job', null, null, false, true);
            this.onclick = null;
        };
    }
    parents = makeIndexSummary(content, "Backgrounds", true, false, "assets/ui/icon/backgrounds.png");
    parents[0].parentNode.id = "background-index";
    for(let i of BACKGROUNDS)
    {
        elems = makeIndexSummary(parents[0], i[0], false, true);
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
        if(!isNaN(el[0]) && el[0].length >= 10 && ["302", "303", "304", "371", "101", "102", "103", "104"].includes(el[0].slice(0, 3)))
        {
            loadCharacter(id);
        }
        else if(id.length == 6 && !isNaN(id))
        {
            loadMC(id);
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
        updateHistory(id+style, parseInt(id[0]));
        AnimeData = [];
        AnimeData.push([]);
        AnimeData.push([]);
        AnimeData.push({1: {1: ""},2: {1: ""}});
        const data = index[id+style];
        if('w' in data)
        {
            is_mc = true;
            mc_wpn = data['w'];
        }
        for(let d of data['v'])
        {
            AnimeData[0].push(d[0]); // name
            const p = AnimeData[1].length;
            AnimeData[1].push({});
            AnimeData[1][p]["cjs"] = [d[1]]; // cjs
            AnimeData[1][p]['action_label_list'] = ['ability', d[2], 'stbwait', 'short_attack', 'double', 'triple']; // mortal
            AnimeData[1][p]['effect'] = [d[3]]; // phit
            AnimeData[1][p]['special'] = [{"random":0,"list":[{"target":"them","cjs":d[4],"fixed_pos_owner_bg":0,"full_screen":+d[5]}]}]; // special, fullscreen
            AnimeData[1][p]['cjs_pos'] = [{"y":0,"x":0}];
            AnimeData[1][p]['special_pos'] = [[{"y":0,"x":0}]];
        }
        successLoading(id+style);
    }
    else // fail
    {
        // DEBUG ONLY
        document.getElementById('output').innerHTML = '<img src="assets/ui/loading.gif" id="temp"><div id="AnimationPlayer"></div><div class="tips">Loading Debug Data.<br>Wait a minute or two before reloading if it takes too much time.</div>';
        if(switchToDebug() && id.startsWith('30') && id.length >= 10 && !LOCAL) // call debug mode (can be disabled by setting AnimeDebug to true)
        {
            let fav = document.getElementById('fav-btn');
            if(fav != null) fav.remove();
            get(CORS + debug_path + "/json/" + id + ".json?" + timestamp, successJSON, failJSON, id);
            return
        }
        document.getElementById('output').innerHTML = "Error: Couldn't load ID " + id + style;
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
            AnimeData[1][p]['special'] = [{"random":0,"list":[{"target":"them","cjs":d[4],"fixed_pos_owner_bg":0,"full_screen":+d[5]}]}]; // special, fullscreen
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

// on success loading the player
function successLoading(id)
{
    // try to access CORS proxy by requesting the enemy
    get(Game.jsUri + "/model/manifest/" + AnimeEnemy + ".js", startplayer, playerFail, id);
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
    document.getElementById('output').innerHTML = '<button id="fav-btn"></button><br><a href="https://gbf.wiki/index.php?title=Special:Search&search=' + id + '">Wiki</a><br><a href="https://mizagbf.github.io/GBFAL/?id=' + id + '">Assets</a><div id="AnimationPlayer"></div>';
    
    if(!AnimeDebug)
    {
        let img = document.createElement("img"); // add character thumbnail on top
        output.insertBefore(img, output.firstChild);
        img.id = "loading";
        img.onload = function() {
            this.id = "character";
        }
        let el = id.split("_");
        if(el.length == 1 && el[0].length == 6)
            img.src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/leader/m/" + el[0] + "_01.jpg";
        else if(id.startsWith("10"))
            img.src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/weapon/m/" + id + ".jpg";
        else if(el.length == 1)
            img.src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/npc/m/" + id + "_01.jpg";
        else
            img.src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/npc/m/" + el[0] + "_01_" + el[1] + ".jpg";
        img.onerror = function() { // can't be loaded? character doesn't exist
            let result = this.parentNode.parentNode;
            this.parentNode.remove();
            this.remove();
            if(result.childNodes.length <= 2) result.remove();
        }
    }
    // enable favorite
    favButton(true, id, id.startsWith('10') ? 1 : (id.startsWith('30') || id.startsWith('37') ? 3 : 0));

    // load the player
    require(["createjs"], function (b) {
        window.createjs = b
    });
    require(['player','lib/common', 'view/cjs', 'script', 'jquery', 'underscore', 'model/cjs-loader']);
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

function updateList(node, elems) // update a list of elements
{
    node.innerHTML = "";
    for(let e of elems)
    {
        switch(e[1])
        {
            case 3: // character, skin, ...
            {
                if(e[0].includes('_st'))
                    addIndexImage(node, "GBF/assets_en/img_low/sp/assets/npc/m/" + e[0].split('_')[0] + "_01_" + e[0].split('_')[1] + ".jpg", e[0]);
                else
                    addIndexImage(node, "GBF/assets_en/img_low/sp/assets/npc/m/" + e[0] + "_01.jpg", e[0]);
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
        }
    }
}

function setExternalBackground(url) // change battle background
{
    let anibg = document.getElementById('anime-bg');
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
};

function addIndexImage(node, path, id, is_bg = false) // add an image to an index. path must start with "GBF/" if it's not a local asset.
{
    if(is_bg) // two behavior based on is_bg
    {
        let img = document.createElement("img");
        node.appendChild(img);
        img.title = id;
        img.classList.add("loading");
        img.setAttribute('loading', 'lazy');
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
                setExternalBackground(img.src.replace('img_low/', 'img/').replace('-a1-', '-a-').replace('-a2-', '-a-').replace('-a3-', '-a-').replace('-a4-', '-a-').replace('-a5-', '-a-'));
            };
        };
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
        img.onerror = function() {
            this.parentNode.remove();
            this.remove();
        };
        img.src = path.replace("GBF/", idToEndpoint(id));
        img.title = id;
        a.href = "?id="+id;
    }
}

// =================================================================================================
// visual elements management
function display(node, key, argA, argB, pad, reverse) // generic function to display the index lists
{
    let callback = null;
    let target = null;
    let start = null;
    let lengths = null;
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
    if(keys.length > 0) node.innerHTML = reverse ? "<div>Newest first</div>" : "<div>Oldest first</div>";
    else node.innerHTML = '<div>Empty</div><img src="assets/ui/sorry.png">'
    for(const k of keys)
    {
        for(let r of slist[k])
        {
            addIndexImage(node, r[1], r[0], (key == "background"));
        }
    }
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
    return [[id, "GBF/assets_en/img_low/sp/assets/npc/m/" + e[0] + "_01" + (e.length == 2 ? "_"+e[1] : "") + ".jpg"]];
}

function display_skins(id, range, unused = null)
{
    let val = parseInt(id.slice(4, 7));
    if(val < range[0] || val >= range[1]) return null;
    return [[id, "GBF/assets_en/img_low/sp/assets/npc/m/" + id + "_01.jpg"]];
}

function display_weapons(id, rarity, proficiency)
{
    if(id[2] != rarity || id[4] != proficiency) return null;
    return [[id, "GBF/assets_en/img_low/sp/assets/weapon/m/"+id+".jpg"]];
}

function display_mc(id, unusedA = null, unusedB = null)
{
    return [[id, "GBF/assets_en/img_low/sp/assets/leader/m/" + id + "_01.jpg"]];
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
    for(let i of index['background'][id][0])
    {
        ret.push([i, "GBF/assets_en/img_low/" + path[0] + i + path[1]]);
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
            let last_id_f = (last_id == null) ? null : (isNaN(last_id) ? last_id : last_id.replace(/\D/g,'')); // strip letters
            while(i < tmp.length)
            {
                let e = tmp[i];
                if(typeof e != 'object' || e.length != 2 || typeof e[0] != 'string' || typeof e[1] != 'number') return;
                if(last_id_f == e[0] && last_type == e[1]) val = true;
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
    intervals.push(setInterval(rmPopup, 2500, div));
}

function rmPopup(popup) // remove a popup
{
    popup.parentNode.removeChild(popup);
    clearInterval(intervals[0]);
    intervals.shift();
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
    document.getElementById('timestamp').innerHTML = "Last update: " + msg;
    setTimeout(clock, now.getTime() % 1000 + 1);
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

function makeIndexSummary(node, name, is_parent, is_sub_detail, icon = null) // used for the html. make the details/summary elements.
{
    let details = document.createElement("details");
    let summary = document.createElement("summary");
    summary.classList.add("element-detail");
    if(is_sub_detail) summary.classList.add("sub-detail");
    if(icon != null)
    {
        let img = document.createElement("img");
        img.classList.add(is_sub_detail ? "sub-detail-icon" : "detail-icon");
        img.src = icon;
        summary.appendChild(img);
    }
    else
    {
        let div = document.createElement("span");
        div.classList.add(is_sub_detail ? "sub-detail-icon" : "detail-icon");
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
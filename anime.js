// main file
var AnimeData = null; // will contain the Character data for the player
var AnimeLocal = false; // set to true if assets are on the same machine
var AnimeDebug = false; // debug only, ignore it
var corsProxy = 'https://gbfcp2.onrender.com/' // CORS Proxy (if AnimeLocal is true)
var Game = {
    xjsUri: 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
    jsUri: corsProxy + 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
    imgUri: corsProxy + 'https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img',
    setting: {}
};
if(AnimeLocal) // local install version
{
    Game = {
        xjsUri: '',
        jsUri: '',
        imgUri: 'img',
        setting: {}
    };
}

var index_files = ["302", "303", "304", "371", "101", "102", "103", "104", "mc"];
var index = {}
var timestamp = Date.now();

var endpoints = [ // possible asset endpoints
    "prd-game-a-granbluefantasy.akamaized.net/",
    "prd-game-a1-granbluefantasy.akamaized.net/",
    "prd-game-a2-granbluefantasy.akamaized.net/",
    "prd-game-a3-granbluefantasy.akamaized.net/",
    "prd-game-a4-granbluefantasy.akamaized.net/",
    "prd-game-a5-granbluefantasy.akamaized.net/"
];
var counter = 0; // endpoint counter (gbf doesn't support http/2 so we cycle through the endpoints)
var is_mc = false; // set to true if we are dealing with main character animations
var mc_id = null; // used by classes only
var mc_wpn = null; // used by weapons and classes

// ========================================================================
// Utility

// generic xhr request function
// id is passed to the callbacks
// default timeout is 60s
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
                load_try = true;
                err_callback.apply(xhr, [id]);
            }
        }
    };
    xhr.open("GET", url, true);
    xhr.timeout = 60000;
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
function getParam()
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
function getEndpoint()
{
    let e = endpoints[counter];
    counter = (counter + 1) % endpoints.length;
    return e;
}

// add image to node
function addImage(node, path, id, d = null)
{
    let img = document.createElement("img");
    let ref = document.createElement('a');
    ref.setAttribute('href', "?id=" + id + (d ? d : ""));
    node.appendChild(ref);
    ref.appendChild(img);
    img.id  = "loading";
    img.loading = "lazy";
    img.onerror = function() {
        this.remove();
    }
    img.onload = function() {
        this.id = "done"
    }
    img.src = "https://" + getEndpoint() + "assets_en/img_low/" + path; 
}

// ========================================================================
// entry point / loading
function init()
{
    if(getParam() == null)
    {
        document.getElementById('result').remove();
    }
    get("json/changelog.json?" + timestamp, initChangelog, initChangelog, null);
}

// set the last update time
function initChangelog(unusued)
{
    try{
        let json = JSON.parse(this.response);
        timestamp = new Date(json['timestamp']);
        let date = timestamp.toISOString();
        timestamp = timestamp.getTime();
        document.getElementById('timestamp').innerHTML += " " + date.split('T')[0] + " " + date.split('T')[1].split(':').slice(0, 2).join(':') + " UTC";
    }catch{
        document.getElementById('timestamp').innerHTML = "";
    }
    get("json/"+index_files[0]+".json?" + timestamp, initIndex, initIndex, 0);
}

function initIndex(target)
{
    try{
        index[index_files[target]] = JSON.parse(this.response);
    }catch{}
    target++;
    if(target < index_files.length)
        get("json/"+index_files[target]+".json?" + timestamp, initIndex, initIndex, target);
    else
    {
        let id = getParam();
        if(id != null && id.length >= 9)
        {
            let el = id.split("_");
            if(!isNaN(el[0]) && el[0].length >= 10 && ["302", "303", "304", "371", "101", "102", "103", "104"].includes(el[0].slice(0, 3)))
            {
                loadCharacter(id);
            }
            else if(id.length == 9 && el.length == 2 && el[0].length == 6 && !isNaN(el[0]))
            {
                loadMC(id);
            }
            else
            {
                document.getElementById('temp').remove();
                result_area = document.getElementById('result');
                result_area.appendChild(document.createTextNode("Error: Invalid ID or Character not found."));
            }
        }
    }
}

function loadCharacter(id)
{
    let ikey = id.slice(0, 3);
    let el = id.split("_");
    let style = "";
    if(el.length == 2)
    {
        id = el[0];
        style = "_"+el[1];
    }
    let ckey = id.startsWith('30') ? id.slice(4, 7) : id.slice(4, 8);
    if(ikey in index && ckey+style in index[ikey])
    {
        AnimeData = [];
        AnimeData.push([]);
        AnimeData.push([]);
        AnimeData.push({1: {1: ""},2: {1: ""}});
        const data = index[ikey][ckey+style];
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
        if(!AnimeDebug && id.startsWith('30') && id.length >= 10) // call debug mode (can be disabled by setting AnimeDebug to true)
        {
            let d = getDebug();
            if(!AnimeLocal && d != null) // testing only
            {
                AnimeDebug = true;
                Game = {
                    xjsUri: 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
                    jsUri: corsProxy + d +'/debug/https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
                    imgUri: corsProxy + d + '/debug/https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img',
                    setting: {}
                }
                get(corsProxy + d + "/json/" + id + ".json?" + timestamp, successJSON, failJSON, id);
                return
            }
        }
        // remove loading image and put error message
        document.getElementById('temp').remove();
        result_area = document.getElementById('result');
        removeChilds(result_area);
        result_area.appendChild(document.createTextNode("Error: Invalid ID"));
    }
}

function loadMC(id)
{
    if('mc' in index && id in index['mc'])
    {
        AnimeData = [];
        AnimeData.push([]);
        AnimeData.push([]);
        AnimeData.push({1: {1: ""},2: {1: ""}});
        const data = index['mc'][id];
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
        // remove loading image and put error message
        document.getElementById('temp').remove();
        result_area = document.getElementById('result');
        removeChilds(result_area);
        result_area.appendChild(document.createTextNode("Error: Invalid ID"));
    }
}

// on success loading the player
function successLoading(id)
{
    document.getElementById('temp').remove(); // remove loading image
    result_area = document.getElementById('result');
    let ref = document.createElement('a'); // add GBFAL link
    ref.setAttribute('href', "https://mizagbf.github.io/GBFAL/?id=" + id);
    ref.appendChild(document.createTextNode("Assets"));
    result_area.insertBefore(ref, result_area.firstChild);
    
    result_area.insertBefore(document.createElement('br'), result_area.firstChild);
    
    ref = document.createElement('a'); // add wiki link
    ref.setAttribute('href', "https://gbf.wiki/index.php?title=Special:Search&search=" + id);
    ref.appendChild(document.createTextNode("Wiki"));
    result_area.insertBefore(ref, result_area.firstChild);
    
    result_area.insertBefore(document.createElement('br'), result_area.firstChild);
    
    if(!AnimeDebug)
    {
        let img = document.createElement("img"); // add character thumbnail on top
        result_area.insertBefore(img, result_area.firstChild);
        img.id  = "loading";
        img.onload = function() {
            this.id = "character"
        }
        let el = id.split("_");
        if(el.length == 2 && el[0].length == 6)
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

    // load the player
    require(["createjs"], function (b) {
        window.createjs = b
    })
    require(['player','lib/common', 'view/cjs', 'script', 'jquery', 'underscore', 'model/cjs-loader'])
}

// on error loading the player
function failLoading(id)
{
    document.getElementById('temp').remove();
    result_area = document.getElementById('result');
    removeChilds(result_area);
    result_area.appendChild(document.createTextNode("Error: Couldn't load the ID, please reload the page"));
}

// ========================================================================
// debug / old or unused
// on success requesting a character json
function successJSON(id)
{
    is_mc = (!id.startsWith("3") || (id.length == 9 && id[6] == '_'));
    AnimeData = JSON.parse(this.response); // parse the data
    if('id' in AnimeData[1][0]) mc_id = AnimeData[1][0]['id'];
    if('wpn' in AnimeData[1][0]) mc_wpn = AnimeData[1][0]['wpn'];
    get(Game.jsUri + "/model/manifest/enemy_6204152.js", successLoading, failLoading, id); // load the player
    // note: my CORS proxy is hosted on a free render.com tier
    // this step add a loading animation while the proxy wakes up
}

// on error requesting a character json
function failJSON(id)
{
    // remove loading image and put error message
    document.getElementById('temp').remove();
    result_area = document.getElementById('result');
    removeChilds(result_area);
    result_area.appendChild(document.createTextNode("Error: Invalid ID"));
}


// ========================================================================
// index display

// display character / weapon
function displayIndexed(elem, key)
{
    let ikey = key.slice(0, 3);
    let skey = null;
    if(key.length == 5) skey = key[4];
    if(ikey in index)
    {
        elem.removeAttribute("onclick");
        let node = document.getElementById('areaindexed'+key);
        let d = getDebug();
        if(d != null)
            d = "&debug=" + d;
        const ordered = Object.keys(index[ikey]).sort().reverse();
        for(const id of ordered)
        {
            const value = index[ikey][id];
            if(skey == null || value["w"][4] == skey)
            {
                let el = id.split("_");
                if(key.startsWith("10"))
                {
                    addImage(node, "sp/assets/weapon/m/" + value["w"] + ".jpg", value["w"], d);
                }
                else
                {
                    let fid = ikey + "0" + el[0] + "000";
                    if(el.length == 1)
                        addImage(node, "sp/assets/npc/m/" + fid + "_01.jpg", fid, d);
                    else
                        addImage(node, "sp/assets/npc/m/" + fid + "_01_" + el[1] + ".jpg", fid + "_" + el[1], d);
                }
            }
        }
    }
}

// display MC
function displayMC(elem)
{
    if("mc" in index)
    {
        elem.removeAttribute("onclick");
        let node = document.getElementById('areamc');
        let d = getDebug();
        if(d != null)
            d = "&debug=" + d;
        for(const [id, value] of Object.entries(index["mc"]))
        {
            addImage(node, "sp/assets/leader/m/" + id.split('_')[0] + "_01.jpg", id, d);
        }
    }
}

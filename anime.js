// main file
var AnimeID = null; // will contain the Character id
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

var index_files = ["data"];
var index = {}
var timestamp = Date.now();
var lastsearches = [];
var bookmarks = [];
var intervals = [];

var endpoints = [ // possible asset endpoints
    "prd-game-a-granbluefantasy.akamaized.net/",
    "prd-game-a1-granbluefantasy.akamaized.net/",
    "prd-game-a2-granbluefantasy.akamaized.net/",
    "prd-game-a3-granbluefantasy.akamaized.net/",
    "prd-game-a4-granbluefantasy.akamaized.net/",
    "prd-game-a5-granbluefantasy.akamaized.net/"
];
var is_mc = false; // set to true if we are dealing with main character animations
var mc_id = null; // used by classes only
var mc_wpn = null; // used by weapons and classes

// ========================================================================
// Bookmark & History (taken from GBFAL)
function updateDynamicList(dynarea, idlist)
{
    for(let e of idlist)
    {
        switch(e[1])
        {
            case 3: // character, skin, ...
            {
                if(e[0].includes('_st'))
                    addImage(dynarea, "sp/assets/npc/m/" + e[0].split('_')[0] + "_01_" + e[0].split('_')[1] + ".jpg", e[0]);
                else
                    addImage(dynarea, "sp/assets/npc/m/" + e[0] + "_01.jpg", e[0]);
                break;
            }
            case 1: // weapon
            {
                addImage(dynarea, "sp/assets/weapon/m/" + e[0] + ".jpg", e[0]);
                break;
            }
            case 0: // mc
            {
                addImage(dynarea, "sp/assets/leader/m/" + e[0].split('_')[0] + "_01.jpg", e[0]);
                break;
            }
        }
    }
}

function favButton(id, search_type)
{
    let fav = document.getElementById('favorite');
    fav.style.display = null;
    fav.onclick = function() { toggleBookmark(id, search_type); };
    for(let e of bookmarks)
    {
        if(e[0] == id)
        {
            if(fav.src != "assets/ui/fav_1.png")
                fav.src = "assets/ui/fav_1.png";
            return;
        }
    }
    if(fav.src != "assets/ui/fav_0.png")
        fav.src = "assets/ui/fav_0.png";
}

function toggleBookmark(id, search_type)
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
        let fav = document.getElementById('favorite');
        if(fav.src.endsWith('fav_0.png'))
        {
            bookmarks.push([id, search_type]);
            fav.src = "assets/ui/fav_1.png";
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
            fav.src = "assets/ui/fav_0.png";
        }
        localStorage.setItem("gbfap-bookmark", JSON.stringify(bookmarks));
    }
    updateBookmark();
}

function updateBookmark()
{
    if(bookmarks.length == 0)
    {
        document.getElementById('bookmark').parentNode.style.display = "none";
        return;
    }
    let bookarea = document.getElementById('bookmark');
    bookarea.parentNode.style.display = null;
    bookarea.innerHTML = "";
    updateDynamicList(bookarea, bookmarks);
    bookarea.appendChild(document.createElement("br"));
    let btn = document.createElement("button");
    btn.innerHTML = "Clear";
    btn.onclick = clearBookmark;
    bookarea.appendChild(btn);
    btn = document.createElement("button");
    btn.innerHTML = "Export";
    btn.onclick = exportBookmark;
    bookarea.appendChild(btn);
    btn = document.createElement("button");
    btn.innerHTML = "Import";
    btn.onclick = importBookmark;
    bookarea.appendChild(btn);
}

function clearBookmark()
{
    localStorage.removeItem('gbfap-bookmark');
    document.getElementById('bookmark').parentNode.style.display = "none";
    document.getElementById('favorite').src = "assets/ui/fav_0.png";
}

function exportBookmark()
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
    navigator.clipboard.writeText(JSON.stringify(bookmarks));
    let div = document.createElement('div');
    div.className = 'popup';
    div.textContent ='Bookmarks have been copied'
    document.body.appendChild(div)
    intervals.push(setInterval(rmPopup, 2500, div));
}

function importBookmark()
{
    navigator.clipboard.readText().then((clipText) => {
        try
        {
            let tmp = JSON.parse(clipText);
            if(typeof tmp != 'object') return;
            let fav = false;
            let i = 0;
            let id = getParam();
            while(i < tmp.length)
            {
                let e = tmp[i];
                if(typeof e != 'object' || e.length != 2 || typeof e[0] != 'string' || typeof e[1] != 'number') return
                if(e[1] == 2 || e[1] == 4 || e[1] == 5) // for GBFAL compatibiliy
                {
                    tmp.splice(i, 1);
                    continue;
                }
                if(id == e[0]) fav = true;
                ++i;
            }
            bookmarks = tmp;
            localStorage.setItem("gbfap-bookmark", JSON.stringify(bookmarks));
            if(fav) document.getElementById('favorite').src = "assets/ui/fav_1.png";
            else document.getElementById('favorite').src = "assets/ui/fav_0.png";
            let div = document.createElement('div');
            div.className = 'popup';
            div.textContent ='Bookmarks have been imported with success'
            document.body.appendChild(div)
            intervals.push(setInterval(rmPopup, 2500, div));
            updateBookmark();
        }
        catch(err) {}
    });
}

function rmPopup(popup) {
    popup.parentNode.removeChild(popup);
    clearInterval(intervals[0]);
    intervals.shift();
}

function clearHistory()
{
    localStorage.removeItem('gbfap-history');
    document.getElementById('history').parentNode.style.display = "none";
}

function updateHistory(id, search_type)
{
    // update local storage
    try
    {
        lastsearches = localStorage.getItem("gbfap-history");
        if(lastsearches == null)
        {
            lastsearches = [];
        }
        else
        {
            lastsearches = JSON.parse(lastsearches);
        }
    }
    catch(err)
    {
        lastsearches = [];
    }
    if(id != null)
    {
        for(let e of lastsearches)
        {
            if(e[0] == id) return; // don't update if already in
        }
        lastsearches.push([id, search_type]);
        localStorage.setItem("gbfap-history", JSON.stringify(lastsearches));
    }
    if(lastsearches.length == 0)
    {
        document.getElementById('history').parentNode.style.display = "none";
        return;
    }
    else if(lastsearches.length > 10)
    {
        lastsearches = lastsearches.slice(lastsearches.length - 10);
    }
    let histarea = document.getElementById('history');
    histarea.parentNode.style.display = null;
    histarea.innerHTML = "";
    updateDynamicList(histarea, lastsearches);
    histarea.appendChild(document.createElement("br"));
    let btn = document.createElement("button");
    btn.innerHTML = "Clear";
    btn.onclick = clearHistory;
    histarea.appendChild(btn);
}

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
function getEndpoint(endpointIndex)
{
    return endpoints[endpointIndex % endpoints.length];
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
    img.src = "https://" + getEndpoint(parseInt(id.replace(/\D/g,''))) + "assets_en/img_low/" + path; 
}

// ========================================================================
// entry point / loading
function init()
{
    // localstorage retrocompatibility (remove in the future, maybe 2024+?)
    let tmp = localStorage.getItem("favorite");
    if(tmp != null)
    {
        localStorage.setItem("gbfap-bookmark", tmp);
        localStorage.removeItem("favorite");
    }
    tmp = localStorage.getItem("lastsearches");
    if(tmp != null)
    {
        localStorage.setItem("gbfap-history", tmp);
        localStorage.removeItem("lastsearches");
    }
    if(getParam() == null)
    {
        document.getElementById('result').remove();
    }
    get("json/changelog.json?" + timestamp, initChangelog, initChangelog, null);
    updateHistory(null, null);
    toggleBookmark(null, null);
}

// set the last update time
function initChangelog(unusued)
{
    try{
        let json = JSON.parse(this.response);
        if(json.hasOwnProperty("new"))
        {
            updated = json["new"].reverse();
            if(updated.length > 0)
            {
                let newarea = document.getElementById('updated');
                newarea.parentNode.style.display = null;
                updateDynamicList(newarea, updated);
            }
        }
        timestamp = json.timestamp;
        clock();
    }catch(err){}
    get("json/"+index_files[0]+".json?" + timestamp, initIndex, initIndex, 0);
}

function clock()
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

function initIndex(target)
{
    try{
        index = JSON.parse(this.response);
    }
    catch(err)
    {
        target--; // to retry
    }
    target++;
    if(target < index_files.length)
        get("json/"+index_files[target]+".json?" + timestamp, initIndex, initIndex, target);
    else
    {
        let id = getParam();
        if(id != null)
        {
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
                document.getElementById('temp').remove();
                result_area = document.getElementById('result');
                result_area.appendChild(document.createTextNode("Error: Invalid ID or Character not found."));
            }
        }
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
    favButton(id, id.startsWith('10') ? 1 : (id.startsWith('30') || id.startsWith('37') ? 3 : 0));

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
    is_mc = (!id.startsWith("3") || (id.length == 6));
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
    elem.removeAttribute("onclick");
    let node = document.getElementById('areaindexed'+key);
    let d = getDebug();
    if(d != null)
        d = "&debug=" + d;
    const ordered = Object.keys(index).sort().reverse();
    for(const id of ordered)
    {
        if(id.length >= 10 && id.startsWith(key))
        {
            if(key.startsWith("10"))
            {
                addImage(node, "sp/assets/weapon/m/" + id + ".jpg", id, d);
            }
            else
            {
                let el = id.split("_");
                if(el.length == 1)
                    addImage(node, "sp/assets/npc/m/" + id + "_01.jpg", id, d);
                else
                    addImage(node, "sp/assets/npc/m/" + el[0] + "_01_" + el[1] + ".jpg", id, d);
            }
        }
    }
}

// display MC
function displayMC(elem)
{
    elem.removeAttribute("onclick");
    let node = document.getElementById('areamc');
    let d = getDebug();
    if(d != null)
        d = "&debug=" + d;
    const ordered = Object.keys(index).sort().reverse();
    for(const id of ordered)
    {
        if(id.length == 6)
            addImage(node, "sp/assets/leader/m/" + id + "_01.jpg", id, d);
    }
}

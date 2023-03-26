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

char_index = null; // character index (for the list of characters)
endpoints = [ // possible asset endpoints
    "prd-game-a-granbluefantasy.akamaized.net/",
    "prd-game-a1-granbluefantasy.akamaized.net/",
    "prd-game-a2-granbluefantasy.akamaized.net/",
    "prd-game-a3-granbluefantasy.akamaized.net/",
    "prd-game-a4-granbluefantasy.akamaized.net/",
    "prd-game-a5-granbluefantasy.akamaized.net/"
];
counter = 0; // endpoint counter (gbf doesn't support http/2 so we cycle through the endpoints)

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

// on success requesting a character json
function successJSON(id)
{
    AnimeData = JSON.parse(this.response); // parse the data
    get(Game.jsUri + "/model/manifest/enemy_6204152.js", successLoading, failLoading, id); // load the player
    // note: my CORS proxy is hosted on a free render.com tier
    // this step add a loading animation while the proxy wakes up
}

// on error requesting a character json
function failJSON(id)
{
    if(!AnimeDebug) // call debug mode (can be disabled by setting AnimeDebug to true)
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
            get(corsProxy + d + "/json/" + id + ".json?" + Date.now(), successJSON, failJSON, id);
            return;
        }
    }
    // remove loading image and put error message
    document.getElementById('temp').remove();
    result_area = document.getElementById('result');
    removeChilds(result_area);
    result_area.appendChild(document.createTextNode("Error: Invalid ID"));
}

// on success loading the player
function successLoading(id)
{
    document.getElementById('temp').remove(); // remove loading image
    result_area = document.getElementById('result');
    let ref = document.createElement('a'); // add GBFAL link
    ref.setAttribute('href', "https://mizagbf.github.io/GBFAL/?id=" + id.split("_")[0]);
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
        img.onerror = function() { // can't be loaded? character doesn't exist
            let result = this.parentNode.parentNode;
            this.parentNode.remove();
            this.remove();
            if(result.childNodes.length <= 2) result.remove();
        }
        img.onload = function() {
            this.id = "character"
        }
        let el = id.split("_");
        if(el.length == 1)
            img.src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/npc/m/" + id + "_01.jpg";
        else
            img.src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/npc/m/" + el[0] + "_01_" + el[1] + ".jpg";
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

// entry point, called on page loading
function playAnimation()
{
    get("json/changelog.json?" + Date.now(), initChangelog, function(a){}, null);
    if(getParam() == null)
    {
        document.getElementById('result').remove();
    }
    let id = getParam();
    if(id != null)
    {
        let el = id.split("_");
        if(!isNaN(el[0]) && el[0].length == 10 && (el[0].slice(0, 3) == "302" || el[0].slice(0, 3) == "303" || el[0].slice(0, 3) == "304" || el[0].slice(0, 3) == "371"))
        {
            get("json/" + id + ".json?" + Date.now(), successJSON, failJSON, id);
        }
        else
        {
            document.getElementById('temp').remove();
            result_area = document.getElementById('result');
            result_area.appendChild(document.createTextNode("Error: Invalid ID or Character not found."));
        }
    }
}

// set the last update time
function initChangelog(unusued)
{
    try{
        let json = JSON.parse(this.response);
        let date = (new Date(json['timestamp'])).toISOString();
        document.getElementById('timestamp').innerHTML += " " + date.split('T')[0] + " " + date.split('T')[1].split(':').slice(0, 2).join(':') + " UTC";
        timestamp = json['timestamp'];
    }catch{
        document.getElementById('timestamp').innerHTML = "";
    }
    initFollowup();
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

// on success loading the index, will add image and link for every indexed characters
function successDisplay(key)
{
    if(!char_index) char_index = JSON.parse(this.response);
    let node = document.getElementById('areacharacters'+key);
    let d = getDebug();
    if(d != null)
        d = "&debug=" + d;
    for(let id of char_index)
    {
        if(id.startsWith(key))
        {
            var el = id.split("_");
            if(el.length == 1)
                addImage(node, "sp/assets/npc/m/" + id + "_01.jpg", id, d);
            else
                addImage(node, "sp/assets/npc/m/" + el[0] + "_01_" + el[1] + ".jpg", id, d);
        }
    }
}

// on error loading the index
function failDisplay(id)
{
    let node = document.getElementById('areacharacters');  
    result_area.appendChild(document.createTextNode("Failed to load character list"));
}

// function to load and build the index
function displayCharacters(elem, key)
{
    if(!char_index) get("json/index.json?" + Date.now(), successDisplay, failDisplay, key);
    else successDisplay(key)
}
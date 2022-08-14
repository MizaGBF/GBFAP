var AnimeData = null;
var corsProxy = 'https://gbfcp.herokuapp.com/'
var Game = {
    xjsUri: 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/VERSION/js',
    jsUri: corsProxy + 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/VERSION/js',
    imgUri: corsProxy + 'https://gbfcp.herokuapp.com/https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img',
    setting: {}
};

char_index = null;
endpoints = [
    "prd-game-a-granbluefantasy.akamaized.net/",
    "prd-game-a1-granbluefantasy.akamaized.net/",
    "prd-game-a2-granbluefantasy.akamaized.net/",
    "prd-game-a3-granbluefantasy.akamaized.net/",
    "prd-game-a4-granbluefantasy.akamaized.net/",
    "prd-game-a5-granbluefantasy.akamaized.net/"
];
counter = 0;

function applyV(version)
{
    Game.xjsUri = Game.xjsUri.replace("VERSION", version)
    Game.jsUri = Game.jsUri.replace("VERSION", version)
}

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
    xhr.timeout = 10000;
    xhr.send(null);
}

function successJSON(id)
{
    result_area = document.getElementById('result');
    var img = document.createElement("img");
    var ref = document.createElement('a');
    result_area.insertBefore(img, result_area.firstChild);
    img.id  = "loading";
    img.onerror = function() {
        var result = this.parentNode.parentNode;
        this.parentNode.remove();
        this.remove();
        if(result.childNodes.length <= 2) result.remove();
    }
    img.onload = function() {
        this.id = "done"
    }
    img.src = "http://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/npc/m/" + id + "_01.jpg";
    
    AnimeData = JSON.parse(this.response);

    require(["createjs"], function (b) {
        window.createjs = b
    })
    require(['player','lib/common', 'view/cjs', 'script', 'jquery', 'underscore', 'model/cjs-loader'])
}

function failJSON(id)
{
    result_area = document.getElementById('result');
    result_area.appendChild(document.createTextNode("Error: Invalid ID"));
}

function getParam()
{
    var params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function playAnimation()
{
    if(getParam() == null)
    {
        document.getElementById('result').remove();
    }
    else if(Game.xjsUri.includes("VERSION") || Game.jsUri.includes("VERSION"))
    {
        get(corsProxy + "https://game.granbluefantasy.jp/", vtest, vfail, 0);
    }
    else
    {
        startupCallback()
    }
}

function vtest(a)
{
    try
    {
        applyV(this.responseText.match(/Game\.version = \"(\d+)\";/)[1]);
        startupCallback();
    }
    catch (e)
    {
        vfail(a)
    }
}

function vfail(a)
{
    result_area = document.getElementById('result');
    result_area.appendChild(document.createTextNode("Error: Either the server is overloaded, GBF is in maintenance or another issue occured."));
}

function startupCallback()
{
    var id = getParam();
    if(id != null && !isNaN(id) && id.length == 10 && (id.slice(0, 3) == "302" || id.slice(0, 3) == "303" || id.slice(0, 3) == "304" || id.slice(0, 3) == "371"))
    {
        get("json/" + id + ".json", successJSON, failJSON, id);
    }
    else
    {
        result_area = document.getElementById('result');
        result_area.appendChild(document.createTextNode("Error: Invalid ID or Character not found."));
    }
}

function getEndpoint()
{
    var e = endpoints[counter];
    counter = (counter + 1) % endpoints.length;
    return e;
}

function addImage(node, path, id)
{
    var img = document.createElement("img");
    var ref = document.createElement('a');
    ref.setAttribute('href', "?id=" + id);
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

function successDisplay(key)
{
    if(!char_index) char_index = JSON.parse(this.response);
    var node = document.getElementById('areacharacters'+key);
    for(let id of char_index)
    {
        if(id.startsWith(key)) addImage(node, "sp/assets/npc/m/" + id + "_01.jpg", id);
    }
}

function failDisplay(id)
{
    var node = document.getElementById('areacharacters');  
    result_area.appendChild(document.createTextNode("Failed to load character list"));
}

function displayCharacters(elem, key)
{
    if(!char_index) get("json/index.json", successDisplay, failDisplay, key);
    else successDisplay(key)
}
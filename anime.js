var AnimeData = null;
var AnimeLocal = false;
var corsProxy = 'https://gbfcp.onrender.com/'
var Game = {
    xjsUri: 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
    jsUri: corsProxy + 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js',
    imgUri: corsProxy + 'https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img',
    setting: {}
};
if(AnimeLocal)
{
    Game = {
        xjsUri: '',
        jsUri: '',
        imgUri: 'img',
        setting: {}
    };
}

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
    document.getElementById('temp').remove();
    result_area = document.getElementById('result');
    
    var ref = document.createElement('a');
    ref.setAttribute('href', "https://mizagbf.github.io/GBFAL/search.html?id=" + id);
    ref.appendChild(document.createTextNode("Assets"));
    result_area.insertBefore(ref, result_area.firstChild);
    
    result_area.insertBefore(document.createElement('br'), result_area.firstChild);
    
    ref = document.createElement('a');
    ref.setAttribute('href', "https://gbf.wiki/index.php?title=Special:Search&search=" + id);
    ref.appendChild(document.createTextNode("Wiki"));
    result_area.insertBefore(ref, result_area.firstChild);
    
    result_area.insertBefore(document.createElement('br'), result_area.firstChild);
    
    var img = document.createElement("img");
    result_area.insertBefore(img, result_area.firstChild);
    img.id  = "loading";
    img.onerror = function() {
        var result = this.parentNode.parentNode;
        this.parentNode.remove();
        this.remove();
        if(result.childNodes.length <= 2) result.remove();
    }
    img.onload = function() {
        this.id = "character"
    }
    img.src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/npc/m/" + id + "_01.jpg";
    
    
    AnimeData = JSON.parse(this.response);

    require(["createjs"], function (b) {
        window.createjs = b
    })
    require(['player','lib/common', 'view/cjs', 'script', 'jquery', 'underscore', 'model/cjs-loader'])
}

function failJSON(id)
{
    document.getElementById('temp').remove();
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
    startupCallback();
}

function startupCallback()
{
    var id = getParam();
    if(id != null)
    {
        var el = id.split("_");
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
        if(id.startsWith(key))
        {
            var el = id.split("_");
            if(el.length == 1)
                addImage(node, "sp/assets/npc/m/" + id + "_01.jpg", id);
            else
                addImage(node, "sp/assets/npc/m/" + el[0] + "_01_" + el[1] + ".jpg", id);
        }
    }
}

function failDisplay(id)
{
    var node = document.getElementById('areacharacters');  
    result_area.appendChild(document.createTextNode("Failed to load character list"));
}

function displayCharacters(elem, key)
{
    if(!char_index) get("json/index.json?" + Date.now(), successDisplay, failDisplay, key);
    else successDisplay(key)
}
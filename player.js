var versionList=Array.from(AnimeData[0]);
var action_index=AnimeData[1];
var action_list={};
var dispatchStack = new Array;
var animeVersion='0';
var stage={
    global:{}
};

var cjs = new Object;
cjs.canvas = {};
cjs.stage = {};
cjs.exportRoot = {};

for (i in action_index) {
    action_index[i].action_label_list =Array.from(action_index[i].action_label_list)
}

var strCanvas = '<canvas class="cjs-npc-demo cjs-npc-demo-0" width="2000" height="2000" style="display:block; top:50%; left:50%; transform:translate(-50%,-50%); position: absolute;z-index:0;width:calc(256vw - 218px);max-height:1400px;max-width:1400px;"></canvas>'
for (var i = 1; i < versionList.length; i++) {
    strCanvas = strCanvas + '<canvas class="cjs-npc-demo cjs-npc-demo-' + i +
        '" width="2000" height="2000" style="display:none; top:50%; left:50%; transform:translate(-50%,-50%); position: absolute;z-index:0;width:calc(256vw - 218px);max-height:1400px;max-width:1400px;"></canvas>'
}

var strSelection = ''
if (versionList.length > 1) {
    strSelection = '<label for="version-selection">Version</label><select id="version-selection" onchange="versionChange(this)">'
    for (var i = 0; i < versionList.length; i++) {
        strSelection = strSelection + '<option value="' + i + '">' + versionList[i] + '</option>'
    }
    strSelection = strSelection + '</select>'
}

document.getElementById("AnimationPlayer").innerHTML = '\
    <div style="max-width:700px; margin:auto;">\
        <div style="max-width:453px; margin:auto;">\
            <div style="width:100%; max-width:calc(83vw - 72px); margin:auto;">\
                <div id="animeCanvas" style="margin:auto;width:100%;height:0;padding-bottom:92%;border:solid;overflow:hidden;position:relative;">'+
                    strCanvas +
                    '<div id="anime-bg" style="z-index:-1"><img style="width:100%" src="https://prd-game-a-granbluefantasy.akamaized.net/assets_en/img/sp/raid/bg/event_82.jpg"></div>\
                </div>\
            </div>\
        </div>\
        <div class="anime-buttom">\
            <div class="bg-selection">\
                <label>Background</label>\
                <div>\
                    <button class="std-button" onclick="openTab(\'index\'); let bgi = document.getElementById(\'background-index\'); bgi.open = true; bgi.scrollIntoView(); pushPopup(\'Select a background in the list\');">Select</button>\
                    <button class="std-button" onclick="setExternalBackground(\'img/sp/raid/0.jpg\')">Black</button>\
                    <button class="std-button" onclick="setExternalBackground(\'img/sp/raid/1.jpg\')">Grid</button>\
                    <button class="std-button" onclick="setExternalBackground(\'img/sp/raid/2.jpg\')">Green</button>\
                </div>\
            </div>\
            <div class="version-selection">'+
                strSelection +
            '</div>\
            <label for="act-selection">Action</label><select id="act-selection" onchange="actionChange(this)"></select><br/>\
        </div>\
        <div>\
            <span id="act-label">Current:</span><span id="act-name">Loading...</span><br>\
            <span id="act-label">Duration:</span><span id="act-duration">???</span>\
        </div>\
    </div>';
strSelection=null;
strCanvas=null;

if (document.getElementById("version-selection")){
    document.getElementById("version-selection").focus();
}else{
    document.getElementById("act-selection").focus();
}

var actionChange = function (obj) {
    var action = obj.options[obj.selectedIndex].value;
    if (action == 'default') {
        action_list.motionList = action_index[animeVersion].action_label_list
    }
    else {
        action_list.motionList = [action]
    }
    this.cjsViewList[animeVersion].cjsNpc.children[0].dispatchEvent("animationComplete");
};

var versionChange = function (obj) {
    animeVersion = obj.options[obj.selectedIndex].value;

    //verify if action exists
    var actionLabel=document.getElementById("act-selection")
    var action = actionLabel.options[actionLabel.selectedIndex].value;
    var defaultAction = action
    if (!action in action_index[animeVersion].action_label_list) {
        defaultAction="default"
    }
    
    //modify list
    var actionlist = '<option value="default">Demo</option>'
    var actionUpdate= true
    l = this.cjsViewList[animeVersion].getActionList();
    for (action in l) {
        action=l[action]
        if (defaultAction==action){
            actionlist = actionlist.concat('<option value=' + action + ' selected>' + this.cjsViewList[animeVersion].translateAction(action) + '</option>');
            actionUpdate= false
        }
        else{
            actionlist = actionlist.concat('<option value=' + action + '>' + this.cjsViewList[animeVersion].translateAction(action) + '</option>');
        }
    }
    if (actionUpdate){
        action_list.motionList = action_index[animeVersion].action_label_list
    }
    document.getElementById("act-selection").innerHTML = actionlist

    //replace version
    for (var i = 0; i < versionList.length; i++) {
        var canvas = document.querySelector('.cjs-npc-demo-' + i)
        if (i == animeVersion) {
            this.cjsViewList[i].resume();
            canvas.style.setProperty('display', 'block');
            this.cjsViewList[i].cjsNpc.children[0].dispatchEvent("animationComplete");
        } else {
            this.cjsViewList[i].pause();
            canvas.style.setProperty('display', 'none');
        }
    };
    
    // header image
    if(!AnimeDebug)
    {
        let el = AnimeID.split('_');
        if(el.length == 1 && el[0].length == 6)
        {
            // do nothing
        }
        else if(AnimeID.startsWith("10"))
        {
            let id = AnimeID;
            let u = Math.floor(animeVersion/2);
            if(u > 0) id += "_0" + JSON.stringify(u+1);
            document.getElementById("character").src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/weapon/m/" + id + ".jpg";
        }
        else
        {
            el = AnimeData[1][animeVersion]['cjs'][0].split('_');
            el[2] += (AnimeID.includes("_st2") ? "_st2" : "");
            document.getElementById("character").src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/npc/m/" + el[1] + "_" + el[2] + ".jpg"
        }
    }
};
var versionList=Array.from(AnimeData[0]);
var action_index=AnimeData[1];
var action_list={};
var dispatchStack = new Array;
var animeVersion='0';
var stage={
    global:{}
};

var bgList = [
    'event_82',
    'e027r_3',
    'event_283',
    'event_177',
    'event_323',
    'common_074',
    'event_321',
    'event_322',
    'common_045',
    'event_386',
    'common_067',
    'event_460',
    '0',
    '1',
    '2'
]

var bgName = [
    'Trial',
    'Town',
    'Beach',
    'Auld Lang Syne',
    'Lucilius',
    'Cosmos',
    'Alanaan',
    'Nier',
    'Grimnir',
    'Vikala',
    'Fediel',
    'Masquerade',
    'Black',
    'Dummy',
    'Green'
]

if (AnimeData[2][1]) {
    var i=1
    while (AnimeData[2][1][i]){
        bgList.push(AnimeData[2][1][i]);
        bgName.push((AnimeData[2][2][i] || 'TMP'+i));
        i++
    }
}

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

var strBG = ''
if (bgList.length > 1) {
    strBG = '<label for="bg-selection">Background</label><select id="bg-selection" onchange="backgroundChange(this)">'
    for (var i = 0; i < bgList.length; i++) {
        strBG = strBG + '<option value="' + bgList[i] + '">' + bgName[i] + '</option>'
    }
    strBG = strBG + '</select>'
}

document.getElementById("AnimationPlayer").innerHTML = '\
    <div style="max-width:700px; margin:auto;">\
        <div style="max-width:453px; margin:auto;">\
            <div style="width:100%; max-width:calc(83vw - 72px); margin:auto;">\
                <div id="animeCanvas" style="margin:auto;width:100%;height:0;padding-bottom:92%;border:solid;overflow:hidden;position:relative;">'+
                    strCanvas +
                    '<div id="anime-bg" style="z-index:-1"><img style="width:100%" src="img/sp/raid/event_82.jpg"></div>\
                </div>\
            </div>\
        </div>\
        <div class="anime-buttom">'+
                strBG +
            '<div class="version-selection">'+
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
strBG=null;

if (document.getElementById("version-selection")){
    document.getElementById("version-selection").focus();
}else{
    document.getElementById("act-selection").focus();
}

var backgroundChange = function(obj) {
    var bgBlock = document.getElementById('anime-bg')
    var bgImg = obj.options[obj.selectedIndex].value;
    var url = "img/sp/raid/" + bgImg + ".jpg";
    bgBlock.innerHTML = '<img style="width:100%" src="'+url+'">'
};

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
        var id = AnimeData[1][animeVersion]['cjs'][0];
        id = id.split('_').slice(1, (id.includes("_st") ? 4 : 3)).join('_');
        document.getElementById("character").src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/npc/m/" + id + ".jpg"
    }
};
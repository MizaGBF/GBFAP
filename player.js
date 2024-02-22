// initialization of important variables
var versionList=Array.from(AnimeData[0]);
var action_speed=1;
var action_index=AnimeData[1];
var custom_choices = {}
var demo_list = null;
var action_list = {};
var dispatchStack = new Array;
var sfxState = false;
var loopingState = true;
var animeVersion = 0;
var loadTotal = 999999999999;
var loadNow = 0;
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

// start
setHTML();

// functions
function setHTML()
{
    let base = 
        '<div id="canvasLevel1">\
            <div id="canvasLevel2">\
                <div id="canvasLevel3">\
                    <div id="animeCanvas">\
                        $CANVAS\
                        <div id="anime-bg"><img class="bg" src="$BACKGROUND"></div>\
                    </div>\
                </div>\
            </div>\
            <div class="controls-root">\
                <div class="controls-part">\
                    <div class="controls-outline">\
                        <span>\
                            $VERSIONS\
                        </span><br>\
                        <span>\
                            <label for="act-selection">Action</label><select id="act-selection" onchange="actionChange(this)"></select>\
                        </span><br>\
                        <span class="act-element">Current:</span>\
                        <span id="act-name" class="act-element"><img src="assets/ui/loading.gif"></span><br>\
                        <span class="act-element">Duration:</span>\
                        <span id="act-duration" class="act-element">Loading...</span><br>\
                    </div>\
                    <div class="controls-outline">\
                        <input id="speed-input" type="range" min="0.05" max="2" step="0.05" value="1" oninput="changeSpeed(this);">\
                        <label id="speed-label" for="speed-input" class="controls-text">100% Speed</label><br>\
                        <button class="small-button" onclick="let elem = document.getElementById(\'speed-input\'); elem.value=1; changeSpeed(elem);"><img src="assets/ui/controls/reset.png"></button>\
                        <button class="small-button" onclick="togglePause();" id="pause-btn"><img src="assets/ui/controls/pause.png"></button>\
                        <button class="small-button btn-enabled" onclick="toggleLoop();" id="loop-btn"><img src="assets/ui/controls/loop.png"></button>\
                        <button class="small-button" onclick="toggleSFX();" id="sfx-btn"><img src="assets/ui/controls/sfx.png"></button>\
                        <button class="small-button" onclick="openCustom()")"><img src="assets/ui/controls/edit.png"></button>\
                    </div>\
                    <div class="controls-outline">\
                        <span class="controls-text">Background</span><br>\
                        <div class="controls-bg">\
                            <button class="bg-button" onclick="setExternalBackground(\'https://prd-game-a-granbluefantasy.akamaized.net/assets_en/img/sp/raid/bg/event_82.jpg\')"><img src="assets/ui/controls/bg_default.png"></button>\
                            <button class="bg-button" onclick="setExternalBackground(Game.gbfapUri + \'img/sp/raid/grid.jpg\')"><img src="assets/ui/controls/bg_grid.png"></button>\
                            <button class="bg-button" onclick="setExternalBackground(Game.gbfapUri + \'img/sp/raid/black.jpg\')"><img src="assets/ui/controls/bg_black.png"></button>\
                            <button class="bg-button" onclick="setExternalBackground(Game.gbfapUri + \'img/sp/raid/green.jpg\')"><img src="assets/ui/controls/bg_green.png"></button>\
                            <button class="bg-button" onclick="openTab(\'index\'); let bgi = document.getElementById(\'background-index\'); bgi.open = true; bgi.scrollIntoView(); pushPopup(\'Select a background in the list\');"><img src="assets/ui/controls/bg_select.png"></button>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div id="custom-action" style="display: none;" class="controls-root custom-menu">\
                <div class="controls-outline"\
                    <b>Play Actions</b><br>\
                    <div id="demo-list">\
                    </div>\
                </div>\
                <div class="controls-outline">\
                    <select id="custom-selection"></select><br>\
                    <br>\
                    <button class="std-button" onclick="addCustom()">Add</button><br>\
                    <br>\
                    <button class="std-button" onclick="playCustom()")">Play</button><br>\
                    <br>\
                    <button class="std-button" onclick="closeCustom()")">Close</button><br>\
                    <br>\
                    <button class="std-button" onclick="resetCustom()")">Reset</button><br>\
                    <br>\
                </div>\
            </div>\
        </div>';
    // background
    let background = localStorage.getItem("gbfap-background");
    if(background == null) background = "https://prd-game-a-granbluefantasy.akamaized.net/assets_en/img/sp/raid/bg/event_82.jpg";
    // canvas content
    let canvas = '<canvas class="cjs-npc-demo cjs-npc-demo-0" width="2000" height="2000" style="display:block;"></canvas>'
    for (var i = 1; i < versionList.length; i++)
        canvas += '<canvas class="cjs-npc-demo cjs-npc-demo-' + i + '" width="2000" height="2000" style="display:none;"></canvas>';
    // version list
    let versions = ''
    if(versionList.length > 1)
    {
        versions = '<label for="version-selection">Version</label><select id="version-selection" onchange="versionChange(this)">'
        for (var i = 0; i < versionList.length; i++) {
            versions += '<option value="' + i + '">' + versionList[i] + '</option>'
        }
        versions += '</select>'
    }
    document.getElementById("AnimationPlayer").innerHTML = base.replace('$BACKGROUND', background).replace('$CANVAS', canvas).replace('$VERSIONS', versions)
    // set focus
    document.getElementById("animeCanvas").scrollIntoView();
}

function openCustom()
{
    let name = document.getElementById("act-name");
    if(name == null || name.getElementsByTagName('img').length > 0) return;
    if(document.getElementById("custom-action").style.display == null) return;
    document.getElementById("custom-action").style.display = null;
    let actionlist = ""
    for(action in custom_choices[animeVersion]) {
        actionlist = actionlist.concat('<option value=' + l[action] + '>' + this.cjsViewList[animeVersion].translateAction(l[action]) + '</option>');
    }
    document.getElementById("custom-selection").innerHTML = actionlist;
    if(demo_list == null) // init
    {
        demo_list = {}
        for(const [e, v] of Object.entries(action_index))
            demo_list[e] = v.action_label_list.slice(0);
    }
    updateDemoList();
}

function playCustom()
{
    closeCustom();
    action_list.motionList = demo_list[animeVersion].slice(0);
    pushPopup("Your selected actions will play after the current animation");
}

function closeCustom()
{
    document.getElementById("custom-action").style.display = "none";
}

function addCustom()
{
    if(demo_list[animeVersion].length == 50)
    {
        pushPopup("You can't add more actions");
        return;
    }
    demo_list[animeVersion].push(document.getElementById("custom-selection").value);
    updateDemoList();
}

function delCustom(i)
{
    if(demo_list[animeVersion].length == 1)
    {
        pushPopup("You can't remove the last action");
        return;
    }
    demo_list[animeVersion].splice(i, 1);
    updateDemoList();
}

function resetCustom()
{
    demo_list[animeVersion] = action_index[animeVersion].action_label_list.slice(0);
    updateDemoList();
}

function updateDemoList()
{
    let html = "";
    let i = 0;
    for(const action of demo_list[animeVersion])
    {
        html += '<span class="act-element">' + this.cjsViewList[animeVersion].translateAction(action) + '</span><button class="small-button" onclick="delCustom(' + i + ')")"><img src="assets/ui/controls/remove.png"></button><br>\n';
        i++;
    }
    document.getElementById('demo-list').innerHTML = html;
}

function actionChange(obj)
{
    let name = document.getElementById("act-name");
    if(name == null || name.getElementsByTagName('img').length > 0) return;
    var action = obj.options[obj.selectedIndex].value;
    if (action == 'default')
    {
        action_list.motionList = action_index[animeVersion].action_label_list
    }
    else
    {
        action_list.motionList = [action]
    }
    this.cjsViewList[animeVersion].cjsNpc.children[0].dispatchEvent("animationComplete");
};

function togglePause()
{
    let name = document.getElementById("act-name");
    if(name == null || name.getElementsByTagName('img').length > 0) return;
    if(this.cjsViewList[animeVersion].isPaused)
    {
        document.getElementById("pause-btn").classList.remove("btn-paused");
        this.cjsViewList[animeVersion].resume();
    }
    else
    {
        document.getElementById("pause-btn").classList.add("btn-paused");
        this.cjsViewList[animeVersion].pause();
    }
}

function toggleLoop()
{
    let name = document.getElementById("act-name");
    if(name == null || name.getElementsByTagName('img').length > 0) return;
    let loop_btn = document.getElementById("loop-btn");
    if(loop_btn.classList.contains('btn-enabled'))
    {
        loop_btn.classList.remove("btn-enabled");
        loopingState = false;
    }
    else
    {
        loop_btn.classList.add("btn-enabled");
        loopingState = true;
        this.cjsViewList[animeVersion].nextLoop();
    }
}

function toggleSFX()
{
    let name = document.getElementById("act-name");
    if(name == null || name.getElementsByTagName('img').length > 0) return;
    let sfx_btn = document.getElementById("sfx-btn");
    if(sfx_btn.classList.contains('btn-enabled'))
    {
        sfx_btn.classList.remove("btn-enabled");
        sfxState = false;
    }
    else
    {
        sfx_btn.classList.add("btn-enabled");
        sfxState = true;
    }
}

function changeSpeed(elem)
{
    let name = document.getElementById("act-name");
    if(name == null || name.getElementsByTagName('img').length > 0) return;
    action_speed = elem.value;
    createjs.Ticker.setFPS(30*action_speed);
    document.getElementById("speed-label").innerHTML = JSON.stringify(Math.floor(100*action_speed)) + "% Speed";
}

function versionChange(obj)
{
    let name = document.getElementById("act-name");
    if(name == null || name.getElementsByTagName('img').length > 0) return;

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
    // unpause
    document.getElementById("pause-btn").classList.remove("btn-paused");
    
    // header image
    if(!AnimeDebug)
    {
        let el = AnimeID.split('_');
        if(el.length == 1 && (el[0].length == 6 || el[0].length == 7)) // mc and enemy
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
        else if(AnimeID.startsWith("20"))
        {
            let id = AnimeID;
            let u = parseInt(AnimeData[0][animeVersion][0]) - 3;
            if(u > 0) id += "_0" + JSON.stringify(u+1);
            document.getElementById("character").src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/summon/m/" + id + ".jpg"
        }
        else
        {
            el = AnimeData[1][animeVersion]['cjs'][0].split('_');
            el[2] += (AnimeID.includes("_st2") ? "_st2" : "");
            document.getElementById("character").src = "https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img_low/sp/assets/npc/m/" + el[1] + "_" + el[2] + ".jpg"
        }
    }
}
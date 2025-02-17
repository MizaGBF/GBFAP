// constant
var CANVAS_SIZE = CANVAS_SIZE || 1400;
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
var sub_menu_open = false;
var textureSwapCache = {};
var loadTotal = 999999999999;
var loadNow = 0;
var canvas = null;
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

setTimeout(update_frame_counter, 10);

// start
setHTML();

// functions
function setHTML()
{
    let base = 
        '<div id="player-container">\
            <div id="canvas-container">\
                $CANVAS\
                <div id="canvas-bg"><img class="bg" src="$BACKGROUND"></div>\
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
                        <span class="act-element">Loop frame:</span>\
                        <span id="act-frame" class="act-element">0</span><br>\
                        <span class="act-element">Current:</span>\
                        <span id="act-name" class="act-element"><img src="assets/ui/loading.gif"></span><br>\
                        <span class="act-element">Duration:</span>\
                        <span id="act-duration" class="act-element">Loading...</span><br>\
                    </div>\
                    <div class="controls-outline">\
                        <input id="speed-input" type="range" min="0.05" max="2" step="0.05" value="1" oninput="changeSpeed(this);">\
                        <label id="speed-label" for="speed-input" class="controls-text">100% Speed</label><br>\
                        <button class="small-button" onclick="resetSpeed();" title="Reset the Speed to 100%\n(Shortcut: R)"><img src="assets/ui/controls/reset.png"></button>\
                        <button class="small-button" onclick="togglePause();" id="pause-btn" title="Toggle the Pause\n(Shortcut: Space)"><img src="assets/ui/controls/pause.png"></button>\
                        <button class="small-button" onclick="nextframe();" id="next-btn" title="Frame Advance\n(Shortcut: F)"><img src="assets/ui/controls/next.png"></button>\
                        <button class="small-button btn-enabled" onclick="toggleLoop();" id="loop-btn" title="Toggle the Animation Loop\n(Shortcut: L)"><img src="assets/ui/controls/loop.png"></button>\
                        <button class="small-button" onclick="toggleSFX();" id="sfx-btn" title="Toggle the Sound Effects\n(Shortcut: S)"><img src="assets/ui/controls/sfx.png"></button>\
                        <button class="small-button" onclick="openCustom()" id="custom-btn" title="Open the Custom Playlist menu\n(Shortcut: C)"><img src="assets/ui/controls/edit.png"></button>\
                        <br>\
                        <button class="small-button" onclick="toggleMute();" id="mute-btn" title="Mute the beep\n(Shortcut: M)"><img src="assets/ui/controls/beep.png"></button>\
                        <button class="small-button" onclick="toggleBound()" id="bound-btn" title="Toggle the Bounding boxes\n(Shortcut: B)"><img src="assets/ui/controls/bound.png"></button>\
                        <button class="small-button" onclick="enemyShift()" id="enemy-btn" title="Shift the Enemy position\n(Shortcut: E)"><img src="assets/ui/controls/enemy.png"></button>\
                        <button class="small-button" onclick="dlimage();" id="dl-btn" title="Download the Canvas\n(Shortcut: Shift+D)"><img src="assets/ui/controls/dl.png"></button>\
                        <button class="small-button" onclick="record();" id="record-btn" title="Save the current playlist as a WEBM file\n(Shortcut: Shift+W)"><img src="assets/ui/controls/record.png"></button>\
                        <button class="small-button" onclick="openTexture();" id="texture-btn" title="Open the Texture/Spritesheet menu\n(Shortcut: T)"><img src="assets/ui/controls/texture.png"></button>\
                    </div>\
                    <div class="controls-outline">\
                        <span class="controls-text">Background</span><br>\
                        <div class="controls-bg">\
                            <button class="bg-button" onclick="openTab(\'index\'); let bgi = document.getElementById(\'background-index\'); bgi.open = true; bgi.scrollIntoView(); pushPopup(\'Select a background in the list\');"><img src="assets/ui/controls/bg_select.png"></button>\
                            <button class="bg-button" onclick="setBackground(Game.bgUri + \'img/sp/raid/bg/event_82.jpg\')"><img src="assets/ui/controls/bg_default1.png"></button>\
                            <button class="bg-button" onclick="setBackground(Game.bgUri + \'img/sp/raid/bg/common_011.jpg\')"><img src="assets/ui/controls/bg_default2.png"></button>\
                            <button class="bg-button" onclick="setBackground(Game.bgUri + \'img/sp/raid/bg/common_025.jpg\')"><img src="assets/ui/controls/bg_default3.png"></button>\
                            <button class="bg-button" onclick="setBackground(\'./img/sp/raid/grid.jpg\')"><img src="assets/ui/controls/bg_grid.png"></button>\
                            <button class="bg-button" onclick="setBackground(\'./img/sp/raid/black.jpg\')"><img src="assets/ui/controls/bg_black.png"></button>\
                            <button class="bg-button" onclick="setBackground(\'./img/sp/raid/green.jpg\')"><img src="assets/ui/controls/bg_green.png"></button>\
                            <button class="bg-button" onclick="setBackground(\'./img/sp/raid/blue.jpg\')"><img src="assets/ui/controls/bg_blue.png"></button>\
                            <button class="bg-button" onclick="setBackground(\'./img/sp/raid/red.jpg\')"><img src="assets/ui/controls/bg_red.png"></button>\
                            <button class="bg-button" onclick="setBackground(\'./img/sp/raid/pink.jpg\')"><img src="assets/ui/controls/bg_pink.png"></button>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div id="custom-action" style="display: none;" class="controls-root custom-menu">\
                <div class="controls-outline"\
                    <b>Play Actions</b><br>\
                    <div id="demo-list" class="scroll-list">\
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
            <div id="texture-action" style="display: none;" class="controls-root custom-menu">\
                <div class="controls-outline"\
                    <b>Spritesheet List</b><br>\
                    <div id="texture-list" class="scroll-list">\
                    </div>\
                </div>\
                <div class="controls-outline">\
                    <button class="std-button" onclick="closeTexture()")">Close</button>\
                </div>\
            </div>\
        </div>';
    // background
    let background = localStorage.getItem("gbfap-background");
    if(background == null) background = Game.externUri + "/img/sp/raid/bg/event_82.jpg";
    // canvas content
    let canvasContent = '<canvas class="cjs-npc-demo cjs-npc-demo-0" width="'+JSON.stringify(CANVAS_SIZE)+'" height="'+JSON.stringify(CANVAS_SIZE)+'" style="display:block;"></canvas>'
    for (var i = 1; i < versionList.length; i++)
        canvasContent += '<canvas class="cjs-npc-demo cjs-npc-demo-' + i + '" width="'+JSON.stringify(CANVAS_SIZE)+'" height="'+JSON.stringify(CANVAS_SIZE)+'" style="display:none;"></canvas>';
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
    document.getElementById("AnimationPlayer").innerHTML = base.replace('$BACKGROUND', background).replace('$CANVAS', canvasContent).replace('$VERSIONS', versions)
    if(!is_enemy)
    {
        document.getElementById("enemy-btn").remove();
    }
    canvas = document.querySelector('.cjs-npc-demo-0');
    // set focus
    document.getElementById("canvas-container").scrollIntoView();
}

function canInteract()
{
    // check if it loaded
    let name = document.getElementById("act-name");
    if(name == null || name.getElementsByTagName('img').length > 0) return false;
    // check if it's recording
    if(this.cjsViewList[animeVersion].recording != null) return false;
    return true;
}

function uploadTexture(name)
{
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png'; // Accept only PNG
    input.addEventListener('change', (event) => {
        try
        {
            const file = event.target.files[0]; // Get the selected file
            if (file) {
                let obj = {
                    orig: null,
                    blob: null,
                    url: null
                }
                let old_url = null;
                if(name in textureSwapCache)
                {
                    obj.orig = textureSwapCache[name].orig;
                    old_url = textureSwapCache[name].url;
                }
                else
                {
                    obj.orig = images[name].src;
                }
                obj.blob = new Blob([file], { type: file.type });
                obj.url = URL.createObjectURL(obj.blob);
                images[name].src = obj.url;
                textureSwapCache[name] = obj;
                if(old_url != null)
                    URL.revokeObjectURL(old_url);
                pushPopup(name + " has been replaced by your texture.");
            }
        }
        catch(err)
        {
            pushPopup("An error occured. Report it if it persists.");
            console.error("Exception thrown", err.stack);
        }
    });
    // trigger
    input.click();
}

function resetTexture(name)
{
    if(name in textureSwapCache)
    {
        images[name].src = textureSwapCache[name].orig;
        URL.revokeObjectURL(textureSwapCache[name].url);
        delete textureSwapCache[name];
        pushPopup(name + " has been reset.");
    }
    else pushPopup(name + " is already set to its original image.");
}

function openTexture()
{
    if(!canInteract()) return;
    let tact = document.getElementById("texture-action");
    if(sub_menu_open || tact.style.display == "") return;
    beep();
    sub_menu_open = true;
    tact.style.display = "";
    let tlist = document.getElementById("texture-list");
    if(tlist.innerHTML.trim() == "")
    {
        let keys = Object.keys(images);
        keys.sort();
        for(let k of keys)
        {
            const name = k;
            let a = document.createElement("a");
            a.innerHTML = name;
            a.href = Game.externUri + "/img/sp/cjs/" + name + ".png";
            a.target="_blank";
            tlist.appendChild(a);
            
            let btn = document.createElement("button");
            btn.classList.add("small-button");
            btn.innerHTML = '<img src="assets/ui/controls/upload.png">';
            btn.onclick = function() {
                uploadTexture(name);
            };
            tlist.appendChild(btn);
            
            btn = document.createElement("button");
            btn.classList.add("small-button");
            btn.innerHTML = '<img src="assets/ui/controls/remove.png">';
            btn.onclick = function() {
                resetTexture(name);
            };
            tlist.appendChild(btn);
            
            tlist.appendChild(document.createElement("br"));
        }
    }
}

function textureIsOpen()
{
    let tact = document.getElementById("texture-action");
    return sub_menu_open && tact.style.display == "";
}

function closeTexture()
{
    sub_menu_open = false;
    beep();
    document.getElementById("texture-action").style.display = "none";
}

function openCustom()
{
    if(!canInteract()) return;
    let cact = document.getElementById("custom-action");
    if(sub_menu_open || cact.style.display == "") return;
    beep();
    sub_menu_open = true;
    cact.style.display = "";
    let actions = this.cjsViewList[animeVersion].getActionList();
    let actionlist = ""
    for(action in custom_choices[animeVersion]) {
        actionlist = actionlist.concat('<option value=' + actions[action] + '>' + this.cjsViewList[animeVersion].translateAction(actions[action]) + '</option>');
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

function customIsOpen()
{
    let cact = document.getElementById("custom-action");
    return sub_menu_open && cact.style.display == "";
}

function playCustom()
{
    closeCustom();
    action_list.motionList = demo_list[animeVersion].slice(0);
    pushPopup("Now playing your set of animations");
    this.cjsViewList[animeVersion].reset();
}

function closeCustom()
{
    sub_menu_open = false;
    beep();
    document.getElementById("custom-action").style.display = "none";
}

function addCustom()
{
    beep();
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
    beep();
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
    beep();
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
    if(!canInteract()) return;
    beep();
    if(window.soundPlayer) window.soundPlayer.clearAll();
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

function update_frame_counter()
{
    let name = document.getElementById("act-name");
    if(name == null || name.getElementsByTagName('img').length > 0)
    {
        // loading, do nothing
    }
    else
    {
        if(document.getElementById("loop-btn").classList.contains('btn-enabled')) document.getElementById("act-frame").innerHTML = JSON.stringify(this.cjsViewList[animeVersion].mainTween.position);
        else document.getElementById("act-frame").innerHTML = "Loop paused";
    }
    setTimeout(update_frame_counter, 10);
}

function spacekey_fix(event) // disabled scrolling when pressing space bar
{
    if(event.code == "Space" && event.target == document.body) event.preventDefault();
}
document.addEventListener("keydown", spacekey_fix);

function keybind_listener(event)
{
    if(!canInteract() || event.ctrlKey || event.altKey || event.metaKey) return;
    switch(event.key)
    {
        case "r": case "R": // speed reset
        {
            if(!event.shiftKey)
                resetSpeed();
            break;
        }
        case "+": // speed up
        {
            let elem = document.getElementById('speed-input');
            elem.value = JSON.stringify(parseFloat(elem.value) + parseFloat(elem.step));
            changeSpeed(elem);
            break;
        }
        case "-": // speed down
        {
            let elem = document.getElementById('speed-input');
            elem.value = JSON.stringify(parseFloat(elem.value) - parseFloat(elem.step));
            changeSpeed(elem);
            break;
        }
        case " ": // pause
        {
            if(document.activeElement.id && document.activeElement.id.includes("-btn")) return; // weird case where the user has a button focused and is pressing space
            togglePause();
        }
        case "l": case "L": // loop toggle
        {
            if(!event.shiftKey)
                toggleLoop();
            return;
        }
        case "s": case "S": // sfx toggle
        {
            if(!event.shiftKey)
                toggleSFX();
            return;
        }
        case "m": case "M": // beep toggle
        {
            if(!event.shiftKey)
                toggleMute();
            return;
        }
        case "c": case "C": // open custom playlist
        {
            if(!event.shiftKey)
            {
                if(!customIsOpen())
                    openCustom();
                else
                    closeCustom();
            }
            return;
        }
        case "b": case "B": // toggle bounding boxes
        {
            if(!event.shiftKey)
                toggleBound();
            return;
        }
        case "e": case "E": // shift enemy position
        {
            if(!event.shiftKey && is_enemy)
                enemyShift();
            return;
        }
        case "f": case "F": // frame advance
        {
            if(!event.shiftKey) 
                nextframe();
            return;
        }
        case "d": case "D": // download canvas
        {
            if(event.shiftKey) // use shift key!
                dlimage();
            return;
        }
        case "w": case "W": // record webm
        {
            if(event.shiftKey) // use shift key!
                record();
            return;
        }
        case "t": case "T": // texture list
        {
            if(!event.shiftKey)
            {
                if(!textureIsOpen())
                    openTexture();
                else
                    closeTexture();
            }
            return;
        }
    }
}
document.addEventListener("keyup", keybind_listener);

function togglePause()
{
    if(!canInteract()) return;
    beep();
    if(this.cjsViewList[animeVersion].isPaused)
    {
        document.getElementById("pause-btn").classList.remove("btn-paused");
        if(window.soundPlayer) window.soundPlayer.resumeAll();
        this.cjsViewList[animeVersion].resume();
    }
    else
    {
        document.getElementById("pause-btn").classList.add("btn-paused");
        if(window.soundPlayer) window.soundPlayer.pauseAll();
        this.cjsViewList[animeVersion].pause();
    }
}

function toggleLoop()
{
    if(!canInteract()) return;
    beep();
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
    this.cjsViewList[animeVersion].loopPaused = !loopingState;
}

function enableLoop()
{
    let loop_btn = document.getElementById("loop-btn");
    if(!loop_btn.classList.contains('btn-enabled'))
    {
        loop_btn.classList.add("btn-enabled");
        loopingState = true;
        this.cjsViewList[animeVersion].nextLoop();
        this.cjsViewList[animeVersion].loopPaused = !loopingState;
    }
}

function toggleSFX()
{
    if(!canInteract()) return;
    beep();
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
    if(window.soundPlayer) window.soundPlayer.enableAll(sfxState);
}

function toggleMute()
{
    if(!canInteract()) return;
    let mute_btn = document.getElementById("mute-btn");
    if(mute_btn.classList.contains('btn-enabled'))
    {
        mute_btn.classList.remove("btn-enabled");
        muteBeep = false;
        beep();
    }
    else
    {
        mute_btn.classList.add("btn-enabled");
        muteBeep = true;
    }
}

function enemyShift()
{
    if(!canInteract()) return;
    beep();
    let sfx_btn = document.getElementById("enemy-btn");
    if(sfx_btn.classList.contains('btn-enabled'))
    {
        sfx_btn.classList.remove("btn-enabled");
        cjsViewList[0].cjsNpc.x -= 71;
        cjsViewList[0].cjsNpc.y += 117;
    }
    else
    {
        sfx_btn.classList.add("btn-enabled");
        cjsViewList[0].cjsNpc.x += 71;
        cjsViewList[0].cjsNpc.y -= 117;
    }
}

function toggleBound()
{
    if(!canInteract()) return;
    beep();
    let bound_btn = document.getElementById("bound-btn");
    if(boundingBox_enabled)
    {
        bound_btn.classList.remove("btn-enabled");
    }
    else
    {
        bound_btn.classList.add("btn-enabled");
    }
    toggle_boundingBox_fireevent();
}

function changeSpeed(elem)
{
    if(!canInteract())
    {
        elem.value = JSON.stringify(action_speed);
        return;
    }
    action_speed = parseFloat(elem.value);
    if(window.soundPlayer) window.soundPlayer.setAllSpeed(action_speed);
    createjs.Ticker.framerate = 30*action_speed;
    document.getElementById("speed-label").innerHTML = JSON.stringify(Math.floor(100*action_speed)) + "% Speed";
}

function resetSpeed()
{
    let elem = document.getElementById('speed-input');
    elem.value='1';
    changeSpeed(elem);
}

function nextframe()
{
    if(!canInteract()) return;
    if(!this.cjsViewList[animeVersion].isPaused) togglePause();
    else beep();
    this.cjsViewList[animeVersion].nextFrame();
}

function dlimage()
{
    if(!canInteract()) return;
    if(!this.cjsViewList[animeVersion].isPaused) togglePause();
    else beep();
    this.cjsViewList[animeVersion].download();
}

function record()
{
    if(!canInteract()) return;
    if(!this.cjsViewList[animeVersion].isPaused) togglePause();
    else beep();
    resetSpeed();
    enableLoop();
    // start recording
    this.cjsViewList[animeVersion].record();
}

function versionChange(obj)
{
    if(!canInteract()) return;
    beep();
    if(window.soundPlayer) window.soundPlayer.clearAll();

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
        canvas = document.querySelector('.cjs-npc-demo-' + i);
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
        document.getElementById("character").src = Game.externUri + "/img_low/sp/assets/weapon/m/" + id + ".jpg";
    }
    else if(AnimeID.startsWith("20"))
    {
        let id = AnimeID;
        let u = parseInt(AnimeData[0][animeVersion][0]) - 3;
        if(u > 0) id += "_0" + JSON.stringify(u+1);
        document.getElementById("character").src = Game.externUri + "/img_low/sp/assets/summon/m/" + id + ".jpg";
    }
    else if(AnimeID.startsWith("389"))
    {
         document.getElementById("character").src = Game.externUri + "/img_low/sp/assets/npc/raid_normal/" + AnimeID + "_01_" + animeVersion + ".jpg";
    }
    else if(AnimeID.startsWith("38"))
    {
        // do nothing
    }
    else
    {
        el = AnimeData[1][animeVersion]['cjs'][0].split('_');
        el[2] += (AnimeID.includes("_st2") ? "_st2" : "");
        document.getElementById("character").src = Game.externUri + "/img_low/sp/assets/npc/m/" + el[1] + "_" + el[2] + ".jpg";
    }
}
// constant
var CANVAS_SIZE = CANVAS_SIZE || 1000;
// initialization of important variables
var ui = {};
var versionList=Array.from(AnimeData[0]);
var action_speed=1;
var action_index=AnimeData[1];
var custom_choices = {}
var demo_list = null;
var action_list = {};
var dispatchStack = new Array;
var skillTarget = false;
var sfxState = false;
var loopingState = true;
var animeVersion = 0;
var abilityPlayMode = 0; // 0 = None, 1 = Cycle, 2 = Fixed
var abilityListIndex = 0; // currently playing ability
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

// start
setHTML();

// functions
function setHTML()
{
	// canvas content
	let canvasContent = '<canvas class="cjs-npc-demo cjs-npc-demo-0" width="'+JSON.stringify(CANVAS_SIZE)+'" height="'+JSON.stringify(CANVAS_SIZE)+'" style="display:block;"></canvas>'
	for (var i = 1; i < versionList.length; i++)
		canvasContent += '<canvas class="cjs-npc-demo cjs-npc-demo-' + i + '" width="'+JSON.stringify(CANVAS_SIZE)+'" height="'+JSON.stringify(CANVAS_SIZE)+'" style="display:none;"></canvas>';
	document.getElementById("canvas-container").innerHTML = canvasContent;
	// version list
	let versions = '';
	if(versionList.length > 0)
	{
		versions = '<label for="version-selection">Version</label><select id="version-selection" onchange="versionChange(this)">';
		for(var i = 0; i < versionList.length; i++)
		{
			versions += '<option value="' + i + '">' + versionList[i] + '</option>';
		}
		versions += '</select>';
	}
	// ability list
	let abilities = '';
	if(abilityList.length > 0)
	{
		abilities = '<label for="ability-selection">Skill Effect</label><select id="ability-selection" onchange="abilityChange(this)">';
		abilities += '<option value="default">None</option>';
		abilities += '<option value="cycle">Cycle</option>';
		for(var i = 0; i < abilityList.length; i++)
		{
			let split_ab = abilityList[i].split("_");
			abilities += '<option value="' + i + '">' + (abilityList[i].includes("_all_") ? "AOE " : "Targeted ") + split_ab[split_ab.length-1] + '</option>';
		}
		abilities += '</select>';
	}
	// init UI
	ui.version_select = document.getElementById("version-selection");
	ui.act_select = document.getElementById("act-selection");
	ui.ab_select = document.getElementById("ability-selection");
	ui.act_name = document.getElementById("act-name");
	ui.act_duration = document.getElementById("act-duration");
	canvas = document.querySelector('.cjs-npc-demo-0');
}

function actionChange(obj)
{
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

function versionChange(obj)
{
	if(!canInteract()) return;
	beep();
	if(window.soundPlayer) window.soundPlayer.clearAll();

	animeVersion = obj.options[obj.selectedIndex].value;
	//verify if action exists
	var action = ui.act_select.options[ui.act_select.selectedIndex].value;
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
		action_list.motionList = action_index[animeVersion].action_label_list;
	}
	ui.act_select.innerHTML = actionlist;

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
}

function abilityChange(obj) // update ability sfx
{
	let index = obj.options[obj.selectedIndex].value;
	switch(index)
	{
		case "default":
			abilityPlayMode = 0;
			break;
		case "cycle":
			abilityPlayMode = 1;
			break;
		default:
			abilityListIndex = parseInt(index);
			abilityPlayMode = 2;
			break;
	};
}
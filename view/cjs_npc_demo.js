define(["view/cjs", "view/content", "lib/common"], function (cjsview, content) {
    // settings you can edit:
    var CANVAS_SIZE = CANVAS_SIZE || "1400"; // 1400px. The syntax is because player.js also needs it, so it might be declared here first, depending on race conditions.
    const WINDOWSIZE = 600; // Window size on the page. Must match what's defined in style.css, at #canvas-container
    const SUMMON_FULLSCREEN_SCALING = 0.9; // Additional scaling for fullscreen summon animations
    // end
    let realSize = 1400; // default expected size
    let scaling = CANVAS_SIZE / realSize;
    let center = CANVAS_SIZE / 2;
    const npcOffset = { // position of the element
        x: Math.floor(is_enemy ? center - WINDOWSIZE * 0.35 * scaling : center + WINDOWSIZE * 0.25 * scaling),
        y: Math.floor(is_enemy ? center + WINDOWSIZE * 0.55 * scaling : center + WINDOWSIZE * 0.15 * scaling)
    };
    const enemyOffset = { // position where the element will target its attacks
        x: Math.floor(is_enemy ? center + WINDOWSIZE * 0.25 * scaling : center - WINDOWSIZE * 0.20 * scaling),
        y: Math.floor(is_enemy ? center + WINDOWSIZE * 0.40 * scaling : center + WINDOWSIZE * 0.30 * scaling)
    };
    const fullscreenOffset = { // position of fullscreen animations
        x: Math.floor(center + WINDOWSIZE * (-1 + 0.45) / scaling), // a tiny bit on the left of the top left corner
        y: Math.floor(center + WINDOWSIZE * (-1 + 0.45) / scaling)
    };
    const OUGIOFFSET = Math.floor(0.15 * WINDOWSIZE / scaling); // Y offset for some ougi effects
    const complete = "animationComplete";
    const atkIndex = 6;
    const stageZIndex = { // like the name implies, z_index constant used for elements. Higher = Above. In the current version, mostly used for to put elements above or under background ougi effects.
        BG: 0,
        ENEMY: 1,
        CHARACTER: 2
    };
    const animations = { // constant associated with in-game strings. Non exhaustive.
        WAIT: "wait",
        WAIT_2: "wait_2",
        WAIT_3: "wait_3",
        TO_STB_WAIT: "setup",
        STB_WAIT: "stbwait",
        CHARA_SELECT: "chara_select",
        CHARA_IN: "chara_in",
        CHARA_OUT: "chara_out",
        ABILITY: "ability",
        ABILITY_WAIT: "ability_wait",
        SUMMON_ATTACK: "summon_atk", // doesn't exist in-game, special for summon use
        SUMMON_DAMAGE: "summon_dmg", // doesn't exist in-game, special for summon use
        MORTAL: "mortal",
        MORTAL_A: "mortal_A",
        MORTAL_A_1: "mortal_A_1",
        MORTAL_A_2: "mortal_A_2",
        MORTAL_B: "mortal_B",
        MORTAL_B_1: "mortal_B_1",
        MORTAL_B_2: "mortal_B_2",
        MORTAL_C: "mortal_C",
        MORTAL_C_1: "mortal_C_1",
        MORTAL_C_2: "mortal_C_2",
        MORTAL_D: "mortal_D",
        MORTAL_D_1: "mortal_D_1",
        MORTAL_D_2: "mortal_D_2",
        MORTAL_E: "mortal_E",
        MORTAL_E_1: "mortal_E_1",
        MORTAL_E_2: "mortal_E_2",
        MORTAL_F: "mortal_F",
        MORTAL_F_1: "mortal_F_1",
        MORTAL_F_2: "mortal_F_2",
        MORTAL_G: "mortal_G",
        MORTAL_G_1: "mortal_G_1",
        MORTAL_G_2: "mortal_G_2",
        MORTAL_H: "mortal_H",
        MORTAL_H_1: "mortal_H_1",
        MORTAL_H_2: "mortal_H_2",
        MORTAL_I: "mortal_I",
        MORTAL_I_1: "mortal_I_1",
        MORTAL_I_2: "mortal_I_2",
        MORTAL_J: "mortal_J",
        MORTAL_J_1: "mortal_J_1",
        MORTAL_J_2: "mortal_J_2",
        MORTAL_K: "mortal_K",
        MORTAL_K_1: "mortal_K_1",
        MORTAL_K_2: "mortal_K_2",
        ATTACK: "attack",
        ATTACK_SHORT: "short_attack",
        ATTACK_DOUBLE: "double",
        ATTACK_TRIPLE: "triple",
        ATTACK_QUADRUPLE: "quadruple",
        SPECIAL_ATTACK: "attack_2",
        ENEMY_ATTACK: "attack_3",
        CHANGE: "change",
        CHANGE_TO: "change_1",
        CHANGE_FROM: "change_2",
        CHANGE_TO_2: "change_1_2",
        CHANGE_FROM_2: "change_2_2",
        DEAD: "dead",
        DEAD_2: "dead_2",
        DAMAGE: "damage",
        DAMAGE_1: "damage_1",
        DAMAGE_2: "damage_2",
        DAMAGE_3: "damage_3",
        DAMAGE_4: "damage_4",
        DAMAGE_5: "damage_5",
        WIN: "win",
        WIN1: "win1",
        WIN2: "win2",
        INVISIBLE: "invisible",
        HIDE: "hide",
        DOWN: "down",
        WAIT_SPECIAL: "pf",
        WAIT_SPECIAL_1: "pf_1",
        WAIT_SPECIAL_2: "pf_2",
        WAIT_SPECIAL_3: "pf_3",
        WAIT_SPECIAL_4: "pf_4",
        WAIT_SPECIAL_5: "pf_5",
        MISS: "miss",
        SUMMON: "summon",
        ABILITY_MOTION_OLD: "attack_noeffect",
        ABILITY_MOTION: "ab_motion",
        ABILITY_MOTION_2: "ab_motion_2",
        ABILITY_MOTION_3: "ab_motion_3",
        ABILITY_MOTION_4: "ab_motion_4",
        ENEMY_PHASE_1: "setin",
        ENEMY_PHASE_2: "setin_2",
        ENEMY_PHASE_3: "setin_3",
        ENEMY_PHASE_4: "setin_4",
        ENEMY_PHASE_5: "setin_5",
        ENEMY_FORM_CHANGE: "form_change",
        ENEMY_STANDBY_A: "standby_A",
        ENEMY_STANDBY_B: "standby_B",
        ENEMY_STANDBY_C: "standby_C",
        ENEMY_STANDBY_D: "standby_D",
        ENEMY_BREAK_STANDBY_A: "break_standby_A",
        ENEMY_BREAK_STANDBY_B: "break_standby_B",
        ENEMY_BREAK_STANDBY_C: "break_standby_C",
        ENEMY_BREAK_STANDBY_D: "break_standby_D",
        ENEMY_DAMAGE_STANDBY_A: "damage_standby_A",
        ENEMY_DAMAGE_STANDBY_B: "damage_standby_B",
        ENEMY_DAMAGE_STANDBY_C: "damage_standby_C",
        ENEMY_DAMAGE_STANDBY_D: "damage_standby_D",
        LINK_PHASE_1: "setin_link",
        LINK_PHASE_1_2: "setin_link_2",
        LINK_PHASE_1_F2: "setin_link_f2",
        LINK_PHASE_1_F2_2: "setin_link_f2_2",
        LINK_PHASE_2: "setin_2_link",
        LINK_PHASE_2_2: "setin_2_link_2",
        LINK_PHASE_2_F2: "setin_2_link_f2",
        LINK_PHASE_2_F2_2: "setin_2_link_f2_2",
        LINK_PHASE_3: "setin_3_link",
        LINK_PHASE_3_2: "setin_3_link_2",
        LINK_PHASE_3_F2: "setin_3_link_f2",
        LINK_PHASE_3_F2_2: "setin_3_link_f2_2",
        LINK_PHASE_4: "setin_4_link",
        LINK_PHASE_4_2: "setin_4_link_2",
        LINK_PHASE_4_F2: "setin_4_link_f2",
        LINK_PHASE_4_F2_2: "setin_4_link_f2_2",
        LINK_PHASE_5: "setin_5_link",
        LINK_PHASE_5_2: "setin_5_link_2",
        LINK_PHASE_5_F2: "setin_5_link_f2",
        LINK_PHASE_5_F2_2: "setin_5_link_f2_2",
        LINK_DAMAGE: "damage_link",
        LINK_DAMAGE_2: "damage_link_2",
        LINK_DEAD: "dead_link",
        LINK_DEAD_1: "dead_1_link",
        LINK_DEAD_2: "dead_2_link",
        LINK_DEAD_3: "dead_3_link",
        LINK_DEAD_A: "dead_link_1",
        LINK_DEAD_B: "dead_link_2",
        LINK_DEAD_C: "dead_link_3",
        LINK_MORTAL_A: "mortal_A_link",
        LINK_MORTAL_A_2: "mortal_A_link_2",
        LINK_MORTAL_A_F2: "mortal_A_link_f2",
        LINK_MORTAL_A_F2_2: "mortal_A_link_f2_2",
        LINK_MORTAL_B: "mortal_B_link",
        LINK_MORTAL_B_2: "mortal_B_link_2",
        LINK_MORTAL_B_F2: "mortal_B_link_f2",
        LINK_MORTAL_B_F2_2: "mortal_B_link_f2_2",
        LINK_MORTAL_C: "mortal_C_link",
        LINK_MORTAL_C_2: "mortal_C_link_2",
        LINK_MORTAL_C_F2: "mortal_C_link_f2",
        LINK_MORTAL_C_F2_2: "mortal_C_link_f2_2",
        LINK_MORTAL_D: "mortal_D_link",
        LINK_MORTAL_D_2: "mortal_D_link_2",
        LINK_MORTAL_D_F2: "mortal_D_link_f2",
        LINK_MORTAL_D_F2_2: "mortal_D_link_f2_2",
        LINK_MORTAL_E: "mortal_E_link",
        LINK_MORTAL_E_2: "mortal_E_link_2",
        LINK_MORTAL_E_F2: "mortal_E_link_f2",
        LINK_MORTAL_E_F2_2: "mortal_E_link_f2_2",
        LINK_MORTAL_F: "mortal_F_link",
        LINK_MORTAL_F_2: "mortal_F_link_2",
        LINK_MORTAL_F_F2: "mortal_F_link_f2",
        LINK_MORTAL_F_F2_2: "mortal_F_link_f2_2",
        LINK_MORTAL_G: "mortal_G_link",
        LINK_MORTAL_G_2: "mortal_G_link_2",
        LINK_MORTAL_G_F2: "mortal_G_link_f2",
        LINK_MORTAL_G_F2_2: "mortal_G_link_f2_2",
        LINK_MORTAL_H: "mortal_H_link",
        LINK_MORTAL_H_2: "mortal_H_link_2",
        LINK_MORTAL_H_F2: "mortal_H_link_f2",
        LINK_MORTAL_H_F2_2: "mortal_H_link_f2_2",
        LINK_MORTAL_I: "mortal_I_link",
        LINK_MORTAL_I_2: "mortal_I_link_2",
        LINK_MORTAL_I_F2: "mortal_I_link_f2",
        LINK_MORTAL_I_F2_2: "mortal_I_link_f2_2",
        LINK_MORTAL_J: "mortal_J_link",
        LINK_MORTAL_J_2: "mortal_J_link_2",
        LINK_MORTAL_J_F2: "mortal_J_link_f2",
        LINK_MORTAL_J_F2_2: "mortal_J_link_f2_2",
        LINK_MORTAL_K: "mortal_K_link",
        LINK_MORTAL_K_2: "mortal_K_link_2",
        LINK_MORTAL_K_F2: "mortal_K_link_f2",
        LINK_MORTAL_K_F2_2: "mortal_K_link_f2_2",
        LINK_ATTACK: "attack_link",
        LINK_ATTACK_2: "attack_link_2",
        LINK_ATTACK_F2: "attack_link_f2",
        LINK_ATTACK_F2_2: "attack_link_f2_2",
        LINK_FORM_CHANGE: "form_change_link",
        LINK_FORM_CHANGE_2: "form_change_link_2"
    };
    const aniState = { // mostly used for double/triple attacks
        WAIT: 10,
        STB_WAIT: 10,
        ABILITY: 30,
        COMBO_PROCESS: 10
    };
    const targets = { // for attack targets
        PLAYER: "player",
        ENEMY: "boss",
        THEM: "them"
    };
    return cjsview.extend({ // START/ENTRY POINT
        cjsList: null,
        cjsEffectList: null,
        cjsMortalList: null,
        currentIndex: 0,
        cjsNameNpc: null,
        cjsNameEffect: null,
        cjsNameMortal: null,
        canvas: null,
        canvasSelector: null,
        canvasIndex: null,
        stage: null,
        cjsNpc: null,
        cjsEffect: null,
        cjsMortal: null,
        isPaused: false,
        loopPaused: false,
        motionList: null,
        motionListIndex: 0,
        isFullScreenMortal: false,
        isFixedPosOwnerBG: false,
        animChanger: null,
        damageTarget: null,
        loopIndex: null,
        npc: null,
        recording: null,
        initialize: function(params) // constructor
        {
            params = params || {};
            content.prototype._destroyStage(this.stage);
            this.stage = null;
            this.currentIndex = 0;
            this.cjsNpc = null;
            this.cjsEffect = null;
            this.cjsMortal = null;
            this.motionListIndex = 0;
            this.isFullScreenMortal = false;
            this.isFixedPosOwnerBG = false;
            this.animChanger = null;
            this.cjsList = params.cjsList || [];
            this.cjsEffectList = params.cjsEffectList || [];
            this.cjsMortalList = params.cjsMortalList || [];
            this.cjsPosList = params.cjsPosList || [];
            this.cjsMortalPosList = params.cjsMortalPosList || [];
            action_list.motionList = params.motionList;
            this.canvasSelector = params.canvasSelector;
            this.canvasIndex = params.canvasIndex;
            for(var c = this.cjsMortalList.length, d = 0; c > d; d++) // iterate over ougis in reverse order
            {
                var e = this.cjsMortalList[d]
                    , f = this.cjsMortalPosList[d];
                if(e.random) {
                    for (var g = _.clone(e.list), h = _.clone(f), i = [], j = g.length, k = 0; j > k; k++)
                        i[k] = k;
                    for (i = _.shuffle(i),
                        k = 0; j > k; k++)
                        e.list[k] = g[i[k]],
                            f[k] = h[i[k]]
                }
            }
            this.canvas = document.querySelector(this.canvasSelector);
            this.updateCjsParams(this.currentIndex);
        },
        getLoadFiles: function () { // file loader
            var files = _.flatten([this.cjsList, this.cjsEffectList]);
            return _.each(this.cjsMortalList, function (mortal) {
                _.each(mortal.list, function (mortal) {
                    files.push(mortal.cjs)
                })
            }),
            files;
        },
        cjsRender: function () { // used at the start
            createjs.Ticker.framerate = 30; // init fps
            this.stage = new createjs.Stage(this.canvas);
            this.cjsNpc = this.generateCjsNpc(this.cjsNameNpc);
            this.cjsNpc.scaleX = scaling;
            this.cjsNpc.scaleY = scaling;
            this.stage.addChild(this.cjsNpc);
            this.startAnim(this.cjsNpc, action_list.motionList[this.motionListIndex]);
            this.stage.update();
            this.isPaused ? this.pause() : createjs.Ticker.addEventListener("tick", this.stage);
        },
        getActionList: function() { // return the list of animations/actions
            if(this.motionList != null) return this.motionList;
            if(mc_summon != null) // special exception for summons
            {
                if(this.cjsMortalList.length >= 1 && this.cjsMortalList[0].list.length >= 1 && this.cjsMortalList[0].list[0].cjs.includes("_attack"))
                    this.motionList = ["summon", "summon_atk", "summon_dmg"]; // add damage if file includes _attack
                else
                    this.motionList = ["summon", "summon_atk"];
                return this.motionList;
            }
            let demoList=[];
            let otherList=[];
            let len=this.cjsNpc['name'].length;
            for(action in this.cjsNpc['children'][0])
            {
                actionStr=action.toString();
                if(is_mc && actionStr.includes("mortal") && ((mc_wpn == null && !actionStr.endsWith('_mortal_B')) || (mc_wpn != null && ["_1", "_2"].includes(actionStr.slice(-2))))) continue; // hack to disable some ougi options on mc
                if(actionStr.substring(0,len) == this.cjsNpc['name'])
                {
                    let action = actionStr.substring(len+1);
                    if(action in action_index[this.canvasIndex]['action_label_list'])
                        demoList.push(action);
                    else
                        otherList.push(action);
                }
            }
            let unsorted = demoList.concat(Array.from(otherList));
            // sort list
            let dic = {};
            for(let m of unsorted)
                dic[this.translateAction(m)] = m;
            let keys = Object.keys(dic).sort();
            this.motionList = [];
            for(let k of keys)
                this.motionList.push(dic[k]);
            return this.motionList;
        },
        translateAction: function(action) { // translate action/animation to more humanly readable names. Unofficial/Made up and Non exhaustive.
            switch(action)
            {
                case animations.WAIT: return "Idle";
                case animations.WAIT_2: return "Idle (Overdrive)";
                case animations.WAIT_3: return "Idle (Break)";
                case animations.TO_STB_WAIT: return "Weapon Drew";
                case animations.STB_WAIT: return "Weapon Drew (Idle)";
                case animations.CHARA_SELECT: return "Selection";
                case animations.CHARA_IN: return "Fade In";
                case animations.CHARA_OUT: return "Fade Out";
                case 'charge': return "Charged";
                case animations.ABILITY: return "C.A. Charged";
                case animations.ABILITY_WAIT: return "Skill (Wait)";
                case animations.SUMMON_ATTACK: return "Summon Call";
                case animations.SUMMON_DAMAGE: return "Summon Damage";
                case animations.MORTAL: return "Charge Attack";
                case animations.MORTAL_A: return "Charge Attack A";
                case animations.MORTAL_A_1: return "Charge Attack A1";
                case animations.MORTAL_A_2: return "Charge Attack A2";
                case animations.MORTAL_B: return "Charge Attack B";
                case animations.MORTAL_B_1: return "Charge Attack B1";
                case animations.MORTAL_B_2: return "Charge Attack B2";
                case animations.MORTAL_C: return "Charge Attack C";
                case animations.MORTAL_C_1: return "Charge Attack C1";
                case animations.MORTAL_C_2: return "Charge Attack C2";
                case animations.MORTAL_D: return "Charge Attack D";
                case animations.MORTAL_D_1: return "Charge Attack D1";
                case animations.MORTAL_D_2: return "Charge Attack D2";
                case animations.MORTAL_E: return "Charge Attack E";
                case animations.MORTAL_E_1: return "Charge Attack E1";
                case animations.MORTAL_E_2: return "Charge Attack E2";
                case animations.MORTAL_F: return "Charge Attack F";
                case animations.MORTAL_F_1: return "Charge Attack F1";
                case animations.MORTAL_F_2: return "Charge Attack F2";
                case animations.MORTAL_G: return "Charge Attack G";
                case animations.MORTAL_G_1: return "Charge Attack G1";
                case animations.MORTAL_G_2: return "Charge Attack G2";
                case animations.MORTAL_H: return "Charge Attack H";
                case animations.MORTAL_H_1: return "Charge Attack H1";
                case animations.MORTAL_H_2: return "Charge Attack H2";
                case animations.MORTAL_I: return "Charge Attack I";
                case animations.MORTAL_I_1: return "Charge Attack I1";
                case animations.MORTAL_I_2: return "Charge Attack I2";
                case animations.MORTAL_J: return "Charge Attack J";
                case animations.MORTAL_J_1: return "Charge Attack J1";
                case animations.MORTAL_J_2: return "Charge Attack J2";
                case animations.MORTAL_K: return "Charge Attack K";
                case animations.MORTAL_K_1: return "Charge Attack K1";
                case animations.MORTAL_K_2: return "Charge Attack K2";
                case animations.ATTACK: return "Attack";
                case animations.ATTACK_SHORT: return "Attack 1";
                case animations.ATTACK_DOUBLE: return "Attack 2";
                case animations.ATTACK_TRIPLE: return "Attack 3";
                case animations.ATTACK_QUADRUPLE: return "Attack 4";
                case animations.SPECIAL_ATTACK: return "Attack B (Alt/OD)";
                case animations.ENEMY_ATTACK: return "Attack C (Break)";
                case animations.CHANGE: return "Change Form";
                case animations.CHANGE_TO: return "Change Form 1";
                case animations.CHANGE_FROM: return "Change Form 2";
                case animations.CHANGE_TO_2: return "Change Form 3";
                case animations.CHANGE_FROM_2: return "Change Form 4";
                case animations.DEAD: return "Dead";
                case animations.DEAD_1: return "Dead 1";
                case animations.DEAD_2: return "Dead 2";
                case animations.DAMAGE: return "Damaged";
                case animations.DAMAGE_1: return "Damaged A";
                case animations.DAMAGE_2: return "Damaged B (OD)";
                case animations.DAMAGE_3: return "Damaged C (Break)";
                case animations.DAMAGE_4: return "Damaged D";
                case animations.DAMAGE_5: return "Damaged E";
                case animations.WIN: return "Win";
                case animations.WIN1: return "Win 1";
                case animations.WIN2: return "Win 2";
                case 'win_1': return "Win Alt. 1";
                case 'win_2': return "Win Alt. 2";
                case 'win_3': return "Win Alt. 3";
                case animations.INVISIBLE: return "Invisible";
                case animations.HIDE: return "Hide";
                case animations.DOWN: return "Low HP";
                case animations.WAIT_SPECIAL: return "Idle (Spe)";
                case animations.WAIT_SPECIAL_1: return "Idle (Spe) A";
                case animations.WAIT_SPECIAL_2: return "Idle (Spe) B";
                case animations.WAIT_SPECIAL_3: return "Idle (Spe) C";
                case animations.WAIT_SPECIAL_4: return "Idle (Spe) D";
                case animations.WAIT_SPECIAL_5: return "Idle (Spe) E";
                case animations.MISS:  return "Miss";
                case animations.SUMMON: return "Summoning";
                case animations.ABILITY_MOTION_OLD: return "Miss (Old)";
                case animations.ABILITY_MOTION: return "Skill A";
                case animations.ABILITY_MOTION_2: return "Skill B";
                case animations.ABILITY_MOTION_3: return "Skill C";
                case animations.ABILITY_MOTION_4: return "Skill D";
                case 'vs_motion_1': return "Custom Skill A";
                case 'vs_motion_2': return "Custom Skill B";
                case 'vs_motion_3': return "Custom Skill C";
                case 'vs_motion_4': return "Custom Skill D";
                case 'vs_motion_5': return "Custom Skill E";
                case 'vs_motion_6': return "Custom Skill F";
                case animations.ENEMY_PHASE_1: return "Phase 1 (Entry)";
                case animations.ENEMY_PHASE_2: return "Phase 2 (OD)";
                case animations.ENEMY_PHASE_3: return "Phase 3 (Break)";
                case animations.ENEMY_PHASE_4: return "Phase 4";
                case animations.ENEMY_PHASE_5: return "Phase 5";
                case animations.ENEMY_FORM_CHANGE: return "Form Change";
                case animations.ENEMY_STANDBY_A: return "Standby A";
                case animations.ENEMY_STANDBY_B: return "Standby B";
                case animations.ENEMY_STANDBY_C: return "Standby C";
                case animations.ENEMY_STANDBY_D: return "Standby D";
                case animations.ENEMY_BREAK_STANDBY_A: return "Standby A (Break)";
                case animations.ENEMY_BREAK_STANDBY_B: return "Standby B (Break)";
                case animations.ENEMY_BREAK_STANDBY_C: return "Standby C (Break)";
                case animations.ENEMY_BREAK_STANDBY_D: return "Standby D (Break)";
                case animations.ENEMY_DAMAGE_STANDBY_A: return "Standby A (Dmgd)";
                case animations.ENEMY_DAMAGE_STANDBY_B: return "Standby B (Dmgd)";
                case animations.ENEMY_DAMAGE_STANDBY_C: return "Standby C (Dmgd)";
                case animations.ENEMY_DAMAGE_STANDBY_D: return "Standby D (Dmgd)";
                case animations.LINK_PHASE_1: return "Phase 1 (Entry)(Lk)";
                case animations.LINK_PHASE_1_2: return "Phase 1B (Entry)(Lk)";
                case animations.LINK_PHASE_1_F2: return "Phase 1C (Entry)(Lk)";
                case animations.LINK_PHASE_1_F2_2: return "Phase 1D (Entry)(Lk)";
                case animations.LINK_PHASE_2: return "Phase 2 (OD)(Lk)";
                case animations.LINK_PHASE_2_2: return "Phase 2B (OD)(Lk)";
                case animations.LINK_PHASE_2_F2: return "Phase 2C (OD)(Lk)";
                case animations.LINK_PHASE_2_F2_2: return "Phase 2D (OD)(Lk)";
                case animations.LINK_PHASE_3: return "Phase 3 (Break)(Lk)";
                case animations.LINK_PHASE_3_2: return "Phase 3B (Break)(Lk)";
                case animations.LINK_PHASE_3_F2: return "Phase 3C (Break)(Lk)";
                case animations.LINK_PHASE_3_F2_2: return "Phase 3D (Break)(Lk)";
                case animations.LINK_PHASE_4: return "Phase 4 (Lk)";
                case animations.LINK_PHASE_4_2: return "Phase 4B (Lk)";
                case animations.LINK_PHASE_4_F2: return "Phase 4C (Lk)";
                case animations.LINK_PHASE_4_F2_2: return "Phase 4D (Lk)";
                case animations.LINK_PHASE_5: return "Phase 5 (Lk)";
                case animations.LINK_PHASE_5_2: return "Phase 5B (Lk)";
                case animations.LINK_PHASE_5_F2: return "Phase 5C (Lk)";
                case animations.LINK_PHASE_5_F2_2: return "Phase 5D (Lk)";
                case animations.LINK_DAMAGE: return "Damaged (Link)";
                case animations.LINK_DAMAGE_2: return "Damaged 2 (Link)";
                case animations.LINK_DEAD: return "Dead (Link)";
                case animations.LINK_DEAD_1: return "Dead 1 (Link)";
                case animations.LINK_DEAD_2: return "Dead 2 (Link)";
                case animations.LINK_DEAD_3: return "Dead 3 (Link)";
                case animations.LINK_DEAD_A: return "Dead 1B (Link)";
                case animations.LINK_DEAD_B: return "Dead 2B (Link)";
                case animations.LINK_DEAD_C: return "Dead 3B (Link)";
                case animations.LINK_MORTAL_A: return "Charge Atk. A (Lk)";
                case animations.LINK_MORTAL_A_2: return "Charge Atk. A2 (Lk)";
                case animations.LINK_MORTAL_A_F2: return "Charge Atk. A3 (Lk)";
                case animations.LINK_MORTAL_A_F2_2: return "Charge Atk. A4 (Lk)";
                case animations.LINK_MORTAL_B: return "Charge Atk. B (Lk)";
                case animations.LINK_MORTAL_B_2: return "Charge Atk. B2 (Lk)";
                case animations.LINK_MORTAL_B_F2: return "Charge Atk. B3 (Lk)";
                case animations.LINK_MORTAL_B_F2_2: return "Charge Atk. B4 (Lk)";
                case animations.LINK_MORTAL_C: return "Charge Atk. C (Lk)";
                case animations.LINK_MORTAL_C_2: return "Charge Atk. C2 (Lk)";
                case animations.LINK_MORTAL_C_F2: return "Charge Atk. C3 (Lk)";
                case animations.LINK_MORTAL_C_F2_2: return "Charge Atk. C4 (Lk)";
                case animations.LINK_MORTAL_D: return "Charge Atk. D (Lk)";
                case animations.LINK_MORTAL_D_2: return "Charge Atk. D2 (Lk)";
                case animations.LINK_MORTAL_D_F2: return "Charge Atk. D3 (Lk)";
                case animations.LINK_MORTAL_D_F2_2: return "Charge Atk. D4 (Lk)";
                case animations.LINK_MORTAL_E: return "Charge Atk. E (Lk)";
                case animations.LINK_MORTAL_E_2: return "Charge Atk. E2 (Lk)";
                case animations.LINK_MORTAL_E_F2: return "Charge Atk. E3 (Lk)";
                case animations.LINK_MORTAL_E_F2_2: return "Charge Atk. E4 (Lk)";
                case animations.LINK_MORTAL_F: return "Charge Atk. F (Lk)";
                case animations.LINK_MORTAL_F_2: return "Charge Atk. F2 (Lk)";
                case animations.LINK_MORTAL_F_F2: return "Charge Atk. F3 (Lk)";
                case animations.LINK_MORTAL_F_F2_2: return "Charge Atk. F4 (Lk)";
                case animations.LINK_MORTAL_G: return "Charge Atk. G (Lk)";
                case animations.LINK_MORTAL_G_2: return "Charge Atk. G2 (Lk)";
                case animations.LINK_MORTAL_G_F2: return "Charge Atk. G3 (Lk)";
                case animations.LINK_MORTAL_G_F2_2: return "Charge Atk. G4 (Lk)";
                case animations.LINK_MORTAL_H: return "Charge Atk. H (Lk)";
                case animations.LINK_MORTAL_H_2: return "Charge Atk. H2 (Lk)";
                case animations.LINK_MORTAL_H_F2: return "Charge Atk. H3 (Lk)";
                case animations.LINK_MORTAL_H_F2_2: return "Charge Atk. H4 (Lk)";
                case animations.LINK_MORTAL_I: return "Charge Atk. I (Lk)";
                case animations.LINK_MORTAL_I_2: return "Charge Atk. I2 (Lk)";
                case animations.LINK_MORTAL_I_F2: return "Charge Atk. I3 (Lk)";
                case animations.LINK_MORTAL_I_F2_2: return "Charge Atk. I4 (Lk)";
                case animations.LINK_MORTAL_J: return "Charge Atk. J (Lk)";
                case animations.LINK_MORTAL_J_2: return "Charge Atk. J2 (Lk)";
                case animations.LINK_MORTAL_J_F2: return "Charge Atk. J3 (Lk)";
                case animations.LINK_MORTAL_J_F2_2: return "Charge Atk. J4 (Lk)";
                case animations.LINK_MORTAL_K: return "Charge Atk. K (Lk)";
                case animations.LINK_MORTAL_K_2: return "Charge Atk. K2 (Lk)";
                case animations.LINK_MORTAL_K_F2: return "Charge Atk. K3 (Lk)";
                case animations.LINK_MORTAL_K_F2_2: return "Charge Atk. K4 (Lk)";
                case animations.LINK_ATTACK: return "Attack (Link)";
                case animations.LINK_ATTACK_2: return "Attack B (Link)";
                case animations.LINK_ATTACK_F2: return "Attack C (Link)";
                case animations.LINK_ATTACK_F2_2: return "Attack D (Link)";
                case animations.LINK_FORM_CHANGE: return "Form Change (Link)";
                case animations.LINK_FORM_CHANGE_2: return "Form Change 2 (Link)"
                default: return "??? (" + action + ")";
            };
        },
        generateCjsNpc: function(npc) // create element
        {
            let elem = new lib[npc];
            return elem.name = npc,
            elem.x = npcOffset.x + this.cjsPos.x,
            elem.y = npcOffset.y + this.cjsPos.y,
            elem.scaleX *= scaling,
            elem.scaleY *= scaling,
            elem
        },
        updateCjsParams: function(index) // update element
        {
            this.cjsNameNpc = this.cjsList[0];
            this.cjsNameEffect = this.cjsEffectList[0];
            this.cjsPos = this.cjsPosList[index] || {
                x: 0,
                y: 0
            };
            if(this.cjsMortalList.length > 0 &&  this.cjsMortalList[index].list.length > 0)
            {
                this.cjsNameMortal = this.cjsMortalList[index].list[0].cjs;
                this.isFullScreenMortal = !!this.cjsMortalList[index].list[0].full_screen || false;
                this.isFixedPosOwnerBG = !!this.cjsMortalList[index].list[0].fixed_pos_owner_bg || false;
                this.cjsMortalPos = this.cjsMortalPosList[0][0] || {
                    x: 0,
                    y: 0
                };
            }
        },
        startAnim: function(elem, motion) // start given animation (called motion)
        {
            function addOugi(mortal) // ougi animations (characters or enemies)
            {
                me.cjsMortal = new lib[mortal];
                me.stage.addChild(me.cjsMortal);
                if(is_enemy)
                {
                    me.cjsMortal.x = enemyOffset.x;;
                    me.cjsMortal.y = enemyOffset.y;
                    me.stage.setChildIndex(me.cjsMortal, stageZIndex.CHARACTER);
                }
                else
                {
                    if(me.isFullScreenMortal)
                    {
                    me.cjsMortal.x = fullscreenOffset.x / SUMMON_FULLSCREEN_SCALING;
                    me.cjsMortal.y = fullscreenOffset.y / SUMMON_FULLSCREEN_SCALING;
                    
                    me.cjsMortal.scaleX *= SUMMON_FULLSCREEN_SCALING;
                    me.cjsMortal.scaleY *= SUMMON_FULLSCREEN_SCALING;
                    }
                    else
                    {
                        if(me.isFixedPosOwnerBG) // kinda unused ?
                        {
                            me.cjsMortal.x = fullscreenOffset.x;
                            me.cjsMortal.y = fullscreenOffset.y;
                            me.stage.setChildIndex(me.cjsMortal, stageZIndex.CHARACTER);
                        }
                        else
                        {
                            me.cjsMortal.x = enemyOffset.x;
                            me.cjsMortal.y = enemyOffset.y + OUGIOFFSET; // add an offset
                            me.stage.setChildIndex(me.cjsMortal, stageZIndex.BG);
                        }
                    }
                    me.cjsMortal.x += me.cjsMortalPos.x;
                    me.cjsMortal.y += me.cjsMortalPos.y;
                }
                me.cjsMortal.scaleX *= scaling;
                me.cjsMortal.scaleY *= scaling;
                if(is_mc && mc_wpn)
                    me.cjsMortal[mortal][mortal+"_special"].gotoAndPlay("special");
                else
                    me.cjsMortal[mortal].gotoAndPlay("special");
            }
            function addSummon(mortal) // summon animations (based on the ougi code)
            {
                me.cjsMortal = new lib[mortal];
                me.stage.addChild(me.cjsMortal);
                if(me.isFullScreenMortal)
                {
                    // apply SUMMON_FULLSCREEN_SCALING here
                    me.cjsMortal.x = fullscreenOffset.x / SUMMON_FULLSCREEN_SCALING;
                    me.cjsMortal.y = fullscreenOffset.y / SUMMON_FULLSCREEN_SCALING;
                    me.cjsMortal.scaleX *= SUMMON_FULLSCREEN_SCALING;
                    me.cjsMortal.scaleY *= SUMMON_FULLSCREEN_SCALING;
                }
                else
                {
                    if(me.isFixedPosOwnerBG) // kinda unused
                    {
                        me.cjsMortal.x = fullscreenOffset.x;
                        me.cjsMortal.y = fullscreenOffset.y;
                        me.stage.setChildIndex(me.cjsMortal, stageZIndex.CHARACTER);
                    }
                    else
                    {
                        me.cjsMortal.x = enemyOffset.x;
                        me.cjsMortal.y = enemyOffset.y + OUGIOFFSET;
                        me.stage.setChildIndex(me.cjsMortal, stageZIndex.CHARACTER);
                    }
                }
                me.cjsMortal.x += me.cjsMortalPos.x;
                me.cjsMortal.y += me.cjsMortalPos.y;
                me.cjsMortal.scaleX *= scaling;
                me.cjsMortal.scaleY *= scaling;
                if(!(mortal in me.cjsMortal[mortal])) // failsafe for old or untested summons
                {
                    for(const k in me.cjsMortal[mortal])
                    {
                        if(k.includes('attack'))
                        {
                            me.cjsMortal[mortal].gotoAndPlay('attack');
                            return me.getAnimDuration(me.cjsMortal[mortal][k]);
                        }
                    }
                    return 0;
                }
                return me.getAnimDuration(me.cjsMortal[mortal][mortal]);
            }
            function addAtkEffect(elem) { // add auto attack effect (phit file)
                let atk = new lib[elem];
                atk.x = enemyOffset.x,
                atk.y = enemyOffset.y,
                atk.scaleX *= scaling,
                atk.scaleY *= scaling,
                me.stage.addChild(atk),
                me.stage.setChildIndex(atk, stageZIndex.CHARACTER),
                atk[elem].gotoAndPlay(atkIndex);
                let duration = me.getAnimDuration(atk[elem][elem + "_effect"]);
                createjs.Tween.get(atk, {
                    useTicks: true
                }).wait(duration).call(function () {
                    me.stage.removeChild(atk)
                })
            }
            function toggleForm() { // form change animations
                me.currentIndex++;
                if(me.currentIndex >= me.cjsList.length)
                    me.currentIndex = 0;
                me.stage.removeChild(me.cjsNpc);
                me.cjsMortal = null;
                me.updateCjsParams(me.currentIndex);
                me.cjsNpc = me.generateCjsNpc(me.cjsNameNpc);
                me.stage.addChild(me.cjsNpc);
            }
            function nextMotion() { // for double/triple attack
                let a = me.motionListIndex + 1;
                if(a >= action_list.motionList.length)
                    a = 0;
                return action_list.motionList[a]
            }
            function animationCompleted(event) { // when the animation is complete
                event.target.removeEventListener(complete, animationCompleted);
                if(me.stage && me.cjsMortal) // remove ougi
                {
                    me.stage.removeChild(me.cjsMortal);
                    me.cjsMortal = null;
                }
                // start next
                me.motionListIndex++;
                if(me.motionListIndex >= action_list.motionList.length)
                    me.motionListIndex = 0;
                me.startAnim(elem, action_list.motionList[me.motionListIndex]);
            }
            // main code
            if (!elem instanceof createjs.MovieClip)
                return null;
            this.loopIndex = null;
            this.npc = elem[this.cjsNameNpc];
            let animDuration = 0;
            let me = this;
            switch(motion)
            {
                default:
                {
                    animDuration = this.getAnimDuration(this.npc[this.cjsNameNpc + "_" + motion]);
                    break;
                }
                case animations.MORTAL:
                case animations.MORTAL_A:
                case animations.MORTAL_A_1:
                case animations.MORTAL_A_2:
                case animations.MORTAL_B:
                case animations.MORTAL_B_1:
                case animations.MORTAL_B_2:
                case animations.MORTAL_C:
                case animations.MORTAL_C_1:
                case animations.MORTAL_C_2:
                case animations.MORTAL_D:
                case animations.MORTAL_D_1:
                case animations.MORTAL_D_2:
                case animations.MORTAL_E:
                case animations.MORTAL_E_1:
                case animations.MORTAL_E_2:
                case animations.MORTAL_F:
                case animations.MORTAL_F_1:
                case animations.MORTAL_F_2:
                case animations.MORTAL_G:
                case animations.MORTAL_G_1:
                case animations.MORTAL_G_2:
                case animations.MORTAL_H:
                case animations.MORTAL_H_1:
                case animations.MORTAL_H_2:
                case animations.MORTAL_I:
                case animations.MORTAL_I_1:
                case animations.MORTAL_I_2:
                case animations.MORTAL_J:
                case animations.MORTAL_J_1:
                case animations.MORTAL_J_2:
                case animations.MORTAL_K:
                case animations.MORTAL_K_1:
                case animations.MORTAL_K_2:
                { // ougi call
                    this.currentIndex = motion.split('_')[1].charCodeAt()-65;
                    if(this.currentIndex >= this.cjsMortalList.length)
                        this.currentIndex=0;
                    if(this.cjsMortalList.length == 0 || this.cjsMortalList[this.currentIndex].list.length == 0) // no ougi file
                    {
                        animDuration = this.getAnimDuration(this.npc[this.cjsNameNpc + "_" + motion]);
                        break;
                    }
                    this.damageTarget = this.cjsMortalList[this.currentIndex].list[0].target === targets.THEM ? targets.ENEMY : targets.PLAYER;
                    this.updateCjsParams(this.currentIndex);
                    addOugi(this.cjsNameMortal);
                    animDuration = this.getAnimDuration(this.npc[this.cjsNameNpc + "_" + motion]) + ((is_mc && mc_wpn) ? this.getAnimDuration(this.cjsMortal[this.cjsNameMortal][this.cjsNameMortal+"_special"]) : 0);
                    break;
                }
                case animations.SUMMON_ATTACK:
                case animations.SUMMON_DAMAGE:
                { // summon call
                    this.currentIndex = 0;
                    this.damageTarget = this.cjsMortalList[this.currentIndex].list[0].target === targets.THEM ? targets.ENEMY : targets.PLAYER;
                    this.updateCjsParams(this.currentIndex);
                    animDuration = addSummon(motion == animations.SUMMON_DAMAGE ? this.cjsNameMortal.replace('attack', 'damage') : this.cjsNameMortal);
                    break;
                }
                case animations.ATTACK:
                case animations.ATTACK_SHORT:
                case animations.ATTACK_DOUBLE:
                case animations.ATTACK_TRIPLE:
                case animations.ATTACK_QUADRUPLE:
                case animations.SPECIAL_ATTACK:
                case animations.ENEMY_ATTACK:
                { // attack (single/double/triple/quad/etc...)
                    this.damageTarget = targets.ENEMY;
                    addAtkEffect(this.cjsNameEffect);
                    let nmotion = nextMotion();
                    animDuration = _.contains([animations.ATTACK_DOUBLE, animations.ATTACK_TRIPLE, animations.ATTACK_QUADRUPLE], nmotion) ? aniState.COMBO_PROCESS : this.getAnimDuration(this.npc[this.cjsNameNpc + "_" + motion]);
                    break;
                }
                case animations.CHANGE:
                case animations.CHANGE_FROM:
                case animations.CHANGE_FROM_2:
                { // form change
                    toggleForm();
                    elem = this.cjsNpc;
                    this.npc = elem[this.cjsNameNpc];
                    animDuration = this.getAnimDuration(this.npc[this.cjsNameNpc + "_" + motion]);
                }
            }
            // update animation name on the page
            let actname = document.getElementById("act-name");
            if(actname && actname.innerHTML != this.translateAction(motion)) {
                actname.innerHTML = this.translateAction(motion);
            };
            // update animation duration on the page
            let actduration = document.getElementById("act-duration");
            let newDuration=(animDuration / 30).toFixed(2) + 's'; // duration in second
            if(actduration && actduration.innerHTML != newDuration)
                actduration.innerHTML = newDuration;
            // set listener
            this.npc.addEventListener(complete, animationCompleted);
            // play animation
            if(motion != animations.SUMMON_ATTACK && motion != animations.SUMMON_DAMAGE) // hack to avoid MC moving during summoning
                this.npc.gotoAndPlay(motion);
            // handle dispatch stack
            flag = true
            for (i = 0; i < dispatchStack.length; i++) {
                if (dispatchStack[i] == 0) {
                    dispatchStack[i] = _.max(dispatchStack) + 1
                    flag = false
                    break
                }
            };
            if (flag) {
                dispatchStack[i] = _.max(dispatchStack) + 1
            };
            // update anim changer
            this.animChanger = createjs.Tween.get(this.stage, {
                useTicks: true,
                override: true
            }).wait(animDuration).call(function (index, p) {
                p.loopIndex = index;
                if(loopingState) p.nextLoop();
            },[i, this])
            if(this.isPaused) this.animChanger.paused = true;
        },
        nextLoop: function() { // switch to next animation loop (if enabled)
            if(this.loopIndex == null)
                return;
            if(dispatchStack[this.loopIndex] == _.max(dispatchStack))
            {
                dispatchStack[this.loopIndex] = 0;
                this.npc.dispatchEvent(complete);
            }
            else
            {
                dispatchStack[this.loopIndex] = 0;
                if(this.loopPaused)
                    this.npc.dispatchEvent(complete);
            }
        },
        getAnimDuration: function(elem) { // return an animation duration (in frames)
            return !elem instanceof createjs.MovieClip ? null : (elem.timeline.duration ? +elem.timeline.duration : +elem.timeline.Id); // last if check might not be needed
        },
        pause: function () { // pause the animation (by stopping the ticker)
            if(!this.isPaused)
            {
                this.isPaused = true;
                createjs.Ticker.removeEventListener("tick", this.stage);
                if(this.animChanger) this.animChanger.paused = true;
            }
        },
        resume: function () { // resume the animation (by restarting the ticker)
            if(this.isPaused)
            {
                this.isPaused = false;
                createjs.Ticker.addEventListener("tick", this.stage);
                if(this.animChanger) this.animChanger.paused = false;
            }
        },
        nextFrame : function() { // play the animation until the next frame. Must be paused beforehand.
            if(this.isPaused)
            {
                this.resume(); // resume animation
                setTimeout(this.nextFrame_wait, 1, this, this.animChanger.position); // each in 1ms if the  frame changed
            }
        },
        nextFrame_wait : function(me, pos) { // subroutine of nextFrame, called every millisecond
            if(pos != me.animChanger.position)
                me.pause();
            else
                setTimeout(me.nextFrame_wait, 1, me, me.animChanger.position);
        },
        download : function() { // update the animation and download the canvas content. Must be paused beforehand.
            if(this.isPaused)
            {
                let url = this.stage.toDataURL("image/png");
                if(url)
                {
                    let link = document.createElement('a');
                    link.href = url;
                    link.download = 'gbfap_' + Date.now() + '.png';
                    link.click();
                    pushPopup("Image saved as " + link.download);
                }
            }
        },
        record : function() { // record a webm of the current animation. Must be paused beforehand.
            if(this.isPaused)
            {
                try
                {
                    let mimetype = null;
                    // list of format/codecs we are trying. H264 has the priority.
                    for(let m of ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm;codecs=h264", "video/webm", "video/mp4"])
                    {
                        if(MediaRecorder.isTypeSupported(m))
                        {
                            mimetype = m;
                            break;
                        }
                    }
                    if(mimetype == null)
                    {
                        pushPopup("This feature isn't supported on your device/browser.");
                        return;
                    }
                    // restart current animation
                    this.reset(); 
                    // container
                    this.recording = {this: this, position: 0, frames: 0, canvas: null, ctx: null, stream: null, rec: null, chunks: [], mimetype: mimetype, extension: mimetype.split(';')[0].split('/')[1], error: false};
                    // create a canvas on which we'll draw
                    this.recording.canvas = document.createElement("canvas");
                    this.recording.canvas.width = WINDOWSIZE;
                    this.recording.canvas.height = WINDOWSIZE;
                    this.recording.ctx = this.recording.canvas.getContext("2d");
                    // set to 0 fps to disable automatic capture
                    this.recording.stream = this.recording.canvas.captureStream(0);
                    // create and set media recorder
                    this.recording.rec = new MediaRecorder(this.recording.stream, {mimeType: this.recording.mimetype, videoBitsPerSecond:50*1024*1024, videoKeyFrameIntervalDuration: 1}); // 50mbps
                    this.recording.rec.ondataavailable = e => this.recording.chunks.push(e.data);
                    const myself = this;
                    this.recording.rec.onstop = e => function() {
                        if(!myself.recording.error)
                        {
                            myself.download_video(new Blob(myself.recording.chunks, {type: myself.recording.mimetype}), myself.recording.extension);
                        }
                        myself.recording = null;
                    }();
                    // start (using 1s chunks)
                    this.recording.rec.start(1);
                    // note current position
                    this.recording.position = this.animChanger.position;
                    // send popup to user
                    pushPopup("Creating the video, be patient...");
                    // resume animation and wait next frame
                    this.resume();
                    setTimeout(this.record_next_frame, 1, this.recording);
                }
                catch(err) // error handling
                {
                    this.recording.error = true;
                    this.recording = null;
                    this.pause();
                    console.error("Exception thrown", err.stack);
                    pushPopup("An error occured. This feature might be unavailable on your device/browser.");
                }
            }
        },
        record_next_frame : function(recording) { // on next frame
            try
            {
                if(recording.position != recording.this.animChanger.position) // check if the frame changed
                {
                    recording.position = recording.this.animChanger.position; // update position
                    recording.this.pause(); // pause animation
                    recording.ctx.clearRect(0,0,WINDOWSIZE,WINDOWSIZE); // clear canvas
                    recording.ctx.drawImage(recording.this.stage.canvas,(CANVAS_SIZE-WINDOWSIZE)/2,(CANVAS_SIZE-WINDOWSIZE)/2,WINDOWSIZE,WINDOWSIZE,0,0,WINDOWSIZE,WINDOWSIZE); // crop stage canvas to our canvas 
                    recording.stream.getVideoTracks()[0].requestFrame(); // request frame
                    if(recording.this.motionListIndex == 0 && recording.this.animChanger.position == 0 && recording.frames > 0) // check if we did a whole loop
                    {
                        recording.frames++;
                        recording.rec.stop(); // and stop if so
                        return;
                    }
                    recording.frames++;
                    recording.this.resume(); // resume animation
                }
                setTimeout(recording.this.record_next_frame, 1, recording); // wait next frame
            }
            catch(err) // error handling
            {
                recording.error = true;
                recording.rec.stop();
                console.error("Exception thrown", err.stack);
                pushPopup("An error occured. This feature might be unavailable on your device/browser.");
            }
        },
        download_video : function(blob, extension) { // download video blob
            let url = URL.createObjectURL(blob);
            let link = document.createElement('a');
            link.href = url;
            link.download = 'gbfap_' + Date.now() + '.' + extension;
            link.click();
            pushPopup("Video saved as " + link.download);
            URL.revokeObjectURL(url);
        },
        reset : function() { // restart the current animation list
            // used as a workaround for a weird bug causing images to not display on the first animation played.
            this.motionListIndex = -1;
            this.npc.dispatchEvent(complete);
        }
    });
});
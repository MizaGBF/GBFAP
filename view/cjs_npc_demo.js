define(["view/cjs", "view/content", "lib/common"], function (cjsview, content) {
    let canvasSize = 2000;
    let realSize = 1400;
    let windowSize = 453;
    canvasSize /= 2;
    let posFix = canvasSize - canvasSize / realSize * windowSize;
    const npcOffset = {
        x: is_enemy ? (-180 + canvasSize) : (140 + canvasSize),
        y: is_enemy ? (310 + canvasSize) : (60 + canvasSize)
    };
    const enemyOffset = {
        x: is_enemy ? (180 + canvasSize) : (-140 + canvasSize),
        y: is_enemy ? (170 + canvasSize) : (95 + canvasSize)
    };
    const bgOffset = {
        x: 50 + posFix,
        y: 50 + posFix
    };
    const complete = "animationComplete";
    const atkIndex = 6;
    const atkOffset = 52;
    const ougiOffset = 138;
    const scaling = .86;
    const stageObject = {
        BG: 0,
        ENEMY: 1,
        CHARACTER: 2
    };
    const animations = {
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
        SUMMON_ATTACK: "summon_atk", // special for summon use
        SUMMON_DAMAGE: "summon_dmg", // special for summon use
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
        ENEMY_BREAK_STANDBY_A: "break_standby_A",
        ENEMY_BREAK_STANDBY_B: "break_standby_B",
        ENEMY_BREAK_STANDBY_C: "break_standby_C",
        ENEMY_DAMAGE_STANDBY_A: "damage_standby_A",
        ENEMY_DAMAGE_STANDBY_B: "damage_standby_B",
        ENEMY_DAMAGE_STANDBY_C: "damage_standby_C",
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
    const aniState = {
        WAIT: 10,
        STB_WAIT: 10,
        ABILITY: 30,
        COMBO_PROCESS: 10
    };
    const targets = {
        PLAYER: "player",
        ENEMY: "boss",
        THEM: "them"
    };
    return cjsview.extend({
        fps: 30,
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
        cjsEnemy: null,
        cjsEffect: null,
        cjsMortal: null,
        isPaused: false,
        motionList: null,
        motionListIndex: 0,
        mortalIndexList: [],
        mortalIndex: 0,
        isFullScreenMortal: false,
        isFixedPosOwnerBG: false,
        animChanger: null,
        damageTarget: null,
        initialize: function (a) {
            content.prototype._destroyStage(this.stage);
            this.stage = null;
            this.currentIndex = 0;
            this.cjsNpc = null;
            this.cjsEnemy = null;
            this.cjsEffect = null;
            this.cjsMortal = null;
            this.isPaused = false;
            this.motionListIndex = 0;
            this.mortalIndexList = [];
            this.mortalIndex = 0;
            this.isFullScreenMortal = false;
            this.isFixedPosOwnerBG = false;
            this.animChanger = null;
            a = a || {};
            this.cjsList = a.cjsList || [];
            this.cjsEffectList = a.cjsEffectList || [];
            this.cjsMortalList = a.cjsMortalList || [];
            this.cjsPosList = a.cjsPosList || [];
            this.cjsMortalPosList = a.cjsMortalPosList || [];
            action_list.motionList = a.motionList;
            this.canvasSelector = a.canvasSelector;
            this.canvasIndex = a.canvasIndex;
            this.fps = +a.fps || this.fps;
            for (var c = this.cjsMortalList.length, d = 0; c > d; d++)
            {
                var e = this.cjsMortalList[d]
                    , f = this.cjsMortalPosList[d];
                if (e.random) {
                    for (var g = _.clone(e.list), h = _.clone(f), i = [], j = g.length, k = 0; j > k; k++)
                        i[k] = k;
                    for (i = _.shuffle(i),
                        k = 0; j > k; k++)
                        e.list[k] = g[i[k]],
                            f[k] = h[i[k]]
                }
                this.mortalIndexList[d] = 0
            }
            this.canvas = document.querySelector(this.canvasSelector),
                this.updateCjsParams(this.currentIndex)
        },
        getLoadFiles: function () {
            var a = _.flatten([this.cjsList, this.cjsEffectList, AnimeEnemy]);
            return _.each(this.cjsMortalList, function (b) {
                _.each(b.list, function (b) {
                    a.push(b.cjs)
                })
            }),
            a;
        },
        cjsRender: function () {
            this.stage = new createjs.Stage(this.canvas);
            this.cjsEnemy = new lib[AnimeEnemy];
            this.cjsEnemy.name = AnimeEnemy;
            this.cjsEnemy.x = enemyOffset.x;
            this.cjsEnemy.y = enemyOffset.y;
            this.cjsEnemy.scaleX = scaling * (is_enemy ? -1 : 1);
            this.cjsEnemy.scaleY = scaling;
            this.cjsEnemy.getChildAt(0).gotoAndPlay("wait");
            this.stage.addChild(this.cjsEnemy);
            this.cjsNpc = this.generateCjsNpc(this.cjsNameNpc);
            this.cjsNpc.scaleX = scaling;
            this.cjsNpc.scaleY = scaling;
            this.stage.addChild(this.cjsNpc);
            this.startAnim(this.cjsNpc, action_list.motionList[this.motionListIndex]);
            this.stage.update();
            this.isPaused ? this.pause(true) : createjs.Ticker.addEventListener("tick", this.stage);
            createjs.Ticker.setFPS(this.fps);
        },
        getActionList: function() {
            if(mc_summon != null) return this.cjsMortalList.length == 2 ? ["summon", "summon_atk", "summon_dmg"] : ["summon", "summon_atk"]; // change list for summons
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
        translateAction: function(action) {
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
                case animations.SPECIAL_ATTACK: return "Attack B";
                case animations.ENEMY_ATTACK: return "Attack C";
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
                case animations.DAMAGE_2: return "Damaged B (Overdrive)";
                case animations.DAMAGE_3: return "Damaged C (Break)";
                case animations.DAMAGE_4: return "Damaged D";
                case animations.DAMAGE_5: return "Damaged E";
                case animations.WIN: return "Win";
                case 'win_1': return "Win Alt. 1";
                case 'win_2': return "Win Alt. 2";
                case 'win_3': return "Win Alt. 3";
                case animations.INVISIBLE: return "Invisible";
                case animations.HIDE: return "Hide";
                case animations.DOWN: return "Low HP";
                case animations.WAIT_SPECIAL: return "Idle (Special)";
                case animations.WAIT_SPECIAL_1: return "Idle (Special) A";
                case animations.WAIT_SPECIAL_2: return "Idle (Special) B";
                case animations.WAIT_SPECIAL_3: return "Idle (Special) C";
                case animations.WAIT_SPECIAL_4: return "Idle (Special) D";
                case animations.WAIT_SPECIAL_5: return "Idle (Special) E";
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
                case animations.ENEMY_PHASE_2: return "Phase 2 (Overdrive)";
                case animations.ENEMY_PHASE_3: return "Phase 3 (Break)";
                case animations.ENEMY_PHASE_4: return "Phase 4";
                case animations.ENEMY_PHASE_5: return "Phase 5";
                case animations.ENEMY_FORM_CHANGE: return "Form Change";
                case animations.ENEMY_STANDBY_A: return "Standby A";
                case animations.ENEMY_STANDBY_B: return "Standby B";
                case animations.ENEMY_STANDBY_C: return "Standby C";
                case animations.ENEMY_BREAK_STANDBY_A: return "Standby A (Break)";
                case animations.ENEMY_BREAK_STANDBY_B: return "Standby B (Break)";
                case animations.ENEMY_BREAK_STANDBY_C: return "Standby C (Break)";
                case animations.ENEMY_DAMAGE_STANDBY_A: return "Standby A (Damaged)";
                case animations.ENEMY_DAMAGE_STANDBY_B: return "Standby B (Damaged)";
                case animations.ENEMY_DAMAGE_STANDBY_C: return "Standby C (Damaged)";
                case animations.LINK_PHASE_1: return "Phase 1 (Entry)(Link)";
                case animations.LINK_PHASE_1_2: return "Phase 1 B (Entry)(Link)";
                case animations.LINK_PHASE_1_F2: return "Phase 1 C (Entry)(Link)";
                case animations.LINK_PHASE_1_F2_2: return "Phase 1 D (Entry)(Link)";
                case animations.LINK_PHASE_2: return "Phase 2 (OD.)(Link)";
                case animations.LINK_PHASE_2_2: return "Phase 2 B (OD.)(Link)";
                case animations.LINK_PHASE_2_F2: return "Phase 2 C (OD.)(Link)";
                case animations.LINK_PHASE_2_F2_2: return "Phase 2 D (OD.)(Link)";
                case animations.LINK_PHASE_3: return "Phase 3 (Break)(Link)";
                case animations.LINK_PHASE_3_2: return "Phase 3 B (Break)(Link)";
                case animations.LINK_PHASE_3_F2: return "Phase 3 C (Break)(Link)";
                case animations.LINK_PHASE_3_F2_2: return "Phase 3 D (Break)(Link)";
                case animations.LINK_PHASE_4: return "Phase 4 (Link)";
                case animations.LINK_PHASE_4_2: return "Phase 4 B (Link)";
                case animations.LINK_PHASE_4_F2: return "Phase 4 C (Link)";
                case animations.LINK_PHASE_4_F2_2: return "Phase 4 D (Link)";
                case animations.LINK_PHASE_5: return "Phase 5 (Link)";
                case animations.LINK_PHASE_5_2: return "Phase 5 B (Link)";
                case animations.LINK_PHASE_5_F2: return "Phase 5 C (Link)";
                case animations.LINK_PHASE_5_F2_2: return "Phase 5 D (Link)";
                case animations.LINK_DAMAGE: return "Damaged (Link)";
                case animations.LINK_DAMAGE_2: return "Damaged 2 (Link)";
                case animations.LINK_DEAD: return "Dead (Link)";
                case animations.LINK_DEAD_1: return "Dead 1 (Link)";
                case animations.LINK_DEAD_2: return "Dead 2 (Link)";
                case animations.LINK_DEAD_3: return "Dead 3 (Link)";
                case animations.LINK_DEAD_A: return "Dead 1B (Link)";
                case animations.LINK_DEAD_B: return "Dead 2B (Link)";
                case animations.LINK_DEAD_C: return "Dead 3B (Link)";
                case animations.LINK_MORTAL_A: return "Charge Atk. A (Link)";
                case animations.LINK_MORTAL_A_2: return "Charge Atk. A2 (Link)";
                case animations.LINK_MORTAL_A_F2: return "Charge Atk. A3 (Link)";
                case animations.LINK_MORTAL_A_F2_2: return "Charge Atk. A4 (Link)";
                case animations.LINK_MORTAL_B: return "Charge Atk. B (Link)";
                case animations.LINK_MORTAL_B_2: return "Charge Atk. B2 (Link)";
                case animations.LINK_MORTAL_B_F2: return "Charge Atk. B3 (Link)";
                case animations.LINK_MORTAL_B_F2_2: return "Charge Atk. B4 (Link)";
                case animations.LINK_MORTAL_C: return "Charge Atk. C (Link)";
                case animations.LINK_MORTAL_C_2: return "Charge Atk. C2 (Link)";
                case animations.LINK_MORTAL_C_F2: return "Charge Atk. C3 (Link)";
                case animations.LINK_MORTAL_C_F2_2: return "Charge Atk. C4 (Link)";
                case animations.LINK_MORTAL_D: return "Charge Atk. D (Link)";
                case animations.LINK_MORTAL_D_2: return "Charge Atk. D2 (Link)";
                case animations.LINK_MORTAL_D_F2: return "Charge Atk. D3 (Link)";
                case animations.LINK_MORTAL_D_F2_2: return "Charge Atk. D4 (Link)";
                case animations.LINK_MORTAL_E: return "Charge Atk. E (Link)";
                case animations.LINK_MORTAL_E_2: return "Charge Atk. E2 (Link)";
                case animations.LINK_MORTAL_E_F2: return "Charge Atk. E3 (Link)";
                case animations.LINK_MORTAL_E_F2_2: return "Charge Atk. E4 (Link)";
                case animations.LINK_MORTAL_F: return "Charge Atk. F (Link)";
                case animations.LINK_MORTAL_F_2: return "Charge Atk. F2 (Link)";
                case animations.LINK_MORTAL_F_F2: return "Charge Atk. F3 (Link)";
                case animations.LINK_MORTAL_F_F2_2: return "Charge Atk. F4 (Link)";
                case animations.LINK_MORTAL_G: return "Charge Atk. G (Link)";
                case animations.LINK_MORTAL_G_2: return "Charge Atk. G2 (Link)";
                case animations.LINK_MORTAL_G_F2: return "Charge Atk. G3 (Link)";
                case animations.LINK_MORTAL_G_F2_2: return "Charge Atk. G4 (Link)";
                case animations.LINK_MORTAL_H: return "Charge Atk. H (Link)";
                case animations.LINK_MORTAL_H_2: return "Charge Atk. H2 (Link)";
                case animations.LINK_MORTAL_H_F2: return "Charge Atk. H3 (Link)";
                case animations.LINK_MORTAL_H_F2_2: return "Charge Atk. H4 (Link)";
                case animations.LINK_MORTAL_I: return "Charge Atk. I (Link)";
                case animations.LINK_MORTAL_I_2: return "Charge Atk. I2 (Link)";
                case animations.LINK_MORTAL_I_F2: return "Charge Atk. I3 (Link)";
                case animations.LINK_MORTAL_I_F2_2: return "Charge Atk. I4 (Link)";
                case animations.LINK_MORTAL_J: return "Charge Atk. J (Link)";
                case animations.LINK_MORTAL_J_2: return "Charge Atk. J2 (Link)";
                case animations.LINK_MORTAL_J_F2: return "Charge Atk. J3 (Link)";
                case animations.LINK_MORTAL_J_F2_2: return "Charge Atk. J4 (Link)";
                case animations.LINK_MORTAL_K: return "Charge Atk. K (Link)";
                case animations.LINK_MORTAL_K_2: return "Charge Atk. K2 (Link)";
                case animations.LINK_MORTAL_K_F2: return "Charge Atk. K3 (Link)";
                case animations.LINK_MORTAL_K_F2_2: return "Charge Atk. K4 (Link)";
                case animations.LINK_ATTACK: return "Attack (Link)";
                case animations.LINK_ATTACK_2: return "Attack B (Link)";
                case animations.LINK_ATTACK_F2: return "Attack C (Link)";
                case animations.LINK_ATTACK_F2_2: return "Attack D (Link)";
                case animations.LINK_FORM_CHANGE: return "Form Change (Link)";
                case animations.LINK_FORM_CHANGE_2: return "Form Change 2 (Link)"
                default: return "??? (" + action + ")";
            };
        },
        generateCjsNpc: function(npc)
        {
            let elem = new lib[npc];
            return elem.name = npc,
            elem.x = npcOffset.x + this.cjsPos.x,
            elem.y = npcOffset.y + this.cjsPos.y,
            elem.scaleX *= scaling,
            elem.scaleY *= scaling,
            elem
        },
        updateCjsParams: function(index)
        {
            this.cjsNameNpc = this.cjsList[0];
            this.cjsNameEffect = this.cjsEffectList[0];
            this.cjsPos = this.cjsPosList[index] || {
                x: 0,
                y: 0
            };
            this.mortalIndex = this.mortalIndexList[index];
            if(this.cjsMortalList.length > 0)
            {
                this.cjsNameMortal = this.cjsMortalList[index].list[this.mortalIndex].cjs;
                this.isFullScreenMortal = !!this.cjsMortalList[index].list[this.mortalIndex].full_screen || false;
                this.isFixedPosOwnerBG = !!this.cjsMortalList[index].list[this.mortalIndex].fixed_pos_owner_bg || false;
                this.cjsMortalPos = this.cjsMortalPosList[0][this.mortalIndex] || {
                    x: 0,
                    y: 0
                };
            }
        },
        startAnim: function(elem, motion)
        {
            function addOugi(mortal)
            {
                me.cjsMortal = new lib[mortal];
                me.stage.addChild(me.cjsMortal);
                if(is_enemy)
                {
                    me.cjsMortal.x = me.cjsEnemy.x;
                    me.cjsMortal.y = me.cjsEnemy.y;
                    me.stage.setChildIndex(me.cjsMortal, stageObject.CHARACTER);
                }
                else
                {
                    if(me.isFullScreenMortal)
                    {
                        me.cjsMortal.x = bgOffset.x;
                        me.cjsMortal.y = bgOffset.y;
                    }
                    else
                    {
                        if(me.isFixedPosOwnerBG)
                        {
                            me.cjsMortal.x = bgOffset.x;
                            me.cjsMortal.y = bgOffset.y;
                            me.stage.setChildIndex(me.cjsMortal, stageObject.CHARACTER);
                        }
                        else
                        {
                            me.cjsMortal.x = me.cjsEnemy.x;
                            me.cjsMortal.y = me.cjsEnemy.y + ougiOffset;
                            me.stage.setChildIndex(me.cjsMortal, stageObject.CHARACTER);
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
            function addSummon(mortal)
            {
                me.cjsMortal = new lib[mortal];
                me.stage.addChild(me.cjsMortal);
                if(me.isFullScreenMortal)
                {
                    me.cjsMortal.x = bgOffset.x;
                    me.cjsMortal.y = bgOffset.y;
                }
                else
                {
                    if(me.isFixedPosOwnerBG)
                    {
                        me.cjsMortal.x = bgOffset.x;
                        me.cjsMortal.y = bgOffset.y;
                        me.stage.setChildIndex(me.cjsMortal, stageObject.CHARACTER);
                    }
                    else
                    {
                        me.cjsMortal.x = me.cjsEnemy.x;
                        me.cjsMortal.y = me.cjsEnemy.y + ougiOffset;
                        me.stage.setChildIndex(me.cjsMortal, stageObject.CHARACTER);
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
                //me.cjsMortal[mortal][mortal].gotoAndPlay(mortal.includes('attack') ? 'attack' : 'damage'); // not needed?
                return me.getAnimDuration(me.cjsMortal[mortal][mortal]);
            }
            function cycleMortalIndex() {
                me.mortalIndexList[me.currentIndex]++;
                if(me.mortalIndexList[me.currentIndex] >= me.cjsMortalList[me.currentIndex].list.length)
                    me.mortalIndexList[me.currentIndex] = 0;
            }
            function addAtkEffect(elem) {
                let atk = new lib[elem];
                atk.x = me.cjsEnemy.x,
                atk.y = me.cjsEnemy.y + atkOffset,
                atk.scaleX *= scaling,
                atk.scaleY *= scaling,
                me.stage.addChild(atk),
                me.stage.setChildIndex(atk, stageObject.CHARACTER),
                atk[elem].gotoAndPlay(atkIndex);
                let duration = me.getAnimDuration(atk[elem][elem + "_effect"]);
                createjs.Tween.get(atk, {
                    useTicks: true
                }).wait(duration).call(function () {
                    me.stage.removeChild(atk)
                })
            }
            function addEnemyDamage() {
                let elem = me.cjsEnemy[AnimeEnemy];
                let duration = elem[AnimeEnemy + "_damage"].timeline.duration;
                elem.gotoAndPlay("damage");
                createjs.Tween.get(me.cjsEnemy, {
                    useTicks: true
                }).wait(duration).call(function () {
                    elem.gotoAndPlay("wait")
                });
            }
            function toggleForm() {
                me.currentIndex++;
                if(me.currentIndex >= me.cjsList.length)
                    me.currentIndex = 0;
                me.stage.removeChild(me.cjsNpc);
                me.cjsMortal = null;
                me.updateCjsParams(me.currentIndex);
                me.cjsNpc = me.generateCjsNpc(me.cjsNameNpc);
                me.stage.addChild(me.cjsNpc);
            }
            function nextMotion() {
                let a = me.motionListIndex + 1;
                if(a >= action_list.motionList.length)
                    a = 0;
                return action_list.motionList[a]
            }
            function ougiCompleted(a) {
                a.target.removeEventListener(complete, ougiCompleted);
                removeOugi();
            }
            function removeOugi() {
                if(me.stage && me.cjsMortal)
                {
                    me.stage.removeChild(me.cjsMortal);
                    me.cjsMortal = null;
                }
                me.motionListIndex++;
                if(me.motionListIndex >= action_list.motionList.length)
                    me.motionListIndex = 0;
                me.startAnim(elem, action_list.motionList[me.motionListIndex]);
            }
            // start
            if (!elem instanceof createjs.MovieClip)
                return null;
            let npc = elem[this.cjsNameNpc];
            let animDuration = 0;
            let me = this;
            switch(motion)
            {
                default:
                {
                    animDuration = this.getAnimDuration(npc[this.cjsNameNpc + "_" + motion]);
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
                {
                    if(this.cjsMortalList.length == 0) // no ougi file
                    {
                        animDuration = this.getAnimDuration(npc[this.cjsNameNpc + "_" + motion]);
                        break;
                    }
                    this.currentIndex = motion[motion.length-1].charCodeAt()-65;
                    if(this.currentIndex >= this.cjsMortalList.length){
                        this.currentIndex=0
                    }
                    this.damageTarget = this.cjsMortalList[this.currentIndex].list[this.mortalIndex].target === targets.THEM ? targets.ENEMY : targets.PLAYER;
                    this.updateCjsParams(this.currentIndex);
                    addOugi(this.cjsNameMortal);
                    animDuration = this.getAnimDuration(npc[this.cjsNameNpc + "_" + motion]) + ((is_mc && mc_wpn) ? this.getAnimDuration(this.cjsMortal[this.cjsNameMortal][this.cjsNameMortal+"_special"]) : 0);
                    /*if(!is_enemy && !is_mc && !mc_wpn)*/ cycleMortalIndex();
                    break;
                }
                case animations.SUMMON_ATTACK: // summon hack
                case animations.SUMMON_DAMAGE: // summon hack
                {
                    this.currentIndex = 0 ;
                    this.damageTarget = this.cjsMortalList[this.currentIndex].list[this.mortalIndex].target === targets.THEM ? targets.ENEMY : targets.PLAYER;
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
                {
                    this.damageTarget = targets.ENEMY;
                    addAtkEffect(this.cjsNameEffect);
                    createjs.Tween.get(this.cjsEnemy, {
                        useTicks: true
                    }).wait(i).call(function () {
                        addEnemyDamage()
                    });
                    let nmotion = nextMotion();
                    animDuration = _.contains([animations.ATTACK_DOUBLE, animations.ATTACK_TRIPLE, animations.ATTACK_QUADRUPLE], nmotion) ? aniState.COMBO_PROCESS : this.getAnimDuration(npc[this.cjsNameNpc + "_" + motion]);
                    break;
                }
                case animations.CHANGE:
                case animations.CHANGE_FROM:
                case animations.CHANGE_FROM_2:
                {
                    toggleForm();
                    elem = this.cjsNpc;
                    npc = elem[this.cjsNameNpc];
                    animDuration = this.getAnimDuration(npc[this.cjsNameNpc + "_" + motion]);
                }
            }
            if (document.getElementById("act-name").innerHTML != this.translateAction(motion)) {
                document.getElementById("act-name").innerHTML = this.translateAction(motion);
            };
            let newDuration=(animDuration / 30).toFixed(2) + 's'; // duration in second
            if (document.getElementById("act-duration").innerHTML != newDuration) // update if needed
                document.getElementById("act-duration").innerHTML = newDuration;
            npc.addEventListener(complete, ougiCompleted);
            if(motion != animations.SUMMON_ATTACK && motion != animations.SUMMON_DAMAGE) // hack to avoid MC moving during summoning
                npc.gotoAndPlay(motion);
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
            this.animChanger = createjs.Tween.get(this.stage, {
                useTicks: true,
                override: true
            }).wait(animDuration).call(function (index) {
                if (dispatchStack[index] == _.max(dispatchStack)) {
                    dispatchStack[index] = 0;
                    npc.dispatchEvent(complete)
                } else {
                    dispatchStack[index] = 0;
                }
            },[i])
        },
        getAnimDuration: function(elem) {
            return !elem instanceof createjs.MovieClip ? null : (elem.timeline.duration ? +elem.timeline.duration : +elem.timeline.Id);
        },
        pause: function (a) { // pause
            (a || !this.isPaused) &&
            (this.isPaused = true, this.stage && createjs.Ticker.removeEventListener("tick", this.stage), this.animChanger && this.animChanger.setPaused(this.isPaused));
        },
        resume: function () { // resume
            this.isPaused &&
            (this.isPaused = false, this.stage && this.stage.canvas &&
                (this.stage.update(), this.animChanger &&
                    this.animChanger.setPaused(this.isPaused), createjs.Ticker.addEventListener("tick", this.stage)
                )
            );
        }
    });
});
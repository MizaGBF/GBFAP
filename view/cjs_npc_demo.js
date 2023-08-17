define(["view/cjs", "view/content", "lib/common"], function (a, b) {
    var c = function(){
        let arr = ["enemy_9100211", "enemy_9100221", "enemy_6204152"];
        return arr[Math.floor(Math.random() * arr.length)];
    }();
    var canvasSize = 2000;
    var realSize = 1400;
    var windowSize = 453;
    canvasSize /= 2;
    var posFix = canvasSize - canvasSize / realSize * windowSize
        , d = {     //offset 1
            x: 140 + canvasSize,
            y: 60 + canvasSize
        }
        , e = {     //offset 2
            x: -140 + canvasSize,
            y: 95 + canvasSize
        }
        , f = {     //bg offset
            x: 50 + posFix,
            y: 50 + posFix
        }
        , g = "animationComplete"
        , h = 6
        , i = 2
        , j = 52
        , k = 138
        , l = {
            width: 640,
            height: 0
        }
        , m = {
            width: 276,
            height: 0
        }
        , n = .86 // scaling
        , o = {
            BG: 0,
            ENEMY: 1,
            CHARACTER: 2
        }
        , p = {
            STANDARD: 0,
            BETA: 1
        }
        , q = {
            WAIT: "wait",
            TO_STB_WAIT: "setup",
            STB_WAIT: "stbwait",
            CHARA_SELECT: "chara_select",
            CHARA_IN: "chara_in",
            CHARA_OUT: "chara_out",
            ABILITY: "ability",
            ABILITY_WAIT: "ability_wait",
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
            CHANGE: "change",
            CHANGE_TO: "change_1",
            CHANGE_FROM: "change_2",
            CHANGE_TO_2: "change_1_2",
            CHANGE_FROM_2: "change_2_2",
            DEAD: "dead",
            DAMAGE: "damage",
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
            ABILITY_MOTION_4: "ab_motion_4"
        }
        , r = {
            WAIT: 10,
            STB_WAIT: 10,
            ABILITY: 30,
            COMBO_PROCESS: 10
        }
        , s = {
            PLAYER: "player",
            ENEMY: "boss",
            THEM: "them"
        }
        , t = a.extend({
            fps: 30,
            bgImg: null,
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
            isPaused: !1,
            motionList: null,
            motionListIndex: 0,
            mortalIndexList: [],
            mortalIndex: 0,
            isFullScreenMortal: !1,
            isFixedPosOwnerBG: !1,
            animChanger: null,
            damageTarget: null,
            initialize: function (a) {
                b.prototype._destroyStage(this.stage),
                    +Game.setting.cjs_mode === p.STANDARD && (createjs.Ticker._inited = !1,
                        createjs.Tween._inited = !1,
                        createjs.Ticker.init()),
                    this.stage = null,
                    this.currentIndex = 0,
                    this.cjsNpc = null,
                    this.cjsEnemy = null,
                    this.cjsEffect = null,
                    this.cjsMortal = null,
                    this.isPaused = !1,
                    this.motionListIndex = 0,
                    this.mortalIndexList = [],
                    this.mortalIndex = 0,
                    this.isFullScreenMortal = !1,
                    this.isFixedPosOwnerBG = !1,
                    this.animChanger = null,
                    a = a || {},
                    this.bgImg = a.bgImg || null,
                    this.cjsList = a.cjsList || [],
                    this.cjsEffectList = a.cjsEffectList || [],
                    this.cjsMortalList = a.cjsMortalList || [],
                    this.cjsPosList = a.cjsPosList || [],
                    this.cjsMortalPosList = a.cjsMortalPosList || [],
                    action_list.motionList = a.motionList,
                    this.canvasSelector = a.canvasSelector,
                    this.canvasIndex = a.canvasIndex,
                    this.fps = +a.fps || this.fps;
                for (var c = this.cjsMortalList.length, d = 0; c > d; d++) {
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
                var a = _.flatten([this.cjsList, this.cjsEffectList, c]);
                return _.each(this.cjsMortalList, function (b) {
                    _.each(b.list, function (b) {
                        a.push(b.cjs)
                    })
                }),
                    a
            },
            cjsRender: function () {
                this.stage = new createjs.Stage(this.canvas);
                var a = new createjs.Bitmap(this.bgImg)
                    , b = m.height - l.height >> 1;
                a.width = l.width,
                    a.height = l.height,
                    a.scaleX = n,
                    a.scaleY = n,
                    a.y = b * n,
                    this.stage.addChild(a),
                    this.cjsEnemy = new lib[c],
                    this.cjsEnemy.name = c,
                    this.cjsEnemy.x = e.x,
                    this.cjsEnemy.y = e.y,
                    this.cjsEnemy.scaleX = n,
                    this.cjsEnemy.scaleY = n,
                    this.cjsEnemy.getChildAt(0).gotoAndPlay("wait"),
                    this.stage.addChild(this.cjsEnemy),
                    this.cjsNpc = this.generateCjsNpc(this.cjsNameNpc),
                    this.cjsNpc.scaleX = n,
                    this.cjsNpc.scaleY = n,
                    this.stage.addChild(this.cjsNpc),
                    this.startAnim(this.cjsNpc, action_list.motionList[this.motionListIndex]),
                    this.stage.update(),
                    this.isPaused ? this.pause(!0) : createjs.Ticker.addEventListener("tick", this.stage),
                    createjs.Ticker.setFPS(this.fps)
            },
            getActionList: function() {
                var newList=[]
                var newSet=new Set()
                var i = 0
                var len=this.cjsNpc['name'].length
                for (action in this.cjsNpc['children'][0]){
                    actionStr=action.toString()
                    if(is_mc && actionStr.includes("mortal") && ((mc_wpn == null && !actionStr.endsWith('_mortal_B')) || (mc_wpn != null && ["_1", "_2"].includes(actionStr.slice(-2))))) continue; // hack to disable some ougi options on mc
                    if (actionStr.substring(0,len)==this.cjsNpc['name']){
                        newSet.add(actionStr.substring(len+1))
                        i++
                    }
                }
                i = 0
                for (let j in action_index[this.canvasIndex]['action_label_list']){
                    action=action_index[this.canvasIndex]['action_label_list'][j]
                    if (newSet.has(action)){
                        newList[i]=action
                        newSet.delete(action)
                        i++
                    }
                }
                this.motionList=newList.concat(Array.from(newSet))
                return this.motionList
            },
            translateAction: function(a) {
                switch(a)
                {
                    case 'ab_motion': return "Skill 1";
                    case 'ab_motion_2': return "Skill 2";
                    case 'ab_motion_3': return "Skill 3";
                    case 'ab_motion_4': return "Skill 4";
                    case 'down': return "Low HP";
                    case 'short_attack': return "Attack 1";
                    case 'double': return "Attack 2";
                    case 'triple': return "Attack 3";
                    case 'quadruple': return "Attack 4";
                    case 'charge': return "Charged";
                    case 'mortal_A': return "Charge Attack";
                    case 'mortal_A_1': return "Charge Attack A";
                    case 'mortal_A_2': return "Charge Attack B";
                    case 'mortal_B': return "Charge Attack 2";
                    case 'mortal_B_1': return "Charge Attack 2 A";
                    case 'mortal_B_2': return "Charge Attack 2 B";
                    case 'mortal_C': return "Charge Attack 3";
                    case 'mortal_C_1': return "Charge Attack 3 A";
                    case 'mortal_C_2': return "Charge Attack 3 B";
                    case 'mortal_D': return "Charge Attack 4";
                    case 'mortal_D_1': return "Charge Attack 4 A";
                    case 'mortal_D_2': return "Charge Attack 4 B";
                    case 'mortal_E': return "Charge Attack 5";
                    case 'mortal_E_1': return "Charge Attack 5 A";
                    case 'mortal_E_2': return "Charge Attack 5 B";
                    case 'mortal_F': return "Charge Attack 6";
                    case 'mortal_F_1': return "Charge Attack 6 A";
                    case 'mortal_F_2': return "Charge Attack 6 B";
                    case 'mortal_G': return "Charge Attack 7";
                    case 'mortal_G_1': return "Charge Attack 7 A";
                    case 'mortal_G_2': return "Charge Attack 7 B";
                    case 'mortal_H': return "Charge Attack 8";
                    case 'mortal_H_1': return "Charge Attack 8 A";
                    case 'mortal_H_2': return "Charge Attack 8 B";
                    case 'mortal_I': return "Charge Attack 9";
                    case 'mortal_I_1': return "Charge Attack 9 A";
                    case 'mortal_I_2': return "Charge Attack 9 B";
                    case 'mortal_J': return "Charge Attack 10";
                    case 'mortal_J_1': return "Charge Attack 10 A";
                    case 'mortal_J_2': return "Charge Attack 10 B";
                    case 'mortal_K': return "Charge Attack 11";
                    case 'mortal_K_1': return "Charge Attack 11 A";
                    case 'mortal_K_2': return "Charge Attack 11 B";
                    case 'chara_in': return "Fade in";
                    case 'chara_out': return "Fade out";
                    case 'dead': return "Dead";
                    case 'damage': return "Damaged";
                    case 'win': return "Win";
                    case 'win_1': return "Win Alt. 1";
                    case 'win_2': return "Win Alt. 2";
                    case 'win_3': return "Win Alt. 3";
                    case 'ability': return "C.A. Charged";
                    case 'attack': return "Action 1";
                    case 'attack_2': return "Action 2";
                    case 'hide': return "Hide";
                    case 'invisible': return "Invisible";
                    case 'stbwait': return "Weapon Drew (Wait)";
                    case 'ability_wait': return "Skill (Wait)";
                    case 'setup': return "Weapon Drew";
                    case 'wait': return "Idle";
                    case 'change_1': return "Change Form 1";
                    case 'change_2': return "Change Form 2";
                    case 'summon': return "Summoning";
                    default: return a;
                };
            },
            generateCjsNpc: function (a) {
                var b = new lib[a];
                return b.name = a,
                    b.x = d.x + this.cjsPos.x,
                    b.y = d.y + this.cjsPos.y,
                    b.scaleX *= n,
                    b.scaleY *= n,
                    b
            },
            updateCjsParams: function (a) {
                this.cjsNameNpc = this.cjsList[0],
                    this.cjsNameEffect = this.cjsEffectList[0],
                    this.cjsPos = this.cjsPosList[a] || {
                        x: 0,
                        y: 0
                    },
                    this.mortalIndex = this.mortalIndexList[a],
                    this.cjsNameMortal = this.cjsMortalList[a].list[this.mortalIndex].cjs,
                    this.isFullScreenMortal = !!this.cjsMortalList[a].list[this.mortalIndex].full_screen || !1,
                    this.isFixedPosOwnerBG = !!this.cjsMortalList[a].list[this.mortalIndex].fixed_pos_owner_bg || !1,
                    this.cjsMortalPos = this.cjsMortalPosList[0][this.mortalIndex] || {
                        x: 0,
                        y: 0
                    }
            },
            startAnim: function (a, b) {
                function d(a) {
                    B.cjsMortal = new lib[a],
                        B.stage.addChild(B.cjsMortal),
                        B.isFullScreenMortal ? (B.cjsMortal.x = f.x,
                            B.cjsMortal.y = f.y) : B.isFixedPosOwnerBG ? (B.cjsMortal.x = f.x,
                                B.cjsMortal.y = f.y,
                                B.stage.setChildIndex(B.cjsMortal, o.CHARACTER)) : (B.cjsMortal.x = B.cjsEnemy.x,
                                    B.cjsMortal.y = B.cjsEnemy.y + k,
                                    B.stage.setChildIndex(B.cjsMortal, o.CHARACTER)),
                        B.cjsMortal.x += B.cjsMortalPos.x,
                        B.cjsMortal.y += B.cjsMortalPos.y,
                        B.cjsMortal.scaleX *= n,
                        B.cjsMortal.scaleY *= n,
                        B.cjsMortal[a].gotoAndPlay("special")
                }
                function d_sp(a) { // custom version of d() above, for weapons
                    B.cjsMortal = new lib[a],
                        B.stage.addChild(B.cjsMortal),
                        B.isFullScreenMortal ? (B.cjsMortal.x = f.x,
                            B.cjsMortal.y = f.y) : B.isFixedPosOwnerBG ? (B.cjsMortal.x = f.x,
                                B.cjsMortal.y = f.y,
                                B.stage.setChildIndex(B.cjsMortal, o.CHARACTER)) : (B.cjsMortal.x = B.cjsEnemy.x,
                                    B.cjsMortal.y = B.cjsEnemy.y + k,
                                    B.stage.setChildIndex(B.cjsMortal, o.CHARACTER)),
                        B.cjsMortal.x += B.cjsMortalPos.x,
                        B.cjsMortal.y += B.cjsMortalPos.y,
                        B.cjsMortal.scaleX *= n,
                        B.cjsMortal.scaleY *= n,
                        B.cjsMortal[a][a+"_special"].gotoAndPlay("special")
                        return B.getAnimDuration(B.cjsMortal[a][a+"_special"])
                }
                function e(a) {
                    var b = a.replace(/_[a-z][0-9]/g, "").replace(/.*_([a-z])?.*/, "$1");
                    return b.toUpperCase()
                }
                function l() {
                    var a = B.cjsMortalList[B.currentIndex]
                        , b = a.list.length;
                    B.mortalIndexList[B.currentIndex]++,
                        B.mortalIndexList[B.currentIndex] >= b && (B.mortalIndexList[B.currentIndex] = 0)
                }
                function m(a) {
                    var b = new lib[a];
                    b.x = B.cjsEnemy.x,
                        b.y = B.cjsEnemy.y + j,
                        b.scaleX *= n,
                        b.scaleY *= n,
                        B.stage.addChild(b),
                        B.stage.setChildIndex(b, o.CHARACTER),
                        b[a].gotoAndPlay(h);
                    var c = B.getAnimDuration(b[a][a + "_effect"]);
                    createjs.Tween.get(b, {
                        useTicks: !0
                    }).wait(c).call(function () {
                        B.stage.removeChild(b)
                    })
                }
                function p() {
                    var a = B.cjsEnemy[c]
                        , b = a[c + "_damage"].timeline.duration;
                    a.gotoAndPlay("damage"),
                        createjs.Tween.get(B.cjsEnemy, {
                            useTicks: !0
                        }).wait(b).call(function () {
                            a.gotoAndPlay("wait")
                        })
                }
                function t() {
                    B.currentIndex++,
                        B.currentIndex >= B.cjsList.length && (B.currentIndex = 0),
                        B.stage.removeChild(B.cjsNpc),
                        B.cjsMortal = null,
                        B.updateCjsParams(B.currentIndex),
                        B.cjsNpc = B.generateCjsNpc(B.cjsNameNpc),
                        B.stage.addChild(B.cjsNpc)
                }
                function u() {
                    var a = B.motionListIndex + 1;
                    return a >= action_list.motionList.length && (a = 0),
                        action_list.motionList[a]
                }
                function v(a) {
                    a.target.removeEventListener(g, v),
                        w()
                }
                function w() {
                    B.stage && B.cjsMortal && (B.stage.removeChild(B.cjsMortal),
                        B.cjsMortal = null),
                        B.motionListIndex++,
                        B.motionListIndex >= action_list.motionList.length && (B.motionListIndex = 0),
                        B.startAnim(a, action_list.motionList[B.motionListIndex])
                }
                if (!a instanceof createjs.MovieClip)
                    return null;
                var x = a[this.cjsNameNpc]
                    , y = 0
                    , z = !1
                    , A = !1
                    , B = this;
                switch (b) {
                    default:
                        y = this.getAnimDuration(x[this.cjsNameNpc + "_" + b]);
                        break;
                    case q.MORTAL:
                    case q.MORTAL_A:
                    case q.MORTAL_A_1:
                    case q.MORTAL_A_2:
                    case q.MORTAL_B:
                    case q.MORTAL_B_1:
                    case q.MORTAL_B_2:
                    case q.MORTAL_C:
                    case q.MORTAL_C_1:
                    case q.MORTAL_C_2:
                    case q.MORTAL_D:
                    case q.MORTAL_D_1:
                    case q.MORTAL_D_2:
                    case q.MORTAL_E:
                    case q.MORTAL_E_1:
                    case q.MORTAL_E_2:
                    case q.MORTAL_F:
                    case q.MORTAL_F_1:
                    case q.MORTAL_F_2:
                    case q.MORTAL_G:
                    case q.MORTAL_G_1:
                    case q.MORTAL_G_2:
                    case q.MORTAL_H:
                    case q.MORTAL_H_1:
                    case q.MORTAL_H_2:
                    case q.MORTAL_I:
                    case q.MORTAL_I_1:
                    case q.MORTAL_I_2:
                    case q.MORTAL_J:
                    case q.MORTAL_J_1:
                    case q.MORTAL_J_2:
                    case q.MORTAL_K:
                    case q.MORTAL_K_1:
                    case q.MORTAL_K_2:
                        z = !0;
                        var E = b;
                        this.currentIndex = E[E.length-1].charCodeAt()-65
                        if (this.currentIndex >= this.cjsMortalList.length){
                            this.currentIndex=0
                        }
                        var C = this.cjsMortalList[this.currentIndex].list;
                        this.damageTarget = C[this.mortalIndex].target === s.THEM ? s.ENEMY : s.PLAYER;
                        this.updateCjsParams(this.currentIndex);
                        if(is_mc && mc_wpn)
                        { // weapon duration hack
                            y = d_sp(this.cjsNameMortal) + this.getAnimDuration(x[this.cjsNameNpc + "_" + E]);
                        }
                        else
                        {
                            d(this.cjsNameMortal)
                            y = this.getAnimDuration(x[this.cjsNameNpc + "_" + E]);
                        }
                        l();
                        break;
                    case q.ATTACK:
                    case q.ATTACK_SHORT:
                    case q.ATTACK_DOUBLE:
                    case q.ATTACK_TRIPLE:
                    case q.ATTACK_QUADRUPLE:
                        this.damageTarget = s.ENEMY,
                            m(this.cjsNameEffect),
                            createjs.Tween.get(this.cjsEnemy, {
                                useTicks: !0
                            }).wait(i).call(function () {
                                p()
                            });
                        var F = u()
                            , G = _.contains([q.ATTACK_DOUBLE, q.ATTACK_TRIPLE, q.ATTACK_QUADRUPLE], F);
                        y = G ? r.COMBO_PROCESS : this.getAnimDuration(x[this.cjsNameNpc + "_" + b]);
                        break;
                    case q.CHANGE:
                    case q.CHANGE_FROM:
                    case q.CHANGE_FROM_2:
                        A = !0,
                            t(),
                            a = this.cjsNpc,
                            x = a[this.cjsNameNpc],
                            y = this.getAnimDuration(x[this.cjsNameNpc + "_" + b])
                }
                if (document.getElementById("act-name").innerHTML != this.translateAction(b)) {
                    document.getElementById("act-name").innerHTML = this.translateAction(b);
                };
                var newDuration=(y / 30).toFixed(2) + 's'
                if (document.getElementById("act-duration").innerHTML != newDuration) {
                    document.getElementById("act-duration").innerHTML = newDuration;
                };
                x.addEventListener(g, v);
                x.gotoAndPlay(b);
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
                    useTicks: !0,
                    override: !0
                }).wait(y).call(function (index) {
                    if (dispatchStack[index] == _.max(dispatchStack)) {
                        dispatchStack[index] = 0;
                        x.dispatchEvent(g)
                    } else {
                        dispatchStack[index] = 0;
                    }
                },[i])
            },
            getAnimDuration: function (a) {
                return !a instanceof createjs.MovieClip ? null : +a.timeline.duration
            },
            pause: function (a) {
                (a || !this.isPaused) && (this.isPaused = !0,
                    this.stage && createjs.Ticker.removeEventListener("tick", this.stage),
                    this.animChanger && this.animChanger.setPaused(this.isPaused))
            },
            resume: function () {
                this.isPaused && (this.isPaused = !1,
                    this.stage && this.stage.canvas && (this.stage.update(),
                        this.animChanger && this.animChanger.setPaused(this.isPaused),
                        createjs.Ticker.addEventListener("tick", this.stage)))
            },
            getDamageTarget: function () {
                return this.damageTarget
            }
        });
    return t
});
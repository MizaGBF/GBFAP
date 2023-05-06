define(["model/cjs-loader", "model/manifest-loader", "view/cjs_npc_demo"], function (cjsloader, manifestloader, cjs_npc_demo) {
    
    loadCJS = function (a) {
        var b = $.Deferred();
        return cjsloader.once("complete", function () {
            b.resolve()
        }),
            cjsloader.loadFiles(a),
            b
    };
    loadManifest = function (a) {
        var b = $.Deferred()
            , c = _.flatten(_.map(a, function (a) {
                return cjsloader.manifest(a)
            }))
        // mc only fix
        let melee = AnimeData[1][0]["cjs"][0].includes("_me_");
        if(is_mc && mc_wpn) // set wpn
        {
            for(let e of c)
            {
                if(melee)
                {
                    if(e.id == "weapon_l") e.src = Game.imgUri + "/sp/cjs/" + mc_wpn + "_1.png"
                    else if(e.id == "weapon_r") e.src = Game.imgUri + "/sp/cjs/" + mc_wpn + "_2.png"
                }
                else
                {
                    if(e.id == "weapon") e.src = Game.imgUri + "/sp/cjs/" + mc_wpn + ".png"
                }
            }
        }
        // end
        return (function () {}),
            manifestloader.once("complete", function () {
                b.resolve()
            }),
            manifestloader.loadManifest(c, !0),
            b
    };
    cjsRender = function (a) {
        a.cjsRender()
    };

    prepareCjs = function () {
        var a = this
        a.cjsViewList = new Array();
        var c = []
        _.each(action_index, function (b, e) {
            b.special=Array.from(b.special);
            var f = new cjs_npc_demo({
                fps: 30,
                cjsList: b.cjs,
                cjsEffectList: b.effect,
                cjsMortalList: b.special,
                cjsPosList: b.cjs_pos,
                cjsMortalPosList: b.special_pos,
                motionList: b.action_label_list,
                canvasSelector: ".cjs-npc-demo-" + e,
                canvasIndex: e,
            });
            a.cjsViewList[e] = f,
                c = c.concat(f.getLoadFiles())
        }),
            c = _.uniq(c),
            this.loadCJS(c).then(function () {
                return a.loadManifest(c)
            }).done(function () {
                _.each(a.cjsViewList, function (b, e) {
                    a.cjsRender(b)
                    if (e > 0) {
                        b.pause()
                    }
                    else{
                        l = b.getActionList();
                        var actionlist = '<option value="default">Demo</option>'
                        for (action in l) {
                            actionlist = actionlist.concat('<option value=' + l[action] + '>' + b.translateAction(l[action]) + '</option>');
                        }
                        document.getElementById("act-selection").innerHTML = actionlist
                    }
                })
            })
    }
    prepareCjs()
})
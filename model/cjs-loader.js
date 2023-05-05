define(["jquery", "underscore", "backbone", "model/manifest-loader", "util/backbone-singleton"], (function(e, n, t, i) {
    var r = window.lib = window.lib || {},
        o = {},
        a = {},
        c = {},
        u = {},
        f = "cjs/",
        s = Game.xjsUri + "/" + "model/manifest/",
        l = t.Model.extend({
            loadFiles: function(t, l) {
                var d = this,
                    m = new e.Deferred,
                    v = n.reject(t, (function(e) {
                        return n.has(o, e) || n.has(a, e)
                    }));
                n.each(v, (function(e) {
                    a[e] = 1
                })), v = n.unique(n.sortBy(v));
                var h = function() {
                    m.resolve();
                    var e = n.difference(n.union(t, n.keys(a)), n.keys(o));
                    n.isEmpty(e) ? d.trigger("complete") : 1 === Game.isSandbox && d.trigger("failed", e)
                };
                if (n.isEmpty(v)) h();
                else {
                    var p = new e.Deferred,
                        j = new createjs.LoadQueue(!1, Game.jsUri + "/", !0);
                    j.setMaxConnections(5), j.on("complete", (function() {
                        p.resolve()
                    })), j.on("fileload", (function(e) {
                        if (e.item) {
                            var t = e.item.id;
                            if (t) {
                                var i = n.last(t.split("/"));
                                r[i].prototype.playFunc = function(e) {
                                    createjs.Tween.get().wait(1).call(e)
                                }, o[i] = i, c[t] = r[i]
                            }
                        }
                    })), j.on("error", (function(e) {
                        p.reject()
                    }));
                    var w = n.map(v, (function(e) {
                        var n = f + e;
                        return {
                            id: n,
                            src: n + ".js",
                            type: createjs.LoadQueue.JAVASCRIPT,
                            cache: !0
                        }
                    }));
                    j.loadManifest(w);
                    var y = new e.Deferred,
                        g = [],
                        b = v.length || n.size(v),
                        q = 0;
                    n.each(v, (function(e) {
                        var n = s + e;
                        require([n], (function(e) {
                            u[n] = e.prototype.defaults.manifest, l && u[n].length > 0 && (g = g.concat(u[n])), q++, b === q && (g.length > 0 ? (i.once("complete", (function() {
                                y.resolve()
                            })), i.loadManifest(g, !0)) : y.resolve())
                        }), (function(e) {}))
                    })), e.when(p, y).always((function() {
                        h()
                    }))
                }
                return m
            },
            cjs: function(e) {
                return e ? c[f + e] : n.values(c)
            },
            manifest: function(e) {
                return e ? u[s + e] : n.values(u)
            },
            clear: function() {
                n.each(n.keys(requirejs.s.contexts._.defined), (function(e) {
                    0 == e.indexOf("") && (require.undef(e), delete r[e])
                })), n.each(c, (function(e, n) {
                    require.undef(n), delete r[n]
                })), n.each(u, (function(e, n) {
                    require.undef(n), delete r[n]
                })), o = {}, a = {}, c = {}, u = {}, i.clear()
            }
        });
    return l.makeSingleton(["loadFiles", "cjs", "manifest", "clear", "on", "off", "once"]), l
}));
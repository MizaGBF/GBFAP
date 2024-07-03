define(["underscore", "backbone", "util/backbone-singleton", "model/manifest-loader", "lib/common"], (function(e, t) {
    var i = window.images = window.images || {},
        n = {},
        a = t.Model.extend({
            initialize: function() {
                this.loadQueue = new createjs.LoadQueue(!1), this.loadQueue.setMaxConnections(5), this.loadQueue.addEventListener("error", e.bind(this.handleError, this)), this.loadQueue.addEventListener("fileload", e.bind(this.handleFileLoad, this)), this.loadQueue.addEventListener("complete", e.bind(this.handleComplete, this)), window.CreateJsShell && 1 == Game.setting.cjs_mode && (this.loadQueue._progress = 1)
            },
            setImageAlias: function(e, t) {
                i[t] = i[e], n[t] = n[e]
            },
            handleFileLoad: function(e) {
                var t, n = e.item.id;
                if (e.item.type === createjs.LoadQueue.IMAGE) t = e.result, i[n] = t;
                this.trigger("fileload", e);
                loadNow++; // increase loaded file count
                document.getElementById('act-duration').innerHTML = "" + loadNow + " / " + loadTotal + " (" + Math.floor(100*loadNow/loadTotal) + "%)"; // update indicator
            },
            handleComplete: function(e) {
                window.CreateJsShell && 1 == Game.setting.cjs_mode && (this.loadQueue._progress = 0), this.trigger("complete", e)
            },
            handleError: function(e) {
                this.trigger("error", e)
            },
            getLoadingTarget: function(t) {
                if (!t) return null;
                e.isObject(t) || (t = {
                    id: t,
                    src: t
                });
                var a = t.id;
                return e.has(i, a) && n[a] == t.src ? null : (n[a] = t.src, e.defaults({
                    type: createjs.LoadQueue.IMAGE
                }, t))
            },
            loadManifest: function(t, i, n) {
                var a = this,
                    o = [];
                loadTotal = t.length; // total file to load
                e.each(t, (function(t) {
                    var i = a.getLoadingTarget(t);
                    i && (e.defaults(i, {
                        cache: !0
                    }), o.push(i))
                })), o = e.uniq(o), e.isEmpty(o) ? this.loadQueue.dispatchEvent("complete") : this.loadQueue.loadManifest(o, i, n)
            },
            loadFile: function(t, i, n) {
                var a = this.getLoadingTarget(t);
                a && (e.defaults(a, {
                    cache: !0
                }), this.loadQueue.loadFile(a, i, n))
            },
            load: function() {
                this.loadQueue.load()
            },
            close: function() {
                this.loadQueue.close()
            },
            setMaxConnections: function(e) {
                this.loadQueue.setMaxConnections(e)
            },
            addEventListener: function(e, t) {
                this.once(e, t)
            },
            clear: function() {
                e.each(n, (function(e, t) {
                    delete i[t]
                })), n = {}
            },
            reset: function() {
                this.loadQueue.reset()
            }
        });
    return a.makeSingleton(["loadFile", "loadManifest", "load", "clear", "setImageAlias", "on", "off", "once", "addEventListener", "reset"]), a
}));
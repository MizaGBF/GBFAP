define(["underscore", "backbone"], (function(n, t) {
    var e = function(t, e) {
        return e = e || n.reject(n.keys(t.prototype), (function(n) {
            return "_" == n[0]
        })), t.prototype.constructor = function() {
            return t._instance ? t._instance : (t._instance = this, t.prototype.constructor.apply(this, arguments))
        }, t.getInstance = function() {
            return this._instance = this._instance || new t, this._instance
        }, n.each(e, (function(n) {
            t[n] = function() {
                var e = t.getInstance();
                return e[n].apply(e, arguments)
            }
        })), t
    };
    return t.Model.makeSingleton = function(n) {
        e(this, n)
    }, {
        makeSingleton: e
    }
}));
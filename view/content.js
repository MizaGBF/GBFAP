define(["underscore", "backbone"], function(_, Backbone) {
    // Define a custom View extending Backbone.View
    const CustomView = Backbone.View.extend({
        /**
         * Cleans up a `createjs.Stage` object.
         * @param {Object} stage - The `createjs.Stage` instance to destroy.
         */
        _destroyStage: function(stage) {
            if (stage) {
                const Ticker = createjs.Ticker;

                // Remove the tick event listener
                Ticker.removeEventListener("tick", stage);

                // Configure the stage for cleanup
                stage.autoClear = true;
                stage.enableDOMEvents(false);
                stage.removeAllChildren();
                stage.update();

                stage.canvas = null;

                // If Ticker has only one listener, stop the animation frame or timeout
                if (_.size(Ticker._listeners) === 1) {
                    if (Ticker._raf) {
                        // Cancel the animation frame
                        const cancelFrame =
                            window.cancelAnimationFrame ||
                            window.webkitCancelAnimationFrame ||
                            window.mozCancelAnimationFrame ||
                            window.oCancelAnimationFrame ||
                            window.msCancelAnimationFrame;
                        if (cancelFrame) {
                            cancelFrame(Ticker._timerId);
                        }
                    } else {
                        // Fallback to clearTimeout
                        clearTimeout(Ticker._timerId);
                    }
                    Ticker._timerId = null;
                }
            }
        }
    });

    /**
     * Adds a singleton pattern to the CustomView class.
     */
    CustomView.singleton = function() {
        let instance = null;
        const OriginalClass = this;

        return this.extend({
            constructor: function(options) {
                // Ensure only one instance is created
                if (instance === null) {
                    OriginalClass.prototype.constructor.call(this, options);
                    instance = this;
                }
                return instance;
            },
            destroy: _.compose(
                function() {
                    // Reset the instance on destroy
                    instance = null;
                },
                _.isFunction(OriginalClass.prototype.destroy)
                    ? OriginalClass.prototype.destroy
                    : function() {}
            )
        });
    };

    // Return the customized View class
    return CustomView;
});

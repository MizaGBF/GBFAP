define(["underscore", "backbone", "util/backbone-singleton", "model/manifest-loader", "lib/common"], function(_, Backbone) {
    window.images = window.images || {}; // Image cache
    var imageSources = {}; // Tracks image source URLs

    // Extend Backbone.Model to create an image loader
    var ManifestLoader = Backbone.Model.extend({
        initialize: function() {
            // Create a LoadQueue for managing image loading
            this.loadQueue = new createjs.LoadQueue(false);
            this.loadQueue.setMaxConnections(5);

            // Attach event listeners for load queue events
            this.loadQueue.addEventListener("error", _.bind(this.handleError, this));
            this.loadQueue.addEventListener("fileload", _.bind(this.handleFileLoad, this));
            this.loadQueue.addEventListener("complete", _.bind(this.handleComplete, this));

            // Special handling for CreateJsShell in cjs_mode
            if (window.CreateJsShell && Game.setting.cjs_mode === 1) {
                this.loadQueue._progress = 1;
            }
        },
        setImageAlias: function(originalKey, aliasKey) {
            window.images[aliasKey] = window.images[originalKey];
            imageSources[aliasKey] = imageSources[originalKey];
        },
        handleFileLoad: function(event) {
            var fileId = event.item.id;

            // If the loaded file is an image, cache it
            if (event.item.type === createjs.Types.IMAGE) {
                var image = event.result;
                window.images[fileId] = image;
            }

            // Trigger "fileload" event for other components
            this.trigger("fileload", event);

            // Update loading progress (custom logic)
            loadNow++; // Increment loaded file count
            let actduration = document.getElementById('act-duration');
            if(actduration)
                actduration.innerHTML = "" + loadNow + " / " + loadTotal + " (" + Math.floor(100*loadNow/loadTotal) + "%)"; // update indicator
        },
        handleComplete: function(event) {
            if(window.CreateJsShell && Game.setting.cjs_mode === 1)
            {
                this.loadQueue._progress = 0;
            }
            this.trigger("complete", event);
        },
        handleError: function(event) {
            this.trigger("error", event);
        },
        getLoadingTarget: function(file) {
            if (!file) return null;

            // Normalize file descriptor
            if(!_.isObject(file)) {
                file = {id: file, src: file};
            }
            var fileId = file.id;
            // Check if the file is already loaded or in progress
            if (_.has(window.images, fileId) && imageSources[fileId] === file.src) {
                return null;
            }

            // Track the file source and return the loading target
            return (imageSources[fileId] = file.src, _.defaults({type:createjs.Types.IMAGE}, file));
        },
        loadManifest: function(files, loadSequentially, basePath) {
            var my = this;
            var targets = [];

            // Track total files to load
            loadTotal = files.length;

            // Process each file descriptor in the manifest
            _.each(files, (function(files) {
                var target = my.getLoadingTarget(files);
                if(target)
                {
                    _.defaults(target, {loadTimeout:60000, cache: true});
                    targets.push(target);
                }
            }));
            // Ensure unique targets and load them
            targets = _.uniq(targets);
            if (_.isEmpty(targets)) {
                this.loadQueue.dispatchEvent("complete");
            } else {
                this.loadQueue.loadManifest(targets, loadSequentially, basePath);
            }
        },
        loadFile: function(file, loadSequentially, basePath) {
            var target = this.getLoadingTarget(file);
            if(target)
            {
                _.defaults(target, {cache: true});
                this.loadQueue.loadFile(target, loadSequentially, basePath);
            }
        },
        load: function() {
            this.loadQueue.load();
        },
        close: function() {
            this.loadQueue.close();
        },
        setMaxConnections: function(maxConnections) {
            this.loadQueue.setMaxConnections(maxConnections);
        },
        addEventListener: function(eventType, callback) {
            this.once(eventType, callback);
        },
        clear: function() {
            _.each(imageSources, function(_, fileId) {
                delete window.images[fileId];
            });
            imageSources = {};
        },
        reset: function() {
            this.loadQueue.reset();
        },
    });

    // Make the model a singleton
    return ManifestLoader.makeSingleton([
        "loadFile",
        "loadManifest",
        "load",
        "clear",
        "setImageAlias",
        "on",
        "off",
        "once",
        "addEventListener",
        "reset",
    ]), ManifestLoader;
});

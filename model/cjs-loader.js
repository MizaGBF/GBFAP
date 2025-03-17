define(["jquery", "underscore", "backbone", "model/manifest-loader", "util/backbone-singleton"], function($, _, Backbone, ManifestLoader) {
	// Set up global objects and paths
	window.lib = window.lib || {};
	var loadedScripts = {};
	var loadingScripts = {};
	var scriptCache = {};
	var manifestCache = {};
	var commonScriptPath = "cjs/";
	var manifestPath = Game.xjsUri + "/model/manifest/";

	// Extend Backbone.Model with asset loading functionality
	var CJSLoader = Backbone.Model.extend({
		loadFiles: function(files, callback) {
			var my = this;
			var deferred = new $.Deferred();

			// Filter out already loaded or loading files
			var newFiles = _.reject(files, function(file) {
				return _.has(loadedScripts, file) || _.has(loadingScripts, file);
			});

			// Mark these files as being loaded
			_.each(newFiles, function(file) {
				loadingScripts[file] = true;
			});

			// Deduplicate and sort the new files
			newFiles = _.unique(_.sortBy(newFiles));

			// Helper function to finalize the process
			var finalize = function() {
				deferred.resolve();
				var failedFiles = _.difference(
					_.union(files, _.keys(loadingScripts)),
					_.keys(loadedScripts)
				);
				if (_.isEmpty(failedFiles)) {
					my.trigger("complete");
				} else if (Game.isSandbox === 1) {
					my.trigger("failed", failedFiles);
				}
			};

			// If there are no new files to load, finish immediately
			if (_.isEmpty(newFiles)) {
				finalize();
			} else {
				// Load assets
				var queueDeferred = new $.Deferred();
				var loadQueue = new createjs.LoadQueue(false, Game.jsUri + "/", true);
				loadQueue.setMaxConnections(5);

				loadQueue.on("complete", function() {
					queueDeferred.resolve();
				});

				loadQueue.on("fileload", function(event) {
					if (event.item) {
						var id = event.item.id;
						if (id) {
							var fileName = _.last(id.split("/"));
							window.lib[fileName].prototype.playFunc = function(callback) {
								createjs.Tween.get().wait(1).call(callback);
							};
							loadedScripts[fileName] = fileName;
							scriptCache[id] = window.lib[fileName];
						}
					}
				});

				loadQueue.on("error", function() {
					queueDeferred.reject();
				});

				// Prepare manifest for loading
				var manifest = _.map(newFiles, function(file) {
					var path = commonScriptPath + file;
					return {
						id: path,
						src: path + ".js",
						type: createjs.Types.JAVASCRIPT,
						cache: true,
					};
				});
				loadQueue.loadManifest(manifest);

				// Load dependent manifests
				var manifestDeferred = new $.Deferred();
				var allManifests = [];
				var totalFiles = newFiles.length;
				var loadedCount = 0;

				_.each(newFiles, function(file) {
					var scriptPath = manifestPath + file + ".js";
					require(
						[scriptPath],
						function(module) {
							manifestCache[scriptPath] = module.prototype.defaults.manifest;
							if (callback && manifestCache[scriptPath].length > 0) {
								allManifests = allManifests.concat(manifestCache[scriptPath]);
							}
							loadedCount++;
							if (loadedCount === totalFiles) {
								if (allManifests.length > 0) {
									ManifestLoader.once("complete", function() {
										manifestDeferred.resolve();
									});
									ManifestLoader.loadManifest(allManifests, true);
								} else {
									manifestDeferred.resolve();
								}
							}
						},
						function() {
							// Handle errors in require.js
						}
					);
				});
				// When all loading is done, finalize
				$.when(queueDeferred, manifestDeferred).always(function() {
					finalize();
				});
			}
			return deferred;
		},

		// Get cached CommonJS scripts
		cjs: function(file) {
			return file ? scriptCache[commonScriptPath + file] : _.values(scriptCache);
		},

		// Get cached manifests
		manifest: function(file) {
			return file ? manifestCache[manifestPath + file + ".js"] : _.values(manifestCache);
		},

		// Clear all caches
		clear: function() {
			_.each(_.keys(requirejs.s.contexts._.defined), function(key) {
				if (key.startsWith("")) {
					require.undef(key);
					delete window.lib[key];
				}
			});

			_.each(scriptCache, function(value, key) {
				require.undef(key);
				delete window.lib[key];
			});

			_.each(manifestCache, function(value, key) {
				require.undef(key);
				delete window.lib[key];
			});

			loadedScripts = {};
			loadingScripts = {};
			scriptCache = {};
			manifestCache = {};
			ManifestLoader.clear();
		},
	});

	// Make the model a singleton
	return CJSLoader.makeSingleton([
		"loadFiles",
		"cjs",
		"manifest",
		"clear",
		"on",
		"off",
		"once",
	]), CJSLoader;
});

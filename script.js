define(["model/cjs-loader", "model/manifest-loader", "view/cjs_npc_demo", "underscore"], function (cjsloader, manifestloader, cjs_npc_demo, _) {
	loadCJS = function (fileList) {
		// Add "summon_damage" files for corresponding "summon_attack" files.
		let originalLength = fileList.length;
		for (let i = 0; i < originalLength; ++i) {
			if (fileList[i].startsWith("summon_") && fileList[i].endsWith("_attack")) {
				fileList.push(fileList[i].replace("attack", "damage"));
			}
		}

		var deferred = $.Deferred();
		return cjsloader.once("complete", function () {
			deferred.resolve()
		}),
			cjsloader.loadFiles(fileList),
			deferred
	};
	loadManifest = function (fileList) {
		var deferred = $.Deferred();

		// Gather all manifest data related to the given file list.
		var manifests = _.flatten(
			_.map(fileList, function(fileList) { return cjsloader.manifest(fileList)})
		);

		// Modify weapon images if specific conditions are met.
		if(is_mc && mc_wpn) // set wpn
		{
			// mc only fix
			let melee = AnimeData[1][0]["cjs"][0].includes("_me_");
			for(let e of manifests)
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
		// Resolve and return after loading
		return (function () {}),
			manifestloader.once("complete", function () {
				deferred.resolve()
			}),
			manifestloader.loadManifest(manifests, true),
			deferred
	};
	prepareCjs = function () {
		var my = this;
		my.cjsViewList = []; // List of CJS views.
		var loadFiles = []; // Aggregate list of files to load.

		// Create CJS views for each action index and collect required files.
		_.each(action_index, function(action, index) {
			// Ensure 'special' is converted to an array.
			action.special = Array.from(action.special);
			// Create a new CJS NPC demo view.
			var cjsView = new cjs_npc_demo({
				cjsList: action.cjs,
				cjsEffectList: action.effect,
				cjsMortalList: action.special,
				cjsPosList: action.cjs_pos,
				cjsMortalPosList: action.special_pos,
				motionList: action.action_label_list,
				canvasSelector: ".cjs-npc-demo-" + index,
				canvasIndex: index,
			});

			// Store the view and collect its loaded files.
			my.cjsViewList[index] = cjsView;
			loadFiles = loadFiles.concat(cjsView.getLoadFiles());
		});

		// Ensure the file list is unique.
		loadFiles = _.uniq(loadFiles);

		// Load the CJS files and manifests sequentially.
		this.loadCJS(loadFiles)
		.then(function () {
			return my.loadManifest(loadFiles);
		})
		.done(function () {
			// Render each view and handle UI updates.
			_.each(my.cjsViewList, (view, index) => {
				view.cjsRender();
				if(index != 0) view.pause(); // Pause non-default views.

				// Get the list of available actions for this view.
				let actions = view.getActionList();
				custom_choices[index] = actions.slice();

				if (index == 0)
				{
					// Populate the action selection dropdown for the default view.
					let actionlist = '<option value="default">Demo</option>'
					for(let action in actions) {
						actionlist = actionlist.concat('<option value=' + actions[action] + '>' + view.translateAction(actions[action]) + '</option>');
					}
					ui.act_select.innerHTML = actionlist;
					view.reset(); // trick, see cjs_npc_demo.js
				}
			});
		});
	};

	// Initialize the preparation process.
	prepareCjs();
});

window.images = window.images || {}; // images storage
window.lib = window.lib || {}; // javascript storage

class Loader
{
	constructor()
	{
		this.manifest_cache = {}; // manifest storage
	}
	
	reset()
	{
		window.images = {};
		window.lib = {};
		this.manifest_cache = {};
	}
	
	load_animations() // starting points
	{
		let manifest_list = [];
		for(const animation of player.get_animations()) // get a list of all manifests
		{
			manifest_list = manifest_list.concat(animation.manifests);
		}
		if(manifest_list.length > 0)
		{
			// remove dupes
			let file_list = Array.from(new Set(manifest_list));
			// start the download
			this.load_manifests(file_list);
		}
	}
	
	load_manifests(file_list)
	{
		let to_load = file_list.concat([]);
		
		if(to_load.length == 0)
			return;
		
		var error_flag = false;
		
		// CJS file
		// Each manifest has an equivalent animation in the cjs folder
		var cjs_deferred = new $.Deferred();
		var load_queue = new createjs.LoadQueue(false, Game.jsUri + "/", true);
		load_queue.setMaxConnections(5);
		
		// set events
		load_queue.on("complete", function() {
			cjs_deferred.resolve();
		});
		
		load_queue.on("fileload", function(event) {
			if(event.item)
			{
				var id = event.item.id;
				if(id)
				{
					var file_name = id.split("/").pop();
					// store in window.lib
					window.lib[file_name].prototype.playFunc = function(callback) {
						createjs.Tween.get().wait(1).call(callback);
					};
				}
			}
		});

		load_queue.on("error", function(event) {
			console.log("Failed to load CJS", event);
			cjs_deferred.reject();
			error_flag = true;
		});
		
		// make list of cjs files to load
		var cjs = to_load.map(function(file) {
			var path = "cjs/" + file;
			return {
				id: path,
				src: path + ".js",
				type: createjs.Types.JAVASCRIPT,
				cache: true,
			};
		});
		// start the download
		load_queue.loadManifest(cjs);
		
		// Manifest files
		// Those files define the spritesheets and such
		var manifest_deferred = new $.Deferred();
		var spritesheets = []; // will contain the list of spritesheets to download
		// a simple counter to check if we have downloaded everything
		var total_files = to_load.length;
		var loaded = 0;
		
		for(const file of to_load)
		{
			if(manifest_deferred.state() == "rejected")
				break;
			var manifest_path = Game.xjsUri + "/model/manifest/" + file + ".js";
			// use require to set the manifest as intended
			require(
				[manifest_path],
				function(module) {
					// add to cache
					loader.manifest_cache[manifest_path] = module.prototype.defaults.manifest;
					// add the spritesheets
					spritesheets = spritesheets.concat(loader.manifest_cache[manifest_path]);
					// increase counter
					loaded++;
					if(loaded == total_files) // if done
					{
						manifest_deferred.resolve(); // resolve the deferred
					}
				},
				function() { // in case of error
					console.error("Error loading manifest " + manifest_path);
					loaded = total_files; // terminate early
					manifest_deferred.reject();
					error_flag = true;
				}
			);
		}
		// wait for both deferred to end
		$.when(cjs_deferred, manifest_deferred).always(function() {
			if(error_flag)
			{
				player.ui.set_error();
				return;
			}
			// hot fix the main character weapon
			// we replace the "weapon.png" files by "WEAPON_ID.png"
			const first_anim = player.get_animations()[0];
			if(first_anim.is_main_character && first_anim.weapon)
			{
				// only do it for the first weapon
				let is_melee = first_anim.cjs.includes("_me_");
				for(let i = 0; i < spritesheets.length; ++i)
				{
					if(spritesheets[i].type === createjs.Types.IMAGE)
					{
						if(is_melee)
						{
							switch(spritesheets[i].id)
							{
								case "weapon_l":
									spritesheets[i].src = Game.imgUri + "/sp/cjs/" + first_anim.weapon + "_1.png";
									break;
								case "weapon_r":
									spritesheets[i].src = Game.imgUri + "/sp/cjs/" + first_anim.weapon + "_2.png";
									break;
							}
						}
						else if(spritesheets[i].id == "weapon")
						{
							spritesheets[i].src = Game.imgUri + "/sp/cjs/" + first_anim.weapon + ".png";
						}
					}
				}
			}
			// loader the spritesheets
			loader.load_spritesheets(spritesheets);
		});
	}
	
	load_spritesheets(spritesheets)
	{
		let to_load = []; // list all files to load
		for(const file of spritesheets)
		{
			let file_id = file.id ?? null;
			if(file_id)
			{
				if(!(file_id in window.images))
				{
					to_load.push(Object.assign({loadTimeout: 60000, cache: true}, file));
				}
			}
		}
		// prepare weapon textures
		var weapon_dupe_table = {};
		if(player.m_weapon_textures.length > 0)
		{
			let is_melee = player.get_animations()[0].cjs.includes("_me_");
			let loading_weapons = {};
			// init loading weapons with first texture
			if(is_melee)
			{
				loading_weapons[player.m_weapon_textures[0]] = ["weapon_l", "weapon_r"];
			}
			else
			{
				loading_weapons[player.m_weapon_textures[0]] = "weapon";
			}
			// init aux weapons
			let w2a = false;
			let w2b = false;
			let manatura = false;
			let shield = false;
			for(const sprite of spritesheets)
			{
				switch(sprite.id)
				{
					case "weapon2a":
					{
						w2a = true;
						break;
					}
					case "weapon2b":
					{
						w2b = true;
						break;
					}
					case "familiar":
					{
						manatura = true;
						break;
					}
					case "shield":
					{
						shield = true;
						break;
					}
				}
			}
			// init other textures
			for(let i = 1; i < player.m_weapon_textures.length; ++i)
			{
				if(is_melee)
				{
					if(player.m_weapon_textures[i] in loading_weapons)
					{
						weapon_dupe_table["weapon_version_" + i + "_0"] = loading_weapons[player.m_weapon_textures[i]][0];
						weapon_dupe_table["weapon_version_" + i + "_1"] = loading_weapons[player.m_weapon_textures[i]][1];
					}
					else
					{
						to_load.push({
							"loadTimeout": 60000,
							"cache": true,
							"src": Game.imgUri + "/sp/cjs/" + player.m_weapon_textures[i] + "_1.png",
							"id": "weapon_version_l_" + i,
							"type": "image",
							"ext": "png",
							"path": ""
						});
						to_load.push({
							"loadTimeout": 60000,
							"cache": true,
							"src": Game.imgUri + "/sp/cjs/" + player.m_weapon_textures[i] + "_2.png",
							"id": "weapon_version_r_" + i,
							"type": "image",
							"ext": "png",
							"path": ""
						});
						loading_weapons[player.m_weapon_textures[i]] = ["weapon_version_l_" + i, "weapon_version_r_" + i];
					}
				}
				else
				{
					if(player.m_weapon_textures[i] in loading_weapons)
					{
						weapon_dupe_table["weapon_version_" + i] = loading_weapons[player.m_weapon_textures[i]];
					}
					else
					{
						to_load.push({
							"loadTimeout": 60000,
							"cache": true,
							"src": Game.imgUri + "/sp/cjs/" + player.m_weapon_textures[i] + ".png",
							"id": "weapon_version_" + i,
							"type": "image",
							"ext": "png",
							"path": ""
						});
						loading_weapons[player.m_weapon_textures[i]] = "weapon_version_" + i;
					}
				}
				// auxiliary
				if(w2a)
				{
					weapon_dupe_table["weapon_version_2a_" + i] = "weapon2a";
				}
				if(w2b)
				{
					weapon_dupe_table["weapon_version_2b_" + i] = "weapon2b";
				}
				if(manatura)
				{
					weapon_dupe_table["familiar_version_" + i] = "familiar";
				}
				if(shield)
				{
					weapon_dupe_table["shield_version_" + i] = "shield";
				}
			}
		}
		// remove dupes
		to_load = Array.from(new Set(to_load));
		if(to_load.length == 0)
		{
			// nothing to download (shouldn't happen...)
			player.start_animation();
		}
		else
		{
			// make deferred and download queue
			var queue_deferred = new $.Deferred();
			var load_queue = new createjs.LoadQueue(false);
			load_queue.setMaxConnections(5);
			// to keep track of the progress
			const total = to_load.length;
			var count = 0;
		
			// set events
			load_queue.on("complete", function() {
				queue_deferred.resolve();
			});
			
			load_queue.on("fileload", function(event) {
				if(event.item)
				{
					count++;
					player.ui.set_loading_progress(count, total);
					var id = event.item.id;
					if(id && event.item.type === createjs.Types.IMAGE)
					{
						window.images[id] = event.result;
					}
				}
			});

			load_queue.on("error", function() {
				if(event && event.srcElement)
					console.error("Failed to download spritesheet", event.srcElement.src);
				count++; // still increase the count
				player.ui.set_loading_progress(count, total);
				// don't reject, others might still download just fine
			});
			
			// start download
			load_queue.loadManifest(to_load, true, "./img/");
			
			queue_deferred.always(function() {
				player.ui.clear_loading_progress();
				// add extra versions
				for(const [dupe, orig] of Object.entries(weapon_dupe_table))
				{
					window.images[dupe] = window.images[orig];
				}
				player.start_animation();
			});
		}
	}
};

// instantiate the loader if it doesn't exist
loader = loader ?? new Loader();
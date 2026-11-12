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
	
	load_animations() // starting point
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
	
	async load_manifests(file_list)
	{
		let to_load = file_list.concat([]);
		
		if(to_load.length == 0)
			return;
		
		var error_flag = false;
		// to track loading progress
		var file_count = to_load.length * 2; // manifest + cjs
		var file_loaded = 0;
		
		// helper to load scripts using tags
		const load_script = (src) => {
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = src;
				script.async = true;
				script.onload = () => resolve(script);
				script.onerror = (err) => reject(err);
				document.head.appendChild(script);
			});
		};

		// helper to load manifests via RequireJS
		const load_manifest = (file) => {
			return new Promise((resolve, reject) => {
				var manifest_path = Game.xjsUri + "/model/manifest/" + file + ".js";
				require(
					[manifest_path],
					(module) => {
						// add to cache
						loader.manifest_cache[manifest_path] = module.prototype.defaults.manifest;
						resolve(module.prototype.defaults.manifest);
					},
					() => { // in case of error
						console.error("Error loading manifest " + manifest_path);
						reject(manifest_path);
					}
				);
			});
		};

		let spritesheets = [];

		// load CJS scripts concurrently
		const cjs_promises = to_load.map(async (file) => {
			var path = "cjs/" + file;
			var src = Game.jsUri + "/" + path + ".js";
			try
			{
				await load_script(src);
				var file_name = file;
				// store in window.lib
				if(window.lib[file_name])
				{
					window.lib[file_name].prototype.playFunc = (callback) => {
						createjs.Tween.get().wait(1).call(callback);
					};
				}
				file_loaded++;
				player.loading_draw_progress_bar(
					file_loaded,
					file_count,
					"scripts"
				);
			} catch(err) {
				console.error("Failed to load CJS script: " + src, err);
				error_flag = true;
				throw err;
			}
		});

		// load manifest files concurrently
		const manifest_promises = to_load.map(async (file) => {
			try
			{
				const manifest_data = await load_manifest(file);
				file_loaded++;
				player.loading_draw_progress_bar(
					file_loaded,
					file_count,
					"scripts"
				);
				return manifest_data;
			} catch(err) {
				error_flag = true;
				throw err;
			}
		});

		try
		{
			// wait for both to finish loading
			const promise_results = await Promise.allSettled([...cjs_promises, ...manifest_promises]);
			for(const res of promise_results)
			{
				if(res.status === 'rejected')
				{
					error_flag = true;
				}
			}
			// extract spritesheet manifests
			const manifest_results = promise_results.slice(to_load.length);
			for(const res of manifest_results)
			{
				if(res.status === 'fulfilled' && res.value)
				{
					spritesheets = spritesheets.concat(res.value);
				}
			}
		} catch(err) {
			error_flag = true;
		}

		if(error_flag)
		{
			player.loading_draw_text("An error occured.");
			return;
		}

		// hot fix the main character weapon
		// we replace the "weapon.png" files by "WEAPON_ID.png"
		const first_anim = player.get_animations()[0];
		if(first_anim.type == AnimationType.MC && first_anim.weapon)
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
		// load the spritesheets
		this.load_spritesheets(spritesheets);
	}
	
	load_spritesheets(spritesheets)
	{
		let to_load = [];
		// list all files to load
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
			const total = to_load.length;
			let count = 0;
		
			// helper to load images via Promises
			const loadImage = (file) => {
				return new Promise((resolve) => {
					const img = new Image();
					if(config.use_game_config != "local")
					{
						img.crossOrigin = "Anonymous";
					}
					// keep in constant for scope longevity
					const srcUrl = file.src;
					img.onload = () => {
						player.loading_draw_progress_bar(
							count++,
							total,
							"spritesheets"
						);
						resolve({id: file.id, img});
						// reset to not interfer with player.set_texture
						img.onload = null;
						img.onerror = null;
					};

					img.onerror = (ev) => {
						console.error("Failed to download spritesheet", srcUrl, ev);
						player.loading_draw_progress_bar(
							count++,
							total,
							"spritesheets"
						);
						resolve(null);
						// reset to not interfer with player.set_texture
						img.onload = null;
						img.onerror = null;
					};

					img.src = srcUrl;
				});
			};

			// download all spritesheets concurrently
			Promise.all(to_load.map(file => loadImage(file))).then((results) => {
				for(const res of results)
				{
					if(res && res.id)
					{
						window.images[res.id] = res.img;
					}
				}
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
// override some functions from GBFML page.js
function override_GBFML()
{
	get_character = function(id, data, range, mypage = false)
	{
		if(data == null || (mypage && !(id in index.mypage)))
			return null;
		let val = parseInt(id.slice(4, 7));
		switch(id[2])
		{
			case '4':
				if(val < range[4] || val >= range[5])
					return null;
				break;
			case '3':
				if(val < range[2] || val >= range[3])
					return null;
				break;
			case '2':
				if(val < range[0] || val >= range[1])
					return null;
				break;
			default:
				return null;
		}
		let uncap_string = "_01";
		switch(data['v'][data['v'].length - 1][0][0])
		{
			case "5":
				uncap_string = "_03";
				break;
			case "6":
				uncap_string = "_04";
				break;
			default:
				break;
		}
		let onerr = default_onerror;
		if(uncap_string != "_01")
		{
			onerr = function() {
				this.src = this.src.replace(uncap_string, uncap_string+'_01'); // hack for lyria and equivalent
				this.onerror = function() {
					this.src.replace(uncap_string+'_01', '_01');
					this.onerror = default_onerror;
				}
			}
		}
		let path = "GBF/assets_en/img_low/sp/assets/npc/m/" + id + uncap_string + ".jpg";
		return [{id:id, path:path, onerr:onerr, class:"", link:false}];
	}

	get_skin = function(id, data, range, mypage = false)
	{
		if(data == null || (mypage && !(id in index.mypage)))
			return null;
		let val = parseInt(id.slice(4, 7));
		if(val < range[0] || val >= range[1])
			return null;
		return [{id:id, path:"GBF/assets_en/img_low/sp/assets/npc/m/" + id + "_01.jpg", onerr:default_onerror, class:"", link:false}];
	}

	get_partner = function(id, data, prefix, unused = null)
	{
		if(data == null)
			return null;
		if(id.slice(1, 3) != prefix)
			return null;
		return [{
			id:id,
			path:(id.startsWith("389")
			? "GBF/assets_en/img_low/sp/assets/npc/raid_normal/" + id + "_01_0.jpg"
			: "GBF/assets_en/img_low/sp/assets/npc/raid_normal/" + id + "_01.jpg"),
			onerr:default_onerror,
			class:"preview", 
			link:false
		}];
	}

	get_summon = function(id, data, rarity, range)
	{
		if(data == null)
			return null;
		if(rarity != null && id[2] != rarity)
			return null;
		if(typeof range == 'boolean') // mypage check
		{
			if(range && !(id in index.mypage))
				return null;
		}
		else
		{
			let val = parseInt(id.slice(4, 7));
			if(val < range[0] || val >= range[1])
				return null;
		}
		let uncap_string = "";
		switch(data['v'][data['v'].length - 1][0][0])
		{
			case "4":
				uncap_string = "_02";
				break;
			case "5":
				uncap_string = "_02";
				break;
			case "6":
				uncap_string = "_04";
				break;
			default:
				break;
		}
		let onerr = default_onerror;
		if(uncap_string != "")
		{
			onerr = function() {
				if(uncap_string == "_04")
				{
					uncap_string = "_02";
					this.src = this.src.replace("_04", "_02");
					this.onerror = function() {
						this.src = this.src.replace(uncap_string, "");
						this.onerror = default_onerror;
					}
				}
				else
				{
					this.src = this.src.replace(uncap_string, "");
					this.onerror = default_onerror;
				}
			}
		}
		let path = "GBF/assets_en/img_low/sp/assets/summon/m/" + id + uncap_string + ".jpg";
		return [{id:id, path:path, onerr:onerr, class:"", link:false}];
	}

	get_weapon = function(id, data, rarity, proficiency)
	{
		if(data == null)
			return null;
		if(id[2] != rarity || id[4] != proficiency)
			return null;
		let uncap = 1;
		for(let i = 0; i < data['v'].length; ++i)
		{
			if(data['v'][i][0].endsWith("Lv200"))
				uncap = Math.max(uncap, 2);
			else if(data['v'][i][0].endsWith("Lv250"))
				uncap = Math.max(uncap, 3);
		}
		let uncap_string = "";
		let onerr = default_onerror;
		if(uncap > 1)
		{
			uncap_string = "_0" + JSON.stringify(uncap);
			onerr = function() {
				this.src=gbf.id_to_endpoint(id) + "assets_en/img_low/sp/assets/weapon/m/"+id+".jpg";
				this.onerror=default_onerror;
			};
		}
		let path = "GBF/assets_en/img_low/sp/assets/weapon/m/" + id + uncap_string + ".jpg";
		return [{id:id, path:path, onerr:onerr, class:"", link:false}];
	}

	get_job = function(id, data, mypage = false, unusedB = null)
	{
		if(mypage && !(id in index.mypage))
			return null;
		return [{id:id, path:"GBF/assets_en/img_low/sp/assets/leader/m/" + id + "_01.jpg", onerr:default_onerror, class:"", link:false}];
	}

	get_enemy = function(id, data, type, size)
	{
		if(id[0] != type || id[1] != size)
			return null;
		let className = (data && "ra" in data && data.ra.length > 0) ? "preview vs" : "preview";
		return [{id:id, path:"GBF/assets_en/img/sp/assets/enemy/s/" + id + ".png", onerr:function() {
			this.src=gbf.id_to_endpoint(id) + "assets_en/img_low/sp/assets/enemy/m/"+id+".png";
			this.onerror=default_onerror;
		}, class:className, link:false}];
	}

	get_background = function(id, data, key, unused = null)
	{
		if(!data)
			return null;
		let path = null;
		switch(id.split('_')[0])
		{
			case "common":
				if(key != "common")
					return null;
				path = ["sp/raid/bg/", ".jpg"];
				break;
			case "main":
				if(key != "main")
					return null;
				path = ["sp/guild/custom/bg/", ".png"];
				break;
			case "event":
				if(key != "event")
					return null;
				path = ["sp/raid/bg/", ".jpg"];
				break;
			default:
				if(key != "")
					return null;
				path = ["sp/raid/bg/", ".jpg"];
				break;
		}
		let ret = [];
		for(const i of data[0])
		{
			ret.push({
				id:i,
				path:"GBF/assets_en/img_low/" + path[0] + i + path[1],
				onerr:null,
				class:"preview",
				link:false,
				onclick:function() {
					open_tab("view");
					player.ui.m_html.scrollIntoView();
					player.ui.set_background(Game.bgUri + "/img/" + path[0] + i + path[1]);
				},
				unlisted:true
			});
		}
		return ret;
	}

	get_mypage_bg = function(id, data, unusedA = null, unusedB = null)
	{
		return [{
			id:id,
			path:"GBF/assets_en/img_low/sp/mypage/town/" + id + "/bg.jpg",
			onerr:null,
			class:"preview",
			link:false,
			onclick:function() {
				open_tab("view");
				player.ui.m_html.scrollIntoView();
				player.ui.set_background(Game.bgUri + "/img/sp/mypage/town/" + id + "/bg.jpg");
			},
			unlisted:true
		}];
	}
}
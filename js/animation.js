// generic class to contain data for an animation
class Animation
{
	constructor(name, obj)
	{
		this.name = name; // name (to be displayed in the version selector)
		this.demo_motions = obj.demo_motions; // default motions
		this.is_main_character = obj.is_main_character ?? false; // if it uses the main character
		this.is_enemy = obj.is_enemy ?? false; // if it's an enemy
		this.is_mypage = obj.is_mypage ?? false; // if it's a mypage animation
		this.weapon = obj.weapon ?? null; // the weapon id (if any). Must be paired with a main character
		this.summon = obj.summon ?? null; // the summon id (if any). Must be paired with a main character
		this.cjs = obj.cjs; // main animation file
		this.specials = obj.specials ?? []; // list of charge attack files
		this.attack = obj.attack ?? null; // list of auto attack ("phit") files
		this.abilities = obj.abilities ?? []; // list of skill effect ("ab") files
		this.raid_appear = obj.raid_appear ?? []; // list of raid appear ("ra") files
	}
	
	get manifests() // return a list of file to download
	{
		let manifests = [this.cjs].concat(this.specials).concat(this.abilities).concat(this.raid_appear)
		if(this.attack)
			manifests.push(this.attack);
		if(this.summon != null)
		{
			if(this.specials.length > 0 && this.specials[0].endsWith("_attack")) // add also _damage if the summon file ends with attack
				manifests.push(this.specials[0].replace("attack", "damage"));
		}
		return manifests;
	}
}
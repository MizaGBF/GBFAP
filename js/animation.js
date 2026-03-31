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
		this.ultimate = obj.ultimate ?? null; // mortal_SP ougi
		this.animation_versions = {}; // table of animation file version
		Animation.__init_animation_version__(this);
	}
	
	// init animation_versions with the version (s2, s3, ...) found in file names
	static __init_animation_version__(anim)
	{
		for(const key of ["cjs", "attack", "ultimate"])
		{
			if(anim[key] != null)
			{
				anim.animation_versions[anim[key]] = (
					anim[key].includes("_s2")
					? 2
					: (
						anim[key].includes("_s3")
						? 3
						: 1
					)
				);
			}
		}
		for(const key of ["specials", "abilities", "raid_appear"])
		{
			for(const file of anim[key])
			{
				anim.animation_versions[file] = (
					file.includes("_s2")
					? 2
					: (
						file.includes("_s3")
						? 3
						: 1
					)
				);
			}
		}
	}
	
	get_version(file)
	{
		if(file in this.animation_versions)
		{
			return this.animation_versions[file];
		}
		else // Fallback
		{
			if(file.includes("_s3"))
			{
				return 3;
			}
			else if(file.includes("_s2"))
			{
				return 2;
			}
			else
			{
				return 1;
			}
		}
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
		if(this.ultimate)
		{
			manifests.push(this.ultimate);
		}
		return manifests;
	}
}
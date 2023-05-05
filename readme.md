# GBF Animation Player  
Web page to play GBF animations.  
Click [Here](https://mizagbf.github.io/GBFAP) to access it.  
Based and modified from the chinese wiki player.  
  
# Setup  
Two possible setups:  
  
### You want to host the assets  
1. Copy this repo.  
2. Run `python updater.py -force -download -enemy` to download all the assets and new characters (The script will ask you to confirm).  
3. Change line 2 of `anime.js`: From `var AnimeLocal = false;` to `var AnimeLocal = true;`  
  
You can now host the project in the way you prefer.  
To later add new characters, simply do `python updater.py -download`.  
  
### You DON'T want to host the assets  
1. Copy this repo.  
2. Run `python updater.py -force` to build a clean character index (The script will ask you to confirm).  
3. Setup your [CORS Proxy](https://github.com/Rob--W/cors-anywhere) of choice to be able to fetch the assets directly from GBF.  
4. Change line 3 of `anime.js` with the address of your proxy.  
  
You can now host the project in the way you prefer.  
To later add new characters, simply do `python updater.py`.  
  
# The updater  
`updater.py` scours the GBF asset servers to build an index of playable character, along with the data needed for their respective demos.  
It's currently compatible with almost characters (R, SR, SSR, Skins) released up to today (see below for exceptions and how to fix those).  
The resulting data will be in the `json` folder.  
  
There are three main possible command lines:
* `python updater.py` to simply retrieve unindexed characters.  
* `python updater.py -index` to simply rebuild the index.json file.  
* `python updater.py -update list_of_character_id` to manually fetch the specified characters (Don't specify the character style).  
  
You can then append the following options for more control:
* `-force` will force a character indexation and, as a result, rebuild its JSON data (No need to use with `-update`).  
* `-download` will download and save the character assets in their respective folders.  
* `-enemy` will download the data and assets needed for the demo enemy and the dummy attack effect.  
  
# Character Uncap  
If a character gets an uncap, simply do:  
`python updater.py -update THE_CHARACTER_ID`  
Add `-download` if you want/need to download its new assets.  
  
# Exceptions  
Some skins (and rarely some seasonal characters) reuse the Charge Attack or Attack effect of another version.  
As there is no way to programmatically find it, at least currently, you'll have to set those exceptions manually in `updater.py`.  
First, you'll likely get a `No special set` error for characters without corresponding charge attack.  
Second, characters without corresponding attack effect will use a default one.  
To fix any of those two issues, find out the ID of the Character that it's supposed to borrow the files from and open `update.py` and look for `self.patches` around line 31.  
Simply add a new line in the list (don't forget the comma in the previous one) such as it looks that way:
`"ID_CHARA_WITHOUT_OUGI" : ("ID_OUGI_BORROWED_FROM", "", "")`.  
Example:  
`"3040232000": ("3040158000", "", "")`.  
Summer Alexiel (3040232000) is using Grand Alexiel (3040158000) Charge Attack files.  
The second value (`''`) is, in the future, if a character/skin ends up borrowing a CA with a weird naming convention, such as a full screen Charge Attack.  
Those have an extra `_s2` or `_s3` in their file names, and will need to be specified at that location.  
The third value (`''`) is for the matching attack effect.  
Just look at the full list in `updater.py` for more examples.  
Once the change is done, run `updater.py` again for the concerned characters.  
  
# Weapons and Main Characters  
Weapon IDs and Main Character classes and outfits are also supported.  
For the later, the ID needs to be hardcoded in the script, but weapons work like characters otherwise.  
  
# Additional Notes  
Downloaded assets are saved in the following folders:  
* Manifests in model/manifest/
* CJS in cjs/
* Sheets in img/sp/cjs/
  
The following files are modified/customized from what GBF uses:  
* model/cjs-loader.js  
* view/cjs_npc_demo.js  
* lib/sound.js  
* lib/raid/extension.js  
  
Along with:  
* anime.js  
* player.js  
* script.js  
  
And possibly more that I forgot.  
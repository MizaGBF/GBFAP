# GBF Animation Player  
Web page to play GBF animations.  
Click [Here](https://mizagbf.github.io/GBFAP) to access it.  
Based and modified from the chinese wiki player.  
  
# Setup  
Two possible setups:  
  
### You want to host the assets  
1. Copy this repo.  
2. Run `python updater.py -force -download -init` to download all the assets and new characters (The script will ask you to confirm).  
3. Change line 2 of `index.js`: From `const LOCAL = false;` to `const LOCAL = true;`  
  
You can now host the project in the way you prefer.  
You only need to use `-init` and `-force` once. Simply do `python updater.py -download` for future updates.  
  
### You DON'T want to host the assets  
1. Copy this repo.  
2. Run `python updater.py -force` to build a clean character index (The script will ask you to confirm).  
3. Setup your [CORS Proxy](https://github.com/Rob--W/cors-anywhere) of choice to be able to fetch the assets directly from GBF.  
4. Change line 3 of `index.js` with the address of your proxy.  
  
You can now host the project in the way you prefer.  
Simply do `python updater.py` for future updates.  
  
# The updater  
`updater.py` scours the GBF asset servers to build an index of playable character, along with the data needed for their respective demos.  
It's currently compatible with characters (R, SR, SSR, Skins), summons, weapons, enemies and classes released up to today.  
The resulting data will be in the `json` folder.  
  
There are three main possible command lines:
* `python updater.py` to simply retrieve unindexed characters.  
* `python updater.py -update list_of__id` to manually update the specified elements (You don't need to specify the character style).  
* `python updater.py -downloadall` will download all the required assets (ONLY USE IT IF YOU'RE PLANNING TO SELF-HOST THE ASSETS).  
  
You can then add the following options before for more control:
* `-force` will force an indexation and, as a result, rebuild its JSON data (No need to use with `-update`).  
* `-download` will download and save the assets in their respective folders.  
* `-init` will download the assets needed for the demo enemy and the dummy attack effect, among other things. This command isn't needed if you don't host the assets.  
* `-nochange` to not update the `changelog.json` recently updated element list.  
  
And the following if you're using [GBFAL](https://github.com/MizaGBF/GBFAL):
* `-gbfal` followed by the url or path to GBFAL `data.json` file.  
  
# Element update  
If something gets updated, simply do:  
`python updater.py -update THE_ELEMENT_ID` to update the element.  
Add `-download` before if you want/need to download its new assets.  
  
# Exceptions/Quirks  
* Some skins (and rarely some seasonal characters) reuse the Charge Attack or Attack effect of another version.  
As there is no way to programmatically find it, at least currently, you'll have to set those exceptions manually in `updater.py`.  
First, you'll likely get a `No special set` error for characters without corresponding charge attack.  
Second, characters without corresponding attack effect will use a default one.  
To fix any of those two issues, find out the ID of the Character that it's supposed to borrow the files from and open `update.py` and look for `PATCHES` around line 31.  
Simply add a new line in the list (don't forget the comma in the previous one) such as it looks that way:
`"ID_CHARA_WITHOUT_OUGI" : ("ID_OUGI_BORROWED_FROM", "", "")`.  
Example:  
`"3040232000": ("3040158000", "", "")`.  
Summer Alexiel (3040232000) is using Grand Alexiel (3040158000) Charge Attack files.  
The second value (`''`) is, in the future, if a character/skin ends up borrowing a CA with a weird naming convention, such as a full screen Charge Attack.  
Those have an extra `_s2` or `_s3` in their file names, and will need to be specified at that location.  
The third value (`''`) is for the matching attack effect.  
In a similar fashion, classes must be set in the code too.  
Just look at the full list in `updater.py` for more examples.  
Once the change is done, run `updater.py` again for the concerned characters.  
  
* In a similar ways, some summons share assets, such as the Arcarum ones.  
The groups must be defined in the `SHARED_SUMMONS` variable.  
  
* Classes also requires to be hardcoded (in `class_lookup` and `class_ougi`).  
`class_lookup` requires the class main ID and a list of its secondary ID along with its proficiencies IDs.  
For example, `150201` and `dkf` are Dark Fencer IDs. It also uses a sword `sw` and dagger `kn`. So the result is `"150201": ["dkf_sw", "dkf_kn"],`.  
`class_ougi` is mostly for skins. Some skins use weapon assets for their charge attacks. Those weapons are usually not playable.  
Using the `-gbfal` flag can fill those gaps for you, if you have access to an up-to-date version.  
  
There are other weird exceptions that I probably forgot, I recommend trying to read the code for more infos.  
  
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
* index.js  
* player.js  
* script.js  
  
And possibly more that I forgot.  
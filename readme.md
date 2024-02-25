# GBF Animation Player  
Web page to play GBF animations.  
Click [Here](https://mizagbf.github.io/GBFAP) to access it.  
Based and modified from the chinese wiki player.  
  
# Setup  
Two possible setups:  
  
### You want to host the assets  
Be sure to have a lot of disk spaces.  
Note: In both case, you can edit the `Game` variable around line 81 to point towards the proper folder.
  
1. Copy this repo.  
2. Run `python updater.py -downloadall` to download all the assets. (The script will ask you to confirm. You can also turn off changes to data.json when asked.).  
3. Change line 2 of `index.js`: From `const LOCAL = false;` to `const LOCAL = true;`  
4. Still in `index.js`, you might need to change line 90 to something else (`/` if your html is at the root of your domain, else the path to it).  
  
You can now host the project in the way you prefer.  
You only need to use `-init` and `-force` once. Simply do `python updater.py -download` for future updates.  
  
Note: Some files will still be accessed remotely (like sound files, which aren't supported by `updater.py`).  
  
### You DON'T want to host the assets  
1. Copy this repo.  
2. Setup your [CORS Proxy](https://github.com/Rob--W/cors-anywhere) of choice to be able to fetch the assets directly from GBF.  
3. Change line 3 of `index.js` with the address of your proxy.  
  
You can now host the project in the way you prefer.  
Simply do `python updater.py` for future updates.  
  
# The updater  
`updater.py` is used to update `json/data.json` with new elements.
It's currently compatible with characters (R, SR, SSR, Skins), summons, weapons, enemies and classes released up to today.  
  
There are three main possible command lines:
* `python updater.py` to simply retrieve new/unindexed elements.  
* `python updater.py -update list_of__id` to manually update the specified elements, in case they got an uncap for example (You don't need to specify the character style for characters).  
* `python updater.py -downloadall` will download all the required assets (ONLY USE IT IF YOU'RE PLANNING TO SELF-HOST THE ASSETS).  
  
You can then add the following options before for more control (except `-downloadall`, it ignores everything):
* `-force` will force an indexation and, as a result, rebuild its JSON data (No need to use with `-update`).  
* `-download` will download and save the assets in their respective folders.  
* `-init` will download the assets needed for the demo enemy and the dummy attack effect, among other things. This command isn't needed if you don't host the assets.  
* `-nochange` to not update the `changelog.json` recently updated element list.  
  
And the following if you're using [GBFAL](https://github.com/MizaGBF/GBFAL):
* `-gbfal` followed by the url or path to GBFAL `data.json` file. You can also set it to `https://raw.githubusercontent.com/MizaGBF/GBFAL/main/json/data.json`.  

  
# Exceptions/Quirks  
* Some skins and characters reuse the Charge Attack or Attack effect of another version.  
As there is no way to programmatically find it, at least currently, you'll have to set those exceptions manually in `updater.py`.  
First, you'll likely get a `No special set` error for characters without corresponding charge attack.  
Second, characters without corresponding attack effect will use a default one.  
To fix any of those two issues, find out the ID of the Character that it's supposed to borrow the files from and open `update.py` and look for `PATCHES` around line 80.  
Simply add a new line in the list if the ID of the character isn't present such as it looks that way:
`"ID_CHARA_WITHOUT_OUGI" : ("ID_OUGI_BORROWED_FROM", "ID_ATTACK_BORROWED_FROM"),`.  
Example:  
`"3040232000": ("3040158000_UU", "phit_3040158000"),`.  
Summer Alexiel (3040232000) is using Grand Alexiel (3040158000) Charge Attack and Attack files.  
`_UU` indicates tells it to use the corresponding level of uncap but you can also set a specific level (like `01`, `02`, `03`, etc...).  
You can also add `FF` to use the current form in the file name.  
Just look at the full list in `updater.py` for more examples.  
Once the change is done, run `updater.py` again for the concerned characters.  
  
* In a similar way, some summons share assets, such as the Arcarum ones.  
The groups must be defined in the `SHARED_SUMMONS` variable.  
  
* Classes also requires to be hardcoded (in `class_lookup` and `class_ougi`).  
`class_lookup` requires the class main ID and a list of its secondary ID along with its proficiencies IDs.  
For example, `150201` and `dkf` are Dark Fencer IDs. It also uses a sword `sw` and dagger `kn`. So the result is `"150201": ["dkf_sw", "dkf_kn"],`.  
`class_ougi` is mostly for skins. Some skins use weapon assets for their charge attacks. Those weapons are usually not playable.  
Using the `-gbfal` flag can fill those gaps for you, if you have access to an up-to-date version.  
  
* Weapons with multiple versions (currently, only the Dark Opus are affected) are separate based on their uncaps. Example `1040212500`, `1040212500_02` and `1040212500_03`.  
This is due to the fact the game doesn't support two different weapons loaded at the same time on different entities.  
  
There are other weird exceptions that I probably forgot, I recommend trying to read the code for more infos.  
  
# Additional Notes  
Downloaded assets are saved in the following folders:  
* Manifests in model/manifest/
* CJS in cjs/
* Sheets in img/sp/cjs/
  
The following files are modified/customized:  
* view/cjs_npc_demo.js (has been mostly deobfuscated and heavily modified)  
* model/cjs-loader.js (added some customization related to file paths)  
* model/manifest-loader.js (the loading indicator is updated here)  
* lib/sound.js (to play SFX)  
* lib/raid/extension.js (mostly empty, it serves as a placeholder)  
  
Along with:  
* index.js (the page main script)  
* player.js (loaded in second, add the player to the HTML)  
* script.js (loaded in third, contains functions to load the assets)  
  
And possibly more that I forgot.  
  
# Possible Improvements  
* Make a HTML demo to make the project easily embeddable on any website.  
* Reverse engineer GBF's `lib/raid/extension.js` to make the player more faithful to in-game raid animations.  
  
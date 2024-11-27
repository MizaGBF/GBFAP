# GBF Animation Player  
[![pages-build-deployment](https://github.com/MizaGBF/GBFAP/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/MizaGBF/GBFAP/actions/workflows/pages/pages-build-deployment)  
Web page to play GBF animations.  
Click [Here](https://mizagbf.github.io/GBFAP) to access it.  
Based and modified from the chinese wiki player.  
  
### Updater Requirements  
* Python 3.11.
* Run `pip install -r requirements.txt` in a command prompt.
* See [requirements.txt](https://github.com/MizaGBF/GBFAP/blob/master/requirements.txt) for a list of third-party modules.  
  
# Setup  
There are two possible ways to host this project.  
  
### First, as it's currently is:
1. Copy this repo.  
2. Setup your [CORS Proxy](https://github.com/Rob--W/cors-anywhere) of choice to be able to fetch the assets directly from GBF. I have one for that purpose [here](https://github.com/MizaGBF/GBFCP).  
3. Change line 3 of `index.js` with the address of your proxy.  
4. **If needed**, change line 98 of `index.js` (`testUri`) to redirect to `assets/test.png` or something else. This endpoint is used to test if the Proxy is alive and must return a HTTP 200 code. The corresponding asset is present in the `assets/folder` if needed.  
  
### The second way, is to host the assets along with the project:
0. Prepare a lot of free space (a few ten of GB).  
1. Copy this repo.  
2. Run `python updater.py -download` to download all the assets. (The script will ask you to confirm by typying `yes`).  
3. Change line 2 of `index.js`: From `const LOCAL = false;` to `const LOCAL = true;`  
  
Note: This method isn't fully tested, you might encounter bugs. You'll also need to run `python updater.py -download` after every update but it won't re-download what's already on disk.  
  
# Additional Setup  
You can tinker with the `Game` variable around the line 80 of `index.js` if you need to change the path of asset types.  
If you need to remove the proxy testing mentionned above, look for the function called `successLoading` in  `index.js` and modify it to look this way:
```javascript
function successLoading(id)
{
    startplayer(id);
}
```  
  
# The updater  
`updater.py` is used to update `json/data.json` with new elements.
It's currently compatible with characters (R, SR, SSR, Skins), summons, weapons, enemies and classes released up to today.  
  
There are three main possible command lines:
* `python updater.py -run` to simply retrieve new/unindexed elements.  
* `python updater.py -update list_of__id` to manually update the specified elements, in case they got an uncap for example (You don't need to specify the character style for characters).  
* `python updater.py -download` will download all the required assets not present on disk (ONLY USE IT IF YOU'RE PLANNING TO SELF-HOST THE ASSETS).  
  
You can then add the following options before for more control:
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
### Download  
Downloaded assets are saved in the following folders:  
* Manifests in model/manifest/
* CJS in cjs/
* Sheets in img/sp/cjs/
  
### Main files  
* index.js (the page main script)  
* player.js (loaded in second, add the player to the HTML)  
* script.js (loaded in third, this is where asset loading starts)  
  
### Changing the canvas/window size  
Values must be changed at the top, in the following files:
* player.js  
* view/cjs_npc_demo.js  
  
### createjs patch  
The project uses a more recent version of createjs and must be hotfixed to work with GBF animation files.  
It can be found in `index.js`, look for `hotfix_createjs`.  
  
### Cross-Origin  
When fetching assets from an external source, the Cross-Origin value must be set in `hotfix_createjs` (see above).  
It's automatically set if you set `const LOCAL = false;` in `index.js` (see at the top of this readme for details).  
  
### Others  
`tester.py` is used to look for specific calls in animation files, to check for crashes.  
You can use one of the `server` scripts to start a Python HTTP Server and test the project locally in your web browser. Tweaks might be needed to make the asset fetching works.  
  
  
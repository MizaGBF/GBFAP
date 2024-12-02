# GBF Animation Player  
[![pages-build-deployment](https://github.com/MizaGBF/GBFAP/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/MizaGBF/GBFAP/actions/workflows/pages/pages-build-deployment)  
Web page to play Granblue Fantasy Animations.  
Click [Here](https://mizagbf.github.io/GBFAP) to access it.  
Originally based and modified from the [chinese wiki](https://gbf.huijiwiki.com/wiki/%E9%A6%96%E9%A1%B5) animation player, itself based on the [Granblue Fantasy Gacha page preview](https://game.granbluefantasy.jp/#gacha/selected).  
> [!IMPORTANT]  
> It can, in theory, play every animations of the game but the scope of this project has been narrowed to:  
> Characters (including their outfits), Summons, Weapons, Main characters (classes and outfits), Enemies and some Partner Characters (from events)  
  
### Updater Requirements  
* Python 3.11.
* Run `pip install -r requirements.txt` in a command prompt.
* See [requirements.txt](https://github.com/MizaGBF/GBFAP/blob/master/requirements.txt) for a list of third-party modules.  
  
# Hosting  
There are two possible ways to host this project.  
  
### With a Proxy:  
> [!TIP]  
> This is the current way I'm using to host it on Github Pages.  
  
With this method:  
- No GBF Assets is hosted.  
- A proxy server is used to work around [CORS policies](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS).  
  
**Pros:**  
- Requires little effort to maintain.  
- Little bandwidth and space requirement for the page itself.  
  
**Cons:**  
- Requires an extra server.  
- Adds extra latency.  
- The bandwidth cost will take effect on this server.  
  
**Setup:**  
1. Copy/Clone this repo.  
2. Setup your CORS Proxy of choise. Make sure its own CORS policy only allows access from your website.  [CORS Anywhere](https://github.com/Rob--W/cors-anywhere) is an option, or you can use my custom solution, [GBFCP](https://github.com/MizaGBF/GBFCP) (Be sure to modify its CORS Url).  
3. Change line 3 of `index.js` with the address of your proxy.  
4. **If needed**, change, around the line 97 of `index.js`, the value `testUri`. It's expected to redirect to `assets/test.png` or something else. This endpoint is used to test if the Proxy is alive and must return a HTTP 200 code.

### Without a Proxy:  
> [!CAUTION]  
> Prepare at least 20 GB of disk space, to be safe.  
  
**Pros:**  
- Faster and not reliant on GBF being available (It will persist even after an eventual EoS).  
  
**Cons:**  
- Requires lot of disk space.  
- **Sound files aren't downloaded by the updater, currently**.  
- Not fully tested.  
  
**Setup:**  
1. Copy/Clone this repo.  
2. Run `python updater.py -download` to download all the assets. (The script will ask you to confirm by typying `yes`).  
3. Change line 2 of `index.js` from `const LOCAL = false;` to `const LOCAL = true;`  
4. **If needed**, change, around the line 81 of `index.js`, the various Uris. `testUri` in particular must redirect to `assets/test.png` or something else.  
  
> [!CAUTION]  
> You'll need to run `python updater.py -download` after every update, but it won't re-download what's already on disk.  
> This also means if, for whatever reason, an old file is updated on the game side, the updater won't update it.  
  
### For local use:  
> [!TIP]  
> This one is for testing or use locally on your own computer.  
  
1. Copy/Clone this repo, along [GBFCP](https://github.com/MizaGBF/GBFCP). Install the python requirements of the later.  
2. Change line 3 of `index.js` to `const CORS = 'http://localhost:8001/'`.  
3. Start [GBFCP](https://github.com/MizaGBF/GBFCP) with the command `python app.py -debug` to run it in local mode.  
4. Start a server in this project folder (you can use one of the server scripts).  
5. Go to [http://localhost:8000/](http://localhost:8000/) to access your local copy of GBFAP.  
  
# Additional Setup  
You can tinker with the `Game` variable around the line 80 of `index.js` if you need to change the path of asset types.  
If you wish to remove the proxy testing mentionned above, look for the function called `successLoading` in  `index.js` and modify it to look this way:
```javascript
function successLoading(id)
{
    startplayer(id);
}
```  
  
# The updater  
`updater.py` is used to update `json/data.json` with new elements.
It's currently compatible with most characters (R, SR, SSR, Skins), summons, weapons, enemies and classes released up to today.  
  
There are three main possible command lines:
* `python updater.py -run` to simply retrieve new/unindexed elements.  
* `python updater.py -update list_of__id` to manually update the specified elements, in case they got an uncap for example (You don't need to specify the character style for characters).  
* `python updater.py -download` will download all the required assets not present on disk (Only use it if you're planning to host the assets).  
  
You can then add the following options before the ones above for more control:
* `-nochange` to not update the `changelog.json` recently updated element list.  
  
And the following if you're using [GBFAL](https://github.com/MizaGBF/GBFAL):
* `-gbfal` followed by the url or path to GBFAL `data.json` file. You can also set it to `https://raw.githubusercontent.com/MizaGBF/GBFAL/main/json/data.json`.  
  
It'll use the [GBFAL](https://github.com/MizaGBF/GBFAL) `data.json` file to update the list of backgrounds, wiki links and also classes if possible.
  
# Exceptions/Quirks  
* Missing animations  
Some skins/characters/weapons/weapons reuse animations of another version and, as a result, don't have their own.  
You'll likely get an error message to signal those (for charge attacks and attack effects, at least), during the update process.  
The solution is to manually set exceptions in `updater.py`, in their corresponding sections:  
- `PATCHES` is for ID substitutions of certain elements (used by characters/skins). The format is `"ID_CHARA_WITHOUT_OUGI" : ("ID_OUGI_BORROWED_FROM", "ID_ATTACK_BORROWED_FROM"),`.  
- `ID_SUBSTITUTE` is also for ID substitutions but on a global scope (used by characters/skins/weapons). The format is `"ID_WITHOUT_ANIMATION" : "ID_WITH_ANIMATION"`.  
- `SHARED_SUMMONS` is a similar system but for summon sharing animations. They must be grouped together in a set: `set(["ID_1", "ID_2", ..., "ID_N"])`.  
  
* Classes  
Classes also requires to be hardcoded to be updated properly (in `class_lookup` and `class_ougi`, in the `__init__` function).  
- `class_lookup` requires the class main ID and a list of its secondary ID along with its proficiencies IDs.  
For example, `150201` and `dkf` are Dark Fencer IDs. It also uses a sword `sw` and dagger `kn`. So the result is `"150201": ["dkf_sw", "dkf_kn"],`.  
- `class_ougi` is mostly for skins. Some skins have weapon assets for their charge attacks. Those weapons are usually not playable.  
  
> [!TIP]  
> To avoid duplicates, only the first proficiency of a class is used in the player itself.  
  
> [!TIP]  
> Using the `-gbfal` flag should remove the needs to manually hardcore the class details.  
  
* Multiple version weapons.  
(Currently, only the Dark Opus are affected)  
Weapons with multiple versions are separated based on their uncaps. Example `1040212500`, `1040212500_02` and `1040212500_03`.  
This is due to the fact the game doesn't support two different weapons loaded at the same time on different entities.  

As another exception, the skin **Honing Seeker: Nova** and its upgrades also work this way, to avoid a few headhaches related to its ID.  
  
# Additional Notes  
### Download Folders  
Downloaded assets are saved in the following folders:  
* Manifests in model/manifest/  
* CJS animations in cjs/  
* Spritesheets in img/sp/cjs/  
* Raid backgrounds in img/sp/raid/ (Custom backgrounds are also inside, be careful if you want to delete the folder)  
  
### Program logic  
Here's a simplified view of the file interactions:  
![Flow](https://raw.githubusercontent.com/MizaGBF/GBFAP/main/assets/readme/01.png)  
  
* `index.js` is the page main script. This is where the page logic is handled (index, tabs, bookmarks, etc...).  
* `script.js` handles the loading.  
* `player.js` adds the player HTML and handles the various buttons/controls under the player. Those interact with `view/cjs_npc_demo.js` when needed.  
* `view/cjs_npc_demo.js` is the player logic. There is one loaded instance by version (uncaps, etc...) of the element.  
  
### Changing the canvas/window size  
The following must be changed:  
* `player.js`: `CANVAS_SIZE` near the top. It's size of the underneath canvas, i.e. the internal resolution, if you will.  
* `view/cjs_npc_demo.js`: Also `CANVAS_SIZE` near the top. It must be the same as in `player.js`.  
* `css/style.css`: Under canvas-container (The player size, what's visible on the page) and cjs-npc-demo (Must be equal to `CANVAS_SIZE`).  
  
### createjs patch  
The project uses a more recent version of [CreateJS](https://createjs.com/) than GBF, and must be hotfixed to work with GBF animation files.  
It can be found in `index.js`, look for `hotfix_createjs`.  
There is also a small change included to allow the bounding box feature.  
  
### Cross-Origin  
When fetching assets from an external source (such as a Proxy), the Cross-Origin value is set to `anonymous` in `hotfix_createjs`.  
It's automatically set if you set `const LOCAL = false;` in `index.js` but, if you encounter cross-origin issues with `const LOCAL = true;`, this is where to look for.  
  
### Others  
* `tester.py` is used to look for specific calls in animation files, to check for crashes.  
* You can use one of the `server` scripts to start a Python HTTP Server and test the project locally in your web browser. Tweaks might be needed to make the asset fetching works.  
  
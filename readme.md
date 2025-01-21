# GBF Animation Player  
[![pages-build-deployment](https://github.com/MizaGBF/GBFAP/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/MizaGBF/GBFAP/actions/workflows/pages/pages-build-deployment)  
Web page to play Granblue Fantasy Animations.  
Click [Here](https://mizagbf.github.io/GBFAP) to access it.  

# Front-End  
It's composed of a single HTML page, plus the javascript, CSS and various assets.  
This section will provide informations on this part of the project.  
  
> [!NOTE]  
> The page is static and is currently hosted on [Github Pages](https://pages.github.com/), but it can technically be hosted anywhere.  
  
## General informations  
  
This animation player is originally based and modified from the [chinese wiki](https://gbf.huijiwiki.com/wiki/%E9%A6%96%E9%A1%B5) animation player, itself based on the [Granblue Fantasy Gacha page preview](https://game.granbluefantasy.jp/#gacha/selected).  
  
It can, in theory, play every animations of the game but the scope of this project has been narrowed to Characters (including their outfits), Summons, Weapons, Main characters (classes and outfits), Enemies and some Partner Characters (from events).  
  
## Asset Folder structure  
> [!NOTE]  
> You can ignore this part if you plan to use a CORS Proxy.  
  
Downloaded assets are saved in the following folders, mimicking GBF folder structure:  
* Manifests in `model/manifest/`  
* CJS animations in `cjs/`  
* Spritesheets in `img/sp/cjs/`  
* Raid backgrounds in `img/sp/raid/` (Custom backgrounds are also inside, be careful if you want to delete the folder)  
* Audio files in `audio/`  
  
## Program logic  
Here's a simplified view of the file interactions:  
![Flow](https://raw.githubusercontent.com/MizaGBF/GBFAP/main/assets/readme/01.png)  
  
* `index.js` is the page main script. This is where the page logic is handled (index, tabs, bookmarks, etc...).  
* `script.js` handles the loading.  
* `player.js` adds the player HTML and handles the various buttons/controls under the player. Those interact with `view/cjs_npc_demo.js` when needed.  
* `view/cjs_npc_demo.js` is the player logic. There is one loaded instance by version (uncaps, etc...) of the element.  
  
## Changing the canvas/window size  
The following must be changed:  
* In `player.js`: `CANVAS_SIZE` near the top. It's size of the underneath canvas, i.e. the internal resolution, if you will.  
* In `view/cjs_npc_demo.js`: Also `CANVAS_SIZE` near the top. It must be the same as in `player.js`.  
* In `css/style.css`: Under `canvas-container` (The player size, what's visible on the page) and `cjs-npc-demo` (Must be equal to `CANVAS_SIZE`).  
  
## createjs patch  
The project uses a more recent version of [CreateJS](https://createjs.com/) than GBF, and must be hotfixed to work with GBF animation files properly.  
It can be found in `index.js`, look for `hotfix_createjs`.  
There is also a small change included to allow the bounding box feature.  
  
## Cross-Origin  
When fetching assets from an external source (such as a Proxy), the Cross-Origin value is set to `anonymous` in `hotfix_createjs`.  
It's automatically set if you set `const LOCAL = false;` in `index.js` but, if you encounter cross-origin issues with `const LOCAL = true;`, this is where to look for.  
  
# Back-End  
Two of the JSON files in the `json` folder are the core of the system:  
- [changelog.json](https://github.com/MizaGBF/GBFAP/blob/main/json/changelog.json) is the first file loaded upon opening the page. It contains the timestamp of the last update and a list of recently updated elements.  
- [data.json](https://github.com/MizaGBF/GBFAP/blob/main/json/data.json) is loaded next and contains the data used to kickstart the player for a given element.  
  
Others JSON files are used for debug or update purpose:  
- [manual_constants.json](https://github.com/MizaGBF/GBFAP/blob/main/json/manual_constants.json) contains constant values used by the Updater, loaded and set on boot. They are in this separate file for maintainability and clarity.  
  
More JSON files not specified here might appear in this folder, for development or testing purpose.  
  
## [updater.py](https://github.com/MizaGBF/GBFAP/blob/main/updater.py)  
This script is in charge of updating the JSON files.  

### Updater Requirements  
* Python 3.13.
* Run `pip install -r requirements.txt` in a command prompt.
* See [requirements.txt](https://github.com/MizaGBF/GBFAP/blob/master/requirements.txt) for a list of third-party modules.  
  
### Usage
```
GBFAP Updater v3.9
usage: updater.py [-h] [-r] [-u UPDATE [UPDATE ...]] [-d] [-nc] [-al PATH]

Animation Updater v3.9 for GBFAP https://mizagbf.github.io/GBFAP/

options:
  -h, --help            show this help message and exit

primary:
  main commands.

  -r, --run             search for new content.
  -u, --update UPDATE [UPDATE ...]
                        update given elements.
  -d, --download        download all assets. Time and Disk space consuming.

settings:
  commands to alter the update behavior.

  -nc, --nochange       disable update of the New category of changelog.json.
  -al, --gbfal PATH     import data.json from GBFAL.
```  
  
> [!TIP]  
> For an **"every day" use case**, you'll only need to:  
> Use `-r` after game updates.  
> Use `-u` for element uncaps or if an older NPC got new arts, with their IDs.  
> Use `-d` **if you're hosting the assets** to download the latest ones.  
  
> [!NOTE]  
> It's recommended to use this project in combination with [GBFAL](https://github.com/MizaGBF/GBFAL), using the `-al` argument.  
> If you don't wish to, you can still use `-al` with an url instead of a path.  
> `-al https://raw.githubusercontent.com/MizaGBF/GBFAL/refs/heads/main/json/data.json` should work just fine.  
  
# Hosting  
There are a few possible ways to host this project.  
  
### With a Proxy:  
> [!TIP]  
> This is the current way it's hosted on Github Pages.  
  
With this method:  
- No GBF Assets are hosted.  
- A proxy server is used to work around [CORS policies](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS).  
  
**Pros:**  
- Requires little effort to maintain.  
- Little bandwidth and space requirement for the page itself.  
  
**Cons:**  
- Requires an extra server to act as a CORS Proxy between the page and GBF.  
- Adds extra latency as a result.  
- The bandwidth cost will take effect on the CORS Proxy server.  
  
**Setup:**  
1. Copy/Clone this repo.  
2. Setup your CORS Proxy of choise. Make sure its own CORS policy only allows access from your website.  [CORS Anywhere](https://github.com/Rob--W/cors-anywhere) is an option, or you can use my custom solution, [GBFCP](https://github.com/MizaGBF/GBFCP) (Be sure to modify its CORS Url).  
3. Change line 3 of `index.js` with the address of your proxy.  
4. **If needed**, change, around the line 97 of `index.js`, the value `testUri`. It's expected to redirect to `assets/test.png` or something else. This endpoint is used to test if the Proxy is alive and must return a HTTP 200 code.

### Without a Proxy:  
> [!CAUTION]  
> Prepare at least 30~40 GB of disk space, to be safe (I might even be underestimating it).  
  
**Pros:**  
- Faster and not reliant on GBF being available (It will persist even after an eventual EoS).  
  
**Cons:**  
- Requires lot of disk space.  
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
  
# Exceptions/Quirks  
* **Missing animations**  
Some skins/characters/weapons/weapons reuse animations of another version and, as a result, don't have their own.  
You'll likely get an error message to signal those (for charge attacks and attack effects, at least), during the update process.  
  
You can manually set exceptions in `json/manual_constants.json`, in the corresponding sections:  
- `PATCHES` is for ID substitutions of certain elements (used by characters/skins). The format is `"ID_CHARA_WITHOUT_OUGI" : ["ID_OUGI_BORROWED_FROM", "ID_ATTACK_BORROWED_FROM"]`.  
- `ID_SUBSTITUTE` is also for ID substitutions but on a global scope (used by characters/skins/weapons). The format is `"ID_WITHOUT_ANIMATION" : "ID_WITH_ANIMATION"`.  
- `SHARED_SUMMONS` is a similar system but for summon sharing animations. They must be grouped together in: `["ID_1", "ID_2", ..., "ID_N"]`.  
  
* **Classes**  
Classes requires to be set in `json/manual_constants.json` under the **following**:  
- `CLASS_LIST` requires the class main ID and a list of its secondary ID along with its proficiencies IDs.  
For example, `150201` and `dkf` are Dark Fencer IDs. It also uses a sword `sw` and dagger `kn`. So the result is `"150201": ["dkf_sw", "dkf_kn"],`.  
- `CLASS_WEAPON_LIST` is mostly for skins. Some skins have weapon assets for their charge attacks. Those weapons are usually not playable.  
  
> [!TIP]  
> To avoid duplicates, only the first proficiency of a class is used in the player itself.  
  
> [!TIP]  
> Using the `-al` flag should remove the needs to manually update the class details, but this solution isn't perfect.  
  
* **Multiple version weapons**  
(Currently, only the Dark Opus are affected)  
Weapons with multiple versions are separated based on their uncaps. Example `1040212500`, `1040212500_02` and `1040212500_03`.  
This is due to the fact the game doesn't support two different weapons loaded at the same time on different entities.  
  
* **Unite & Fight skin**  
The skin **Honing Seeker: Nova** and its upgrades are also separated, to avoid a few headhaches related to their ID.  
The related IDs must be set in `json/manual_constants.json`, under `UNIQUE_SKIN`.  
  
# Others  
* `tester.py` is used to look for specific calls in animation files, to check for crashes.  
* You can use one of the `server` scripts to start a Python HTTP Server and test the project locally in your web browser. Tweaks might be needed to make the asset fetching works.  
  
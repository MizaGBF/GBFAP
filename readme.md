# GBF Animation Player  
[![pages-build-deployment](https://github.com/MizaGBF/GBFAP/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/MizaGBF/GBFAP/actions/workflows/pages/pages-build-deployment)  
Web page to play Granblue Fantasy Animations.  
Click [Here](https://mizagbf.github.io/GBFAP) to access it.  
  
Older versions of the Animation Players were originally based and modified from the [chinese wiki](https://gbf.huijiwiki.com/wiki/%E9%A6%96%E9%A1%B5) animation player, itself based on the [Granblue Fantasy Gacha page preview](https://game.granbluefantasy.jp/#gacha/selected).  
  
> [!IMPORTANT]  
> This project reuse data from the [Asset Lookup](https://mizagbf.github.io/GBFAL). As such, if you intend to keep an up-to-date version, it's recommended to also keep an up-to-date version of this other project.  
  
# Front-End  
There are two pages:  
- The main page, `index.html`.   
- The demo page, `demo.html`, for developers interested in integrating the player in another page.  
  
`index.html` is using assets and codes from [GBFML](https://github.com/MizaGBF/GBFML).  
  
> [!NOTE]  
> These pages are static and are currently hosted on [Github Pages](https://pages.github.com/), but it can technically be hosted anywhere.  
  
Three of the JSON files in the `json` folder are also used:  
- [config.json](https://github.com/MizaGBF/GBFAP/blob/main/json/config.json) is the first file loaded upon opening the page. It contains various constants, the layout of the index and settings of the Animation Player.  
- [changelog.json](https://github.com/MizaGBF/GBFAP/blob/main/json/changelog.json) is loaded next. It contains the timestamp of the last update and a list of recently updated elements.  
- [data.json](https://github.com/MizaGBF/GBFAP/blob/main/json/data.json) is loaded along with config.json and contains the asset catalog and more.  
  
# Back-End  
Another JSON file is used for update purposes:  
- [manual_constants.json](https://github.com/MizaGBF/GBFAP/blob/main/json/manual_constants.json) contains constant values used by the Updater, loaded and set on boot. They are in this separate file for maintainability and clarity.  
  
More JSON files not specified here might appear in this folder, for development or testing purpose.  
  
# Folder Structure  
The project requires [GBFML](https://github.com/MizaGBF/GBFML) to be alongside it.  
It can also benefit from having [GBFAL](https://github.com/MizaGBF/GBFAL) too.  
The folder structure on the server is as such:  
```
Root Folder/
├── GBFAP/
├── GBFML/
└── GBFAL/ (Optional)
```  
If you wish to run a test server with Python for example, uses `python -m http.server` in the Root Folder.  
  
# Requirements  
Some third party libraries used by GBF are also required by the player as a result.  
You can find them in the `js/vendor` folder.  
They are:  
- [Createjs](https://createjs.com/).  
- [RequireJS](https://requirejs.org/).  
- [Backbone.js](https://backbonejs.org/).  
- [Underscore.js](https://underscorejs.org/).  
  
Additionaly, the player in its purest form as presented in the [demo.html](https://github.com/MizaGBF/GBFAP/blob/main/demo.html) file uses GBFML [js/util.js](https://github.com/MizaGBF/GBFML/blob/main/js/util.js).  
  
  
# Tools  
The `tools` folder got some scripts intended for debugging:  
- `list_name.py` will go through all main animations to try to attempt to make a list of animation names, to find missing ones. Manual checking is recommended after.  
- `tester.py` go through all animations to look for specific terms, to ensure player compability.  
  
Those scripts must run from inside the folder.  
  
## [updater.py](https://github.com/MizaGBF/GBFAP/blob/main/updater.py)  
This script is in charge of updating the JSON files.  
> [!CAUTION]  
> Using it can be time and bandwidth consuming.  
  
### Updater Requirements  
* Python 3.13.
* Run `pip install -r requirements.txt` in a command prompt.
* See [requirements.txt](https://github.com/MizaGBF/GBFAP/blob/master/requirements.txt) for a list of third-party modules.  
  
### Usage
```console
GBFAP Updater v5.0
usage: updater.py [-h] [-r] [-u UPDATE [UPDATE ...]] [-c] [-d [DOWNLOAD ...]] [-nc] [-fs]
                  [-al PATH] [-dg]

Animation Updater v5.0 for GBFAP https://mizagbf.github.io/GBFAP/

options:
  -h, --help            show this help message and exit

primary:
  main commands to update the data.

  -r, --run             search for new content.
  -u, --update UPDATE [UPDATE ...]
                        update given elements.
  -c, --classes         update new classes.
  -d, --download [DOWNLOAD ...]
                        download all assets. Can specific IDs. Time and Disk space consuming.

settings:
  commands to alter the updater behavior.

  -nc, --nochange       disable update of the New category of changelog.json.
  -fs, --fixsummon      update all summons default classes.
  -al, --gbfal PATH     import data.json from GBFAL.
  -dg, --debug          enable the debug infos in the progress string.
```  
  
> [!TIP]  
> For an **"every day" use case**, you'll only need to:  
> Use `-r` after game updates.  
> Use `-u` for element uncaps or if an older NPC got new arts, with their IDs.  
> It's recommended to add `-al` followed by the path or url towards a [GBFAL data.json](https://github.com/MizaGBF/GBFAL/blob/main/json/data.json), as it will automatically detect uncaps and fetch other datas from it.  
  
### Pause  
You can pause `updater.py` with a simple `CTRL+C`. It opens a CLI letting you save, exit or resume with text commands.  
  
### Task System  
The Updater uses wrappers around Asyncio Tasks to execute code.  
Tasks/Functions calls can be queued into the Task Manager. There are 5 queues available, the first one having the highest priority.  
The Task Manager itself won't run more than 90 Tasks concurrently (The number itself can be changed in the code). In the same way, the Updater is limited to 80 concurrent requests.  
When a Task or the Updater judges more Task are needed, they will be queued too. That's why the number of Tasks will likely grow when executing the Updater.  
It's designed to limit the memory usage while keeping the Updater always busy, to not have idle/dead times.  
  
### Additional Notes  
- For testing, just run `python-m http.server` in a terminal, in the parent folder of the project, with [GBFML](https://github.com/MizaGBF/GBFML) on the side.  
- [GBFCP](https://github.com/MizaGBF/GBFCP) is the CORS Proxy used to fetch assets on the Github Page version.  
  
# Hosting  
You might be interested in hosting your own copy.  
There are three configurations provided in the included [config.json](https://github.com/MizaGBF/GBFAP/blob/main/json/config.json) file for you to play with.
**You can select which configuration to use by change the value of `use_game_config`**.  
  
> [!IMPORTANT]  
> The sprite sheets cross-origin is automatically set to `Anonymous` if `use_game_config` is different from `local`. CTRL+F `Anonymous` to find the relevant part in `js/loader.js` if you need to change this behavior.  
  
### With a CORS Proxy  
> [!TIP]  
> This is the current way it's hosted on Github Pages.  
  
The name of the configuration is `proxy`.  
  
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
  
> [!NOTE]  
> Audio assets are still fetched from the official servers in this configuration.  
  
**Setup:**  
1. Copy/Download/Clone this repo.  
2. Setup your CORS Proxy of choise. Make sure its own CORS policy only allows access from your website. [CORS Anywhere](https://github.com/Rob--W/cors-anywhere) is an option, or you can use my custom solution, [GBFCP](https://github.com/MizaGBF/GBFCP) (Be sure to modify its CORS Url).  
3. Change the `corsProxy` in the configuration to the address of your proxy.  
4. If you aren't using [GBFCP](https://github.com/MizaGBF/GBFCP), you might need to change `testUri` to another path. Any file the Proxy is able to fetch is fine. This is to test if the Proxy is working. If you don't need it, set it to null.  
  
### Hosting the Assets  
> [!CAUTION]  
> Prepare a lot of disk space. I don't know how much, at least 30~40 GB, if not more.  
  
The name of the configuration is `local`.  
  
**Pros:**  
- Faster and not reliant on GBF being available (It will persist even after an eventual EoS).  
  
**Cons:**  
- Requires lot of disk space.  
  
**Setup:**  
1. Copy/Clone this repo.  
2. Run `python updater.py --download` to download all the assets. (The script will ask you to confirm by typing `yes`).  
  
> [!CAUTION]  
> You'll need to run `python updater.py --download` after every update, but it won't re-download what's already on disk.  
> This also means if, for whatever reason, an old file is updated on the game side, the updater won't update it.  
> You can also pass specific IDs after the parameter if you only want to download some.  
  
### For Testing  
> [!TIP]  
> For testing and development purpose.  
  
The name of the configuration is `test`.  
This is what I use during development.  
  
I use it alongside [GBFCP](https://github.com/MizaGBF/GBFCP) using `python app.py -debug` to start a Proxy on port 8001.  
  
If you're interested in tinkering locally with the project, this is the recommended way.  
  
# Player Configuration  
Below is a description of the settings found in `config.json` used by the player.  
You'll find more in the provided [config.json](https://github.com/MizaGBF/GBFAP/blob/main/json/config.json): Those are used by [GBFML](https://github.com/MizaGBF/GBFML) to render the page.  
  
> [!TIP]  
> If you don't want to use a separate file, you can pass the config to `load_player` as a parameter.  
  
### use_game_config  
String.
To set which `game` configuration to use.  
  
### game  
Object.
The possible configutations.
It must contains the Uris used by the game `xjsUri`, `jsUri`, `imgUri`, `soundUri` along with extra ones `externUri` and `bgUri`.  
`corsProxy` must also be present and either be `null` or set to your CORS Proxy url (with a trailing slash).  
Append on the front of your Uris `CORS/` if they must use your proxy.  
  
Finally, there is `testUri`. Set to `null` or to the url of your choice if you need to test if your proxy is alive.  
  
### buttons  
**Optional** Object.  
Use to customize the inner HTML of the Player buttons.  
The key must match the one used by the button.  
The value is the inner HTML.  
  
### disable_bounding_boxes  
**Optional** Boolean.  
If `true`, the bounding box feature will be disabled.  
  
### default_background  
**Optional** String.  
The url of the default background used in normal mode.  
  
### backgrounds  
**Optional** Object.  
Use to add extra buttons to change the background in normal mode.  
The key is the button inner HTML.  
The key is either:  
- `null`. To add a search background button. A callback is required (see further below).  
- A path starting with `./`. It will set the background source to this local file.  
- A path **not** starting with `./`. It will set the background source to this path, appended to `Game.bgUri + "/"`.  
  
### default_mypage_background  
**Optional** String.  
The url of the default background used in MyPage mode.  
  
### mypage_backgrounds  
**Optional** Object.  
Use to add extra buttons to change the background in MyPage mode.  
It works like `backgrounds`.  
  
### mypage_background_allow_mask  
**Optional** Boolean.  
If `true`, a transparent white mask is added to the background, to emulate the look of GBF Home Page.  
  
### audio_disabled  
**Optional** Boolean.  
If `true`, the audio system will be disabled.  
  
### save_setting_key  
**Optional** String.  
If set, settings will be loaded and saved from this key in the browser local storage.  
  
# Player integration  
If you wish to integrate the player in your own page or project, there are a few function callbacks you can define to extend or alter its capabilities:  
- `player_test_start()`: It will be called just before testing the player proxy if the configuration `testUri` is set.  
- `player_test_end(bool)`: It will be called just after testing the player proxy if the configuration `testUri` is set. The parameter is true if the test is a success, false otherwise.  
- `toggle_beep()`: To toggle the beep feedback. If you're using GBFML `js/util.js`, it's defined by default.  
- `beep()`: To play the beep feedback. If you're using GBFML `js/util.js`, it's defined by default.  
- `push_popup()`: To display a text popup. If you're using GBFML `js/util.js`, it's defined by default.  
- `open_background_search(bool)`: Called by the search background button. The parameter is true if it's for a MyPage animation, false otherwise.  
  
# More Information  
The whole code is commented, make sure to take a look.  
Check the [demo](https://github.com/MizaGBF/GBFAP/blob/main/demo.html) page a minimal example of how to include the player in another page.  
  
## Exceptions/Quirks  
  
### Missing Animations  
Some skins/characters/weapons/weapons reuse animations of another version and, as a result, don't have their own.  
You'll likely get an error message to signal those (for charge attacks and attack effects, at least), during the update process.  
  
You can manually set exceptions in `json/manual_constants.json`, in the corresponding sections:  
- `PATCHES` is for ID substitutions of certain elements (used by characters/skins). The format is `"ID_CHARA_WITHOUT_OUGI" : ["ID_OUGI_BORROWED_FROM", "ID_ATTACK_BORROWED_FROM"]`.  
- `ID_SUBSTITUTE` is also for ID substitutions but on a global scope (used by characters/skins/weapons). The format is `"ID_WITHOUT_ANIMATION" : "ID_WITH_ANIMATION"`.  
- `SHARED_SUMMONS` is a similar system but for summon sharing animations. They must be grouped together in: `["ID_1", "ID_2", ..., "ID_N"]`.  
  
### No Charge Attacks  
Some characters must not be set their charge attack files at certain uncap levels.  
They can be set in `NO_CHARGE_ATTACK`, with their corresponding uncap, gender, etc... (for example `"NO_CHARGE_ATTACK":["3040158000_01", "3040158000_02"]`).  
  
### Classes  
Classes requires to be set in `json/manual_constants.json` under the **following**:  
- `CLASS_LIST` requires the class main ID and a list of its secondary ID along with its proficiencies IDs.  
For example, `150201` and `dkf` are Dark Fencer IDs. It also uses a sword `sw` and dagger `kn`. So the result is `"150201": ["dkf_sw", "dkf_kn"],`.  
- `CLASS_WEAPON_LIST` is mostly for skins. Some skins have weapon assets for their charge attacks. Those weapons are usually not playable.  
  
> [!TIP]  
> To avoid duplicates, only the first proficiency of a class is used in the player itself.  
  
> [!TIP]  
> Using the `-al` flag should remove the needs to manually update the class details, but this solution isn't fully tested.  
  
### Evolving outfits  
The skins such as **Honing Seeker: Nova** and their upgrades are also separated, to avoid a few headaches related to their ID and for clarity sake.  
The related IDs must be set in `json/manual_constants.json`, under `UNIQUE_SKIN`.  
  
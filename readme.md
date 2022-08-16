# GBF Animation Player  
Web page to play GBF animations.  
Click [Here](https://mizagbf.github.io/GBFAP) to access it.  
Based and modified from the chinese wiki player.  
  
# Hosting your own  
The project is a simple HTML page.  
All the magic happens in the javascript.  

Beforehand, however, `updater.py` let you index existing characters and create data for them under the `json` folder.  
You need to use it to update the list (after a new character release).  
Possible commands:  
* `python updater.py` to simply update with new characters.  
* `python updater.py -force` to update all characters.  
* `python updater.py -index` to update the index.json file.  
* `python updater.py -update list_of_character_id` to do a manual update (Add the afford mentionned options after the list, if needed).  
  
Additionaly, if you want to host the assets on your server:
* add `-download` (and `-enemy` for the enemy files) to download all assets.  
* go to `anime.js` and change:
```javascript
var Game = {
    xjsUri: 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/VERSION/js',
    jsUri: corsProxy + 'https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/VERSION/js',
    imgUri: corsProxy + 'https://gbfcp.herokuapp.com/https://prd-game-a1-granbluefantasy.akamaized.net/assets_en/img',
    setting: {}
};
```
to
```javascript
var Game = {
    xjsUri: '',
    jsUri: '',
    imgUri: 'img',
    setting: {}
};
```
Or edit the proxy (it's setup to be used only with my version).  
* for characters/skins using another version ougi file, you need to add the subtitution in the `patches` variable of `updater.py`, around line 36.  
Example: `"ID of Character without Ougi" : ("ID of the corresponding Character with Ougi", "_s2 if the corresponding Character file uses it, else nothing")`  
  
  
# Additional Notes  
The following files are modified/customized from what GBF uses:  
* model/cjs-loader.js  
* view/cjs_npc_demo.js  
* lib/sound.js  
* lib/raid/extension.js  
  
Along with:  
* anime.js  
* player.js  
* script.js  
  
# Known Issues  
* [Lina Inverse](https://gbf.wiki/Lina) doesn't work (impossible to find her files and I can't find someone with the character) and has been excluded as a result.  
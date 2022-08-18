# GBF Animation Player  
Web page to play GBF animations.  
Click [Here](https://mizagbf.github.io/GBFAP) to access it.  
Based and modified from the chinese wiki player.  
  
# Hosting your own  
The project is a simple HTML page.  
All the magic happens in the javascript.  

Beforehand, however, `updater.py` let you index existing characters and create data for them under the `json` folder.  
You need to use it to update the list (after a new character release).  
Possible (mutually exclusive) commands:  
* `python updater.py` to simply update with new characters.  
* `python updater.py -index` to update the index.json file.  
* `python updater.py -update list_of_character_id` to do a manual update.  
  
Other options:
* `python updater.py -force` to update all characters regardless of if they are already indexed.  
* `python updater.py -download` to update all characters and download their assets (for a local use).  
* `python updater.py -enemy` to update the enemy and dummy attack effect animation data (add `-download` to also get the effect).  

Those three options can be used together, and after `-update`.  
  
Additionaly, if you want to host the assets on your server:
* add `-download` (and `-enemy` for the enemy files) to download all assets.  
* go to `anime.js`, line 2, and change:
```javascript
var AnimeLocal = false;
```
to
```javascript
var AnimeLocal = true;
```
Or edit the proxy if you are planning to use one (the one used is setup for my version and won't work with another).  
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
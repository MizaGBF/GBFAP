import asyncio
import aiohttp
import json
import re
import os
import sys
import traceback
import time
from datetime import datetime, timedelta, timezone, UTC
from typing import Callable, Any
import argparse

### CONSTANT
VERSION = '4.0'
# limit
MAX_HTTP = 90
MAX_RUN_TASK = 10
# MC classes
CLASS = [
    "csr_sw_{}_01", # sword
    "gzk_kn_{}_01", # dagger
    "aps_sp_{}_01", # spear
    "bsk_ax_{}_01", # axe
    "wrk_wa_{}_01", # staff
    "rlc_gu_{}_01", # gun
    "ogr_me_{}_01", # melee
    "rbn_bw_{}_01", # bow
    "els_mc_{}_01", # harp
    "kng_kt_{}_01" # katana
]
CLASS_DEFAULT_WEAPON = {
    "sw": "1010000000",
    "kn": "1010100000",
    "sp": "1010200000",
    "ax": "1010300000",
    "wa": "1010400000",
    "gu": "1010500000",
    "me": "1010600000",
    "bw": "1010700000",
    "mc": "1010800000",
    "kt": "1010900000"
}
# CDN endpoints
ENDPOINT = "https://prd-game-a-granbluefantasy.akamaized.net/assets_en/"
JS = ENDPOINT + "js/"
MANIFEST = JS + "model/manifest/"
CJS = JS + "cjs/"
IMG = ENDPOINT + "img" # no trailing /
# for mp3 download
MP3_SEARCH = re.compile('"[a-zA-Z0-9_\\/]+\\.mp3"')

# dynamic constants
STYLE_CHARACTER : list[str] = []
PATCHES : dict[str, list[str]] = {}
ID_SUBSTITUTE : dict[str, str] = {}
SHARED_SUMMONS : list[list[str]] = []
UNIQUE_SKIN : list[str] = []
CLASS_LIST : dict[str, list[str]] = {}
CLASS_WEAPON_LIST : dict[str, str] = {}
SUMMON_CLASS : str = ""
# load dynamic constants
try:
    with open("json/manual_constants.json", mode="r", encoding="utf-8") as f:
        globals().update(json.load(f)) # add to global scope
except Exception as e:
    print("Failed to load and set json/manual_constants.json")
    print("Please fix the file content and try again")
    print("".join(traceback.format_exception(type(e), e, e.__traceback__)))
    raise Exception("Failed to load GBFAL Constants")

# progress bar class
class Progress():
    def __init__(self, *, total : int = 9999999999999, silent : bool = True) -> None: # set to silent with a high total by default
        self.silent = silent
        self.total = total
        self.current = -1
        self.start_time = time.time()
        self._prev_percents_ = ("", "")
        if self.total > 0: self.update()

    def progress2str(self) -> str: # convert the percentage to a valid string
        s = "{:.2f}".format(100 * self.current / float(self.total))
        if s == self._prev_percents_[0]: # use cached result if same string
            return self._prev_percents_[1]
        l = len(s)
        while s[l-1] == '0' or s[l-1] == '.': # remove trailing 0 up to the dot (included)
            l -= 1
            if s[l] == '.':
                break
        self._prev_percents_ = (s, s[:l]) # cache the result
        return s[:l]

    def set(self, *, total : int = 0, silent : bool = False) -> None: # to initialize it after a task start, once we know the total
        if total >= 0:
            self.total = total
        self.silent = silent
        if not self.silent and self.total > 0:
            sys.stdout.write("\rProgress: {}%      ".format(self.progress2str()))
            sys.stdout.flush()

    def update(self) -> None: # to call to update the progress text (if not silent and not done)
        if self.current < self.total:
            self.current += 1
            if not self.silent:
                sys.stdout.write("\rProgress: {}%      ".format(self.progress2str()))
                sys.stdout.flush()
                if self.current >= self.total:
                    diff = time.time() - self.start_time # elapsed time
                    # format to H:M:S
                    x = int((diff - int(diff)) * 100)
                    diff = int(diff)
                    h = diff // 3600
                    m = (diff % 3600) // 60
                    s = diff % 60
                    p = ""
                    if h > 0: p += str(h).zfill(2) + "h"
                    if m > 0 or p != "": p += str(m).zfill(2) + "m"
                    p += str(s).zfill(2)
                    if x > 0: p += "." + str(x).zfill(2)
                    p += "s"
                    print("\nRun time: {}".format(p))

    def is_maxed(self) -> bool: # return true if percentage is 100%
        try: return (self.current / float(self.total) >= 1.0)
        except: return False

    def __enter__(self): # to use 'WITH'
        pass

    def __exit__(self, type, value, traceback):
        self.update() # updated on exit

# main class
class Updater():
    def __init__(self) -> None:
        # other init
        self.client = None
        self.progress = Progress() # initialized with a silent progress bar
        self.latest_additions = {}
        self.index = {}
        self.modified = False
        self.disable_save = False
        self.update_changelog = True
        self.dl_queue = None # used for download
        self.gbfal = {} # gbfal data
        self.class_gbfal = False
        self.exclusion = set()
        self.uncap_check = set()
        self.loadIndex()
        self.http_sem = asyncio.Semaphore(MAX_HTTP) # http semaphore

    def update_data_from_GBFAL(self) -> None: # update CLASS_LIST and CLASS_WEAPON_LIST according to GBFAL data
        if self.class_gbfal or len(list(self.gbfal.keys())) == 0: return # only run once and if gbfal is loaded
        try:
            print("Checking GBFAL data for new classes...")
            count = 0
            for k in self.gbfal['job']: # go over jobs
                if k not in CLASS_LIST:
                    CLASS_LIST[k] = self.gbfal['job'][k][6] # add mh
                    for x, v in self.gbfal['job_wpn'].items():
                        if v == k:
                            CLASS_WEAPON_LIST[k] = x # add class weapon
                    for x, v in self.gbfal['job_id'].items():
                        if v == k:
                            for i in range(len(CLASS_LIST[k])): # add missing classes
                                CLASS_LIST[k] = x + "_" + CLASS_LIST[k]
                    count += 1
            if count > 0:
                print("Found", count, "classes not present in GBFAP, from GBFAL, consider updating")
        except:
            pass
        self.class_gbfal = True
        try:
            print("Checking GBFAL data for new backgrounds...")
            if len(list(self.gbfal['background'].keys())) != len(list(self.index.get('background', {}))): # simply copy over background table if different
                self.index['background'] = self.gbfal['background']
                self.modified = True
                print("Background list updated from GBFAL")
        except:
            pass
        try:
            print("Checking GBFAL data for uncaps and styles...")
            possible_uncap = set()
            table = {}
            for k, v in self.gbfal['characters'].items():
                if isinstance(v, list):
                    max_uncap = 0
                    for e in v[6]: # seventh index for general ids
                        try:
                            u = int(e.split('_')[1])
                            if u < 10 and u > max_uncap: # store the highest uncap
                                max_uncap = u
                        except:
                            pass
                        if "_st2" in e: # check if it's a style
                            if k + "_st2" not in self.index:
                                possible_uncap.add(k + "_st2")
                    if max_uncap > 0: # add to table if not 0
                        table[k] = max_uncap
            for k, v in self.gbfal['summons'].items(): # do the same for summons
                if isinstance(v, list):
                    max_uncap = 0
                    for e in v[0]: # first index for general ids
                        try:
                            u = int(e.split('_')[1])
                        except:
                            u = 1
                        if u < 10 and u > max_uncap:
                            max_uncap = u
                    if max_uncap > 0:
                        table[k] = max_uncap
            for k, v in self.index.items(): # now go over our items and our uncap table and comapre
                if k in table:
                    if 'v' in v:
                        max_uncap = 0
                        if k[0] == '3': # character
                            for e in v['v']:
                                u = 0
                                match e[0].split('★')[0]:
                                    case '0':
                                        u = 1
                                    case '4':
                                        u = 2
                                    case '5':
                                        u = 3
                                    case '6':
                                        u = 4
                                if u < 10 and u > max_uncap:
                                    max_uncap = u
                        elif k[0] == '2': # summon
                            for e in v['v']:
                                u = 0
                                match e[0].split('★')[0]:
                                    case '3':
                                        u = 1
                                    case '4':
                                        u = 2
                                    case '5':
                                        u = 3
                                    case '6':
                                        u = 4
                                if u < 10 and u > max_uncap:
                                    max_uncap = u
                        else: # failsafe
                            continue
                        if table[k] > max_uncap:
                            possible_uncap.add(k)
            if len(possible_uncap) > 0:
                print(len(possible_uncap), "possible uncap/style(s) found")
                self.uncap_check = possible_uncap
        except Exception as e:
            pass
            print(e)

    def update_wiki_from_GBFAL(self) -> None: # same than the above, for wiki lookup
        try:
            print("Checking GBFAL data for wiki lookup...")
            if 'wiki' not in self.index: # init if missing
                self.index['wiki'] = {}
            for k, v in self.gbfal['lookup'].items(): # more or less copy the wiki link from GBFAL if present
                if k not in self.index:
                    continue
                try:
                    tmp = v.split('@@', 1)[1].split(' ')[0]
                    if self.index['wiki'].get(k, None) != tmp:
                        self.index['wiki'][k] = tmp
                        self.modified = True
                except:
                    pass
        except:
            pass

    async def progress_container(self, coroutine : Callable) -> Any: # to track progress of tasks
        with self.progress:
            try:
                return await coroutine
            except Exception as e:
                print(e)

    async def req(self, url, head=False) -> bytes|bool: # to request (GET or HEAD), return True on success for GET
        async with self.http_sem:
            if head:
                response = await self.client.head(url, headers={'connection':'keep-alive'})
                if response.status != 200: raise Exception()
                return True
            else:
                response = await self.client.get(url, headers={'connection':'keep-alive'})
                if response.status != 200: raise Exception()
                async with response:
                    return await response.content.read()

    async def run(self) -> None:
        print("Updating index...")
        self.progress = Progress()
        async with asyncio.TaskGroup() as tg:
            tasks = []
            # list of ID to check
            possibles = ["3020{}000", "3030{}000", "3040{}000", "3710{}000", "2010{}000", "2020{}000", "2030{}000", "2040{}000", "10100{}00", "10200{}00", "10300{}00", "10400{}00", "10201{}00", "10101{}00", "10301{}00", "10401{}00", "10102{}00", "10202{}00", "10302{}00", "10402{}00", "10103{}00", "10203{}00", "10303{}00", "10403{}00", "10104{}00", "10204{}00", "10304{}00", "10404{}00", "10105{}00", "10205{}00", "10305{}00", "10405{}00", "10106{}00", "10206{}00", "10306{}00", "10406{}00", "10107{}00", "10207{}00", "10307{}00", "10407{}00", "10108{}00", "10208{}00", "10308{}00", "10408{}00", "10209{}00", "10109{}00", "10309{}00", "10409{}00"]
            # add uncap checks
            tasks.append(tg.create_task(self.check_uncaps()))
            # add enemies
            for a in range(1, 10):
                for b in range(1, 4):
                    possibles.append(str(a) + str(b) + "{}")
            # add possibles
            for i in range(MAX_RUN_TASK):
                tasks.append(tg.create_task(self.run_class(i, MAX_RUN_TASK)))
                for j in possibles:
                    tasks.append(tg.create_task(self.run_sub(i, MAX_RUN_TASK, j)))
            self.progress = Progress(total=len(tasks), silent=False)
        count = 0
        for t in tasks:
            count += t.result()
        if count > 0:
            print("")
            print(count, "new entries")
        else: print("Done")

    async def check_uncaps(self) -> int: # update items with uncap detected during GBFAL import
        count = 0
        for f in self.uncap_check:
            if f.startswith("10"):
                if f in CLASS_WEAPON_LIST.values():
                    continue
                count += await self.update_weapon(f)
            elif f.startswith("20"):
                count += await self.update_summon(f)
            else:
                if "_st" in f:
                    count += await self.update_character(f.split('_', 1)[0], "_"+f.split('_', 1)[1])
                else:
                    count += await self.update_character(f)
        return count

    async def run_sub(self, start : int, step : int, file : str) -> int: # subroutine of run()
        with self.progress:
            eid = start # element id
            errc = 0 # err count
            count = 0 # succerss count
            is_mob = (len(file) == 4 and file.endswith('{}')) # is an enemy? flag
            while errc < 20:
                f = file.format(str(eid).zfill(4 if is_mob else 3)) # format id
                if is_mob: # different logic for enemy, we have 4 types to check
                    r = 0 # store return values of our update_mob tasks
                    tasks = []
                    for i in range(1, 4):
                        fi = f+str(i)
                        if self.index.get(fi, 0) == 0:
                            tasks.append(self.update_mob(fi))
                        else:
                            r += 1
                    if len(tasks) > 0: # run the tasks in parallel for speed
                        for tr in await asyncio.gather(*tasks):
                            if tr is not None:
                                r += tr # add return value
                                if tr:
                                    count += 1
                    if r == 0: # if all 4 returned 0, it's a miss, increase error
                        errc += 1
                        if errc >= 20:
                            return count
                    else:
                        errc = 0
                else: # anything else
                    if self.index.get(f, 0) == 0 and f not in self.uncap_check:
                        if file.startswith("10"):
                            if f in CLASS_WEAPON_LIST.values():
                                errc = 0
                                eid += step
                                continue
                            r = await self.update_weapon(f)
                        elif file.startswith("20"):
                            r = await self.update_summon(f)
                        else:
                            r = await self.update_character(f)
                        if r == 0: # function returned 0, it's a miss
                            errc += 1
                            if errc >= 20:
                                return count
                        else:
                            errc = 0
                            count += r
                    else:
                        errc = 0
                eid += step # increase ID by step
            return count

    async def run_class(self, start : int, step : int) -> int: # function to update class
        with self.progress:
            keys = list(CLASS_LIST.keys()) # go over our class list and update missing ones
            i = start
            count = 0
            while i < len(keys):
                f = keys[i]
                if f not in self.index:
                    count += await self.update_class(f)
                i += step
            return count

    async def update_class(self, id : str) -> int:
        try:
            if id in self.exclusion: return 0
            if id not in CLASS_LIST: return 0
            try:
                await self.req(IMG + "/sp/assets/leader/m/" + id.split('_')[0] + "_01.jpg")
            except:
                return 0
            wid = None
            colors = []
            for i in ["01", "02", "03", "04", "05", "80"] if id not in UNIQUE_SKIN else ["01"]: # check colors/alts
                try:
                    await self.getJS(CLASS_LIST[id][0] + "_0_{}".format(i))
                    colors.append(CLASS_LIST[id][0] + "_0_{}".format(i))
                except:
                    pass
            if len(colors) == 0:
                return 0
            abilities : list[str] = []
            if id in CLASS_WEAPON_LIST: # skin with custom weapon
                mortal = "mortal_B" # skin with custom ougis use this
                mc_cjs = colors[0]
                sp = None
                phit = None
                if CLASS_WEAPON_LIST[id] is not None: # check class weapon spritesheets
                    for s in ["", "_0"]: # auto attack
                        try:
                            f = "phit_" + CLASS_WEAPON_LIST[id] + s
                            await self.getJS(f)
                            phit = f
                            break
                        except:
                            pass
                    for s in ["", "_0", "_0_s2", "_s2"]: # ougi
                        try:
                            f = "sp_" + CLASS_WEAPON_LIST[id] + s
                            await self.getJS(f)
                            sp = f
                            break
                        except:
                            pass
                    for s in range(1, 10): # single target skills
                        try:
                            f = "ab_" + CLASS_WEAPON_LIST[id] + "_" + str(s).zfill(2)
                            await self.getJS(f)
                            abilities.append(f)
                        except:
                            pass
                    for s in range(1, 10): # AOE skills
                        try:
                            f = "ab_all_" + CLASS_WEAPON_LIST[id] + "_" + str(s).zfill(2)
                            await self.getJS(f)
                            abilities.append(f)
                        except:
                            pass
            else: # regular class
                mortal = "mortal_A"
                mc_cjs = colors[0]
                wid = CLASS_DEFAULT_WEAPON[mc_cjs.split('_')[1]]
                sp = None
                phit = None
                for fn in ["phit_{}".format(id), "phit_{}_0".format(id)]: # check attack spritesheet
                    try:
                        if phit is None:
                            await self.getJS(fn)
                            phit = fn
                    except:
                        pass
                for fn in ["sp_{}".format(id), "sp_{}_0".format(id), "sp_{}_0_s2".format(id), "sp_{}_s2".format(id)]: # check ougi spritesheet
                    try:
                        if sp is None:
                            await self.getJS(fn)
                            sp = fn
                    except:
                        pass
            if phit is None:
                if id == "360101":
                    phit = "phit_racer" # special exception
                else:
                    phit = "phit_{}_0001".format(mc_cjs.split('_')[1]) # default animation used on the player
            character_data = {}
            if wid is not None: # set class weapon id
                character_data['w'] = wid
            character_data['v'] = []
            character_data['ab'] = abilities
            for x, c in enumerate(colors):
                if c == colors[0]:
                    var = ""
                else:
                    var = " v"+str(x)
                for i in range(2):
                    if i == 1: # djeeta
                        # for djeeta, we copy and edit the _0 of gran to _1
                        if phit.endswith('_0'):
                            phit = phit[:-2] + '_1'
                        if sp is not None:
                            if sp.endswith('_0'):
                                sp = sp[:-2] + '_1'
                            elif sp.endswith('_0_s2'):
                                sp = sp[:-5] + '_1_s2'
                            try:
                                await self.getJS(sp)
                            except:
                                print("")
                                print("Warning:", sp, "not found for", id)
                                sp = None
                    tmp = [('Gran' if i == 0 else 'Djeeta') + var, c.replace('_0_', '_{}_'.format(i)), mortal, phit, [] if sp is None else [sp], (sp is not None and ('_s2' in sp or '_s3' in sp))] # name, cjs, mortal, phit, sp, fullscreen
                    character_data['v'].append(tmp)
            if str(character_data) != str(self.index.get(id, None)):
                self.index[id] = character_data
                self.modified = True
                self.latest_additions[id] = 0
            return 1
        except Exception as e:
            sys.stdout.write("\rError {} for id: {}\n".format(e, id))
            sys.stdout.flush()
            return 0

    async def update_weapon(self, id : str) -> int:
        try:
            if id in self.exclusion: return 0
            try:
                await self.req(IMG + "/sp/assets/weapon/m/" + id + ".jpg")
            except:
                return 0
            # containers
            mc_cjs = CLASS[(int(id) // 100000) % 10]
            sid = ID_SUBSTITUTE.get(id, None)
            for uncap in ["", "_02", "_03"]: # check uncaps (only for Opus right now)
                character_data = {}
                character_data['w'] = id + uncap
                character_data['v'] = []
                match uncap: # identifiers to check
                    case "_03":
                        uns = ["_03", "_02"]
                        spus = [3, 2, 0]
                    case "_02":
                        uns = ["_02"]
                        spus = [2, 0]
                    case _:
                        uns = [""]
                        spus = [0]
                sp = None
                phit = None
                for i in ([id] if sid is None else [id, sid]):
                    for un in uns:
                        for fn in ["phit_{}{}".format(i, un), "phit_{}{}_0".format(i, un)]: # check attack
                            try:
                                if phit is None:
                                    await self.getJS(fn)
                                    phit = fn
                            except:
                                pass
                        for spu in spus:
                            for fn in ["sp_{}".format(i), "sp_{}_{}".format(i, spu), "sp_{}_{}_s2".format(i, spu), "sp_{}_s2".format(i)]: # check ougi
                                try:
                                    if sp is None:
                                        await self.getJS(fn)
                                        sp = fn
                                except:
                                    pass
                if phit is None or sp is None:
                    if uncap == "":
                        raise Exception("No attack effect or charge attack")
                    else:
                        break
                # update for gran (0) and djeeta (1)
                for i in range(2):
                    nsp = (sp if sp is not None else 'sp_{}_01210001'.format(mc_cjs.split('_')[1]))
                    tmp = [('Gran' if i == 0 else 'Djeeta'), mc_cjs.format(i), 'mortal_A', (phit if phit is not None else "phit_{}_0001".format(mc_cjs.split('_')[1])), [nsp], ('_s2' in nsp or '_s3' in nsp)] # name, cjs, mortal, phit, sp, fullscreen
                    if i == 1: # djeeta
                        # replace gran _0 by _1 for djeeta
                        if id in tmp[3] or (sid is not None and sid in tmp[3]):
                            try:
                                fn = tmp[3].replace('_0', '_1')
                                await self.getJS(fn)
                                tmp[3] = fn
                            except:
                                pass
                        if id in nsp or (sid is not None and sid in nsp):
                            try:
                                fn = nsp.replace('_0', '_1')
                                await self.getJS(fn)
                                tmp[4][0] = fn
                            except:
                                pass
                    character_data['v'].append(tmp)
                if str(character_data) != str(self.index.get(id+uncap, None)):
                    self.index[id+uncap] = character_data
                    self.modified = True
                    self.latest_additions[id+uncap] = 1
            return 1
        except Exception as e:
            sys.stdout.write("\rError {} for id: {}\n".format(e, id))
            sys.stdout.flush()
            return 0

    async def update_summon(self, id : str) -> bool:
        try:
            if id in self.exclusion: return 0
            # containers
            sid = [id]
            for k in SHARED_SUMMONS:
                if id in k:
                    sid = list(k)
                    break
            character_data = {}
            character_data['v'] = []
            character_data['s'] = id
            call_found = set()
            for uncap in ["_04", "_03", "_02", "_01"]:
                try:
                    await self.req(IMG + "/sp/assets/summon/m/" + id + uncap.replace('_01', '') + ".jpg") # try to guess uncap level based on existing portrait
                except:
                    if uncap != '_01':
                        continue
                    else:
                        return 0
                match uncap: # identifiers to check according to uncap
                    case "_04":
                        uns = ["_04", "_03", "_02"]
                    case "_03":
                        uns = ["_03", "_02"]
                    case "_02":
                        uns = ["_02"]
                    case "_01":
                        uns = ["_01", ""]
                calls = []
                for i in sid:
                    for un in uns:
                        if un in call_found:
                            break
                        for m in ["", "_a", "_b", "_c", "_d", "_e"]: # look for call animations (they can have multiples)
                            fn = "summon_{}{}{}_attack".format(i, un, m)
                            try:
                                await self.getJS(fn)
                                await self.getJS(fn.replace('attack', 'damage'))
                                calls.append(fn)
                                call_found.add(un)
                            except:
                                if m != "":
                                    break
                        if len(calls) != 0:
                            break
                    if len(calls) != 0:
                        break
                if len(calls) == 0: # no call, it might be an old summon with the call embedded in the base cjs
                    if uncap == '_01':
                        for i in sid:
                            try:
                                fn = "summon_{}".format(i)
                                await self.getJS(fn)
                                calls.append(fn)
                                break
                            except:
                                pass
                    if len(calls) == 0:
                        if uncap == "_01": return 0
                        else: continue
                uncap_data = []
                for i, sp in enumerate(calls): # for each call
                    uncap_data.append([str(2 + int(uncap.split('_')[1])) + '★' + (' ' + chr(ord('A') + i) if (i > 0 or len(calls) > 1) else ''), SUMMON_CLASS, '', None, [sp], ('attack' in sp)]) # name, cjs, mortal, phit, sp, fullscreen)
                uncap_data.reverse()
                character_data['v'] += uncap_data
            character_data['v'].reverse()
            if str(character_data) != str(self.index.get(id, None)):
                self.index[id] = character_data
                self.modified = True
                self.latest_additions[id] = 2
            return 1
        except Exception as e:
            sys.stdout.write("\rError {} for id: {}\n".format(e, id))
            sys.stdout.flush()
            return 0

    async def update_mob(self, id : str) -> bool:
        try:
            if id in self.exclusion: return 0
            # Check if exists
            try:
                await self.req(IMG + "/sp/assets/enemy/s/" + id + ".png")
            except:
                return 0
            try: # base cjs
                fn = "enemy_{}".format(id)
                await self.getJS(fn)
            except:
                return 0
            ehit = None
            try: # attack cjs
                fn = "ehit_{}".format(id)
                await self.getJS(fn)
                ehit = fn
            except:
                pass
            if ehit is None:
                ehit = "phit_0000000000" # set generic attack if missing
            tasks = []
            for i in range(0, 20): # look for ougis (can be single or AOE)
                try:
                    tasks.append(self.update_mob_sub("esp_{}_{}".format(id, str(i).zfill(2))))
                except:
                    pass
                try:
                    tasks.append(self.update_mob_sub("esp_{}_{}_all".format(id, str(i).zfill(2))))
                except:
                    pass
            mortals = []
            for sp in await asyncio.gather(*tasks):
                if sp is not None:
                    mortals.append(sp)
            mortals.sort()
            character_data = {} # different format to save on space
            character_data['ehit'] = ehit
            character_data['sp'] = mortals
            if str(character_data) != str(self.index.get(id, None)):
                self.index[id] = character_data
                self.modified = True
                self.latest_additions[id] = 4
            return 1
        except Exception as e:
            sys.stdout.write("\rError {} for id: {}\n".format(e, id))
            sys.stdout.flush()
            return 0

    async def update_mob_sub(self, fn : str) -> str|None:
        try:
            await self.getJS(fn)
            return fn
        except:
            return None

    async def update_character(self, id : str, style : str = "") -> bool: # character
        try:
            if id in self.exclusion:
                return 0
            is_partner = id.startswith("38")
            try:
                if is_partner:
                    await self.req(IMG + "/sp/assets/npc/raid_normal/" + id + "_01" + style + ".jpg", head=True)
                else:
                    await self.req(IMG + "/sp/assets/npc/m/" + id + "_01" + style + ".jpg", head=True)
            except:
                return 0
            tid = ID_SUBSTITUTE.get(id, id) # fix for bobobo skin
            versions = {}
            genders = {}
            gender_ougis = {}
            mortals = {}
            phits = {}
            nsp = {}
            fullscreen = {}
            for uncap in range(1, 6):
                su = str(uncap).zfill(2) # uncap string, i.e. 01, 02, etc...
                found = False
                for gender in ["", "_0", "_1"]: # gender check (vgrim, catura, etc..)
                    for ftype in ["", "_s2"]: # version (s2 is newer)
                        for form in ["", "_f1", "_f2", "_f"]: # alternate stance/form (rosetta, nicholas, etc...)
                            try:
                                fn = "npc_{}_{}{}{}{}{}".format(tid, su, style, gender, form, ftype) # create full filename
                                await self.getJS(fn) # check if exists, exception is raised otherwise
                                vs = su + gender + ftype + form
                                versions[vs] = fn # add in found versions
                                if gender != "":
                                    genders[vs] = gender # add in gender versions
                                # get cjs
                                data = (await self.req(CJS + fn + ".js")).decode('utf-8') # retrieve the content for the following
                                if vs not in mortals: # for characters such as lina
                                    for m in ['mortal_A', 'mortal_B', 'mortal_C', 'mortal_D', 'mortal_E', 'mortal_F', 'mortal_G', 'mortal_H', 'mortal_I', 'mortal_K']:
                                        if m in data: # we check which mortal (i.e. ougi) is found in the file, as some don't have the mortal_A
                                            mortals[vs] = m
                                            break
                                if form == "":
                                    found = True
                                try: # check attacks
                                    fn = "phit_{}_{}{}{}{}{}".format(tid, su, style, gender, form, ftype).replace("_01", "")
                                    await self.getJS(fn)
                                    phits[vs] = fn
                                except:
                                    try: # check simpler attack if not found
                                        fn = "phit_{}_{}{}".format(tid, su, style).replace("_01", "")
                                        await self.getJS(fn)
                                        phits[vs] = fn
                                    except: # if still not found, retrieve from lower uncaps
                                        for sub_uncap in range(uncap-1, 0, -1):
                                            ssu = str(sub_uncap).zfill(2)
                                            for k in phits:
                                                if k.startswith(ssu):
                                                    phits[vs] = phits[k]
                                                    break
                                            if vs in phits:
                                                break
                                        if vs not in phits: # if STILL not found, apply patch if any
                                            if tid in PATCHES and PATCHES[tid][1] != "":
                                                phits[vs] = PATCHES[tid][1].replace('UU', su).replace('FF', form)
                                            else: # else use default axe animation
                                                phits[vs] = 'phit_ax_0001'
                                for s in ["", "_s2", "_s3"]: # check ougi
                                    for g in ["", "_0"] if gender == "" else [gender]: # and gender
                                        tasks = []
                                        for m in ["", "_a", "_b", "_c", "_d", "_e", "_f", "_g", "_h", "_i", "_j"]: # and variations for multiple ougi like shiva grand
                                            tasks.append(self.update_character_sub("nsp_{}_{}{}{}{}{}{}".format(tid, su, style, g, form, s, m)))
                                        tmp = []
                                        for r in await asyncio.gather(*tasks):
                                            if r is not None:
                                                tmp.append(r)
                                        if len(tmp) != 0:
                                            nsp[vs] = tmp
                                            if gender == "" and g != "":
                                                gender_ougis[vs] = True
                                            if s != "":
                                                fullscreen[vs] = True # s2 and s3 seems to use the fullscreen flag set to true
                                            break
                                # apply patches if any and no ougi found
                                if vs not in nsp and tid in PATCHES and PATCHES[tid][0] != "":
                                    for sub_uncap in range(uncap, 0, -1):
                                        ssu = str(sub_uncap).zfill(2)
                                        pid = PATCHES[tid][0].replace('UU', ssu).replace('FF', form)
                                        for s in ["", "_s2", "_s3"]:
                                            tasks = []
                                            for m in ["", "_a", "_b", "_c", "_d", "_e", "_f", "_g", "_h", "_i", "_j"]:
                                                tasks.append(self.update_character_sub("nsp_{}{}{}".format(pid, s, m)))
                                            tmp = []
                                            for r in await asyncio.gather(*tasks):
                                                if r is not None:
                                                    tmp.append(r)
                                            if len(tmp) != 0:
                                                nsp[vs] = tmp
                                                if s != "": fullscreen[vs] = True
                                                break
                                        if vs in nsp:
                                            break
                                if vs not in nsp: # if still no ougi found, check base form if it's an alt form
                                    if form != "":
                                        svs = su + gender + ftype
                                        if svs in nsp:
                                            nsp[vs] = nsp[svs]
                                            fullscreen[vs] = fullscreen.get(svs, False)
                                if vs not in nsp: # else raise error
                                    raise Exception("No charge attack")
                            except Exception as se:
                                if str(se) == "No charge attack" and not is_partner:
                                    raise se
                        if found is True: # stop loop
                            break
                    if found is True and gender != "_0": # stop loop
                        break
                if not found: # stop loop if this uncap found nothing
                    break
            if len(versions.keys()) == 0: # stop if nothing found
                return 0
            # check abilities
            abilities : list[str] = []
            for s in range(1, 15): # single target skills
                try:
                    f = "ab_" + tid + "_" + str(s).zfill(2)
                    await self.getJS(f)
                    abilities.append(f)
                except:
                    pass
            for s in range(1, 15): # AOE skills
                try:
                    f = "ab_all_" + tid + "_" + str(s).zfill(2)
                    await self.getJS(f)
                    abilities.append(f)
                except:
                    pass
            name_table = {}
            for vs in versions: # now add all versions to tab
                name = ""
                star = int(vs[:2]) # star number used in the name
                if star == 1:
                    star = 0
                else:
                    star += 2
                name += "{}★".format(star) # format it
                # add gender if needed
                if vs in genders:
                    name += " Gran" if genders[vs] == "_0" else " Djeeta"
                elif vs in gender_ougis:
                    name += " Gran"
                # add extra character for alt versions
                if "_f1" in vs:
                    name += " B"
                elif "_f2" in vs:
                    name += " C"
                elif "_f" in vs:
                    name += " T"
                name_table[name] = vs
                if vs in gender_ougis: # add djeeta ougis by copying gran
                    name_table[name.replace('Gran', 'Djeeta')] = vs
            # sort this stuff
            keys = list(name_table.keys())
            keys.sort()
            character_data = {'v':[], 'ab':abilities}
            for name in keys:
                vs = name_table[name]
                sp = nsp.get(vs, [])
                if vs in gender_ougis and 'Djeeta' in name:
                    sp = nsp.get(vs, []).copy()
                    for i in range(len(sp)):
                        sp[i] = sp[i][:17] + sp[i][17:].replace('_0', '_1') # replace _0 by _1 for djeeta
                character_data['v'].append([name, versions[vs], mortals[vs], phits[vs], sp, fullscreen.get(vs, False)])
            if str(character_data) != str(self.index.get(id+style, None)):
                self.index[id+style] = character_data
                self.modified = True
                self.latest_additions[id+style] = 3
            if id in STYLE_CHARACTER and style == "": # style check
                return 1 + await self.update_character(id, "_st2")
            return 1
        except Exception as e:
            sys.stdout.write("\rError {} for id: {}\n".format(e, id))
            sys.stdout.flush()
            return 0

    async def update_character_sub(self, fn : str) -> str|None:
        try:
            await self.getJS(fn)
            return fn
        except:
            return None

    def manifestToJSON(self, manifest : str) -> dict: # extra manifest content into json
        st = manifest.find('manifest:') + len('manifest:')
        ed = manifest.find(']', st) + 1
        return json.loads(manifest[st:ed].replace('Game.imgUri+', '').replace('src:', '"src":').replace('type:', '"type":').replace('id:', '"id":'))

    async def manualUpdate(self, ids : list) -> None: # manual update command
        self.progress = Progress()
        async with asyncio.TaskGroup() as tg:
            tasks = []
            for id in ids:
                if len(id) == 7:
                    tasks.append(tg.create_task(self.progress_container(self.update_mob(id))))
                elif len(id) == 10:
                    if id.startswith("10"):
                        tasks.append(tg.create_task(self.progress_container(self.update_weapon(id))))
                    elif id.startswith("20"):
                        tasks.append(tg.create_task(self.progress_container(self.update_summon(id))))
                    else:
                        tasks.append(tg.create_task(self.progress_container(self.update_character(id, ""))))
                elif len(id) == 14 and (id.startswith("30") or id.startswith("38")) and id[10] == '_':
                    tasks.append(tg.create_task(self.progress_container(self.update_character(id.split('_')[0], "_"+id.split('_')[1]))))
                elif id in CLASS_LIST:
                    tasks.append(tg.create_task(self.progress_container(self.update_class(id))))
            if len(tasks) > 0:
                print("Attempting to update", len(tasks), "element(s)")
                self.progress = Progress(total=len(tasks), silent=False)
        count = 0
        for t in tasks:
            count += t.result()
        if count > 0: print(count, "new entries")
        else: print("Done")

    async def getJS(self, js : str) -> None:
        await self.req(MANIFEST + js + ".js")

    async def phitUpdate(self, phit : str) -> None:
        with self.progress:
            try:
                await self.getJS(phit)
            except:
                pass

    async def download(self, targets : list) -> None:
        print("Downloading all assets...")
        print("Checking directories...")
        try:
            for f in ["model/manifest", "cjs", "img/sp/cjs", "img/sp/raid/bg", "img/sp/guild/custom/bg", "sound/se", "sound/voice"]:
                if not os.path.exists(f):
                    os.makedirs(f)
                    print("Created missing '"+f+"' folder")
        except Exception as e:
            print("Failed to create directories, aborting...")
            print(e)
            return
        
        # adding basic stuff to queue
        self.dl_queue = asyncio.Queue()
        self.dl_queue.put_nowait(("model/manifest/", "phit_0000000000.js"))
        for p in CLASS:
            self.dl_queue.put_nowait(("model/manifest/", p.format(0)+".js")) # gran
            self.dl_queue.put_nowait(("model/manifest/", p.format(1)+".js")) # djeeta
        for w in ["sw", "kn", "sp", "ax", "wa", "gu", "me", "bw", "mc", "kt"]:
            self.dl_queue.put_nowait(("model/manifest/", "sp_{}_01210001.js".format(w)))
            for i in range(30):
                for s in ["", "_silent"]:
                    self.dl_queue.put_nowait(("model/manifest/", "phit_{}_{}{}.js".format(w, str(i).zfill(4), s)))
        
        # start
        print("Downloading...")
        if len(targets) > 0:
            print("Will only download elements from", len(targets), "given matching ID")
        async with asyncio.TaskGroup() as tg:
            tasks = [tg.create_task(self.downloader()) for i in range(50)] # 50 tasks
            
            # add backgrounds to queue
            for k, v in self.index["background"].items():
                p = "img/sp/guild/custom/bg/" if k.startswith("main_") else "img/sp/raid/bg/"
                ex = ".png" if k.startswith("main_") else ".jpg"
                if not isinstance(v, list): continue
                await asyncio.sleep(0)
                for l in v[0]:
                    await self.dl_queue.put((p, l + ex))
            # adding everything else
            for k, v in self.index.items():
                if k in ["wiki", "background"] or (len(targets) > 0 and k not in targets): continue
                await asyncio.sleep(0)
                # enemy
                if len(k) == 7:
                    await self.dl_queue.put(("model/manifest/", "enemy_"+k+".js"))
                if "ehit" in v:
                    await self.dl_queue.put(("model/manifest/", v["ehit"]+".js"))
                if "sp" in v:
                    for l in v["sp"]:
                        await self.dl_queue.put(("model/manifest/", l+".js"))
                # playable
                if "v" in v:
                    for l in v["v"]:
                        await self.dl_queue.put(("model/manifest/", l[1]+".js")) # chara
                        await self.dl_queue.put(("model/manifest/", l[3]+".js")) # phit
                        if isinstance(l[4], list): # sp
                            for sp in l[4]:
                                await self.dl_queue.put(("model/manifest/", sp+".js"))
                                if sp.startswith("summon_") and sp.endswith("_attack"):
                                    await self.dl_queue.put(("model/manifest/", sp.replace('attack', 'damage')+".js"))
                        else:
                            await self.dl_queue.put(("model/manifest/", l[4]+".js"))
                # weapon
                if "w" in v:
                    if v["w"][4] == "6": # melee type
                        await self.dl_queue.put(("img/sp/cjs/", v["w"]+"_1.png"))
                        await self.dl_queue.put(("img/sp/cjs/", v["w"]+"_2.png"))
                    else:
                        await self.dl_queue.put(("img/sp/cjs/", v["w"]+".png"))
        for t in tasks:
           t.result()
        print("Done")
    
    def fixsummon(self) -> None:
        for k in self.index:
            if len(k) == 10 and k[:2] == "20" and "v" in self.index[k]:
                for i in range(len(self.index[k]["v"])):
                    if self.index[k]["v"][i][1] != SUMMON_CLASS:
                        self.index[k]["v"][i][1] = SUMMON_CLASS
                        self.modified = True
    
    async def downloader(self) -> None: # download task
        err_count = 0
        while err_count < 3:
            try:
                path, file = self.dl_queue.get_nowait()
                err_count = 0
                await asyncio.sleep(0)
            except:
                err_count += 1
                await asyncio.sleep(1)
                continue
            if os.path.isfile(path + file):
                if path == "model/manifest/":
                    with open(path + file, mode="r", encoding="utf-8") as f:
                        data = f.read()
            else:
                try:
                    match path:
                        case "model/manifest/": p = MANIFEST
                        case "cjs/": p = CJS
                        case "sound/se/"|"sound/voice/": p = ENDPOINT + path
                        case "img/sp/cjs/"|"img/sp/raid/bg/"|"img/sp/guild/custom/bg/": p = ENDPOINT + path
                        case _: raise Exception("Unknown path type " + path)
                    data = await self.req(p + file)
                    with open(path + file, "wb") as f:
                        f.write(data)
                    print(path + file, "written to disk")
                except Exception as e:
                    if str(e).startswith("Unknown path type"):
                        print("Important error for", path + file, ":", e)
                    continue
            if path == "model/manifest/":
                # add cjs equivalent to queue
                await self.dl_queue.put(("cjs/", file))
                # add images to queue
                try:
                    if isinstance(data, bytes): data = data.decode('utf-8')
                    data = self.manifestToJSON(data)
                    for l in data:
                        await self.dl_queue.put(("img" + '/'.join(l['src'].split('/')[:-1]) + "/", l['src'].split('/')[-1]))
                except Exception as e:
                    print("Error while reading manifest", path + file, ":", e)
                    continue
            elif path == "cjs/":
                # extract mp3 paths from cjs
                audios = MP3_SEARCH.findall(data.decode('utf-8'))
                for a in audios:
                    s = a[1:-1].split('/', 1)
                    if len(s) == 2:
                        await self.dl_queue.put(('sound/'+s[0]+'/', s[1]))
                    else:
                        print("Warning: Skipped the following potential sound:", a)

    def loadIndex(self) -> None:
        try:
            self.modified = False
            with open("json/data.json", mode="r", encoding="utf-8") as f:
                self.index = json.load(f)
        except OSError as e:
            print(e)
            if input("Continue anyway? (type 'y' to continue):").lower() != 'y':
                os._exit(0)
        except Exception as e:
            print("The following error occured while loading data.json:")
            print("".join(traceback.format_exception(type(e), e, e.__traceback__)))
            print(e)
            os._exit(0)

    def saveIndex(self) -> None:
        try:
            if self.modified:
                self.modified = False
                if self.disable_save: return
                with open("json/data.json", 'w', encoding='utf-8') as outfile:
                    outfile.write("{\n")
                    keys = list(self.index.keys())
                    for k, v in self.index.items():
                        outfile.write('"{}":'.format(k))
                        json.dump(v, outfile, separators=(',', ':'), ensure_ascii=False)
                        if k != keys[-1]: outfile.write(",\n")
                        else: outfile.write("\n")
                    outfile.write("}")
                try:
                    with open('json/changelog.json', mode='r', encoding='utf-8') as f:
                        data = json.load(f)
                    new = {}
                    if isinstance(data.get('new', {}), list): # Retrocompatibility with old format
                        new[str((datetime.now(UTC) - timedelta(days=1)).strftime('%Y-%m-%d'))] = data['new'] # use yesterday for the key
                    else:
                        new = data.get('new', {})
                except:
                    new = {}
                if self.update_changelog and len(self.latest_additions) > 0: # update new content
                    # get date of today
                    now : str = datetime.now(UTC).strftime('%Y-%m-%d')
                    if now in new: # if date present
                        temp : dict[str, Any] = {e[0]:e[1] for e in new[now]} # get old data
                        for k, v in self.latest_additions.items(): # put new data after
                            if k in temp:
                                temp.pop(k)
                            temp[k] = v
                        new[now] = [[k, v] for k, v in temp.items()] # replace by new data
                    else:
                        new[now] = [[k, v] for k, v in self.latest_additions.items()] # else just set new data
                    # sort keys
                    keys : list[str]= list(new.keys())
                    keys.sort(reverse=True)
                    if len(keys) > 5: # and remove oldest
                        keys = keys[:5]
                    new = {k:new[k] for k in keys}
                    self.latest_additions = {} # clear self.addition
                with open('json/changelog.json', mode='w', encoding='utf-8') as outfile:
                    json.dump({'timestamp':int(datetime.now(timezone.utc).timestamp()*1000), 'new':new}, outfile, indent=2, separators=(',', ':'), ensure_ascii=False)
                if self.update_changelog:
                    print("data.json and changelog.json updated")
                else:
                    print("data.json updated")
        except Exception as e:
            print(e)
            print("".join(traceback.format_exception(type(e), e, e.__traceback__)))

    async def start(self) -> None:
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=50)) as self.client:
                print("GBFAP Updater v{}".format(VERSION))
                # parse parameters
                prog_name : str
                try: prog_name = sys.argv[0].replace('\\', '/').split('/')[-1]
                except: prog_name = "updater.py" # fallback to default
                # Set Argument Parser
                parser : argparse.ArgumentParser = argparse.ArgumentParser(prog=prog_name, description="Animation Updater v{} for GBFAP https://mizagbf.github.io/GBFAP/".format(VERSION))
                primary = parser.add_argument_group('primary', 'main commands.')
                primary.add_argument('-r', '--run', help="search for new content.", action='store_const', const=True, default=False, metavar='')
                primary.add_argument('-u', '--update', help="update given elements.", nargs='+', default=None)
                primary.add_argument('-d', '--download', help="download all assets. Can specific IDs. Time and Disk space consuming.", nargs='*', default=None)
                
                settings = parser.add_argument_group('settings', 'commands to alter the updater behavior.')
                settings.add_argument('-nc', '--nochange', help="disable update of the New category of changelog.json.", action='store_const', const=True, default=False, metavar='')
                settings.add_argument('-fs', '--fixsummon', help="update all summons default classes.", action='store_const', const=True, default=False, metavar='')
                settings.add_argument('-al', '--gbfal', help="import data.json from GBFAL.", action='store', nargs=1, type=str, metavar='PATH')
                args : argparse.Namespace = parser.parse_args()
                # settings
                run_help : bool = True
                if args.nochange:
                    self.update_changelog = False
                if args.fixsummon:
                    self.fixsummon()
                    run_help = False
                if args.gbfal is not None:
                    try:
                        if args.gbfal[0].startswith('https://'):
                            self.gbfal = json.loads((await self.req(args.gbfal[0])).decode('utf-8'))
                        else:
                            with open(args.gbfal[0], mode="r", encoding="utf-8") as f:
                                self.gbfal = json.load(f)
                        print("GBFAL data is loaded")
                        self.update_data_from_GBFAL()
                    except Exception as e:
                        print("GBFAL data couldn't be loaded")
                        print(e)
                    run_help = False
                # run
                if args.run:
                    await self.run()
                elif args.update is not None and len(args.update) > 0:
                    await self.manualUpdate(args.update)
                elif args.download is not None:
                    print("ONLY USE THIS COMMAND IF YOU NEED TO HOST THE ASSETS")
                    print("Are you sure that you want to download the assets of all elements?")
                    print("It will take time and a lot of disk space.")
                    if input("Type 'yes' to continue:").lower() == 'yes':
                        await self.download(args.download)
                    else:
                        print("Operation aborted...")
                elif run_help:
                    parser.print_help()
                if len(self.gbfal) > 0:
                    self.update_wiki_from_GBFAL()
                self.saveIndex()
        except Exception as e:
            print("".join(traceback.format_exception(type(e), e, e.__traceback__)))

if __name__ == "__main__":
    asyncio.run(Updater().start())
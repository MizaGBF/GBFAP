from __future__ import annotations
from typing import Any, Callable
from collections import deque
from dataclasses import dataclass
from datetime import datetime, timezone, UTC
import asyncio
import aiohttp
import os
import sys
import re
import time
import json
from pathlib import Path
import traceback
import signal
import argparse

### CONSTANT
VERSION = '5.10'
CONCURRENT_TASKS = 90
SAVE_VERSION = 1
# limit
HTTP_CONN_LIMIT = 80
# addition type
ADD_JOB = 0
ADD_WEAP = 1
ADD_SUMM = 2
ADD_CHAR = 3
ADD_BOSS = 4
ADD_NPC = 5
ADD_PARTNER = 6
ADD_EVENT = 7
ADD_SKILL = 8
ADD_BUFF = 9
ADD_BG = 10
ADD_STORY0 = 11
ADD_FATE = 12
ADD_SHIELD = 13
ADD_MANATURA = 14
ADD_STORY1 = 15
# CDN endpoints
ENDPOINT = "https://prd-game-a-granbluefantasy.akamaized.net/assets_en/"
JS = ENDPOINT + "js/"
MANIFEST = JS + "model/manifest/"
CJS = JS + "cjs/"
IMG = ENDPOINT + "img/"
SOUND = ENDPOINT + "sound/"
VOICE = SOUND + "voice/"
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
# for mp3 download
MP3_SEARCH = re.compile('"[a-zA-Z0-9_\\/]+\\.mp3"')

# dynamic constants
STYLE_CHARACTER : list[str] = []
NO_CHARGE_ATTACK : set[str] = set()
PATCHES : dict[str, list[str]] = {}
ID_SUBSTITUTE : dict[str, str] = {}
SHARED_SUMMONS : list[list[str]] = []
UNIQUE_SKIN : list[str] = []
CLASS_LIST : dict[str, list[str]] = {}
CLASS_WEAPON_LIST : dict[str, str] = {}
ORIGIN_CLASSES : list[str] = []
SUMMON_CLASS : str = ""
# load dynamic constants
try:
    with open("json/manual_constants.json", mode="r", encoding="utf-8") as f:
        globals().update(json.load(f)) # add to global scope
    del f
except Exception as e:
    print("Failed to load and set json/manual_constants.json")
    print("Please fix the file content and try again")
    print("".join(traceback.format_exception(type(e), e, e.__traceback__)))
    raise Exception("Failed to load GBFAP Constants")
NO_CHARGE_ATTACK = set(NO_CHARGE_ATTACK)

# Handle tasks
@dataclass(slots=True)
class TaskManager():
    debug : bool
    is_running : bool
    updater : Updater
    queues : tuple[deque, ...]
    running : deque[asyncio.Task]
    total : int
    finished : int
    print_flag : bool
    elapsed : float
    written_len : int
    def __init__(self : TaskManager, updater : Updater) -> None:
        self.debug = False
        self.is_running = False
        self.updater = updater
        self.queues = (deque(), deque(), deque(), deque(), deque())
        self.running = deque()
        self.total = 0
        self.finished = 0
        self.print_flag = False
        self.elapsed = 0
        self.written_len = 0

    # reinitialize variables
    def reset(self : TaskManager) -> None:
        self.total = 0
        self.finished = 0
        self.is_running = False
        self.print_flag = False

    # add a task to one queue
    def add(self : TaskManager, awaitable : Callable, *, parameters : tuple[Any, ...]|None = None, priority : int = -1) -> None:
        if parameters is not None and not(isinstance(parameters, tuple)):
            raise Exception("Invalid parameters")
        if priority < 0 or priority >= len(self.queues):
            priority = len(self.queues) - 1
        self.queues[priority].append(Task.make(awaitable, parameters))
        self.total += 1

    # return True if all queues are empty
    def queues_are_empty(self : TaskManager) -> bool:
        for q in self.queues:
            if len(q) > 0:
                return False
        return True

    # run tasks in queue
    async def run(self : TaskManager, *, skip : int = 0) -> None:
        if self.is_running:
            self.print("ERROR: run() is already running, ignoring...)")
            return
        self.is_running = True
        start_time : float = time.time()
        self.elapsed : float = start_time
        to_sleep : bool = False
        i : int
        # loop
        while len(self.running) > 0 or not self.queues_are_empty():
            # remove from queue and run
            for i, q in enumerate(self.queues):
                while len(self.running) < CONCURRENT_TASKS and len(q) > 0:
                    try:
                        t : Task = q.popleft()
                        if skip <= 0:
                            if t.parameters is not None:
                                self.running.append(asyncio.create_task(t.awaitable(*t.parameters)))
                            else:
                                self.running.append(asyncio.create_task(t.awaitable()))
                        else:
                            skip -= 1
                    except Exception as e:
                        self.print("Can't start task, the following exception occured in queue", i)
                        self.print("".join(traceback.format_exception(type(e), e, e.__traceback__)))
                        self.finished += 1
                        break
            # remove completed tasks
            prev : int = self.finished
            for i in range(len(self.running)):
                t : asyncio.Task = self.running.popleft()
                if t.done():
                    try:
                        t.result()
                    except Exception as e:
                        self.print("The following exception occured:")
                        self.print("".join(traceback.format_exception(type(e), e, e.__traceback__)))
                    self.finished += 1
                    # t is discarded
                else:
                    self.running.append(t) # put back in
            # update status
            if prev != self.finished: # number of finished task changed
                # print t he progress
                self.print_progress()
                # auto save if needed
                if time.time() - self.elapsed >= 3600:
                    if self.updater.modified:
                        self.print(f"Progress: {self.finished} / {self.total} Tasks, autosaving...")
                    self.updater.save()
                    self.elapsed = time.time()
                to_sleep = False
            else:
                to_sleep = True
            # ... and sleep if we haven't finished tasks
            if to_sleep:
                await asyncio.sleep(0.1)
        self.print("Complete")
        # finished
        diff : float = time.time() - start_time # elapsed time
        # format to H:M:S
        elapsed_s : int = int(diff)
        h : int = elapsed_s // 3600 # hours
        m : int = (elapsed_s % 3600) // 60 # minutes
        s : int = elapsed_s % 60 # seconds
        strings : list[str] = ["Run time: "]
        if h > 0:
            strings.append(str(h).zfill(2))
            strings.append('h')
        if m > 0:
            strings.append(str(m).zfill(2))
            strings.append('m')
        strings.append(str(s).zfill(2))
        strings.append('s')
        self.reset()
        print("".join(strings))

    # start to run queued tasks
    async def start(self : TaskManager) -> bool:
        if self.is_running or self.queues_are_empty(): # return if already running or no tasks pending
            return False
        await self.run()
        return True

    # print the progression string
    def print_progress(self : TaskManager) -> None:
        if self.running and self.total > 0:
            if self.print_flag:
                sys.stdout.write("\r")
                if self.written_len > 0:
                    sys.stdout.write((" " * self.written_len) + "\r")
            else:
                self.print_flag = True
            if self.debug:
                self.written_len = sys.stdout.write(f"P:{self.finished}/{self.total} | R:{len(self.running)} | Q:{len(self.queues[0])} {len(self.queues[1])} {len(self.queues[2])} {len(self.queues[3])} {len(self.queues[4])}")
            else:
                self.written_len = sys.stdout.write(f"Progress: {self.finished} / {self.total} Tasks")
            sys.stdout.flush()

    # print whatever you want, to use instead of print to handle the \r
    def print(self : TaskManager, *args) -> None:
        if self.print_flag:
            self.print_flag = False
            sys.stdout.write("\r")
            if self.written_len > 0:
                sys.stdout.write((" " * self.written_len) + "\r")
        print(*args)
        self.print_progress()

    # called when CTRL+C is used
    def interrupt(self : TaskManager, *args) -> None:
        if self.total <= 0 or self.finished >= self.total:
            return
        if self.print_flag:
            self.print_flag = False
            sys.stdout.write("\r")
            if self.written_len > 0:
                sys.stdout.write((" " * self.written_len) + "\r")
        print("Process PAUSED")
        print(f"{self.finished} / {self.total} Tasks completed")
        print(f"{len(self.running)} Tasks running")
        for i, q in enumerate(self.queues):
            print(f"Tasks in queue lv{i}: {len(q)}")
        if self.updater.modified:
            print("Pending Data is waiting to be saved")
        print("Type 'help' for a command list, or a command to execute, anything else to resume")
        while True:
            s = input(":").lower().split(' ')
            match s[0]:
                case 'help':
                    print("save    - call the save() function")
                    print("exit    - force exit the process, changes won't be saved")
                    print("peek    - check the content of data.json. Take two parameters: the index to look at and an id")
                    print("tchange - toggle update_changelog setting")
                case 'save':
                    if not self.updater.modified:
                        print("No changes waiting to be saved")
                    else:
                        self.updater.save()
                case 'peek':
                    if len(s) < 3:
                        print("missing 1 parameter: ID")
                    elif len(s) < 2:
                        print("missing 2 parameters: index, ID")
                    else:
                        try:
                            d : Any = self.data[s[1]][s[2]]
                            print(s[1], '-', s[2])
                            print(d)
                        except Exception as e:
                            print("Can't read", s[1], '-', s[2])
                            print(e)
                case 'tchange':
                    self.updater.update_changelog = not self.updater.update_changelog
                    print("changelog.json updated list WILL be modified" if self.updater.update_changelog else "changelog.json updated list won't be modified")
                case 'exit':
                    print("Exiting...")
                    os._exit(0)
                case _:
                    print("Process RESUMING...")
                    break

# A queued task
@dataclass(frozen=True, slots=True)
class Task():
    awaitable : Callable
    parameters : tuple[Any, ...]|None

    @classmethod
    def make(cls : Task, awaitable : Callable, parameters : tuple[Any, ...]|None) -> Task:
        return cls(awaitable, parameters)

@dataclass(slots=True)
class TaskStatus():
    index : int
    max_index : int
    err : int
    max_err : int
    running : int
    
    def __init__(self : TaskStatus, max_index : int, max_err : int, *, start : int = 0, running : int = 0):
        self.index = start
        self.max_index = max_index
        self.err = 0
        self.max_err = max_err
        self.running = running

    def get_next_index(self : TaskStatus) -> int:
        i : int = self.index
        self.index += 1
        return i

    def good(self : TaskStatus) -> None:
        self.err = 0

    def bad(self : TaskStatus) -> None:
        self.err += 1

    @property
    def complete(self : TaskStatus) -> bool:
        return self.err >= self.max_err or self.index >= self.max_index

    def finish(self : TaskStatus) -> None:
        self.running -= 1

    @property
    def finished(self : TaskStatus) -> bool:
        return self.running <= 0


@dataclass(slots=True)
class Updater():
    # other init
    client : aiohttp.ClientSession|None
    http_sem : asyncio.Semaphore
    tasks : TaskManager
    update_changelog : bool
    data : dict[str, Any]
    modified : bool
    addition : set[tuple[str, int|str]]
    updated_elements : set[str]
    gbfal : dict[str, Any]|None
    def __init__(self : Updater):
        # other init
        self.client = None # the http client
        self.http_sem = asyncio.Semaphore(HTTP_CONN_LIMIT) # http semaphor to limit http connections
        self.tasks = TaskManager(self) # the task manager
        self.update_changelog  = True # flag to enable or disable the generation of changelog.json
        self.data = { # data structure
            "version":SAVE_VERSION,
            "characters":{},
            "partners":{},
            "summons":{},
            "weapons":{},
            "enemies":{},
            "skins":{},
            "job":{},
            "background":{},
            "mypage_bg":{},
            "lookup":{},
            "mypage":{},
            "styles":{}
        }
        self.load() # load self.data NOW
        self.modified = False # if set to true, data.json will be written on the next call of save()
        self.addition = set() # new elements for changelog.json
        self.updated_elements = set() # set of elements ran through update_element()
        self.gbfal = None # storage for optional gbfal data

    ### Utility #################################################################################################################

    # Load data.json
    def load(self : Updater) -> None:
        try:
            # load file
            with open('json/data.json', mode='r', encoding='utf-8') as f:
                data : dict[str, Any] = json.load(f)
                if not isinstance(data, dict):
                    return
            # update if old version
            data = self.retrocompatibility(data)
            # load only expected keys
            k : str
            for k in self.data:
                if k in data:
                    self.data[k] = data[k]
        except OSError as e:
            self.tasks.print(e)
            if input("Continue anyway? (type 'y' to continue):").lower() != 'y':
                os._exit(0)
        except Exception as e:
            self.tasks.print("The following error occured while loading data.json:")
            self.tasks.print("".join(traceback.format_exception(type(e), e, e.__traceback__)))
            self.tasks.print(e)
            os._exit(0)

    # make older data.json compatible with newer versions
    def retrocompatibility(self : Updater, data : dict[str, Any]) -> dict[str, Any]:
        version = data.get("version", 0)
        if version == 0:
            self.tasks.print("This version is unsupported and might not work properly")
        data["version"] = SAVE_VERSION
        return data

    # Save data.json and changelog.json (only if self.modified is True)
    def save(self : Updater) -> None:
        try:
            if self.modified:
                self.modified = False
                # json.dump isn't used to keep the file small AND easily editable by hand
                with open('json/data.json', mode='w', encoding='utf-8') as outfile:
                    # custom json indentation
                    outfile.write("{\n")
                    keys : list[str] = list(self.data.keys())
                    k : str
                    v : Any
                    for k, v in self.data.items():
                        outfile.write(f'"{k}":\n')
                        if isinstance(v, int): # INT
                            outfile.write(f'{v}\n')
                            if k != keys[-1]:
                                outfile.write(",")
                            outfile.write("\n")
                        elif isinstance(v, list): # LIST
                            outfile.write('[\n')
                            d : Any
                            for d in v:
                                json.dump(d, outfile, separators=(',', ':'), ensure_ascii=False)
                                if d is not v[-1]:
                                    outfile.write(",")
                                outfile.write("\n")
                            outfile.write("]")
                            if k != keys[-1]:
                                outfile.write(",")
                            outfile.write("\n")
                        elif isinstance(v, dict): # DICT
                            outfile.write('{\n')
                            last : list[str] = list(v.keys())
                            if len(last) > 0:
                                last = last[-1]
                                i : int
                                d : Any
                                for i, d in v.items():
                                    outfile.write(f'"{i}":')
                                    json.dump(d, outfile, separators=(',', ':'), ensure_ascii=False)
                                    if i != last:
                                        outfile.write(",")
                                    outfile.write("\n")
                            outfile.write("}")
                            if k != keys[-1]:
                                outfile.write(",")
                            outfile.write("\n")
                    outfile.write("}")
                # changelog.json
                stat : str|None
                new : dict[str, list[Any]]
                issues : list[str]
                help : bool
                try: # load its content
                    with open('json/changelog.json', mode='r', encoding='utf-8') as f:
                        data = json.load(f)
                        stat = data.get('stat', None)
                        issues = data.get('issues', [])
                        help = data.get('help', False)
                        new = data.get('new', {})
                except:
                    new = {}
                    stat = None
                    issues = []
                    help = False
                if self.update_changelog and len(self.addition) > 0: # update new content
                    # get date of today
                    now : str = datetime.now(UTC).strftime('%Y-%m-%d')
                    if now in new: # if date present
                        existing : set[tuple[str, int|str]] = {(e[0], e[1]) for e in new[now]} # get old data
                        for el in self.addition:
                            if el not in existing:
                                new[now].append(list(el))
                    else:
                        new[now] = [list(el) for el in self.addition] # else just set new data
                    # sort keys
                    keys : list[str]= list(new.keys())
                    keys.sort(reverse=True)
                    if len(keys) > 5: # and remove oldest
                        keys = keys[:5]
                    new = {k:new[k] for k in keys}
                    # sort updated one
                    new[now] = sorted(new[now], key=lambda x: (0 if isinstance(x[1], int) else 1, x[1], x[0]), reverse=True)
                    # clear self.addition
                    self.addition = set()
                with open('json/changelog.json', mode='w', encoding='utf-8') as outfile: # the timestamp is upated below
                    json.dump({'timestamp':int(datetime.now(timezone.utc).timestamp()*1000), 'new':new, 'stat':stat, 'issues':issues, 'help':help}, outfile, indent=2, separators=(',', ':'), ensure_ascii=False)
                if self.update_changelog:
                    self.tasks.print("data.json and changelog.json updated")
                else:
                    self.tasks.print("data.json updated")
        except Exception as e:
            self.tasks.print(e)
            self.tasks.print("".join(traceback.format_exception(type(e), e, e.__traceback__)))

    def add(self : Updater, element_id : str, element_type : int|str) -> None:
        self.addition.add((element_id, element_type))

    # Generic GET request function
    async def get(self : Updater, url : str) -> Any:
        async with self.http_sem:
            response : aiohttp.HTTPResponse = await self.client.get(url, headers={'connection':'keep-alive', 'accept-encoding':'gzip'})
            async with response:
                if response.status != 200:
                    raise Exception(f"HTTP error {response.status}")
                return await response.content.read()

    # Generic HEAD request function
    async def head(self : Updater, url : str) -> Any:
        async with self.http_sem:
            response : aiohttp.HTTPResponse = await self.client.head(url, headers={'connection':'keep-alive'})
            async with response:
                if response.status != 200:
                    raise Exception(f"HTTP error {response.status}")
                return response.headers

    async def head_manifest(self : Updater, js : str) -> None:
        await self.head(MANIFEST + js + ".js")

    # format a traceback
    def trbk(self : Updater, e : Exception) -> str:
        return "".join(traceback.format_exception(type(e), e, e.__traceback__))

    def fetch_gbfal_data(self : Updater) -> None:
        try:
            # background import
            if len(self.data["background"]) != len(self.gbfal["background"]):
                self.data["background"] = self.gbfal["background"]
                self.modified = True
                self.tasks.print("New backgrounds imported from GBFAL")
            if len(self.data["mypage_bg"]) != len(self.gbfal["mypage_bg"]):
                self.data["mypage_bg"] = self.gbfal["mypage_bg"]
                self.modified = True
                self.tasks.print("New mypage backgrounds imported from GBFAL")
            # class import
            count : int = 0
            for k, jd in self.gbfal["job"].items():
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
                else:
                    # mypage section
                    if len(jd[13]) > 0 and k not in self.data["mypage"]:
                        self.tasks.add(self.update_mypage, parameters=(k,))
                        self.tasks.print("New mypage animation found in GBFAL:", k)
            if count > 0:
                self.tasks.print("Found", count, "new classes in GBFAL")
            # uncap check
            table : dict[str, int] = {}
            count = 0
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
                            if k not in self.data["styles"]:
                                self.tasks.add(self.update_character, parameters=(k, "_st2"))
                                count += 1
                    if max_uncap > 0: # add to table if not 0
                        table[k] = max_uncap
                    # mypage section
                    if len(v[9]) > 0 and k not in self.data["mypage"]:
                        self.tasks.add(self.update_mypage, parameters=(k,))
                        self.tasks.print("New mypage animation found in GBFAL:", k)
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
                    # mypage section
                    if len(v[3]) > 0 and k not in self.data["mypage"]:
                        self.tasks.add(self.update_mypage, parameters=(k,))
                        self.tasks.print("New mypage animation found in GBFAL:", k)
            for t in ("characters", "summons"):
                for k, v in self.data[t].items(): # now go over our items and our uncap table and comapre
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
                                if table[k] > max_uncap:
                                    self.tasks.add(self.update_character, parameters=(k,))
                                    count += 1
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
                                if table[k] > max_uncap:
                                    self.tasks.add(self.update_summon, parameters=(k,))
                                    count += 1
                            else: # failsafe
                                continue
            if count > 0:
                self.tasks.print(count, "possible uncap/style(s) found in GBFAL")
            # enemy appear
            for k in self.data["enemies"]:
                if k in self.gbfal["enemies"]:
                    if len(self.gbfal["enemies"][k][2]) > 0: # index 2
                        # add 'ra' list if missing
                        if "ra" not in self.data["enemies"][k]:
                            self.data["enemies"][k]["ra"] = []
                        modified = False
                        for f in self.gbfal["enemies"][k][2]:
                            parts = f.split(".png", 1)[0].split("_")
                            if len(parts) == 3:
                                appear = "_".join(parts)
                                if appear not in self.data["enemies"][k]["ra"]:
                                    self.data["enemies"][k]["ra"].append(appear)
                                    modified = True
                            elif len(parts) > 3:
                                if parts[3] in ("1", "2", "3", "4", "5", "6", "7", "8", "9", "shade"):
                                    appear = "_".join(parts[:4])
                                    if appear not in self.data["enemies"][k]["ra"]:
                                        self.data["enemies"][k]["ra"].append(appear)
                                        modified = True
                        if modified:
                            self.data["enemies"][k]["ra"].sort()
                            self.add(k, ADD_BOSS)
                            self.modified = True
        except Exception as e:
            self.tasks.print("Failed to fetch GBFAL data:\n", self.trbk(e))

    def import_gbfal_lookup(self : Updater) -> None:
        try:
            if self.data["lookup"] != self.gbfal["lookup"]:
                self.data["lookup"] = self.gbfal["lookup"]
                self.modified = True
        except Exception as e:
            self.tasks.print("Failed to import GBFAL lookup:\n", self.trbk(e))

    ### Main #################################################################################################################

    # called by -run
    async def run(self : Updater) -> None:
        # classes
        self.tasks.add(self.check_classes)
        
        #rarity of various stuff
        for r in range(1, 5):
            # weapons
            for j in range(10):
                ts = TaskStatus(1000, 15)
                for i in range(5):
                    self.tasks.add(self.update_element, parameters=(ts, 'weapons', str(r)+"0"+str(j)))
            # summons
            ts = TaskStatus(1000, 15)
            for i in range(5):
                self.tasks.add(self.update_element, parameters=(ts, 'summons', str(r)))
            if r > 1:
                # characters
                ts = TaskStatus(1000, 15)
                for i in range(5):
                    self.tasks.add(self.update_element, parameters=(ts, 'characters', str(r)))
        # skins
        ts = TaskStatus(1000, 20)
        for i in range(5):
            self.tasks.add(self.update_element, parameters=(ts, 'skins'))

        # enemies
        main : int
        sub : int
        for main in range(1, 10):
            for sub in range(1, 4):
                ts = TaskStatus(10000, 40)
                prefix : str = str(main) + str(sub)
                for i in range(10):
                    self.tasks.add(self.update_element, parameters=(ts, 'enemies', prefix))
        # start the tasks
        await self.tasks.start()

    ### Update #################################################################################################################

    # Attempt to update all given element ids
    async def update_all(self : Updater, elements : list[str]) -> None:
        element_id : str
        for element_id in elements:
            if len(element_id) >= 10:
                match element_id[:2]:
                    case "30"|"37"|"38":
                        try:
                            main, style = element_id.split("_", 1)
                            style = "_" + style
                        except:
                            main = element_id
                            style = ""
                        self.tasks.add(self.update_character, parameters=(main, style))
                    case "20":
                        self.tasks.add(self.update_summon, parameters=(element_id.split("_", 1)[0],))
                    case "10":
                        self.tasks.add(self.update_weapon, parameters=(element_id.split("_", 1)[0],))
            elif len(element_id) >= 7:
                self.tasks.add(self.update_enemy, parameters=(element_id,))
            elif len(element_id) == 6:
                self.tasks.add(self.update_class, parameters=(element_id,))
        await self.tasks.start()

    # run subroutine
    async def update_element(self : Updater, ts : TaskStatus, target : str, extra : str = "") -> None:
        match target:
            case "characters":
                while not ts.complete:
                    i : int = ts.get_next_index()
                    element_id : str = f"30{extra}0{i:03}000"
                    if (element_id in self.data[target]
                            or await self.update_character(element_id)):
                        ts.good()
                    else:
                        ts.bad()
            case "skins":
                while not ts.complete:
                    i : int = ts.get_next_index()
                    element_id : str = f"3710{i:03}000"
                    if (element_id in self.data[target]
                            or await self.update_character(element_id)):
                        ts.good()
                    else:
                        ts.bad()
            case "summons":
                while not ts.complete:
                    i : int = ts.get_next_index()
                    element_id : str = f"20{extra}0{i:03}000"
                    if (element_id in self.data[target]
                            or await self.update_summon(element_id)):
                        ts.good()
                    else:
                        ts.bad()
            case "weapons":
                while not ts.complete:
                    i : int = ts.get_next_index()
                    element_id : str = f"10{extra}{i:03}00"
                    if (element_id in self.data[target]
                            or await self.update_weapon(element_id)):
                        ts.good()
                    else:
                        ts.bad()
            case "enemies":
                while not ts.complete:
                    i : int = ts.get_next_index()
                    found : bool = False
                    for j in range(1, 4):
                        element_id : str = f"{extra}{i:04}{j}"
                        if (element_id in self.data[target]
                                or await self.update_enemy(element_id)):
                            found = True
                    if found:
                        ts.good()
                    else:
                        ts.bad()

    async def update_mypage(self : Updater, element_id : str, style : str = "") -> bool:
        try:
            add_type = None
            if len(element_id) == 10: # summons/characters
                match element_id[:2]:
                    case "20":
                        suffixes = [style, "_02"+style, "_03"+style, "_04"+style, "_05"+style]
                        add_type = ADD_SUMM
                    case "30"|"37":
                        suffixes = await self.get_mypage_list(element_id, style)
                        add_type = ADD_CHAR
                    case _:
                        self.tasks.print("Unsupported ID " + element_id + " for update_mypage")
                        return False
            elif len(element_id) == 6: # classes
                suffixes = []
                ci : str = CLASS_LIST[element_id][0].split("_")[1]
                for g in range(0, 2):
                    suffixes.append(f"_{ci}_{g}_01")
                add_type = ADD_JOB
            else:
                self.tasks.print("Unsupported ID " + element_id + " for update_mypage")
                return False
            character_data = {"v":[]}
            for uncap in suffixes:
                try:
                    f : str = "mypage_" + element_id + uncap
                    await self.head_manifest(f)
                    character_data["v"].append([str(len(character_data["v"]) + 1), f, None, None, []])
                except:
                    pass
            if len(character_data["v"]) == 0:
                return False
            if str(character_data) != str(self.data["mypage"].get(element_id, None)):
                self.data["mypage"][element_id] = character_data
                self.modified = True
                if add_type is not None:
                    self.add(element_id, add_type)
                self.tasks.print("Updated", element_id, "for mypage")
            return True
        except Exception as e:
            self.tasks.print(f"Exception for id: {element_id}, with style: {style}\n{self.trbk(e)}")
            return False

    # search for existing mypage arts
    async def get_mypage_list(self : Updater, element_id : str, style : str) -> list[str]:
        suffixes : list[str] = []
        i : int
        for i in (0, 80, 90):
            j : int
            for j in range(1, 10):
                uncap : str = str(i + j).zfill(2)
                found : bool = False
                task_params : list = []
                for g in ("", "_0", "_1"): # gender
                    for m in ("", "_101", "_102", "_103", "_104"): # multi
                        for n in ("", "_01"): # null (lyria...)
                            task_params.append((element_id, "_{}{}{}{}{}".format(uncap, style, g, m, n)))
                futures = await asyncio.gather(*[self.get_mypage_list_sub(*p) for p in task_params])
                for future in futures:
                    if future is not None:
                        suffixes.append(future)
                        found = True
                if not found:
                    break
        return suffixes

    async def get_mypage_list_sub(self : Updater, element_id : str, suffix : str) -> str|None:
        try:
            await self.head(IMG + f"sp/assets/npc/my/{element_id}{suffix}.png")
            return suffix
        except:
            return None

    # custom sort for the version sorting of characters
    def name_sort(self : Updater, name : str):
        parts : list[str] = name.split(' ')
        star : int = int(parts[0].replace('★', ''))
        name_order : int = 0
        if len(parts) > 1:
            if parts[1] == 'Gran':
                name_order = 1
            elif parts[1] == 'Djeeta':
                name_order = 2
        version_letter = ''
        if len(parts) > 2:
            version_letter = parts[-1]
            
        return (star, name_order, version_letter)

    async def update_character(self : Updater, element_id : str, style : str = "") -> bool:
        try:
            if element_id + style in self.updated_elements:
                return False
            self.updated_elements.add(element_id + style)
            
            is_partner : bool = element_id.startswith("38")
            is_special_partner : bool = element_id.startswith("388")
            if is_partner and element_id.startswith("389"):
                return await self.update_partner_main_character(element_id)
            is_skin : bool = element_id.startswith("37")
            try:
                if is_partner:
                    await self.head(IMG + f"/sp/assets/npc/raid_normal/{element_id}_01.jpg")
                else:
                    await self.head(IMG + f"/sp/assets/npc/m/{element_id}_01.jpg")
            except:
                return False
            if not is_partner and style == "":
                try:
                    await self.head(IMG + f"/sp/assets/npc/m/{element_id}_01_st2.jpg")
                    self.tasks.add(self.update_character, parameters=(element_id, "_st2"))
                except:
                    pass
            tid = ID_SUBSTITUTE.get(element_id, element_id) # fix for bobobo skin
            versions = {}
            genders = {}
            gender_ougis = {}
            mortals = {}
            phits = {}
            nsp = {}
            for uncap in range(1, 6):
                su = str(uncap).zfill(2) # uncap string, i.e. 01, 02, etc...
                found = False
                for gender in ("", "_0", "_1"): # gender check (vgrim, catura, etc..)
                    for ftype in ("", "_s2"): # version (s2 is newer)
                        for form in ("", "_f1", "_f2", "_f"): # alternate stance/form (rosetta, nicholas, etc...)
                            full_id : str = f"{tid}_{su}{style}{gender}{form}{ftype}"
                            try:
                                fn = "npc_" + full_id # create full filename
                                await self.head_manifest(fn) # check if exists, exception is raised otherwise
                                vs = su + gender + ftype + form
                                versions[vs] = fn # add in found versions
                                if gender != "":
                                    genders[vs] = gender # add in gender versions
                                # get cjs
                                data = (await self.get(CJS + fn + ".js")).decode('utf-8') # retrieve the content for the following
                                if vs not in mortals: # for characters such as lina
                                    for m in ('mortal_A', 'mortal_B', 'mortal_C', 'mortal_D', 'mortal_E', 'mortal_F', 'mortal_G', 'mortal_H', 'mortal_I', 'mortal_K'):
                                        if m in data: # we check which mortal (i.e. ougi) is found in the file, as some don't have the mortal_A
                                            mortals[vs] = m
                                            break
                                if form == "":
                                    found = True
                                try: # check attacks
                                    fn = f"phit_{full_id}".replace("_01", "")
                                    await self.head_manifest(fn)
                                    phits[vs] = fn
                                except:
                                    try: # check simpler attack if not found
                                        fn = f"phit_{tid}_{su}{style}".replace("_01", "")
                                        await self.head_manifest(fn)
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
                                if full_id not in NO_CHARGE_ATTACK:
                                    for s in ("", "_s2", "_s3"): # check ougi
                                        for g in (("", "_0") if gender == "" else (gender,)): # and gender
                                            tasks = []
                                            for m in ("", "_a", "_b", "_c", "_d", "_e", "_f", "_g", "_h", "_i", "_j"): # and variations for multiple ougi like shiva grand
                                                tasks.append(self.update_character_sub(f"nsp_{tid}_{su}{style}{g}{form}{s}{m}"))
                                            tmp = []
                                            for r in await asyncio.gather(*tasks):
                                                if r is not None:
                                                    tmp.append(r)
                                            if len(tmp) != 0:
                                                nsp[vs] = tmp
                                                if gender == "" and g != "":
                                                    gender_ougis[vs] = True
                                                break
                                    # apply patches if any and no ougi found
                                    if vs not in nsp and tid in PATCHES and PATCHES[tid][0] != "":
                                        for sub_uncap in range(uncap, 0, -1):
                                            ssu = str(sub_uncap).zfill(2)
                                            pid = PATCHES[tid][0].replace('UU', ssu).replace('FF', form)
                                            for s in ("", "_s2", "_s3"):
                                                tasks = []
                                                for m in ("", "_a", "_b", "_c", "_d", "_e", "_f", "_g", "_h", "_i", "_j"):
                                                    tasks.append(self.update_character_sub(f"nsp_{pid}{s}{m}"))
                                                tmp = []
                                                for r in await asyncio.gather(*tasks):
                                                    if r is not None:
                                                        tmp.append(r)
                                                if len(tmp) != 0:
                                                    nsp[vs] = tmp
                                                    break
                                            if vs in nsp:
                                                break
                                    if vs not in nsp: # if still no ougi found, check base form if it's an alt form
                                        if form != "":
                                            svs = su + gender + ftype
                                            if svs in nsp:
                                                nsp[vs] = nsp[svs]
                                    if vs not in nsp: # else raise error
                                        raise Exception("No charge attack")
                            except Exception as se:
                                if str(se) == "No charge attack" and not is_partner and full_id not in NO_CHARGE_ATTACK: # alexiel is excluded from this check
                                    raise se
                        if found is True: # stop loop
                            break
                    if found is True and gender != "_0": # stop loop
                        break
                if not found: # stop loop if this uncap found nothing
                    break
            if len(versions.keys()) == 0: # stop if nothing found
                return False
            # check abilities
            abilities : list[str] = []
            for s in range(1, 15): # single target skills
                try:
                    f = "ab_" + tid + "_" + str(s).zfill(2)
                    await self.head_manifest(f)
                    abilities.append(f)
                except:
                    pass
            for s in range(1, 15): # AOE skills
                try:
                    f = "ab_all_" + tid + "_" + str(s).zfill(2)
                    await self.head_manifest(f)
                    abilities.append(f)
                except:
                    pass
            name_table = {}
            for vs in versions: # now add all versions to tab
                name = ""
                if is_special_partner:
                    indice = int(vs[:2])
                    match indice:
                        case 1:
                            name = "0★ Gran"
                        case 2:
                            name = "0★ Djeeta"
                        case 3:
                            name = "0★ ???"
                elif style == "":
                    star = int(vs[:2]) # star number used in the name
                    if star == 1:
                        star = 0
                    else:
                        star += 2
                    name += f"{star}★" # format it
                else:
                    name = "Style "
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
            keys.sort(key=self.name_sort)
            character_data = {'v':[], 'ab':abilities}
            for name in keys:
                vs = name_table[name]
                sp = nsp.get(vs, [])
                if vs in gender_ougis and 'Djeeta' in name:
                    sp = nsp.get(vs, []).copy()
                    for i in range(len(sp)):
                        sp[i] = sp[i][:17] + sp[i][17:].replace('_0', '_1') # replace _0 by _1 for djeeta
                character_data['v'].append([name, versions[vs], mortals[vs], phits[vs], sp])
            if style == "":
                if is_skin:
                    target = "skins"
                elif is_partner:
                    target = "partners"
                else:
                    target = "characters"
                if str(character_data) != str(self.data[target].get(element_id, None)):
                    self.data[target][element_id] = character_data
                    self.modified = True
                    self.add(element_id, ADD_CHAR if target != "partners" else ADD_PARTNER)
                    self.tasks.print("Updated", element_id, "for index", target)
                if not is_partner:
                    if not is_skin:
                        self.tasks.add(self.update_character, parameters=(element_id, "_st2"))
                    self.tasks.add(self.update_mypage, parameters=(element_id,))
            else:
                if str(character_data) != str(self.data["styles"].get(element_id, None)):
                    self.data["styles"][element_id] = character_data
                    self.modified = True
                    self.add(element_id, ADD_CHAR)
                    self.tasks.print("Updated", element_id, "for styles")
                self.tasks.add(self.update_mypage, parameters=(element_id, "_st2"))
            return True
        except Exception as e:
            self.tasks.print(f"Exception for id: {element_id}, with style: {style}\n{self.trbk(e)}")
            return False

    # subroutine for update_character
    async def update_character_sub(self : Updater, fn : str) -> str|None:
        try:
            await self.head_manifest(fn)
            return fn
        except:
            return None

    async def update_summon(self : Updater, element_id : str) -> bool:
        try:
            if element_id in self.updated_elements:
                return False
            self.updated_elements.add(element_id)
            # containers
            sid = [element_id]
            for k in SHARED_SUMMONS:
                if element_id in k:
                    sid = list(k)
                    break
            character_data = {}
            character_data['v'] = []
            character_data['s'] = element_id
            call_found = set()
            for uncap in ("_04", "_03", "_02", "_01"):
                try:
                    await self.head(IMG + "/sp/assets/summon/m/" + element_id + uncap.replace('_01', '') + ".jpg") # try to guess uncap level based on existing portrait
                except:
                    if uncap != '_01':
                        continue
                    else:
                        return False
                match uncap: # identifiers to check according to uncap
                    case "_04":
                        uns = ("_04", "_03", "_02")
                    case "_03":
                        uns = ("_03", "_02")
                    case "_02":
                        uns = ("_02",)
                    case "_01":
                        uns = ("_01", "")
                calls = []
                for i in sid:
                    for un in uns:
                        if un in call_found:
                            break
                        for m in ("", "_a", "_b", "_c", "_d", "_e"): # look for call animations (they can have multiples)
                            fn = f"summon_{i}{un}{m}_attack"
                            try:
                                await self.head_manifest(fn)
                                await self.head_manifest(fn.replace('attack', 'damage'))
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
                                fn = "summon_" + i
                                await self.head_manifest(fn)
                                calls.append(fn)
                                break
                            except:
                                pass
                    if len(calls) == 0:
                        if uncap == "_01":
                            return False
                        else:
                            continue
                uncap_data = []
                for i, sp in enumerate(calls): # for each call
                    uncap_data.append([str(2 + int(uncap.split('_')[1])) + '★' + (' ' + chr(ord('A') + i) if (i > 0 or len(calls) > 1) else ''), SUMMON_CLASS, '', None, [sp]]) # name, cjs, mortal, phit, sp
                uncap_data.reverse()
                character_data['v'] += uncap_data
            character_data['v'].reverse()
            if str(character_data) != str(self.data["summons"].get(element_id, None)):
                self.data["summons"][element_id] = character_data
                self.modified = True
                self.add(element_id, ADD_SUMM)
                self.tasks.print("Updated", element_id, "for index summons")
            self.tasks.add(self.update_mypage, parameters=(element_id,))
            return True
        except Exception as e:
            self.tasks.print(f"Exception for id: {element_id}\n{self.trbk(e)}")
            return False

    async def update_weapon(self : Updater, element_id : str) -> bool:
        try:
            if element_id in self.updated_elements:
                return False
            self.updated_elements.add(element_id)
            try:
                await self.head(IMG + f"/sp/assets/weapon/m/{element_id}.jpg")
            except:
                return False
            # containers
            mc_cjs = CLASS[(int(element_id) // 100000) % 10]
            sid = ID_SUBSTITUTE.get(element_id, None)
            
            character_data = {}
            character_data['w'] = []
            character_data['v'] = []
            for uncap in ("", "_02", "_03"): # check uncaps (only for Opus right now)
                match uncap: # identifiers to check
                    case "_03":
                        uns = ("_03", "_02")
                        spus = [3, 2, 0]
                        name_suffix = " Lv250"
                    case "_02":
                        uns = ("_02", )
                        spus = [2, 0]
                        name_suffix = " Lv200"
                    case _:
                        uns = ("", )
                        spus = [0]
                        name_suffix = ""
                sp = None
                phit = None
                for i in ([element_id] if sid is None else [element_id, sid]):
                    for un in uns:
                        for fn in (f"phit_{i}{un}", f"phit_{i}{un}_0"): # check attack
                            try:
                                if phit is None:
                                    await self.head_manifest(fn)
                                    phit = fn
                            except:
                                pass
                        for spu in spus:
                            for fn in (f"sp_{i}", f"sp_{i}_{spu}", f"sp_{i}_{spu}_s2", f"sp_{i}_s2"): # check ougi
                                try:
                                    if sp is None:
                                        await self.head_manifest(fn)
                                        sp = fn
                                except:
                                    pass
                if phit is None or sp is None:
                    if uncap != "":
                        break
                # update for gran (0) and djeeta (1)
                mccjspart :str = mc_cjs.split('_')[1]
                for i in range(2):
                    nsp = (sp if sp is not None else f'sp_{mccjspart}_01210001')
                    tmp = [('Gran' if i == 0 else 'Djeeta') + name_suffix, mc_cjs.format(i), 'mortal_A', (phit if phit is not None else f"phit_{mccjspart}_0001"), [nsp]] # name, cjs, mortal, phit, sp
                    if i == 1: # djeeta
                        # replace gran _0 by _1 for djeeta
                        if element_id in tmp[3] or (sid is not None and sid in tmp[3]):
                            try:
                                fn = tmp[3].replace('_0', '_1')
                                await self.head_manifest(fn)
                                tmp[3] = fn
                            except:
                                pass
                        if element_id in nsp or (sid is not None and sid in nsp):
                            try:
                                fn = nsp.replace('_0', '_1')
                                await self.head_manifest(fn)
                                tmp[4][0] = fn
                            except:
                                pass
                    character_data['w'].append(element_id + uncap)
                    character_data['v'].append(tmp)
            if str(character_data) != str(self.data["weapons"].get(element_id, None)):
                self.data["weapons"][element_id] = character_data
                self.modified = True
                self.add(element_id, ADD_WEAP)
                self.tasks.print("Updated", element_id, "for index weapons")
            return True
        except Exception as e:
            self.tasks.print(f"Exception for id: {element_id}\n{self.trbk(e)}")
            return False

    async def update_enemy(self : Updater, element_id : str) -> bool:
        try:
            if element_id in self.updated_elements:
                return False
            self.updated_elements.add(element_id)
            # Check if exists
            try:
                await self.head(IMG + f"/sp/assets/enemy/s/{element_id}.png")
            except:
                return False
            try: # base cjs
                fn = "enemy_" + element_id
                await self.head_manifest(fn)
            except:
                return False
            ehit = None
            try: # attack cjs
                fn = "ehit_" + element_id
                await self.head_manifest(fn)
                ehit = fn
            except:
                pass
            if ehit is None:
                ehit = "phit_0000000000" # set generic attack if missing
            tasks = []
            for i in range(0, 20): # look for ougis (can be single or AOE)
                try:
                    tasks.append(self.update_enemy_sub(f"esp_{element_id}_{i:02}"))
                except:
                    pass
                try:
                    tasks.append(self.update_enemy_sub(f"esp_{element_id}_{i:02}_all"))
                except:
                    pass
            mortals = []
            for sp in await asyncio.gather(*tasks):
                if sp is not None:
                    mortals.append(sp)
            mortals.sort()
            # boss appear animation
            appear = []
            for k in ("", "_2", "_3", "_4", "_5", "_6", "_7", "_8", "_9", "_shade"):
                try:
                    fn = f"raid_appear_{element_id}{k}"
                    await self.head_manifest(fn)
                    appear.append(fn)
                except:
                    pass
            character_data = {} # different format to save on space
            character_data["v"] = [["", "enemy_" + element_id, None, ehit, mortals]]
            if len(appear) > 0:
                character_data["ra"] = appear
            if str(character_data) != str(self.data["enemies"].get(element_id, None)):
                self.data["enemies"][element_id] = character_data
                self.modified = True
                self.add(element_id, ADD_BOSS)
                self.tasks.print("Updated", element_id, "for index enemies")
            return True
        except Exception as e:
            self.tasks.print(f"Exception for id: {element_id}\n{self.trbk(e)}")
            return False

    # subroutine for update_enemy
    async def update_enemy_sub(self : Updater, fn : str) -> str|None:
        try:
            await self.head_manifest(fn)
            return fn
        except:
            return None

    # routine to check for new classes
    async def check_classes(self : Updater) -> None:
        keys = list(CLASS_LIST.keys())
        for element_id in keys:
            if element_id not in self.data["job"]:
                self.tasks.add(self.update_class, parameters=(element_id,), priority=0)
        await self.tasks.start()

    async def update_class(self : Updater, element_id : str) -> int:
        try:
            if element_id not in CLASS_LIST:
                return False
            try:
                await self.head(IMG + "/sp/assets/leader/m/" + element_id.split('_')[0] + "_01.jpg")
            except:
                return False
            wid = None
            colors = []
            for i in ("01", "02", "03", "04", "05", "80") if element_id not in UNIQUE_SKIN else ("01", ): # check colors/alts
                try:
                    await self.head_manifest(CLASS_LIST[element_id][0] + f"_0_{i}")
                    colors.append(CLASS_LIST[element_id][0] + f"_0_{i}")
                except:
                    pass
            if len(colors) == 0:
                return False
            abilities : list[str] = []
            ultimate_base : str|None = None
            if element_id in CLASS_WEAPON_LIST and element_id not in ORIGIN_CLASSES: # skin with custom weapon
                mortal = "mortal_B" # skin with custom ougis use this
                mc_cjs = colors[0]
                sp = None
                phit = None
                if CLASS_WEAPON_LIST[element_id] is not None: # check class weapon spritesheets
                    for s in ("", "_0"): # auto attack
                        try:
                            f = "phit_" + CLASS_WEAPON_LIST[element_id] + s
                            await self.head_manifest(f)
                            phit = f
                            break
                        except:
                            pass
                    for s in ("", "_0", "_0_s2", "_s2"): # ougi
                        try:
                            f = "sp_" + CLASS_WEAPON_LIST[element_id] + s
                            await self.head_manifest(f)
                            sp = f
                            break
                        except:
                            pass
                    for s in range(1, 10): # single target skills
                        try:
                            f = "ab_" + CLASS_WEAPON_LIST[element_id] + "_" + str(s).zfill(2)
                            await self.head_manifest(f)
                            abilities.append(f)
                        except:
                            pass
                    for s in range(1, 10): # AOE skills
                        try:
                            f = "ab_all_" + CLASS_WEAPON_LIST[element_id] + "_" + str(s).zfill(2)
                            await self.head_manifest(f)
                            abilities.append(f)
                        except:
                            pass
            else: # regular class
                mortal = "mortal_A"
                mc_cjs = colors[0]
                wid = CLASS_DEFAULT_WEAPON[mc_cjs.split('_')[1]]
                sp = None
                phit = None
                for fn in (f"phit_{element_id}", f"phit_{element_id}_0"): # check attack spritesheet
                    try:
                        if phit is None:
                            await self.head_manifest(fn)
                            phit = fn
                    except:
                        pass
                for fn in (f"sp_{element_id}", f"sp_{element_id}_0", f"sp_{element_id}_0_s2", f"sp_{element_id}_s2"): # check ougi spritesheet
                    try:
                        if sp is None:
                            await self.head_manifest(fn)
                            sp = fn
                    except:
                        pass
                # only for fighter origin so far
                if element_id in CLASS_WEAPON_LIST and element_id in ORIGIN_CLASSES:
                    for s in ("", "_0", "_0_s2", "_s2"): # ougi
                        try:
                            f = "sp_" + CLASS_WEAPON_LIST[element_id] + s
                            await self.head_manifest(f)
                            ultimate_base = f
                            break
                        except:
                            pass
            if phit is None:
                if element_id == "360101":
                    phit = "phit_racer" # special exception
                else:
                    phit = "phit_{}_0001".format(mc_cjs.split('_')[1]) # default animation used on the player
            character_data = {}
            if wid is not None: # set class weapon id
                character_data['w'] = []
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
                                await self.head_manifest(sp)
                            except:
                                try: # try alternative
                                    if "_s2" in sp:
                                        sp = sp.replace("_s2", "_s3")
                                    elif "_s3" in sp:
                                        sp = sp.replace("_s3", "_s2")
                                    else:
                                        raise Exception()
                                    await self.head_manifest(sp)
                                except:
                                    self.tasks.print("Warning:", sp, "not found for", element_id)
                                    sp = None
                    tmp = [('Gran' if i == 0 else 'Djeeta') + var, c.replace('_0_', f'_{i}_'), mortal, phit, [] if sp is None else [sp]] # name, cjs, mortal, phit, sp
                    character_data['v'].append(tmp)
                    if wid is not None:
                        character_data['w'].append(wid)
            if ultimate_base is not None:
                character_data['u'] = []
                for v in character_data['v']:
                    if "Djeeta" in v[0]:
                        character_data['u'].append(ultimate_base.replace("_0_", "_1_"))
                    else:
                        character_data['u'].append(ultimate_base)
            if str(character_data) != str(self.data["job"].get(element_id, None)):
                self.data["job"][element_id] = character_data
                self.modified = True
                self.add(element_id, ADD_JOB)
                self.tasks.print("Updated", element_id, "for index job")
            self.tasks.add(self.update_mypage, parameters=(element_id,))
            return True
        except Exception as e:
            self.tasks.print(f"Exception for id: {element_id}\n{self.trbk(e)}")
            return False

    async def update_partner_main_character(self : Updater, element_id : str) -> int:
        try:
            try:
                await self.head(IMG + f"/sp/assets/npc/raid_normal/{element_id}_01_0.jpg")
            except:
                return False
            try:
                mortal = None
                fn = f"npc_{element_id}_0_01" # create full filename
                await self.head_manifest(fn) # check if exists, exception is raised otherwise
                cjs = fn
                # get cjs
                data = (await self.get(CJS + fn + ".js")).decode('utf-8') # retrieve the content for the following
                for m in ('mortal_A', 'mortal_B', 'mortal_C', 'mortal_D', 'mortal_E', 'mortal_F', 'mortal_G', 'mortal_H', 'mortal_I', 'mortal_K'):
                    if m in data: # we check which mortal (i.e. ougi) is found in the file, as some don't have the mortal_A
                        mortal = m
                        break
            except:
                return False
            try:
                fn = "phit_" + element_id
                await self.head_manifest(fn)
                phit = fn
            except:
                try:
                    fn += "_0"
                    await self.head_manifest(fn)
                    phit = fn
                except:
                    return False
            sp = None
            for s in ("", "_s2", "_s3"):
                try:
                    fn = f"nsp_{element_id}_01{s}"
                    await self.head_manifest(fn)
                    sp = fn
                    break
                except:
                    pass
            if sp is None:
                self.tasks.print("Warning:", "special not found for", element_id)
            abilities = []
            for s in range(1, 10): # single target skills
                try:
                    fn = f"ab_{element_id}_{s:02}"
                    await self.head_manifest(fn)
                    abilities.append(fn)
                except:
                    pass
            for s in range(1, 10): # AOE skills
                try:
                    fn = f"ab_all_{element_id}_{s:02}"
                    await self.head_manifest(fn)
                    abilities.append(fn)
                except:
                    pass
            character_data = {}
            character_data['v'] = []
            character_data['ab'] = abilities
            for i in range(2):
                if i == 1: # djeeta
                    # for djeeta, we copy and edit the _0 of gran to _1
                    if phit.endswith('_0'):
                        phit = phit[:-2] + '_1'
                    if sp is not None:
                        sp = sp.replace("_01", "_02")
                        try:
                            await self.head_manifest(sp)
                        except:
                            try: # try alternative
                                if "_s2" in sp:
                                    sp = sp.replace("_s2", "_s3")
                                elif "_s3" in sp:
                                    sp = sp.replace("_s3", "_s2")
                                else:
                                    raise Exception()
                                await self.head_manifest(sp)
                            except:
                                self.tasks.print("Warning:", sp, "not found for", element_id)
                                sp = None
                character_data['v'].append([('Gran' if i == 0 else 'Djeeta'), cjs.replace('_0_', f'_{i}_'), mortal, phit, [] if sp is None else [sp]]) # name, cjs, mortal, phit, sp
            if str(character_data) != str(self.data["partners"].get(element_id, None)):
                self.data["partners"][element_id] = character_data
                self.modified = True
                self.add(element_id, ADD_PARTNER)
                self.tasks.print("Updated", element_id, "for index partners")
            return True
        except Exception as e:
            self.tasks.print(f"Exception for id: {element_id}\n{self.trbk(e)}")
            return False

    ### Others #################################################################################################################

    def fixsummon(self : Updater) -> None:
        self.tasks.print("Updating summons base classes...")
        done : bool = False
        for k in self.data["summons"]:
            for i in range(len(self.data["summons"][k]["v"])):
                if self.data["summons"][k]["v"][i][1] != SUMMON_CLASS:
                    self.data["summons"][k]["v"][i][1] = SUMMON_CLASS
                    self.modified = True
                    done = True
        if done:
            self.tasks.print("Summons base classes have been updated")

    def list_spritesheets(self : Updater, manifest : bytes) -> list|None:
        try:
            # parse the content
            res : list[str] = []
            cur : int = 0
            lstart : int = len(b'Game.imgUri+"')
            while True:
                # search start of img path
                cur = manifest.find(b'Game.imgUri+"', cur)
                if cur == -1:
                    break
                cur += lstart
                # search end of img path
                a = manifest.find(b'?', cur)
                b = manifest.find(b'",', cur)
                p : bytes
                if a == -1 and b == -1:
                    break
                elif b == -1:
                    p = manifest[cur:a]
                    cur = a
                elif a == -1:
                    p = manifest[cur:b]
                    cur = b
                elif a < b:
                    p = manifest[cur:a]
                    cur = a
                else:
                    p = manifest[cur:b]
                    cur = b
                # check validity
                if not p.endswith((b'.png', b'.jpg', b'.jpeg')):
                    continue
                # add result
                res.append(p.rsplit(b'/', 1)[-1].decode("ascii"))
            return res
        except:
            return None

    async def downloader(self : Updater, file_type : str, file : str, file_seen : set[str], error_context : str = "") -> None: # download task
        identifier : str = file_type + "#" + file
        if identifier in file_seen:
            return
        file_seen.add(identifier)
        
        p : Path
        url : str
        match file_type:
            case "manifest":
                p = Path("model/manifest", file + ".js")
                url = JS + p.as_posix()
                if p.exists():
                    self.tasks.add(self.downloader, parameters=("cjs", file, file_seen, error_context))
            case "cjs":
                p = Path("cjs", file + ".js")
                url = JS + p.as_posix()
            case "se":
                p = Path("sound/se", file)
                url = ENDPOINT + p.as_posix()
            case "voice":
                p = Path("sound/voice", file)
                url = ENDPOINT + p.as_posix()
            case "sprite":
                p = Path("img/sp/cjs", file)
                url = ENDPOINT + p.as_posix()
            case "weapon":
                p = Path("img/sp/cjs", file + ".png")
                url = ENDPOINT + p.as_posix()
            case "background":
                if file.startswith("main_"):
                    p = Path("img/sp/guild/custom/bg", file + ".png")
                else:
                    p = Path("img/sp/raid/bg", file + ".jpg")
                url = ENDPOINT + p.as_posix()
            case "mypage_bg":
                p = Path("img/sp/mypage/town", file, "bg.jpg")
                url = ENDPOINT + p.as_posix()
            case _:
                self.tasks.print("Unknown file type", file_type)
                return
        if p.exists():
            return
        p.parent.mkdir(parents=True, exist_ok=True)
        
        err_count = 0
        while err_count < 5:
            try:
                content : bytes = await self.get(url)
            except:
                err_count += 1
                continue
            match file_type:
                case "manifest":
                    # add cjs equivalent
                    self.tasks.add(self.downloader, parameters=("cjs", file, file_seen, error_context))
                    # parse manifest
                    spritesheets = self.list_spritesheets(content)
                    if spritesheets is None:
                        self.tasks.print("Failed to parse spritesheets from", p.as_posix(), "in", error_context)
                    else:
                        for surl in spritesheets:
                            self.tasks.add(self.downloader, parameters=("sprite", surl, file_seen, file))
                case "cjs":
                    audios = MP3_SEARCH.findall(content.decode('utf-8'))
                    for a in audios:
                        s = a[1:-1].split('/', 1)
                        if len(s) == 2:
                            self.tasks.add(self.downloader, parameters=(s[0], s[1], file_seen, file))
                        else:
                            self.tasks.print("Warning, skipped the following potential sound:", a, "in", error_context)
            with p.open(mode="wb") as f:
                f.write(content)
            break
        if err_count == 5:
            if file_type in ("background"):
                return
            self.tasks.print("Failed to download", p.as_posix(), "in", error_context)

    async def download(self : Updater, targets : set[str]) -> None:
        if len(targets) == 0:
            self.tasks.print("Downloading all assets...")
        else:
            self.tasks.print("Downloading assets for", len(targets), "element(s)...")
        file_seen : set[str] = set()
        for t in ("characters", "partners", "summons", "weapons", "enemies", "skins", "job", "mypage", "styles"):
            for element_id, data in self.data[t].items():
                if len(targets) != 0 and element_id not in targets:
                    continue
                for version in data["v"]:
                    self.tasks.add(self.downloader, parameters=("manifest", version[1], file_seen, "element " + element_id))
                    if version[3] is not None:
                        self.tasks.add(self.downloader, parameters=("manifest", version[3], file_seen, "element " + element_id))
                    for sp in version[4]:
                        self.tasks.add(self.downloader, parameters=("manifest", sp, file_seen, "element " + element_id))
                for weapon in data.get("w", []):
                    self.tasks.add(self.downloader, parameters=("weapon", weapon, file_seen, "element " + element_id))
        
        for element_id, data in self.data["background"].items():
            for file in data[0]:
                self.tasks.add(self.downloader, parameters=("background", file, file_seen, "background " + element_id))
        
        for element_id in self.data["mypage_bg"]:
            self.tasks.add(self.downloader, parameters=("mypage_bg", element_id, file_seen, "mypage bg " + element_id))
        await self.tasks.start()

    ### Entry Point #################################################################################################################

    # Start function
    async def start(self : Updater) -> None:
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=50)) as self.client:
            self.tasks.print(f"GBFAP Updater v{VERSION}")
            # set Ctrl+C
            try: # unix
                asyncio.get_event_loop().add_signal_handler(signal.SIGINT, self.tasks.interrupt)
            except: # windows fallback
                signal.signal(signal.SIGINT, self.tasks.interrupt)
            # parse parameters
            prog_name : str
            try: prog_name = sys.argv[0].replace('\\', '/').split('/')[-1]
            except: prog_name = "updater.py" # fallback to default
            # Set Argument Parser
            parser : argparse.ArgumentParser = argparse.ArgumentParser(prog=prog_name, description=f"Animation Updater v{VERSION} for GBFAP https://mizagbf.github.io/GBFAP/")
            primary = parser.add_argument_group('primary', 'main commands to update the data.')
            primary.add_argument('-r', '--run', help="search for new content.", action='store_const', const=True, default=False, metavar='')
            primary.add_argument('-u', '--update', help="update given elements.", nargs='+', default=None)
            primary.add_argument('-c', '--classes', help="update new classes.", action='store_const', const=True, default=False, metavar='')
            primary.add_argument('-d', '--download', help="download all assets. Can specific IDs. Time and Disk space consuming.", nargs='*', default=None)
            
            settings = parser.add_argument_group('settings', 'commands to alter the updater behavior.')
            settings.add_argument('-nc', '--nochange', help="disable update of the New category of changelog.json.", action='store_const', const=True, default=False, metavar='')
            settings.add_argument('-fs', '--fixsummon', help="update all summons default classes.", action='store_const', const=True, default=False, metavar='')
            settings.add_argument('-al', '--gbfal', help="import data.json from GBFAL.", action='store', nargs=1, type=str, metavar='PATH')
            settings.add_argument('-dg', '--debug', help="enable the debug infos in the progress string.", action='store_const', const=True, default=False, metavar='')
            args : argparse.Namespace = parser.parse_args()
            # settings
            run_help : bool = True
            if args.nochange:
                self.update_changelog = False
            if args.debug:
                self.tasks.debug = True
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
                    self.tasks.print("GBFAL data is loaded from", args.gbfal[0])
                    self.fetch_gbfal_data()
                except Exception as e:
                    self.tasks.print("GBFAL data couldn't be loaded")
                    self.tasks.print(e)
                run_help = False
            # run
            if args.run:
                self.tasks.print("Searching for new elements...")
                await self.run()
            elif args.update is not None and len(args.update) > 0:
                self.tasks.print("Updating", len(args.update), "element(s)...")
                await self.update_all(args.update)
            elif args.classes:
                self.tasks.print("Updating new classes...")
                await self.check_classes()
            elif args.download is not None:
                self.tasks.print("ONLY USE THIS COMMAND IF YOU NEED TO HOST THE ASSETS")
                self.tasks.print("Are you sure that you want to download the assets of all elements?")
                self.tasks.print("It will take time and a lot of disk space.")
                if input("Type 'yes' to continue:").lower() == 'yes':
                    await self.download(set(args.download))
                else:
                    self.tasks.print("Operation aborted...")
            elif run_help:
                parser.print_help()
            if self.gbfal is not None:
                self.import_gbfal_lookup()
            if self.modified:
                self.save()

if __name__ == "__main__":
    asyncio.run(Updater().start())
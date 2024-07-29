import asyncio
import aiohttp
import json
import os
import sys
import traceback
import time
from datetime import datetime, timezone
from typing import Optional, Callable, Any

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
    ### CONSTANT
    # limit
    MAX_NEW = 80
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
        "rsr_me_{}_01", # melee
        "rbn_bw_{}_01", # bow
        "els_mc_{}_01", # harp
        "kng_kt_{}_01" # katana
    ]
    # character patches
    PATCHES = { # tuple: substitute ougi id, substitute atk file
        # attack fixes
        # R
        "3020000000": ("", "phit_ax_0001"),
        "3020001000": ("", "phit_sw_0003"),
        "3020002000": ("", "phit_ax_0004"),
        "3020004000": ("", "phit_ax_0001"),
        "3020005000": ("", "phit_sp_0002"),
        "3020006000": ("", "phit_sw_0003"),
        "3020007000": ("", "phit_sw_0003"),
        "3020008000": ("", "phit_wa_0001"),
        "3020009000": ("", "phit_me_0004"),
        "3020010000": ("", "phit_sw_0006"),
        "3020011000": ("", "phit_wa_0004"),
        "3020012000": ("", "phit_sp_0003"),
        "3020013000": ("", "phit_kn_0003"),
        "3020014000": ("", "phit_gu_0002"),
        "3020015000": ("", "phit_kn_0006"),
        "3020016000": ("", "phit_gu_0001"),
        "3020017000": ("", "phit_kn_0006"),
        "3020018000": ("", "phit_sw_0005"),
        "3020019000": ("", "phit_sw_0004"),
        "3020020000": ("", "phit_me_0005"),
        "3020021000": ("", "phit_wa_0001"),
        "3020022000": ("", "phit_kn_0003"),
        "3020023000": ("", "phit_gu_0001"),
        "3020024000": ("", "phit_ax_0005"),
        "3020025000": ("", "phit_ax_0001"),
        "3020026000": ("", "phit_kn_0004"),
        "3020027000": ("", "phit_sw_0003"),
        "3020028000": ("", "phit_kn_0003"),
        "3020030000": ("", "phit_kn_0002"),
        "3020031000": ("", "phit_kn_0006"),
        "3020033000": ("", "phit_me_0003"),
        "3020034000": ("", "phit_gu_0001"),
        "3020036000": ("", "phit_gu_0001"),
        "3020037000": ("", "phit_me_0003"),
        "3020038000": ("", "phit_me_0001"),
        "3020039000": ("", "phit_wa_0005"),
        "3020040000": ("", "phit_sp_0002"),
        "3020041000": ("", "phit_kn_0006"),
        "3020045000": ("", "phit_kn_0004"),
        "3020046000": ("", "phit_ax_0001"),
        "3020048000": ("", "phit_sw_0002"),
        "3020049000": ("", "phit_bw_0001"),
        "3020050000": ("", "phit_0000000000"),
        "3020051000": ("", "phit_me_0003"),
        "3020052000": ("", "phit_me_0001_silent"),
        "3020053000": ("", "phit_sw_0002"),
        "3020054000": ("", "phit_kn_0005"),
        "3020056000": ("", "phit_sw_0004"),
        "3020057000": ("", "phit_sp_0001"),
        "3020058000": ("", "phit_sw_0003"),
        "3020059000": ("", "phit_me_0004"),
        "3020060000": ("", "phit_me_0001"),
        "3020061000": ("", "phit_wa_0006"),
        "3020062000": ("", "phit_me_0002"),
        "3020063000": ("", "phit_kn_0001"),
        "3020064000": ("", "phit_sw_0003"),
        "3020070000": ("", "phit_me_0002"),
        # SR
        "3030000000": ("", "phit_sp_0015"),
        "3030001000": ("", "phit_sw_0012"),
        "3030002000": ("", "phit_wa_0012"),
        "3030003000": ("", "phit_wa_0011"),
        "3030004000": ("", "phit_sw_0014"),
        "3030009000": ("", "phit_sw_0013"),
        "3030010000": ("", "phit_kn_0014"),
        "3030011000": ("", "phit_ax_0011"),
        "3030012000": ("", "phit_sw_0012"),
        "3030013000": ("", "phit_me_0013"),
        "3030014000": ("", "phit_sp_0012"),
        "3030015000": ("", "phit_me_0011"),
        "3030016000": ("", "phit_gu_0011"),
        "3030018000": ("", "phit_bw_0014"),
        "3030020000": ("", "phit_me_0013"),
        "3030024000": ("", "phit_bw_0014"),
        "3030026000": ("", "phit_mc_0014"),
        "3030027000": ("", "phit_kn_0011"),
        "3030028000": ("", "phit_sp_0012"),
        "3030029000": ("", "phit_sw_0012"),
        "3030030000": ("", "phit_gu_0011"),
        "3030031000": ("", "phit_sw_0014"),
        "3030032000": ("", "phit_3030101000"),
        "3030033000": ("", "phit_sw_0016"),
        "3030034000": ("", "phit_wa_0011"),
        "3030035000": ("", "phit_bw_0014"),
        "3030036000": ("", "phit_wa_0015"),
        "3030037000": ("", "phit_sw_0013"),
        "3030038000": ("", "phit_sw_0013"),
        "3030039000": ("", "phit_wa_0015"),
        "3030040000": ("", "phit_sw_0015"),
        "3030041000": ("", "phit_sw_0012"),
        "3030042000": ("", "phit_sw_0016"),
        "3030043000": ("", "phit_mc_0014"),
        "3030044000": ("", "phit_bw_0014"),
        "3030045000": ("", "phit_sp_0013"),
        "3030046000": ("", "phit_sw_0011"),
        "3030047000": ("", "phit_sp_0012"),
        "3030048000": ("", "phit_gu_0013"),
        "3030049000": ("", "phit_sw_0015"),
        "3030050000": ("", "phit_wa_0015"),
        "3030053000": ("", "phit_sw_0015"),
        "3030054000": ("", "phit_3710177000"),
        "3030055000": ("", "phit_me_0013"),
        "3030056000": ("", "phit_sw_0013"),
        "3030057000": ("", "phit_me_0013"),
        "3030058000": ("", "phit_wa_0011"),
        "3030059000": ("", "phit_ax_0016"),
        "3030062000": ("", "phit_sw_0011"),
        "3030063000": ("", "phit_gu_0011"),
        "3030064000": ("", "phit_bw_0012"),
        "3030066000": ("", "phit_wa_0014"),
        "3030067000": ("", "phit_bw_0014"),
        "3030068000": ("", "phit_gu_0011"),
        "3030072000": ("", "phit_sw_0014"),
        "3030075000": ("", "phit_mc_0015"),
        "3030077000": ("", "phit_sw_0012"),
        "3030081000": ("", "phit_kt_0026"),
        "3030082000": ("", "phit_me_0025"),
        "3030084000": ("", "phit_kn_0016"),
        "3030085000": ("", "phit_gu_0013"),
        "3030090000": ("", "phit_wa_0016"),
        "3030092000": ("", "phit_wa_0016"),
        "3030096000": ("", "phit_sp_0011"),
        "3030097000": ("", "phit_sw_0011"),
        "3030100000": ("", "phit_wa_0014"),
        "3030102000": ("", "phit_wa_0013"),
        "3030103000": ("", "phit_sw_0013"),
        "3030106000": ("", "phit_wa_0013"),
        "3030107000": ("", "phit_sp_0012"),
        "3030108000": ("", "phit_3040023000"),
        "3030109000": ("", "phit_me_0015"),
        "3030110000": ("", "phit_sp_0011"),
        "3030112000": ("", "phit_gu_0013"),
        "3030113000": ("", "phit_bw_0011"),
        "3030116000": ("", "phit_ax_0015"),
        "3030117000": ("", "phit_me_0015"),
        "3030118000": ("", "phit_kt_0014"),
        "3030119000": ("", "phit_ax_0011"),
        "3030121000": ("", "phit_sw_0013"),
        "3030122000": ("", "phit_me_0013"),
        "3030123000": ("", "phit_kn_0012"),
        "3030127000": ("", "phit_me_0011"),
        "3030128000": ("", "phit_ax_0014"),
        "3030129000": ("", "phit_sw_0016"),
        "3030133000": ("", "phit_sp_0013"),
        "3030134000": ("", "phit_kn_0013"),
        "3030139000": ("", "phit_ax_0013"),
        "3030140000": ("", "phit_wa_0015"),
        "3030147000": ("", "phit_me_0013"),
        "3030149000": ("", "phit_mc_0013"),
        "3030151000": ("", "phit_3030022000"),
        "3030154000": ("", "phit_gu_0021_silent"),
        "3030155000": ("", "phit_gu_0011_silent"),
        "3030157000": ("", "phit_sw_0003"),
        "3030158000": ("", "phit_3020065000"),
        "3030159000": ("", "phit_gu_0013"),
        "3030161000": ("", "phit_wa_0011"),
        "3030163000": ("", "phit_3040070000"),
        "3030165000": ("", "phit_3040007000"),
        "3030168000": ("", "phit_3040050000"),
        "3030169000": ("", "phit_me_0014"),
        "3030170000": ("", "phit_3040071000"),
        "3030175000": ("", "phit_sw_0013"),
        "3030176000": ("", "phit_sw_0012"),
        "3030178000": ("", "phit_kt_0013"),
        "3030179000": ("", "phit_bw_0014"),
        "3030181000": ("", "phit_gu_0014"),
        "3030182000": ("", "phit_3040098000"),
        "3030183000": ("", "phit_kn_0015"),
        "3030184000": ("", "phit_kt_0013"),
        "3030185000": ("", "phit_gu_0016"),
        "3030186000": ("", "phit_me_0012_silent"),
        "3030187000": ("", "phit_bw_0011"),
        "3030191000": ("", "phit_sw_0014"),
        "3030195000": ("", "phit_sw_0015"),
        "3030199000": ("", "phit_3040084000"),
        "3030200000": ("", "phit_sw_0011"),
        "3030201000": ("", "phit_3040052000"),
        "3030202000": ("", "phit_me_0004"),
        "3030203000": ("", "phit_3030083000"),
        "3030206000": ("", "phit_kt_0013"),
        "3030221000": ("", "phit_3040057000"),
        "3030223000": ("", "phit_3040006000"),
        "3030225000": ("", "phit_3040024000"),
        "3030230000": ("", "phit_gu_0001"),
        "3030233000": ("", "phit_3040078000"),
        "3030239000": ("", "phit_gu_0015"),
        "3030246000": ("", "phit_3040145000"),
        "3030250000": ("", "phit_ax_0013"),
        "3030268000": ("", "phit_bw_0011"),
        "3030272000": ("", "phit_3040191000"),
        "3030273000": ("", "phit_3030262000"),
        # SSR
        "3040014000": ("", "phit_3040004000"),
        "3040056000": ("", "phit_3040028000"),
        "3040073000": ("", "phit_3030101000"),
        "3040090000": ("", "phit_3040050000"),
        "3040091000": ("", "phit_3040060000"),
        "3040110000": ("", "phit_3040070000"),
        "3040126000": ("", "phit_3040100000"),
        "3040127000": ("", "phit_3040081000"),
        "3040128000": ("", "phit_3040025000"),
        "3040136000": ("", "phit_wa_0001"),
        "3040151000": ("", "phit_3040123000"),
        "3040154000": ("", "phit_sw_0015"),
        "3040176000": ("", "phit_3040068000"),
        "3040177000": ("", "phit_3040148000"),
        "3040210000": ("", "phit_3040138000"),
        "3040224000": ("", "phit_3040153000"),
        # skins
        "3710001000": ("", "phit_3040054000_03"),
        "3710002000": ("", "phit_3030008000_03"),
        "3710003000": ("", "phit_3040065000_03"),
        "3710004000": ("", "phit_3040227000"),
        "3710005000": ("", "phit_3030253000"),
        "3710006000": ("", "phit_3040027000"),
        "3710007000": ("", "phit_3040141000"),
        "3710008000": ("", "phit_3040143000"),
        "3710009000": ("", "phit_3040237000"),
        "3710010000": ("", "phit_3040237000"),
        "3710011000": ("", "phit_3040209000"),
        "3710013000": ("", "phit_3040141000"),
        "3710014000": ("", "phit_3040255000"),
        "3710017000": ("", "phit_3040013000"),
        "3710018000": ("", "phit_3040071000_03"),
        "3710021000": ("", "phit_3040227000"),
        "3710022000": ("", "phit_3040083000"),
        "3710023000": ("", "phit_3040077000_03"),
        "3710030000": ("", "phit_3040050000"),
        "3710031000": ("", "phit_3040237000"),
        "3710032000": ("", "phit_3040023000"),
        "3710035000": ("", "phit_3040054000_03"),
        "3710036000": ("", "phit_3040141000"),
        "3710037000": ("", "phit_3040077000_03"),
        "3710038000": ("", "phit_3040068000_03"),
        "3710039000": ("", "phit_3040101000"),
        "3710040000": ("", "phit_3040117000"),
        "3710045000": ("", "phit_3040209000"),
        "3710046000": ("", "phit_3040257000"),
        "3710047000": ("", "phit_3040054000_03"),
        "3710048000": ("", "phit_3040092000"),
        "3710050000": ("", "phit_3030008000_03"),
        "3710052000": ("", "phit_3040077000_03"),
        "3710053000": ("", "phit_3040068000_03"),
        "3710054000": ("", "phit_wa_0001"),
        "3710055000": ("", "phit_wa_0001"),
        "3710058000": ("", "phit_3040120000"),
        "3710060000": ("", "phit_3040140000"),
        "3710061000": ("", "phit_3030231000"),
        "3710062000": ("", "phit_3040010000"),
        "3710063000": ("", "phit_3040001000_03"),
        "3710064000": ("", "phit_3040060000_03"),
        "3710067000": ("", "phit_3040120000"),
        "3710068000": ("", "phit_3040035000"),
        "3710069000": ("", "phit_3030235000"),
        "3710070000": ("", "phit_3040172000_03"),
        "3710071000": ("", "phit_3040147000_03"),
        "3710072000": ("", "phit_3040031000"),
        "3710074000": ("", "phit_3040036000"),
        "3710076000": ("", "phit_3040159000"),
        "3710078000": ("", "phit_3040098000"),
        "3710080000": ("", "phit_3040030000"),
        "3710081000": ("", "phit_3040070000"),
        "3710082000": ("", "phit_3040147000"),
        "3710083000": ("", "phit_3040098000"),
        "3710087000": ("", "phit_3040187000_02"),
        "3710088000": ("", "phit_3040153000"),
        "3710089000": ("", "phit_3840153000"),
        "3710092000": ("", "phit_3040098000"),
        "3710097000": ("", "phit_3030196000"),
        "3710105000": ("", "phit_3040098000"),
        "3710106000": ("", "phit_3040033000"),
        "3710107000": ("", "phit_3040039000"),
        "3710112000": ("", "phit_1040612000"),
        "3710117000": ("", "phit_3030172000_03"),
        "3710125000": ("", "phit_3040196000"),
        "3710130000": ("", "phit_3040192000"),
        "3710134000": ("", "phit_3040155000"),
        "3710139000": ("", "phit_3040098000"),
        "3710167000": ("", "phit_3040331000"),
        # special fixes
        # Malinda
        "3030093000": ("3030093000_UUFF_1", "phit_3030093001"),
        # Vira
        "3030019000": ("3040043000_UU", "phit_sw_0016"),
        "3040053000": ("3040043000_UU", "phit_3040043000"),
        "3040116000": ("3040043000_UU", ""),
        "3040141000": ("3040043000_UU", ""),
        "3040211000": ("3040043000_UU", ""),
        "3040243000": ("3040043000_UU", ""),
        "3040385000": ("3040043000_UU", ""),
        "3710012000": ("3040043000_01", "phit_3040209000"),
        # Alexiel
        "3040232000": ("3040158000_UU", "phit_3040158000"),
        # Magisa
        "3040247000": ("3040011000_UU", ""),
        "3040412000": ("3040011000_UU", ""),
        # Amira
        "3030065000": ("3040051000_UUFF", ""),
        "3040051000": ("3040051000_02FF", ""),
        "3040287000": ("3040051000_UU", ""),
        # Zeta
        "3710019000": ("3040028000_02", "phit_3040028000_03"),
        # Lancelot
        "3710020000": ("3040023000_02", "phit_3040023000"),
        # Vira (Skin)
        "3710024000": ("3030019000_02", "phit_3040141000"),
        # Vampy
        "3710025000": ("3040057000_02", "phit_3040057000"),
        # Percival
        "3710026000": ("3040050000_02", "phit_3040050000"),
        # Jeanne d'Arc
        "3710033000": ("3040040000_02", "phit_3040040000"),
        # Seruel
        "3710034000": ("3040013000_02", "phit_3040013000"),
        # Cagliostro
        "3710042000": ("3040009000_02", "phit_3040009000"),
        # Nezahualpilli
        "3710043000": ("3040003000_03", "phit_3040003000"),
    }
    # substitute id
    ID_SUBSTITUTE = {
        "3710171000":"3710167000","3710170000":"3710167000","3710169000":"3710167000","3710168000":"3710167000", # bobobo
        "1040017100":"1040017000","1040212600":"1040212500","1040809500":"1040809400","1040911100":"1040911000","1040415100":"1040415000","1040310700":"1040310600", # opus
        "1040317600":"1040317500", "1040317700":"1040317500", "1040317800":"1040317500", "1040317900":"1040317500", "1040318000":"1040317500" # shieldsworn axe ccw
    }
    SHARED_SUMMONS = [
        set(["2030081000", "2030082000", "2030083000", "2030084000", "2040236000", "2040313000", "2040145000"]), # justice
        set(["2030085000", "2030086000", "2030087000", "2030088000", "2040237000", "2040314000", "2040146000"]), # hanged man
        set(["2030089000", "2030090000", "2030091000", "2030092000", "2040238000", "2040315000", "2040147000"]), # death
        set(["2030093000", "2030094000", "2030095000", "2030096000", "2040239000", "2040316000", "2040148000"]), # temperance
        set(["2030097000", "2030098000", "2030099000", "2030100000", "2040240000", "2040317000", "2040149000"]), # devil
        set(["2030101000", "2030102000", "2030103000", "2030104000", "2040241000", "2040318000", "2040150000"]), # tower
        set(["2030105000", "2030106000", "2030107000", "2030108000", "2040242000", "2040319000", "2040151000"]), # star
        set(["2030109000", "2030110000", "2030111000", "2030112000", "2040243000", "2040320000", "2040152000"]), # moon
        set(["2030113000", "2030114000", "2030115000", "2030116000", "2040244000", "2040321000", "2040153000"]), # sun
        set(["2030117000", "2030118000", "2030119000", "2030120000", "2040245000", "2040322000", "2040154000"]), # judgement
        # some N/R ones
        set(["2010001000", "2020003000"]),
        set(["2010004000", "2020001000"]),
        set(["2010011000", "2020002000"]),
        # alter
        set(["2030001000", "2030063000"]), # colo
        set(["2030011000", "2030064000"]), # levi
        set(["2030015000", "2030065000"]), # yggdrasil
        set(["2030032000", "2030066000"]), # lumi
        set(["2030041000", "2030067000"]), # celeste
        # carbuncles
        set(["2030016000", "2030076000"]),
        set(["2030031000", "2030073000"]),
        set(["2030021000", "2030074000"]),
        set(["2030024000", "2030075000"]),
        set(["2030042000", "2030077000"]),
        set(["2030039000", "2030078000"]),
        # optimus
        set(["2040094000", "2040269000"]), # agni
        set(["2040100000", "2040270000"]), # varuna
        set(["2040084000", "2040271000"]), # titan
        set(["2040098000", "2040272000"]), # zeph
        set(["2040080000", "2040273000"]), # zeus
        set(["2040090000", "2040274000"]), # hades
    ]
    # CDN endpoints
    ENDPOINT = "https://prd-game-a-granbluefantasy.akamaized.net/assets_en/"
    JS = ENDPOINT + "js/"
    MANIFEST = JS + "model/manifest/"
    CJS = JS + "cjs/"
    IMG = ENDPOINT + "img" # no trailing /

    def __init__(self) -> None:
        self.client = None
        self.progress = Progress() # initialized with a silent progress bar
        self.latest_additions = {}
        self.index = {}
        self.modified = False
        self.disable_save = False
        self.update_changelog = True
        self.debug_mode = False
        self.dl_queue = None # used for download
        self.gbfal = {} # gbfal data
        
        self.class_lookup = {
            "150201": ["dkf_sw", "dkf_kn"], # dark fencer
            "200201": ["acm_kn", "acm_gu"], # alchemist
            "310401": ["mcd_sw"], # mac do
            "130201": ["hrm_wa", "hrm_kn"], # hermit
            "120401": ["hlr_wa", "hlr_sp"], # iatromantis
            "150301": ["csr_sw", "csr_kn"], # chaos ruler
            "170201": ["sdw_bw", "sdw_gu"], # sidewinder
            "240201": ["gns_gu"], # gunslinger
            "360001": ["vee_me"], # vyrn suit
            "310701": ["fal_sw"], # fallen
            "400001": ["szk_kt"], # zhuque
            "450301": ["rlc_sw", "rlc_gu"], # relic buster
            "140301": ["gzk_kn", "gzk_gu"], # bandit tycoon
            "110001": ["kni_sw", "kni_sp"], # knight
            "270301": ["ris_mc"], # rising force
            "290201": ["kks_gu"], # mechanic
            "190101": ["drg_sp", "drg_ax"], # dragoon
            "140201": ["hky_kn", "hky_gu"], # hawkeye
            "240301": ["sol_gu"], # soldier
            "120301": ["sag_wa", "sag_sp"], # sage
            "120101": ["cle_wa", "cle_sp"], # cleric
            "150101": ["ars_sw", "ars_kn"], # arcana dueler
            "130301": ["wrk_wa", "wrk_kn"], # warlock
            "130401": ["mnd_wa", "mnd_kn"], # manadiver
            "310601": ["edg_sw"], # eternal 2
            "120001": ["pri_wa", "pri_sp"], # priest
            "180101": ["mst_kn", "mst_mc"], # bard
            "200301": ["dct_kn", "dct_gu"], # doctor
            "220201": ["smr_bw", "smr_kt"], # samurai
            "140001": ["thi_kn", "thi_gu"], # thief
            "370601": ["bel_me"], # belial 1
            "370701": ["ngr_me"], # cook
            "330001": ["sry_sp"], # qinglong
            "370501": ["phm_me"], # anime s2 skin
            "440301": ["rbn_bw"], # robin hood
            "160201": ["ogr_me"], # ogre
            "210301": ["mhs_me", "mhs_kt"], # runeslayer
            "310001": ["lov_sw"], # lord of vermillion
            "370801": ["frb_me"], # belial 2
            "180201": ["sps_kn", "sps_mc"], # superstar
            "310301": ["chd_sw"], # attack on titan
            "125001": ["snt_wa"], # santa
            "110301": ["spt_sw", "spt_sp"], # spartan
            "310801": ["ykt_sw"], # yukata
            "110201": ["hsb_sw", "hsb_sp"], # holy saber
            "230301": ["glr_sw", "glr_kt"], # glorybringer
            "130101": ["srr_wa", "srr_kn"], # sorcerer
            "430301": ["mnk_wa", "mnk_me"], # monk
            "280301": ["msq_kn"], # masquerade
            "250201": ["wmn_wa"], # mystic
            "160001": ["grp_me"], # grappler
            "110101": ["frt_sw", "frt_sp"], # sentinel
            "270201": ["drm_mc"], # taiko
            "300301": ["crs_sw", "crs_kt"], # chrysaor
            "360101": ["rac_gu"], # platinum sky 2
            "300201": ["gda_sw", "gda_kt"], # gladiator
            "100101": ["wrr_sw", "wrr_ax"], # warrior
            "170001": ["rng_bw", "rng_gu"], # ranger
            "280201": ["dnc_kn"], # dancer
            "410301": ["lmb_ax", "lmb_mc"],
            "100001": ["fig_sw", "fig_ax"], # fighter
            "180301": ["els_kn", "els_mc"], # elysian
            "250301": ["knd_wa"], # nekomancer
            "260201": ["asa_kn"], # assassin
            "370301": ["kjm_me"], # monster 3
            "140101": ["rdr_kn", "rdr_gu"], # raider
            "180001": ["hpt_kn", "hpt_mc"], # superstar
            "370001": ["kjt_me"], # monster 1
            "165001": ["stf_me"], # street fighter
            "160301": ["rsr_me"], # luchador
            "100201": ["wms_sw", "wms_ax"], # weapon master
            "170301": ["hdg_bw", "hdg_gu"], # nighthound
            "230201": ["sdm_sw", "sdm_kt"], # swordmaster
            "310201": ["swm_sw"], # summer
            "190301": ["aps_sp", "aps_ax"], # apsaras
            "100401": ["vkn_sw", "vkn_ax"], # viking
            "150001": ["enh_sw", "enh_kn"], # enhancer
            "220301": ["kng_bw", "kng_kt"], # kengo
            "120201": ["bis_wa", "bis_sp"], # bishop
            "310101": ["ani_sw"], # anime season 1
            "130001": ["wiz_wa", "wiz_kn"], # wizard
            "185001": ["idl_kn", "idl_mc"], # idol
            "100301": ["bsk_sw", "bsk_ax"], # berserker
            "160101": ["kun_me"], # kung fu artist
            "370201": ["kjb_me"], # monster 2
            "110401": ["pld_sw", "pld_sp"], # paladin
            "310501": ["cnq_sw"], # eternal 1
            "310901": ["vss_sw"], # versus skin
            "190001": ["lnc_sp", "lnc_ax"], # lancer
            "420301": ["cav_sp", "cav_gu"], # cavalier
            "190201": ["vkr_sp", "vkr_ax"], # valkyrie
            "260301": ["tmt_kn"], # tormentor
            "210201": ["nnj_me", "nnj_kt"], # ninja
            "370401": ["ybk_me"], # bird
            "320001": ["sut_kn"], # story dancer
            "170101": ["mrk_bw", "mrk_gu"], # archer
            "311001": ["gkn_sw"], # school
            "340001": ["gnb_ax"], # xuanwu
            "360201": ["ebi_gu"], # premium friday
            "370901": ["byk_me"], # baihu
            "460301": ["ymt_sw", "ymt_kt"], # yamato
            "140401": ["kig_kn", "kig_gu"], # king
            "311101": ["vs2_sw"], # versus rising skin
            "311201": ["tbs_sw"], # relink skin
            "400101": ["nir_kt"], # 2B skin
            "150401": ["omj_kn", "omj_kt"], # onmyoji
            "470301": ["sld_ax", "sld_gu"], # shieldsworn
            "311301": ["unf_sw"], # gw
            "311401": ["alb_sw"] # albacore
        }
        self.class_weapon = {
            "310001": "1040009100", # lord of vermillion
            "310101": None, # anime season 1
            "310201": None, # summer
            "310301": "1040014200", # attack on titan
            "310401": None, # mac do
            "310501": "1040016700", # eternal 1
            "310601": "1040016800", # eternal 2
            "310701": "1040016900", # fallen
            "310801": "1040018800", # yukata
            "310901": "1040019100", # versus
            "311001": "1040020200", # school
            "311101": "1040025000", # versus rising skin
            "311201": "1040025600", # relink skin
            "311301": "1040026400", # gw skin
            "311401": "1040026500", # albacore
            "320001": "1040115000", # school dancer
            "330001": "1040216600", # qinglong
            "340001": "1040315700", # xuanwu
            "360001": None, # vyrn suit
            "360101": "1040508600", # platinum sky 2
            "360201": "1040515800", # premium friday
            "370001": "1040610300", # monster 1
            "370201": "1040610200", # monster 2
            "370301": "1040610400", # monster 3
            "370401": None, # bird
            "370501": "1040614000", # anime s2 skin
            "370601": "1040614400", # belial 1
            "370701": "1040615300", # cook
            "370801": "1040616000", # belial 2
            "370901": "1040617400", # baihu
            "400001": "1040913700", # zhuque
            "400101": "1040916100" # 2B skin
        }
        self.class_gbfal = False
        self.class_placeholders = {
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
        self.exclusion = set([])
        self.loadIndex()
        self.http_sem = asyncio.Semaphore(self.MAX_HTTP) # http semaphore

    def update_data_from_GBFAL(self) -> None: # update class_lookup and class_weapon according to GBFAL data
        if self.class_gbfal or len(list(self.gbfal.keys())) == 0: return # only run once and if gbfal is loaded
        try:
            print("Checking GBFAL data for new classes...")
            count = 0
            for k in self.gbfal['job']:
                if k not in self.class_lookup:
                    self.class_lookup[k] = self.gbfal['job'][k][6] # mh
                    for x, v in self.gbfal['job_wpn'].items():
                        if v == k:
                            self.class_weapon[k] = x
                    for x, v in self.gbfal['job_id'].items():
                        if v == k:
                            for i in range(len(self.class_lookup[k])):
                                self.class_lookup[k] = x + "_" + self.class_lookup[k]
                    count += 1
            if count > 0:
                print("Found", count, "classes not present in GBFAP, from GBFAL, consider updating")
        except:
            pass
        self.class_gbfal = True
        try:
            print("Checking GBFAL data for new backgrounds...")
            if len(list(self.gbfal['background'].keys())) != len(list(self.index.get('background', {}))):
                self.index['background'] = self.gbfal['background']
                self.modified = True
                print("Background list updated from GBFAL")
        except:
            pass

    def update_wiki_from_GBFAL(self) -> None: # same than the above, for wiki lookup
        try:
            print("Checking GBFAL data for wiki lookup...")
            if 'wiki' not in self.index: self.index['wiki'] = {}
            for k, v in self.gbfal['lookup'].items():
                if k not in self.index: continue
                try:
                    tmp = v.split('@@', 1)[1].split(' ')[0]
                    if self.index['wiki'].get(k, None) != tmp:
                        self.index['wiki'][k] = tmp
                        self.modified = True
                except:
                    pass
        except:
            pass
        self.saveIndex()

    async def progress_container(self, coroutine : Callable) -> Any:
        with self.progress:
            try:
                return await coroutine
            except Exception as e:
                print(e)

    async def req(self, url, headers={}, head=False) -> Optional[bytes]:
        async with self.http_sem:
            if head:
                response = await self.client.head(url, headers={'connection':'keep-alive'} | headers)
                if response.status != 200: raise Exception()
                return True
            else:
                response = await self.client.get(url, headers={'connection':'keep-alive'} | headers)
                if response.status != 200: raise Exception()
                async with response:
                    return await response.content.read()

    async def run(self) -> None:
        self.debug_mode = False
        print("Updating index...")
        self.progress = Progress()
        async with asyncio.TaskGroup() as tg:
            tasks = []
            possibles = ["3020{}000", "3030{}000", "3040{}000", "3710{}000", "2010{}000", "2020{}000", "2030{}000", "2040{}000", "10100{}00", "10200{}00", "10300{}00", "10400{}00", "10201{}00", "10101{}00", "10301{}00", "10401{}00", "10102{}00", "10202{}00", "10302{}00", "10402{}00", "10103{}00", "10203{}00", "10303{}00", "10403{}00", "10104{}00", "10204{}00", "10304{}00", "10404{}00", "10105{}00", "10205{}00", "10305{}00", "10405{}00", "10106{}00", "10206{}00", "10306{}00", "10406{}00", "10107{}00", "10207{}00", "10307{}00", "10407{}00", "10108{}00", "10208{}00", "10308{}00", "10408{}00", "10209{}00", "10109{}00", "10309{}00", "10409{}00"]
            # add enemies
            for a in range(1, 10):
                for b in range(1, 4):
                    for d in [1, 2, 3]:
                        possibles.append(str(a) + str(b) + "{}" + str(d))
            for i in range(self.MAX_RUN_TASK):
                tasks.append(tg.create_task(self.run_class(i, self.MAX_RUN_TASK)))
                for j in possibles:
                    tasks.append(tg.create_task(self.run_sub(i, self.MAX_RUN_TASK, j)))
            self.progress = Progress(total=len(tasks), silent=False)
        count = 0
        for t in tasks:
            count += t.result()
        if count > 0: print(count, "new entries")
        else: print("Done")
        self.saveIndex()

    async def run_sub(self, start : int, step : int, file : str) -> int:
        with self.progress:
            eid = start
            errc = 0
            count = 0
            while errc < 20:
                is_mob = len(file) == 5
                f = file.format(str(eid).zfill(4 if is_mob else 3))
                if self.index.get(f, 0) == 0:
                    if is_mob:
                        r = await self.update_mob(f)
                    elif file.startswith("10"):
                        if f in self.class_weapon.values():
                            errc = 0
                            eid += step
                            continue
                        r = await self.update_weapon(f)
                    elif file.startswith("20"):
                        r = await self.update_summon(f)
                    else:
                        r = await self.update_character(f)
                    if r == 0:
                        errc += 1
                        if errc >= 20:
                            return count
                    else:
                        errc = 0
                        count += r
                else:
                    errc = 0
                eid += step
            return count

    async def run_class(self, start : int, step : int) -> int:
        with self.progress:
            keys = list(self.class_lookup.keys())
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
            if id not in self.class_lookup: return 0
            try:
                await self.req(self.IMG + "/sp/assets/leader/m/" + id.split('_')[0] + "_01.jpg")
            except:
                if not self.debug_mode: return 0
            wid = None
            colors = []
            for i in ["01", "02", "03", "04", "05", "80"]:
                try:
                    await self.getJS(self.class_lookup[id][0] + "_0_{}".format(i))
                    colors.append(self.class_lookup[id][0] + "_0_{}".format(i))
                except:
                    pass
            if len(colors) == 0: return 0
            if id in self.class_weapon: # skin with custom weapon
                mortal = "mortal_B" # skin with custom ougis use this
                mc_cjs = colors[0]
                sp = None
                phit = None
                if self.class_weapon[id] is not None:
                    for s in ["", "_0"]:
                        try:
                            f = "phit_" + self.class_weapon[id] + s
                            await self.getJS(f)
                            phit = f
                            break
                        except:
                            pass
                    for s in ["", "_0", "_0_s2", "_s2"]:
                        try:
                            f = "sp_" + self.class_weapon[id] + s
                            await self.getJS(f)
                            sp = f
                            break
                        except:
                            pass
            else: # regular class
                mortal = "mortal_A"
                mc_cjs = colors[0]
                wid = self.class_placeholders[mc_cjs.split('_')[1]]
                sp = None
                phit = None
                for fn in ["phit_{}".format(id), "phit_{}_0".format(id)]:
                    try:
                        if phit is None:
                            await self.getJS(fn)
                            phit = fn
                    except:
                        pass
                for fn in ["sp_{}".format(id), "sp_{}_0".format(id), "sp_{}_0_s2".format(id), "sp_{}_s2".format(id)]:
                    try:
                        if sp is None:
                            await self.getJS(fn)
                            sp = fn
                    except:
                        pass
            if phit is None:
                if id == "360101": phit = "phit_racer" # special exception
                else: phit = "phit_{}_0001".format(mc_cjs.split('_')[1])
            character_data = {}
            if wid is not None: character_data['w'] = wid
            character_data['v'] = []
            for x, c in enumerate(colors):
                if c == colors[0]: var = ""
                else: var = " v"+str(x)
                for i in range(2):
                    if i == 1: # djeeta
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
                await self.req(self.IMG + "/sp/assets/weapon/m/" + id + ".jpg")
            except:
                if not self.debug_mode: return 0
            # containers
            mc_cjs = self.CLASS[(int(id) // 100000) % 10]
            sid = self.ID_SUBSTITUTE.get(id, None)
            for uncap in ["", "_02", "_03"]:
                character_data = {}
                character_data['w'] = id + uncap
                character_data['v'] = []
                match uncap:
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
                        for fn in ["phit_{}{}".format(i, un), "phit_{}{}_0".format(i, un)]:
                            try:
                                if phit is None:
                                    await self.getJS(fn)
                                    phit = fn
                            except:
                                pass
                        for spu in spus:
                            for fn in ["sp_{}".format(i), "sp_{}_{}".format(i, spu), "sp_{}_{}_s2".format(i, spu), "sp_{}_s2".format(i)]:
                                try:
                                    if sp is None:
                                        await self.getJS(fn)
                                        sp = fn
                                except:
                                    pass
                if phit is None or sp is None:
                    if uncap == "": return 0
                    else: break
                for i in range(2):
                    nsp = (sp if sp is not None else 'sp_{}_01210001'.format(mc_cjs.split('_')[1]))
                    tmp = [('Gran' if i == 0 else 'Djeeta'), mc_cjs.format(i), 'mortal_A', (phit if phit is not None else "phit_{}_0001".format(mc_cjs.split('_')[1])), [nsp], ('_s2' in nsp or '_s3' in nsp)] # name, cjs, mortal, phit, sp, fullscreen
                    if i == 1: # djeeta
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
            mc_cjs = "fig_sw_0_01"
            sid = [id]
            for k in self.SHARED_SUMMONS:
                if id in k:
                    sid = list(k)
                    break
            character_data = {}
            character_data['v'] = []
            character_data['s'] = id
            call_found = set()
            for uncap in ["_04", "_03", "_02", "_01"]:
                try:
                    await self.req(self.IMG + "/sp/assets/summon/m/" + id + uncap.replace('_01', '') + ".jpg")
                except:
                    if not self.debug_mode: 
                        if uncap != '_01':
                            continue
                        else:
                            return 0
                match uncap:
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
                        if un in call_found: break
                        for m in ["", "_a", "_b", "_c", "_d", "_e"]:
                            fn = "summon_{}{}{}_attack".format(i, un, m)
                            try:
                                await self.getJS(fn)
                                await self.getJS(fn.replace('attack', 'damage'))
                                calls.append(fn)
                                call_found.add(un)
                            except:
                                if m != "": break
                        if len(calls) != 0: break
                    if len(calls) != 0: break
                if len(calls) == 0:
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
                for i, sp in enumerate(calls):
                    uncap_data.append([str(2 + int(uncap.split('_')[1])) + '★' + (' ' + chr(ord('A') + i) if (i > 0 or len(calls) > 1) else ''), mc_cjs, '', "phit_sw_0001", [sp], ('attack' in sp)]) # name, cjs, mortal, phit, sp, fullscreen)
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
            
            try:
                await self.req(self.IMG + "/sp/assets/enemy/s/" + id + ".png")
            except:
                if not self.debug_mode:
                    return 0
            try:
                fn = "enemy_{}".format(id)
                await self.getJS(fn)
            except:
                return 0
            ehit = None
            try:
                fn = "ehit_{}".format(id)
                await self.getJS(fn)
                ehit = fn
            except:
                pass
            if ehit is None:
                ehit = "phit_0000000000" # generic
            tasks = []
            for i in range(0, 20):
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

    async def update_mob_sub(self, fn : str) -> Optional[str]:
        try:
            await self.getJS(fn)
            return fn
        except:
            return None

    async def update_character(self, id : str, style : str = "") -> bool: # character
        try:
            if id in self.exclusion: return 0
            try:
                await self.req(self.IMG + "/sp/assets/npc/m/" + id + "_01" + style + ".jpg", head=True)
            except:
                if not self.debug_mode: return 0
            tid = self.ID_SUBSTITUTE.get(id, id) # fix for bobobo skin
            versions = {}
            genders = {}
            gender_ougis = {}
            mortals = {}
            phits = {}
            nsp = {}
            fullscreen = {}
            for uncap in range(1, 6):
                su = str(uncap).zfill(2)
                found = False
                for gender in ["", "_0", "_1"]:
                    for ftype in ["", "_s2"]:
                        for form in ["", "_f1", "_f2", "_f"]:
                            try:
                                fn = "npc_{}_{}{}{}{}{}".format(tid, su, style, gender, form, ftype)
                                await self.getJS(fn)
                                vs = su + gender + ftype + form
                                versions[vs] = fn
                                if gender != "": genders[vs] = gender
                                # get cjs
                                data = (await self.req(self.CJS + fn + ".js")).decode('utf-8')
                                if vs not in mortals: # for characters such as lina
                                    for m in ['mortal_A', 'mortal_B', 'mortal_C', 'mortal_D', 'mortal_E', 'mortal_F', 'mortal_G', 'mortal_H', 'mortal_I', 'mortal_K']:
                                        if m in data:
                                            mortals[vs] = m
                                            break
                                if form == "": found = True
                                try:
                                    fn = "phit_{}_{}{}{}{}{}".format(tid, su, style, gender, form, ftype).replace("_01", "")
                                    await self.getJS(fn)
                                    phits[vs] = fn
                                except:
                                    try:
                                        fn = "phit_{}_{}{}".format(tid, su, style).replace("_01", "")
                                        await self.getJS(fn)
                                        phits[vs] = fn
                                    except:
                                        for sub_uncap in range(uncap-1, 0, -1):
                                            ssu = str(sub_uncap).zfill(2)
                                            for k in phits:
                                                if k.startswith(ssu):
                                                    phits[vs] = phits[k]
                                                    break
                                            if vs in phits:
                                                break
                                        if vs not in phits:
                                            if tid in self.PATCHES and self.PATCHES[tid][1] != "":
                                                phits[vs] = self.PATCHES[tid][1].replace('UU', su).replace('FF', form)
                                            else:
                                                phits[vs] = 'phit_ax_0001'
                                for s in ["", "_s2", "_s3"]:
                                    for g in ["", "_0"] if gender == "" else [gender]:
                                        tasks = []
                                        for m in ["", "_a", "_b", "_c", "_d", "_e", "_f", "_g", "_h", "_i", "_j"]:
                                            tasks.append(self.update_character_sub("nsp_{}_{}{}{}{}{}{}".format(tid, su, style, g, form, s, m)))
                                        tmp = []
                                        for r in await asyncio.gather(*tasks):
                                            if r is not None:
                                                tmp.append(r)
                                        if len(tmp) != 0:
                                            nsp[vs] = tmp
                                            if gender == "" and g != "": gender_ougis[vs] = True
                                            if s != "": fullscreen[vs] = True
                                            break
                                if vs not in nsp and tid in self.PATCHES and self.PATCHES[tid][0] != "":
                                    for sub_uncap in range(uncap, 0, -1):
                                        ssu = str(sub_uncap).zfill(2)
                                        pid = self.PATCHES[tid][0].replace('UU', ssu).replace('FF', form)
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
                                if vs not in nsp:
                                    if form != "":
                                        svs = su + gender + ftype
                                        if svs in nsp:
                                            nsp[vs] = nsp[svs]
                                            fullscreen[vs] = fullscreen.get(svs, False)
                                if vs not in nsp:
                                    raise Exception("No special")
                            except:
                                pass
                        if found is True: break
                    if found is True and gender != "_0": break
                if not found: break
            if len(versions.keys()) == 0:
                return 0
            name_table = {}
            for vs in versions:
                name = ""
                star = int(vs[:2])
                if star == 1: star = 0
                else: star += 2
                name += "{}★".format(star)
                if vs in genders:
                    name += " P1" if genders[vs] == "_0" else " P2"
                elif vs in gender_ougis:
                    name += " P1"
                if "_f1" in vs: name += " B"
                elif "_f2" in vs: name += " C"
                elif "_f" in vs: name += " T"
                name_table[name] = vs
                if vs in gender_ougis:
                    name_table[name.replace('P1', 'P2')] = vs
            keys = list(name_table.keys())
            keys.sort()
            character_data = {'v':[]}
            for name in keys:
                vs = name_table[name]
                sp = nsp[vs]
                if vs in gender_ougis and 'P2' in name:
                    sp = nsp[vs].copy()
                    for i in range(len(sp)):
                        sp[i] = sp[i][:17] + sp[i][17:].replace('_0', '_1')
                character_data['v'].append([name.replace('P1', 'Gran').replace('P2', 'Djeeta'), versions[vs], mortals[vs], phits[vs], sp, fullscreen.get(vs, False)])
            if str(character_data) != str(self.index.get(id+style, None)):
                self.index[id+style] = character_data
                self.modified = True
                self.latest_additions[id+style] = 3
            if id == "3040088000" and style == "": # style check for yngwie, change it later if they add more
                return 1 + await self.update_character(id, "_st2")
            return 1
        except Exception as e:
            sys.stdout.write("\rError {} for id: {}\n".format(e, id))
            sys.stdout.flush()
            return 0

    async def update_character_sub(self, fn : str) -> Optional[str]:
        try:
            await self.getJS(fn)
            return fn
        except:
            return None

    def manifestToJSON(self, manifest : str) -> dict:
        st = manifest.find('manifest:') + len('manifest:')
        ed = manifest.find(']', st) + 1
        return json.loads(manifest[st:ed].replace('Game.imgUri+', '').replace('src:', '"src":').replace('type:', '"type":').replace('id:', '"id":'))

    async def manualUpdate(self, ids : list) -> None:
        self.progress = Progress()
        async with asyncio.TaskGroup() as tg:
            tasks = []
            for id in ids:
                if len(id) == 7:
                    tasks.append(tg.create_task(self.progress_container(self.update_mob(id))))
                elif len(id) == 10:
                    if id.startswith("10"): tasks.append(tg.create_task(self.progress_container(self.update_weapon(id))))
                    elif id.startswith("20"): tasks.append(tg.create_task(self.progress_container(self.update_summon(id))))
                    else: tasks.append(tg.create_task(self.progress_container(self.update_character(id, ""))))
                elif len(id) == 14 and id.startswith("30") and id[10] == '_':
                    tasks.append(tg.create_task(self.progress_container(self.update_character(id.split('_')[0], id.split('_')[1]))))
                elif id in self.class_lookup:
                    tasks.append(tg.create_task(self.progress_container(self.update_class(id))))
            if len(tasks) > 0:
                print("Attempting to update", len(tasks), "element(s)")
                self.progress = Progress(total=len(tasks), silent=False)
        count = 0
        for t in tasks:
            count += t.result()
        if count > 0: print(count, "new entries")
        else: print("Done")
        self.saveIndex()

    async def getJS(self, js : str) -> None:
        await self.req(self.MANIFEST + js + ".js")

    async def phitUpdate(self, phit : str) -> None:
        with self.progress:
            try:
                await self.getJS(phit)
            except:
                pass

    async def download(self, targets : list) -> None:
        print("Download all assets...")
        print("Checking directories...")
        try:
            for f in ["model/manifest", "cjs", "img/sp/cjs", "img/sp/raid/bg", "img/sp/guild/custom/bg"]:
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
        for p in self.CLASS:
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
                        case "model/manifest/": p = self.MANIFEST
                        case "cjs/": p = self.CJS
                        case "img/sp/cjs/"|"img/sp/raid/bg/"|"img/sp/guild/custom/bg/": p = self.ENDPOINT + path
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
                        existing = {}
                        for e in json.load(f).get('new', []):
                            existing[e[0]] = e[1]
                except:
                    existing = {}
                new = []
                if self.update_changelog:
                    existing = existing | self.latest_additions
                self.latest_additions = {}
                for k, v in existing.items():
                    new.append([k, v])
                if len(new) > self.MAX_NEW: new = new[len(new)-self.MAX_NEW:]
                with open('json/changelog.json', mode='w', encoding='utf-8') as outfile:
                    json.dump({'timestamp':int(datetime.now(timezone.utc).timestamp()*1000), 'new':new}, outfile)
                if self.update_changelog: print("data.json and changelog.json updated")
                else: print("data.json updated")
        except Exception as e:
            print(e)
            print("".join(traceback.format_exception(type(e), e, e.__traceback__)))

    # Print the help
    def print_help(self) -> None:
        print("Usage: python updater.py [START] [MODE]")
        print("")
        print("START parameters (Optional):")
        print("-nochange    : Disable the update of changelog.json.")
        print("-gbfal       : Followed by a path towards GBFAL data.json. Will reuse some data from this JSON file.")
        print("")
        print("MODE parameters (One at a time):")
        print("-run         : Update the data with new content.")
        print("-update      : Manual data update (Followed by IDs to check).")
        print("-download    : Download ALL assets (Time and disk space consuming).")

    async def boot(self, argv : list) -> None:
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=50)) as self.client:
                print("GBFAP updater v3.3\n")
                start_flags = set(["-nochange", "-debug"])
                flags = set()
                extras = []
                gbfal = None
                i = 0
                while i < len(argv):
                    k = argv[i]
                    if k in start_flags:
                        flags.add(k) # continue...
                    elif k == "-gbfal":
                        try:
                            gbfal = argv[i+1]
                            i += 1
                        except:
                            print("GBFAL parameter error")
                            return
                    elif k.startswith("-"):
                        flags.add(k)
                        extras = argv[i+1:]
                        break
                    else:
                        print("Unknown parameter:", k)
                        return
                    i += 1
                self.update_changelog = ('-nochange' not in flags)
                self.debug_mode = ('-debug' in flags)
                if gbfal is not None:
                    try:
                        if gbfal.startswith('https://'):
                            self.gbfal = json.loads((await self.req(gbfal)).decode('utf-8'))
                        else:
                            with open(gbfal, mode="r", encoding="utf-8") as f:
                                self.gbfal = json.load(f)
                        print("GBFAL data is loaded")
                        self.update_data_from_GBFAL()
                    except Exception as e:
                        print("GBFAL data couldn't be loaded")
                        print(e)
                
                if '-download' in flags:
                    print("ONLY USE THIS COMMAND IF YOU NEED TO HOST THE ASSETS")
                    print("Are you sure that you want to download the assets of all elements?")
                    print("It will take time and a lot of disk space.")
                    if input("Type 'yes' to continue:").lower() == 'yes':
                        await self.download(extras)
                    else:
                        print("Operation aborted...")
                elif "-update" in flags: await self.manualUpdate(extras)
                elif "-run" in flags: await self.run()
                else: self.print_help()
                if gbfal is not None:
                    self.update_wiki_from_GBFAL()
        except Exception as e:
            print("".join(traceback.format_exception(type(e), e, e.__traceback__)))

    def start(self, argv : list) -> None:
        asyncio.run(self.boot(argv))

if __name__ == "__main__":
    Updater().start(sys.argv[1:])
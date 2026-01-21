import asyncio
import aiohttp
import json
import traceback

class NameLister():
    def __init__(self):
        with open("../json/data.json", mode="r", encoding="utf-8") as f:
            self.data = json.load(f)
        try:
            with open("list_name_output.json", mode="r", encoding="utf-8") as f:
                d = json.load(f)
                self.cache = set(d["cache"])
                self.found = d["found"]
        except:
            self.cache = set()
            self.found = {}
        self.count = 0
        self.client = None

    async def req(self, file):
        try:
            if file is None or file in self.cache: return None
            self.cache.add(file)
            req = await self.client.get("https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js/cjs/{}.js".format(file))
            if req.status == 200:
                return (await req.content.read()).decode("utf-8")
            else:
                return None
        except Exception as e:
            print(file)
            print("".join(traceback.format_exception(type(e), e, e.__traceback__)))

    # Below is old code reused from GBFSB
    # Sorry for its roughness
    # To sum it up: File content is parsed
    # to build a list of animations inside
    # and their relation to each others
    # to find the root ones
    def process_file(self, file, content):
        if content is None:
            return {}
        for i in range(0, len(content)):
            if content[i] == '{':
                content = content[i+1:]
                break
        content = content[content.find(';')+1:]
        tps = []
        lvl = 0
        for i in range(len(content)):
            if content[i] == '(':
                lvl += 1
                if lvl == 1:
                    if (
                        len(tps) > 0
                        and not tps[-1].startswith(
                            (
                                'a.',
                                'b.',
                                'c.',
                                'lib.'
                            )
                        )
                            ):
                        tps.pop()
                    tps.append('')
                else:
                    tps[-1] += content[i]
            elif content[i] == ')':
                lvl -= 1
                if lvl > 0:
                    tps[-1] += content[i]
            elif lvl > 0:
                tps[-1] += content[i]
        if len(tps) > 0 and not tps[-1].startswith('a.') and not tps[-1].startswith('b.') and not tps[-1].startswith('c.') and not tps[-1].startswith('lib.'):
            tps.pop()
        dt = {}
        for s in tps:
            self._parser(s, file, dt)
        # build branches
        sbrct = {}
        branches = {}
        for k in dt:
            scr = dt[k]
            if len(scr) > 0 and len(scr[0]) > 1 and scr[0][0] == "sourceRect":
                sbrct[k] = scr[0][1]
        for k in dt:
            if k in sbrct:
                continue
            scr = dt[k]
            for cmd in scr:
                if cmd[0] == "do" or cmd[0].startswith("instance"):
                    if cmd[0] == "do":
                        n = "do"
                    elif cmd[0].startswith("instance_"):
                        n = cmd[0][len("instance_"):]
                    else:
                        n = None
                    if cmd[1].startswith("new a."):
                        sn = cmd[1][len("new a."):].split("(")[0]
                    elif cmd[1].startswith("new lib."):
                        sn = cmd[1][len("new lib."):].split("(")[0]
                    elif cmd[1].startswith("new "):
                        sn = cmd[1][len("new "):].split("(")[0]
                        if n == "do": n = "do " + sn
                    else:
                        sn = cmd[1].split("(")[0]
                    if sn not in dt:
                        continue
                    if k not in branches:
                        branches[k] = []
                    if sn not in branches[k]:
                        branches[k].append(sn)
        return branches

    def _parser(self, ck : str, file : str, dt : dict) -> None:
        eq = ck.find('=')
        com = ck.find(',')
        if eq != -1 and ((eq <= com and com != -1) or com == -1): pos = eq
        elif com != -1 and ((com <= eq and eq != -1) or eq == -1): pos = com
        current = ck[2:pos]
        content = ck[pos+1:].replace('\n', '')
        raw = []
        if pos == eq:
            lvl = [0]
            blvl = 0
            c = 0
        else:
            lvl = [0, 0]
            blvl = 1
            c = 0
        for i in range(len(content)):
            if content[i] == '{':
                blvl += 1
                lvl.append(0)
                if blvl == 1:
                    raw = []
                    c = i + 1
            elif content[i] == '}':
                blvl -= 1
                lvl.pop()
            elif content[i] == '(':
                lvl[-1] += 1
            elif content[i] == ')':
                lvl[-1] -= 1
            elif blvl == 1 and lvl[-1] == 0 and content[i] == ',':
                raw.append(content[c:i].replace('this.', ''))
                c = i + 1
        if len(raw) == 0 or content[c:i].replace('this.', '') != raw[-1]:
            raw.append(content[c:i].replace('this.', ''))
        if '.' in current:
            current = current.split('.')[-1]
        if current not in dt:
            dt[current] = []
        self._parser_final(current, raw, file, dt)

    def _parser_final(self, current : str, raw : list, file : str, dt : dict) -> None:
        for r in raw:
            if r.startswith('sourceRect=new cjs.Rectangle('):
                rargs = r[len('sourceRect=new cjs.Rectangle('):-1].split(',')
                pargs = []
                for f in rargs:
                    pargs.append(float(f))
                dt[current].append(['sourceRect', pargs])
            elif r.startswith('sourceRect=new c.Rectangle('):
                rargs = r[len('sourceRect=new c.Rectangle('):-1].split(',')
                pargs = []
                for f in rargs:
                    pargs.append(float(f))
                dt[current].append(['sourceRect', pargs])
            elif r.startswith('instance=new a.'):
                dt[current].append(['instance of', r[len('instance=new a.'):]])
            elif r.startswith('instance=new lib.'):
                dt[current].append(['instance of', r[len('instance=new lib.'):]])
            elif r.startswith('shape=(new c.Shape).'):
                if len(dt[current]) > 0 and dt[current][-1][0] == 'shape':
                    dt[current][-1].append(r[len('shape=(new c.Shape).'):])
                else:
                    dt[current].append(['shape', r[len('shape=(new c.Shape).'):]])
            elif r.startswith('shape.'):
                if len(dt[current]) > 0 and dt[current][-1][0] == 'shape':
                    dt[current][-1].append(r[len('shape.'):])
                else:
                    dt[current].append(['shape', r[len('shape.'):]])
            elif r.startswith('instance.'):
                dt[current][-1].append(r[len('instance.'):])
            elif r.startswith('timeline.addTween('):
                ts = r[len('timeline.addTween(')+len('c.Tween.'):-1].split(").")
                dt[current].append(['timeline'])
                for t in ts:
                    if t.startswith('get('): dt[current][-1].append(t.replace('get(', ''))
                    elif t.startswith('to('):
                        try:
                            exp = '{"' + t[t.find('{')+1:t.find('}')+1].replace(',', ',"').replace(':', '":').replace(":.", ":0.").replace(":-.", ":-0.").replace('!0', 'true').replace('!1', 'false').replace('\n', '')
                            tts = json.loads(exp)
                            ks = list(tts.keys())
                            if len(ks) != 1 or ks[0] != "_off":
                                tf = [0, 0, 1, 1, 0, 0, 0, 0, 0]
                                tf[0] = tts.get('x', 0.0)
                                tf[1] = tts.get('y', 0.0)
                                tf[2] = tts.get('scaleX', 1.0)
                                tf[3] = tts.get('scaleY', 1.0)
                                tf[4] = tts.get('rotation', 0.0)
                                tf[5] = tts.get('skewX', 0)
                                tf[6] = tts.get('skewY', 0)
                                tf[7] = tts.get('regX', 0)
                                tf[8] = tts.get('regY', 0)
                                dt[current][-1].append(tf)
                        except:
                            #print("exp:", exp) # DEBUG
                            dt[current][-1].append(t+")")
                    elif t.startswith('wait('):
                        pass
                    else:
                        dt[current][-1].append(t+")")
                if len(dt[current][-1]) == 2:
                    dt[current].pop()
            elif r.startswith("instance_"):
                dot = r.find('.')
                eq = r.find('=')
                if dot >= 0 and (eq == -1 or dot <= eq): p = dot
                elif eq >= 0 and (dot == -1 or eq <= dot): p = eq
                else: continue
                n = r[len("instance_"):p]
                if len(dt[current]) > 0 and dt[current][-1][0] == 'instance_'+n:
                    dt[current][-1].append(r[p+1:])
                else:
                    dt[current].append(['instance_'+n, r[p+1:]])
            elif r.startswith("frame_"):
                dot = r.find('.')
                eq = r.find('=')
                if dot >= 0 and (eq == -1 or dot <= eq): p = dot
                elif eq >= 0 and (dot == -1 or eq <= dot): p = eq
                else: continue
                n = r[len("frame_"):p]
                p += len('function(){')
                if 'lib/sound' not in r[p+1:-1]:
                    ss = r[p+1:-1].split(',')
                    for s in ss:
                        dt[current].append(['frame_'+n, s])
            elif r.startswith("initialize("):
                if file in r and len(dt[current]) > 0 and dt[current][-1][0] == 'sourceRect':
                    dt[current][-1].append(
                        r.split('(')[1]
                        .replace('', '')
                        .replace(')', '')
                        .replace(';', '')
                        .replace(file, '')
                        .split('.')[1]
                    )
            elif r.startswith("null"): # skip
                pass
            else:
                dot = r.find('.')
                eq = r.find('=')
                if dot >= 0 and (eq == -1 or dot <= eq): p = dot
                elif eq >= 0 and (dot == -1 or eq <= dot): p = eq
                else:
                    continue
                rf = r[p+1:].replace('new a.', 'new ')
                if len(dt[current]) > 0 and (dt[current][-1][0] == 'instance of' or dt[current][-1][0].startswith('instance_') or dt[current][-1][0] == 'shape') and (rf.startswith('Rectangle(') or rf.startswith('setTransform(') or rf.startswith('parent=')):
                    dt[current][-1].append(rf)
                elif len(dt[current]) > 0 and dt[current][-1][0] == 'do':
                    dt[current][-1].append(rf)
                else:
                    dt[current].append(['do', rf])

    async def check(self, eid, data):
        if "v" in data:
            for e in data["v"]:
                err = 0
                while err < 3:
                    try:
                        branches = self.process_file(e[1], await self.req(e[1]))
                        # extract the list of valid animations
                        valid = set()
                        for n in branches:
                            if n.startswith("mc_"):
                                valid.add(n)
                        for n, elems in branches.items():
                            for el in elems:
                                if el in valid:
                                    valid.remove(el)
                                elif el.startswith("gr_") and el.replace("gr_", "mc_") in valid:
                                    valid.remove(el.replace("gr_", "mc_"))
                        for el in valid:
                            el = el.split(e[1] + "_")[1]
                            if el not in self.found:
                                self.found[el] = e[1]
                                print("Found:", el, "from", e[1])
                        break
                    except Exception as e:
                        if err == 0:
                            print("Exception for " + eid + "\n" + "".join(traceback.format_exception(type(e), e, e.__traceback__)))
                        err += 1
        self.count -= 1

    async def run(self):
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=50)) as self.client:
            print("Looking for function calls in animation files...")
            for k, v in self.data.items():
                if k in ["characters", "partners", "summons", "weapons", "enemies", "skins", "job", "mypage", "styles"]:
                    if k == "summons":
                        break
                    for eid, el in v.items():
                        while self.count >= 30:
                            await asyncio.sleep(0.5)
                        asyncio.create_task(self.check(eid, el))
                        self.count += 1
            while self.count > 0:
                await asyncio.sleep(1)
            print("Done")
            with open("list_name_output.json", mode="w", encoding="utf-8") as f:
                l = list(self.found.keys())
                l.sort()
                self.found = {k : self.found[k] for k in l}
                json.dump({"found":self.found,"cache":list(self.cache)}, f, indent=0)
            print("list_name_output.json has been written")

asyncio.run(NameLister().run())
import asyncio
import aiohttp
import json
import re
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
            req = await self.client.get(
                "https://prd-game-a3-granbluefantasy.akamaized.net/assets_en/js/cjs/{}.js".format(file),
                headers={"connection":"keep-alive", "accept-encoding":"gzip"}
            )
            if req.status == 200:
                return (await req.content.read()).decode("utf-8")
            else:
                return None
        except Exception as e:
            print(file)
            print("".join(traceback.format_exception(type(e), e, e.__traceback__)))

    async def check(self, eid, data):
        if "v" in data:
            for e in data["v"]:
                err = 0
                while err < 3:
                    try:
                        motions = self.process_file(e[1], await self.req(e[1]))
                        for m in motions:
                            if m not in self.found:
                                self.found[m] = e[1]
                                print("Found:", m, "from", e[1])
                        break
                    except Exception as e:
                        if err == 0:
                            print("Exception for " + eid + "\n" + "".join(traceback.format_exception(type(e), e, e.__traceback__)))
                        err += 1
                        await asyncio.sleep(0.2)
        self.count -= 1

    def process_file(self, file_name, file_content):
        if file_content is None:
            return []
        clean_filename = file_name.rsplit('.', 1)[0]
        # extract relevant part
        start = file_content.find("mc_" + clean_filename + "=")
        a = file_content.find("{", start + 1)
        if a == -1:
            return []
        l = 0
        b = len(file_content)
        for i in range(a, len(file_content)):
            c = file_content[i]
            if c == "{":
                l += 1
            elif c == "}":
                l -= 1
                if l <= 0:
                    b = i
        file_content = file_content[a:b]
        # extract motions
        pattern = re.compile(r'this\.(\w+)=new \w+\.mc_' + re.escape(clean_filename) + r'_\w+')
        # clean up
        motions = list(set(pattern.findall(file_content)))
        i = 0
        while i < len(motions):
            j = 0
            is_part = not motions[i].startswith(clean_filename)
            if not is_part:
                for j in range(len(motions)):
                    if i == j:
                        continue
                    elif motions[j].startswith(motions[i]) or motions[i] == clean_filename:
                        is_part = True
                        break
            if is_part:
                motions.pop(i)
            else:
                i += 1
        for i in range(len(motions)):
            motions[i] = motions[i][len(clean_filename) + 1:]
        return motions

    async def run(self):
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=60)) as self.client:
            print("Looking for function calls in animation files...")
            for k, v in self.data.items():
                if k in ["characters", "partners", "summons", "weapons", "enemies", "skins", "job", "mypage", "styles"]:
                    for eid, el in v.items():
                        while self.count >= 15:
                            await asyncio.sleep(0.1)
                        asyncio.create_task(self.check(eid, el))
                        self.count += 1
            while self.count > 0:
                await asyncio.sleep(1)
            print("Done")
            with open("list_name_output.json", mode="w", encoding="utf-8") as f:
                l = list(self.found.keys())
                l.sort()
                self.found = {k : self.found[k] for k in l}
                b = list(self.cache)
                b.sort()
                json.dump({"found":self.found,"cache":b}, f, indent=0)
            print("list_name_output.json has been written")

asyncio.run(NameLister().run())
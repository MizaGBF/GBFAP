import asyncio
import aiohttp
import json
import traceback

class Tester():
    def __init__(self):
        with open("json/data.json", mode="r", encoding="utf-8") as f:
            self.data = json.load(f)
        self.cache = set()
        self.set = set()
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
            input()

    def process_file(self, file, content):
        if content is None: return
        a = 0
        b = 0
        while True:
            a = content.find("this.", b)
            if a == -1:
                return
            a += len("this.")
            b = -1
            for c in range(a, len(content)):
                match content[c]:
                    case '(':
                        s = content[a:c]
                        if s not in self.set:
                            self.set.add(s)
                            print(s, "in", file)
                        b = c
                        break
                    case ')'|'.'|'='|'?'|'&'|'|':
                        b = c
                        break
            if b == -1:
                break

    async def check(self, data):
        if "v" in data:
            for e in data["v"]:
                self.process_file(e[1], await self.req(e[1]))
                self.process_file(e[3], await self.req(e[3]))
                if isinstance(e[4], list):
                    for f in e[4]:
                        self.process_file(f, await self.req(f))
                else:
                    self.process_file(e[4], await self.req(e[4]))
        if "ehit" in data:
            self.process_file(data["ehit"], await self.req(data["ehit"]))
        if "sp" in data:
            for e in data["sp"]:
                self.process_file(e, await self.req(e))
        self.count -= 1

    async def run(self):
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=50)) as self.client:
            print("Looking for function calls in animation files...")
            for k, v in self.data.items():
                if k not in ["background", "wiki"]:
                    while self.count >= 80:
                        await asyncio.sleep(0.5)
                    asyncio.create_task(self.check(v))
                    self.count += 1
            while self.count > 0:
                await asyncio.sleep(1)
            print("Done")

asyncio.run(Tester().run())
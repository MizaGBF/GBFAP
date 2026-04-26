from typing import Any
import os
import json
try:
    import aiohttp
    from aiohttp import web
except:
    print("Error: You must install aiohttp for this script to work. Please check the README.")
    exit(0)
import webbrowser
from pathlib import Path

class LocalServer():
    VERSION = "1.0"
    
    def __init__(self) -> None:
        self.root_folder = Path.cwd().parent
        self.client = None

    def run(self) -> None:
        print(f"GBFAP Local Server v{self.VERSION}")
        try:
            with open("json/config.json", mode="r", encoding="utf-8") as f:
                obj = json.load(f)
            if obj["use_game_config"] != "localserver":
                print("\"use_game_config\" isn't set to \"localserver\" in json\\config.json.")
                if input("Do you want me to set it now? (y/N)").lower() == "y":
                    obj["use_game_config"] = "localserver"
                    with open("json/config.json", mode="w", encoding="utf-8") as f:
                        json.dump(obj, f, indent=4)
                    print("json/config.json has been updated")
        except:
            print("Error: Can't find json/config.json. Did you run this script from the GBFAP folder?")
            return
        
        app = web.Application()
        try:
            app.router.add_static("/GBFAL/", self.root_folder / "GBFAL")
        except:
            print("Warning: GBFAL folder missing, some links and images will not work.")
        try:
            app.router.add_static("/GBFTU/", self.root_folder / "GBFTU")
        except:
            print("Warning: GBFTU folder missing, some links and images will not work.")
        try:
            app.router.add_get('/GBFAP', self.index)
            app.router.add_static("/GBFAP/", self.root_folder / "GBFAP")
        except:
            print("Error: Is this folder not named GBFAP?")
            return
        try:
            app.router.add_static("/GBFML/", self.root_folder / "GBFML")
        except:
            print("Error: The GBFML folder must be present alongside GBFAP.")
            return
        app.router.add_get("/proxy/{target:.*}", self.proxy)
        app.router.add_get('/', self.root)
        app.on_startup.append(self.open_client)
        app.on_cleanup.append(self.close_client)
        try:
            print("Starting server on http://localhost:8000")
            webbrowser.open_new_tab("http://localhost:8000/GBFAP")
            web.run_app(app, port=8000, shutdown_timeout=0)
        except:
            return

    async def open_client(self, app : web.Application) -> None:
        self.client = aiohttp.ClientSession()
        await self.check_updates()

    async def close_client(self, app : web.Application) -> None:
        await self.client.close()

    async def root(self, request : web.Request) -> web.Response:
        return web.Response(text="<a href=\"GBFAP\">Open GBFAP</a>", content_type='text/html')

    async def index(self, request : web.Request) -> web.Response:
        raise web.HTTPFound('/GBFAP/index.html')

    async def proxy(self, request : web.Request) -> web.Response:
        target = request.match_info.get('target', None)
        try:
            body, status = await self.http_get(target, with_status=True)
            return web.Response(
                body=body,
                status=status,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                }
            )
        except:
            return web.Response(status=404)

    async def http_get(self, url : str, *, expect_json : bool = False, with_status : bool = False) -> Any:
        response = await self.client.get(url)
        async with response:
            if response.status != 200:
                raise Exception(f"HTTP Error {response.status}")
            if with_status:
                if expect_json:
                    return await response.json(content_type=None), response.status
                else:
                    return await response.read(), response.status
            else:
                if expect_json:
                    return await response.json(content_type=None)
                else:
                    return await response.read()

    async def check_updates(self) -> None:
        try:
            with open("json/changelog.json", mode="r", encoding="utf-8") as f:
                ts = json.load(f)["timestamp"]
            remote = await self.http_get(
                "https://raw.githubusercontent.com/MizaGBF/GBFAP/refs/heads/main/json/changelog.json",
                expect_json=True
            )
            if ts < remote["timestamp"]:
                print("Updated JSON files are available on Github.")
                if input("Do you want me to download them? (Y/n)").lower() != "n":
                    file_data : bytes = await self.http_get(
                        "https://raw.githubusercontent.com/MizaGBF/GBFAP/refs/heads/main/json/data.json"
                    )
                    with open("json/data.json", mode="wb") as f:
                        f.write(file_data)
                    with open("json/changelog.json", mode="w", encoding="utf-8") as f:
                        json.dump(remote, f, indent=4)
                    print("Files have been updated.")
                    print("If you encounter issues, you might need to update the whole project.")
        except:
            print("Warning: Failed to check if there are updated JSON files available on Github.")

if __name__ == "__main__":
    LocalServer().run()
    
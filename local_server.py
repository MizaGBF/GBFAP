import os
import json
import asyncio
import aiohttp
from aiohttp import web
import webbrowser
from pathlib import Path

class LocalServer():
    def __init__(self) -> None:
        self.client = None

    def run(self) -> None:
        try:
            with open("json/config.json", mode="r", encoding="utf-8") as f:
                obj = json.load(f)
                if obj["use_game_config"] != "localserver":
                    print("Warning: You must set \"use_game_config\" to \"localserver\" in json\\config.json")
        except:
            pass
        
        try:
            LocalServer.move_to_parent()
        except:
            print("Error: GBFAP must not be in the root directory of your drive")
            input("Press Return to quit")
            return
        
        app = web.Application()
        try:
            app.router.add_static("/GBFAL/", "./GBFAL")
        except:
            print("Warning: GBFAL folder missing, some links and images will not work.")
        try:
            app.router.add_static("/GBFTU/", "./GBFTU")
        except:
            print("Warning: GBFTU folder missing, some links and images will not work.")
        try:
            app.router.add_get('/GBFAP', self.index)
            app.router.add_static("/GBFAP/", "./GBFAP")
        except:
            print("Error: Is this folder not named GBFAP?")
            return
        try:
            app.router.add_static("/GBFML/", "./GBFML")
        except:
            print("Error: The GBFML folder must be present alongside GBFAP.")
            return
        app.router.add_get("/proxy/{target:.*}", self.proxy)
        app.router.add_get('/', self.root)
        # setup proxy HTTP client
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

    async def close_client(self, app : web.Application) -> None:
        await self.client.close()

    async def root(self, request : web.Request) -> web.Response:
        return web.Response(text="<a href=\"GBFAP\">Open GBFAP</a>", content_type='text/html')

    async def index(self, request : web.Request) -> web.Response:
        raise web.HTTPFound('/GBFAP/index.html')

    async def proxy(self, request : web.Request) -> web.Response:
        target = request.match_info.get('target', None)
        try:
            response = await self.client.get(target)
            async with response:
                if response.status != 200:
                    return web.Response(status=response.status)
                return web.Response(
                    body=await response.read(),
                    status=response.status,
                    headers={
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type, Authorization",
                    }
                )
        except:
            return web.Response(status=404)

    def move_to_parent() -> None:
        current_dir = Path.cwd()
        parent_dir = current_dir.parent

        if current_dir == parent_dir:
            raise OSError(f"Operation failed: Already at the root directory ({current_dir}).")

        try:
            os.chdir(parent_dir)
        except PermissionError:
            raise PermissionError(f"Access denied: You do not have permission to enter {parent_dir}.")
        except Exception as e:
            raise RuntimeError(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    LocalServer().run()
    
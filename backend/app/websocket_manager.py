from typing import Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, WebSocket] = {}

    async def connect(self, key: str, websocket: WebSocket):
        await websocket.accept()
        self.active[key] = websocket

    def disconnect(self, key: str):
        if key in self.active:
            del self.active[key]

    async def send_personal_message(self, key: str, message: dict):
        ws = self.active.get(key)
        if ws:
            await ws.send_json(message)

manager = ConnectionManager()

from llm.router import run_all_models
from llm.consensus import consensus
from http.server import BaseHTTPRequestHandler
import json
import asyncio

class handler(BaseHTTPRequestHandler):

    def do_POST(self):

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        data = json.loads(body)

        prompt = data.get("resume")

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        results = loop.run_until_complete(run_all_models(prompt))
        final = consensus(results)

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        self.wfile.write(json.dumps(final).encode())
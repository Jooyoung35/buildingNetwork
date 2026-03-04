# Python 3 기준. 설치 없이 실행:  python server.py
import urllib.request
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler

PORT = 5500

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if 'dapi.kakao.com' in self.path and 'sdk.js' in self.path:
            query = ('?' + self.path.split('?', 1)[1]) if '?' in self.path else ''
            url = 'https://dapi.kakao.com/v2/maps/sdk.js' + query
            try:
                with urllib.request.urlopen(url) as r:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/javascript; charset=UTF-8')
                    self.end_headers()
                    self.wfile.write(r.read())
            except Exception as e:
                self.send_response(502)
                self.end_headers()
                self.wfile.write(b'Kakao SDK proxy error')
            return
        return SimpleHTTPRequestHandler.do_GET(self)

    def log_message(self, format, *args):
        print("%s - %s" % (self.log_date_time_string(), format % args))

os.chdir(os.path.dirname(os.path.abspath(__file__)))
print('서버: http://127.0.0.1:%s' % PORT)
print('지도는 이 주소로 접속하면 됩니다 (Live Server 대신 사용).')
HTTPServer(('', PORT), Handler).serve_forever()

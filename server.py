import http.server
import socketserver
import sys

PORT = 8080

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
            print(f"Cravio live server running exclusively at http://localhost:{PORT}")
            sys.stdout.flush()
            httpd.serve_forever()
    except Exception as e:
        print(f"Server error on port {PORT}: {e}")
        sys.exit(1)

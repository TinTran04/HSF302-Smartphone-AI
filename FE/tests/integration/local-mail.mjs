// Local test-only SMTP sink; never use this server for real email.
import net from 'node:net';
import http from 'node:http';
let latest = '';
net.createServer(socket => {
  socket.write('220 localhost test SMTP\r\n');
  let buffer = '';
  let data = false;
  socket.on('data', chunk => {
    buffer += chunk.toString();
    while (buffer.includes('\r\n')) {
      const end = buffer.indexOf('\r\n');
      const line = buffer.slice(0, end); buffer = buffer.slice(end + 2);
      if (data) {
        if (line === '.') { data = false; socket.write('250 OK\r\n'); }
        else latest += line + '\n';
      } else if (/^EHLO|^HELO/i.test(line)) socket.write('250 localhost\r\n');
      else if (/^DATA/i.test(line)) { latest = ''; data = true; socket.write('354 End with .\r\n'); }
      else if (/^QUIT/i.test(line)) { socket.end('221 Bye\r\n'); }
      else socket.write('250 OK\r\n');
    }
  });
}).listen(12525, '127.0.0.1');
http.createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ otp: latest.match(/\b\d{6}\b/)?.[0] || '' }));
}).listen(12526, '127.0.0.1');

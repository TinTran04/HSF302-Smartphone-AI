// Local test-only SMTP sink; never use this server for real email.
import net from 'node:net';
import http from 'node:http';
let latest = '';
let latestRecipient = '';
net.createServer(socket => {
  // A test backend may disconnect mid-message when a run is interrupted.
  socket.on('error', () => {});
  socket.write('220 localhost test SMTP\r\n');
  let buffer = '';
  let data = false;
  let recipient = '';
  socket.on('data', chunk => {
    buffer += chunk.toString();
    while (buffer.includes('\r\n')) {
      const end = buffer.indexOf('\r\n');
      const line = buffer.slice(0, end); buffer = buffer.slice(end + 2);
      if (data) {
        if (line === '.') { data = false; socket.write('250 OK\r\n'); }
        else latest += line + '\n';
      } else if (/^EHLO|^HELO/i.test(line)) socket.write('250 localhost\r\n');
      else if (/^RCPT TO:/i.test(line)) { recipient = line.replace(/^RCPT TO:\s*<?|>$/gi, ''); socket.write('250 OK\r\n'); }
      else if (/^DATA/i.test(line)) { latest = ''; latestRecipient = recipient; data = true; socket.write('354 End with .\r\n'); }
      else if (/^QUIT/i.test(line)) { socket.end('221 Bye\r\n'); }
      else socket.write('250 OK\r\n');
    }
  });
}).listen(12525, '127.0.0.1');
http.createServer((_request, response) => {
  const separator = latest.indexOf('\n\n');
  const headers = latest.slice(0, separator);
  let body = latest.slice(separator + 2);
  if (/Content-Transfer-Encoding: base64/i.test(headers)) body = Buffer.from(body.replace(/\s/g, ''), 'base64').toString('utf8');
  if (/Content-Transfer-Encoding: quoted-printable/i.test(headers)) body = body.replace(/=\r?\n/g, '').replace(/=([a-f0-9]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  const invitationUrl = body.match(/https?:\/\/[^\s]+\/invite\?token=[a-zA-Z0-9_-]+/)?.[0] || '';
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ otp: body.match(/\b\d{6}\b/)?.[0] || '', invitationUrl, recipient: latestRecipient }));
}).listen(12526, '127.0.0.1');

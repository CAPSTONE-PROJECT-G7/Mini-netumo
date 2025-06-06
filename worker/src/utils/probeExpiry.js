const tls = require('tls');
const whois = require('whois-json');

module.exports = async function probeExpiry (url) {
  if (!url.startsWith('http')) {
    url = 'https://' + url; // ✅ force https
  }

  const { hostname, port = 443 } = new URL(url);

  const cert = await new Promise((resolve, reject) => {
    const socket = tls.connect(port, hostname, { servername: hostname }, () => {
      const info = socket.getPeerCertificate();
      socket.end(); resolve(info);
    }).on('error', reject);
  });

  const daysCert = Math.floor((new Date(cert.valid_to) - Date.now()) / 864e5);

  const res  = await whois(hostname);
  const exp  = res.expiryDate || res['Registrar Registration Expiration Date'];
  const daysDomain = exp ? Math.floor((new Date(exp) - Date.now()) / 864e5) : -1;

  return { daysCert, daysDomain };
};


const crypto = require('crypto');
const fs = require('fs');
const cipher = crypto.createCipher('aes192', 'a password');

let encrypted = '';
cipher.on('readable', () => {
  const data = cipher.read();
  console.log('!', data, '!');
  if (data)
    encrypted += data.toString('hex');
});
cipher.on('end', () => {
  console.log(encrypted);
  // Prints: ca981be48e90867604588e75d04feabb63cc007a8f8ad89b10616ed84d815504

  
});

cipher.write('some clear text data');
cipher.end();


const cipher2 = crypto.createCipher('aes192', '1a password');
let encrypted2 = cipher2.update('some clear text data', 'utf8', 'hex');
encrypted2 += cipher2.final('hex');
console.log('encrypted2', encrypted2);

const decipher2 = crypto.createDecipher('aes192', '1a password');

let decrypted = '';
decipher2.on('readable', () => {
  const data = decipher2.read();
  console.log(data);
  if (data)
    decrypted += data.toString('utf8');
});
decipher2.on('end', () => {
  console.log('decrypted', decrypted);
  // Prints: some clear text data
});

// decipher2.write(encrypted, 'hex');
decipher2.write(encrypted2, 'hex');
decipher2.end();


let cipherStream = crypto.createCipher('aes192', 'a password');

let input = fs.createReadStream('mailer.js');
let output = fs.createWriteStream('test.enc');

input.pipe(cipherStream).pipe(output);

let decipherStream = crypto.createDecipher('aes192', 'a password');
let input2 = fs.createReadStream('test.enc');
let output2 = fs.createWriteStream('test.js');

// input2.pipe(decipherStream).pipe(output2);

let crypto3 = require('crypto');
let decipher3 = crypto.createDecipher('aes192', 'a password');

let encrypted3 =
    'ca981be48e90867604588e75d04feabb63cc007a8f8ad89b10616ed84d815504';
let decrypted3 = decipher3.update(encrypted3, 'hex', 'utf8');
decrypted3 += decipher3.final('utf8');
console.log('decrypted3', decrypted3);

var base64map
= 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64ToBytes (base64) {
  // Remove non-base-64 characters
  base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

  for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
      imod4 = ++i % 4) {
    if (imod4 == 0) continue;
    bytes.push(((base64map.indexOf(base64.charAt(i - 1))
        & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
        | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
  }
  return bytes;
}

function bytesToBase64(bytes) {
  for (var base64 = [], i = 0; i < bytes.length; i += 3) {
    var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    for (var j = 0; j < 4; j++)
      if (i * 8 + j * 6 <= bytes.length * 8)
        base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
      else
        base64.push('=');
  }
  return base64.join('');
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xF).toString(16));
  }
  return hex.join('');
}

// Convert a hex string to a byte array
function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

console.log(base64ToBytes('123ABC'));
console.log(bytesToBase64(base64ToBytes('123ABC')));


console.log(hexToBytes('11111'));
console.log(bytesToHex(hexToBytes('11111')));


let str = 'customized test string.';
let secret = 'something secret';

function sha1(str){
  return crypto.createHash('sha1').update(str).digest('hex');
}

let a = crypto
.createHmac('sha256', secret)
.update(str)
.digest('base64')
.replace(/\=+$/, '');

let b = crypto
.createHmac('sha256', secret)
.update(str)
.digest('base64')
.replace(/\=+$/, '');

let sa = sha1(a);
let sb = sha1(b);

console.log('#', a, b, '#');
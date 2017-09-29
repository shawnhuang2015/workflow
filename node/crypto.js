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
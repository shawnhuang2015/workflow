const uuidv1 = require('uuid/v1');
console.log(uuidv1());
console.log(uuidv1());
console.log(uuidv1());
console.log(uuidv1());
console.log(uuidv1());

const uuidv4 = require('uuid/v4');
console.log(uuidv4());
console.log(uuidv4());
console.log(uuidv4());
console.log(uuidv4());
console.log(uuidv4());

const uuidv5 = require('uuid/v5');
console.log('hello.example.com', uuidv5.DNS);
console.log(uuidv5('hello.example.com', uuidv5.DNS));
console.log(uuidv5('hello.example.com', uuidv5.DNS));
console.log(uuidv5('http://example.com/hello', uuidv5.URL));
console.log(uuidv5('http://example.com/hello', uuidv5.URL));
console.log(uuidv5('http://example.com/hello', uuidv5.URL));

const MY_NAMESPACE = 'fdda765f-fc57-5604-a269-52a7df8164ec';

console.log(uuidv5('Hello, World!', MY_NAMESPACE));
console.log(uuidv5('Hello, World!', MY_NAMESPACE));
console.log(uuidv5('Hello, World!', MY_NAMESPACE));
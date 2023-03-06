const crypto = require('crypto');
const fs = require('fs');

function generatePair() {
	const privatePublicPair = crypto.generateKeyPairSync('rsa', {
		modulusLength: 4096,
		publicKeyEncoding: {
			type: 'pkcs1',
			format: 'pem',
		},
		privateKeyEncoding: {
			type: 'pkcs1',
			format: 'pem',
		},
	});
	const publicKey = privatePublicPair.publicKey;
	const privateKey = privatePublicPair.privateKey;

	fs.writeFileSync(__dirname + '/publicKey.pem', publicKey);
	fs.writeFileSync(__dirname + '/privateKey.pem', privateKey);
}

generatePair();

/*
 const publicKey = fs.readFileSync(__dirname + '/publicKey.pem', {
 	encoding: 'utf-8',
 })
 const privateKey = fs.readFileSync(__dirname + '/privateKey.pem', {
 	encoding: 'utf-8',
 })
 */

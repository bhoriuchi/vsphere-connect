/*
 * retrieve example
 */

var connect = require('../lib');
var util    = connect.util;
var cred    = require('../credentials');
var _       = require('lodash');


var args = {
	host: cred.endpoint,
	username: cred.user,
	password: cred.password,
	ignoreSSL: true,
	autoLogin: true,
	exclusive: true
};


connect.createClient(args).then(function(client) {
	
	// clone the vm. use your environment specific values
	return client.retrieve([{
		type: 'VirtualMachine',
		id: ['vm-800'],
		properties: ['name', 'config.hardware.device']
	}])
	.then(function(result) {
		console.log(JSON.stringify(result, null, '  '));
	})
	.then(function() {
		return client.logOut();
	})
	.caught(function(err) {
		throw err;
	});
})
.caught(function(err) {
	console.log(err);
});
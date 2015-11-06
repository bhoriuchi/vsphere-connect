var connect = require('../lib');
var cred    = require('../credentials');
var _       = require('lodash');

var viclient;

connect.client(cred.endpoint, cred.user, cred.password, cred.ignoreSSL)
.then(function(client) {

	return client.searchManagedEntities({
		type: 'VirtualMachine'
		//properties: ['name']
	}).then(function(result) {

		console.log(JSON.stringify(result, null, '  '));
		
		
		return result;
	})
	.then(function() {
		return client.logOut();
	})
	.caught(function(err) {
		console.log(err);
	});
});
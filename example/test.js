var connect = require('../lib');
var cred    = require('../credentials');


connect.client(cred.endpoint, cred.user, cred.password, cred.ignoreSSL)
.then(function(client) {
	console.log('ServiceInstance', client);
	//console.log('session', client.session);
});
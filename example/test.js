var connect = require('../lib');
var cred    = require('../credentials');

var viclient;

connect.client(cred.endpoint, cred.user, cred.password, cred.ignoreSSL)
.then(function(client) {

	return client.searchManagedEntities('Folder').then(function(view) {
		console.log(view);
		return view;
	})
	.then(function() {
		return client.logOut();
	});
});
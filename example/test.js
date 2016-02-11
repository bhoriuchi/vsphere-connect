var connect = require('../lib');
//var cred    = require('../credentials');
var _       = require('lodash');

var viclient = new connect.Client();

viclient(cred.endpoint, cred.user, cred.password, cred.ignoreSSL)
.then(function(client) {

	/*
	return client.searchManagedEntities({
		type: 'VirtualMachine',
		properties: ['name', 'id'],
		//id: ['vm-812', 'vm-778'],
		//raw: true
	})
*/
	/*
	return client.findVmByDnsName('gtnpoc02')

	*/
	/*return client.getServiceProperties({
		type: 'SessionManager',
		id: 'SessionManager',
		properties: ['currentSession', 'sessionList']
	})*/
	return client.searchManagedObjects({
		type: 'ScheduledTask',
		//id: 'EventManager',
		//id: ['vm-624'],
		//properties: ['latestEvent']
		//properties: 'all'
	})
	.then(function(result) {
		console.log(JSON.stringify(result, null, '  '));

		return result;
	})
	.then(function() {
		return client.logOut();
	})
	.caught(function(err) {
		try {
			err = JSON.stringify(err, null, '  ');
		} catch(e) {}
		console.log('got error');
		console.log(err);
	});
});
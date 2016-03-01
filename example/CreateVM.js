/*
 * CreateVM example
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
	
	var query;
	
	// monitor the task state
	client.on('task.state', function(state) {
		console.log(state);
	});
	

	return client.method('CreateVM_Task', {
		_this: util.moRef('Folder', 'group-v3'),
		config: {
			name: 'newvm01',
			guestId: 'ubuntu64Guest',
			files: {
				vmPathName: '[datastore] newvm01/newvm01.vmx'
			},
			version: 'vmx-08',
			memoryMB: 2048,
			numCPUs: 1
		},
		pool: 'resgroup-51'
	})
	.then(function(result) {
		
		// format the result to get
		return connect.format(result);
		
		// start a monitor that polls every 5 seconds
		//return client.monitor.task(result.id, 5000);	
	})
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
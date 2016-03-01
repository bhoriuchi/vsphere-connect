/*
 * CloneVM example
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
	
	// monitor the task state
	client.on('task.state', function(state) {
		console.log(state);
	});
	
	// clone the vm. use your environment specific values
	return client.method('CloneVM_Task', {
		_this: util.moRef('VirtualMachine', 'vm-830'),
		folder: "group-v3",
		name: "cloned01",
		spec: {
			location: {
				pool: "resgroup-51",
				datastore: "datastore-836"
			},
			powerOn: false,
			template: false
		}
	})
	.then(function(result) {
		
		// format the result to get
		result = connect.format(result);
		
		// start a monitor that polls every 5 seconds
		return client.monitor.task(result.id, 5000);	
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
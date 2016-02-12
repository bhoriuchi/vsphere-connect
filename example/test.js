var connect = require('../lib');
var util    = connect.util;
var cred    = require('../credentials');
var _       = require('lodash');


var args = {
	host: cred.endpoint,
	username: cred.user,
	password: cred.password,
	ignoreSSL: cred.ignoreSSL,
	autoLogin: true,
	events: {
		interval: 10000
	}
};

connect.createClient(args).then(function(client) {
	
	client.on('TaskEvent', function(event) {
		console.log('---------');
		console.log(event);
		console.log('---------');
	});
	
	//client.on('emitlog', function(l) {
	//	console.log(l);
	//});
	
	//console.log(client.serviceContent.rootFolder);
	
	/* group-d870
	return client.findVmByDnsName('gtnpoc02')

	*/
	/*return client.getServiceProperties({
		type: 'SessionManager',
		id: 'SessionManager',
		properties: ['currentSession', 'sessionList']
	})*/
	
	
	return client.retrieve({
		type: 'Folder',
		//id: 'group-v3',
		//id: ['vm-624'],
		properties: ['name']
		//properties: 'all'
	})
	
	/*
	var start = (new Date((new Date()).valueOf() - (60000 * 10))).toISOString();
	
	console.log('Now', (new Date()).toISOString());
	console.log('Begin', start);
	
	
	return client.method('QueryEvents', {
		_this: util.moRef('EventManager', 'EventManager'),
		filter: {
			time: {
				beginTime: start
			}
		}
	})
	*/
	/*
	return client.destroy({
		id: 'group-d884',
		type: 'Folder',
		async: false
	})*/
	
	/*
	return client.findByName({
		type: 'VirtualMachine',
		name: 'cloud-dc01',
		recursive: true,
		properties: ['name']
	})*/
	
	.then(function(result) {
		console.log(JSON.stringify(result, null, '  '));

		return result;
	})
	//.then(function() {
	//	return client.logOut();
	//})
	.caught(function(err) {
		try {
			err = JSON.stringify(err, null, '  ');
		} catch(e) {}
		console.log(err);
	});
})
.caught(function(err) {
	console.log('error');
	console.log(err);
});
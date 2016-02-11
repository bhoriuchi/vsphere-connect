var connect = require('../lib');
var cred    = require('../credentials');
var _       = require('lodash');

var viclient = new connect.Client();

var args = {
	host: cred.endpoint,
	username: cred.user,
	password: cred.password,
	ignoreSSL: cred.ignoreSSL,
	autoLogin: true
};

viclient(args)
.then(function(client) {
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
	.then(function() {
		return client.logOut();
	})
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
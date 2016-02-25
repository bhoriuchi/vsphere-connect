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
	exclusive: true,
	//events: {
	//	interval: 10000
	//}
};


function findKey(obj, key, path, seen, results) {
	
	path    = path || [];
	seen    = seen || [];
	results = results || [];
	
	if (Array.isArray(obj)) {
		_.forEach(obj, function(o) {
			if (!_.includes(seen, o)) {
				findKey(o, key, _.clone(path), seen, results);
			}
		});
	}
	else if (_.isObject(obj)) {
		
		seen.push(obj);
		
		_.forEach(obj, function(v, k) {
			
			//var rx       = new RegExp(k, 'i');
			var thisPath = _.clone(path);
			thisPath.push(k);
			
			if (_.lowerCase(k) === _.lowerCase(key)) {
				console.log(thisPath.join('.'));
				results.push(thisPath.join('.'));
			}
			
			if (!_.includes(seen, v)) {
				findKey(v, key, thisPath, seen, results);
			}
		});
	}
	
	return results;
}


connect.createClient(args).then(function(client) {

	console.log(client.types.MethodFault());
	
	//findKey(client.client.wsdl, 'ManagedObjectReference');
	
	//console.log(client.client.wsdl._includesWsdl[0].definitions.schemas['urn:vim25'].types.VsanHostNodeState);
	//console.log(_.keys(client.client.wsdl.services.VimService.ports.VimPort.binding.topElements));
	//console.log(JSON.stringify(client.client.wsdl._includesWsdl[0].definitions.schemas['urn:vim25'].types.VsanHostNodeState, null, '  '));
	
	//_includesWsdl.definitions.schemas.urn:vim25.complexTypes
	//definitions.schemas.urn:vim25.complexTypes
	
	/*
	client.on('TaskEvent', function(event) {
		console.log('---------');
		console.log(event);
		console.log('---------');
	});
	*/
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
	
	/*
	return client.retrieve([{
		type: 'ResourcePool',
		properties: ['name']
	}, {
		type: 'Datacenter',
		properties: ['name', 'parent']
	}])
*/	
	
	/*
	client.on('updates', function(updates) {
		console.log(JSON.stringify(updates, null, '  '));
	});
	
	client.emitUpdates([{
		type: 'Folder',
		properties: ['name']
	}, {
		type: 'ClusterComputeResource',
		properties: ['name']
	}]);
	
	*/
	
	/*
	return client.findParentType({
		client: client,
		type: 'ResourcePool',
		id: 'resgroup-50',
		parentType: 'ResourcePool1',
		root: true
	})
	*/
	
	
	// resgroup-50 should return 47
	
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
	/*
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
	});*/
})
.caught(function(err) {
	console.log('error');
	console.log(err);
});
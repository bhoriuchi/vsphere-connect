/**
 * vSphere Connect - borrowed heavily from node-vsphere-soap
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */

// create a global hash
var env = {
	statics   : require('./statics'),
	lodash    : require('lodash'),
	promise   : require('bluebird'),
	soap      : require('soap'),
	constants : require('constants'),
	nodexml   : require('nodexml'),
	cookie    : require('soap-cookie'),
	schema    : require('vsphere-schema'),
	emitter   : new require('events').EventEmitter()
};

// import the modules
env.util   = require('./util')(env);
env.format = require('./format')(env);
env.client = require('./client')(env);


// return the module
module.exports = {
	type    : 'vsphere-connect',
	version : '0.0.1',
	env     : env,
	Client  : env.client
};

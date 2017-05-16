/**
 * vSphere Connect - Promise based vSphere client
 * inspired by node-vsphere-soap
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
	event     : require('events').EventEmitter,
	nodeutil  : require('util')
};

// import the modules
env.util     = require('./util')(env);
env.format   = require('./format')(env);
env.specUtil = require('./specUtil')(env);
env.client   = require('./client')(env);


// return the module
module.exports = {
	type         : 'vsphere-connect',
	version      : '1.0.0',
	env          : env,
	util         : env.util,
	format       : env.format,
	schema       : env.schema,
	Client       : env.client,
	createClient : function(args) {
		return (new env.client(args));
	}
};

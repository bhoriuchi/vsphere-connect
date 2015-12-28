/**
 * vSphere Connect - borrowed heavily from node-vsphere-soap
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */

var EventEmitter = require('events').EventEmitter;

var env = {
	statics   : require('./statics'),
	lodash    : require('lodash'),
	promise   : require('bluebird'),
	soap      : require('soap'),
	constants : require('constants'),
	toxml     : require('object-to-xml'),
	cookie    : require('soap-cookie'),
	schema    : require('vsphere-schema'),
	emitter   : new EventEmitter()
};

env.util   = require('./util')(env);
env.format = require('./format')(env);
env.client = require('./client')(env);


module.exports = {
	type    : 'vsphere-connect',
	version : '0.0.1',
	env     : env,
	client  : env.client
};



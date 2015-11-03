/**
 * vSphere Util - borrowed heavily from node-vsphere-soap
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
	emitter   : new EventEmitter()
};

env.client = require('./client')(env);


module.exports = {
	type    : 'vsphere-util',
	version : '0.0.1',
	env     : env,
	client  : env.client
};



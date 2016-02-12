/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	var _       = env.lodash;
	var Promise = env.promise;
	
	// compose or decompose a moRef
	function moRef(type, id) {
		
		if (type && id) {
			return {
				attributes: {
					type: type
				},
				"$value": id
			};
		}
		else if (typeof(type) === 'object') {
			return {
				id: _.get(type, '$value'),
				type: _.get(type, 'attributes.type') || _.get(type, 'attributes.xsi:type')
			};
		}
		return null;
	}
	
	// function to get the soap type of an object
	function sType(obj) {
		return _.get(obj, 'attributes.xsi:type') || _.get(obj, 'attributes.type') || null;
	}
	
	// determine if type is an array
	function isArray(obj) {
		var type = sType(obj);
		return (Array.isArray(obj) || (typeof(type) === 'string' && type.substring(0, 5) === 'Array'));
	}
	
	// check for boolean
	function isBoolean(obj) {
		var type = sType(obj);
		return (_.has(obj, '$value') && (type === 'xsd:boolean' || type === 'boolean'));
	}
	
	// function to check for object with keys
	function hasKeys(obj) {
		return (!Array.isArray(obj) && _.isObject(obj) && _.keys(obj).length > 0);
	}
	
	
	// TODO - replace with vsphere-schema method
	// function to check if an object has a specific method
	function hasMethod(apiVersion, type, method) {
		return _.has(env.schema[apiVersion], type + '.methods.' + method);
	}
	
	// function to get valid paths
	function filterValidPaths(type, paths, version) {
		var valid = [];
		
		version = env.schema[version] || env.schema['5.1'];
		
		_.forEach(paths, function(p) {
			if (env.schema.hasProperty(version, type, p)) {
				valid.push(p);
			}
		});
		
		return valid;
	}
	
	// returns a promise that resolves to an error
	function newError(errorCode, errorMessage) {
		
		var errObj;
		
		if (_.isObject(errorCode)) {
			errObj = errorCode;
		}
		else if (typeof(errorCode) === 'number') {
			errObj = {
				errorCode: errorCode,
			};
			
			if (errorMessage) {
				errObj.message = errorMessage;
			}
		}
		else {
			errObj = {errorCode: 500};
		}
		
		return new Promise(function(resolve, reject) {
			reject(errObj);
		});
	}
	
	// parse the cookie for a session id
	function getSessionId(cookie) {
		if (typeof(cookie.cookies) === 'string') {
			var idx = cookie.cookies.indexOf('=');
			if (idx !== -1) {
				return _.trim(cookie.cookies.substring(idx + 1), '"') || null;
			}
		}
		return null;
	}
	
	// function to construct a cookie from a session key
	function bakeCookie(sessionId) {
		return {
			cookies: 'vmware_soap_session="' + sessionId + '"'
		};
	}
	
	// TODO - replace with vsphere-schema method
	// return all event types
	function getEventTypes(version) {
		if (_.has(env.schema, version)) {
			return _.filter(_.keys(env.schema[version]), function(type) {
				return type.match(/Event$/);
			});
		}
		return null;
	}
	
	// keep a log of something
	function log(obj, message) {
		obj = obj || [];
		obj.push({
			time: new Date(),
			log: message
		});
		
		return obj;
	}
	
	
	return {
		log              : log,
		getEventTypes    : getEventTypes,
		newError         : newError,
		bakeCookie       : bakeCookie,
		getSessionId     : getSessionId,
		moRef            : moRef,
		sType            : sType,
		isArray          : isArray,
		isBoolean        : isBoolean,
		hasKeys          : hasKeys,
		hasMethod        : hasMethod,
		filterValidPaths : filterValidPaths
	};
};



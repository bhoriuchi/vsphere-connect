/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	// modules
	var _         = env.lodash;
	var util      = env.util;
	
	// pointer to client object
	var _client   = env._client;
	var types     = {};
	var _self     = {};

	var ccnt = 0;
	
	_self.complexType = function(parent, name, obj) {
		_.forEach(parent.children, function(child) {
			_self.getChildren(child, name, obj);
		});
		return obj;
	};
	
	_self.simpleType = function(parent, name, obj) {
		_.forEach(parent.children, function(child) {
			_self.getChildren(child, name, obj);
		});
		return obj;
	};
	
	
	_self.restriction = function(parent, name, obj) {
		_.forEach(parent.children, function(child) {
			_self.getChildren(child, name, obj);
		});
		return obj;
	};
	
	
	_self.enumeration = function(parent, name, obj) {
		_.forEach(parent.children, function(e) {
			_self[e.$value] = e.$value;
		});
		return obj;
	};
	
	
	_self.simpleContent = function(parent, name, obj) {
		_.forEach(parent.children, function(child) {
			_self.getChildren(child, name, obj);
		});
		return obj;
	};
	
	
	_self.complexContent = function(parent, name, obj) {
		_.forEach(parent.children, function(child) {
			_self.getChildren(child, name, obj);
		});
		return obj;
	};
	
	
	_self.hasCircular = function(obj, type) {
		var has = false;
		
		type = type || obj;
		
		_.forEach(obj, function(v, k) {
			if (v === type) {
				has = true;
				return false;
			}
			else if (_self.hasCircular(v, type)) {
				has = true;
				return false;
			}
		});
		
		
		return has;
	};
	
	_self.extension = function(parent, name, obj) {
		
		_.forEach(parent.children, function(child) {
			_self.getChildren(child, name, obj);
		});
		
		var typeName = parent.$base.replace(/^vim25\:/, '');
		
		if (_.has(types, typeName)) {
			
			// modify circular references
			_.forEach(obj, function(v, k) {
				if (v === types[typeName] || v === types[name]) {
					console.log('circular', k);
					obj[k] = '[Circular]';
				}
				else if (typeof(v) === 'function') {
					obj[k] = v();
				}
			});
			
			return _.merge(types[typeName](), obj);
		}

		return obj;
		
	};
	
	
	_self.sequence = function(parent, name, obj) {
		_.forEach(parent.children, function(child) {
			_self.getChildren(child, name, obj);
		});
		return obj;
	};
	
	
	_self.element = function(parent, name, obj) {
		if (parent.$type.match(/^vim25\:/)) {
			
			var typeName = parent.$type.replace(/^vim25\:/, '');
			
			try {
				
				if (typeName !== name) {
					obj[parent.$name] = types[typeName]();
				}
				else {
					obj[parent.$name] = '[Circular]';
				}
				
			}
			catch(err) {
				console.log('h1', parent.$type.replace(/^vim25\:/, ''));
				throw err;
			}
		}
		else {
			obj[parent.$name] = parent.$type;
		}
		return obj;
	};
	
	_self.attribute = function(parent, name, obj) {
		obj[parent.$name] = parent.$type;
		return obj;
	};
	
	
	// get the children
	_self.getChildren = function(parent, name, obj) {
		ccnt++;
		console.log(ccnt);
		return _self[parent.name](parent, name, obj);
	};
	
	return function() {
		
		// get the types defined in the wsdl
		var simpleTypes  = _.get(_client.client.wsdl, '_includesWsdl[0].definitions.schemas.urn:vim25.types') || {};
		var complexTypes = _.get(_client.client.wsdl, '_includesWsdl[0].definitions.schemas.urn:vim25.complexTypes') || {};
		var allTypes     = _.merge(_.cloneDeep(simpleTypes), _.cloneDeep(complexTypes));
		
		_.forEach(allTypes, function(type, name) {
			types[name] = function() {
				return _self.getChildren(type, name, {});
			};
		});
		
		//console.log(JSON.stringify(allTypes.ManagedObjectReference, null, '  '));
		//console.log(types.DynamicData());
		
		// evaluate the type functions
		//return _.mapValues(types, function(v, k) {
		//	return v();
		//});
		return types;
	};
};
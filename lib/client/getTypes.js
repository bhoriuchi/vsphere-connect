/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env, c) {
	
	// modules
	var _         = env.lodash;
	var util      = env.util;
	
	// pointer to client object
	var _client   = c._client;
	
	// objects for storing data
	var types     = {};
	var _self     = {};
	var op        = {};
	

	// get the children
	_self.getChildren = function(parent, name, obj) {
		return _self[parent.name](parent, name, obj);
	};
	
	// generic function to expand children
	_self.expandChildren = function(parent, name, obj) {
		_.forEach(parent.children, function(child) {
			_self.getChildren(child, name, obj);
		});
		return obj;
	};
	
	// all types that simply expand child objects
	_self.complexType    = _self.expandChildren;
	_self.simpleType     = _self.expandChildren;
	_self.restriction    = _self.expandChildren;
	_self.sequence       = _self.expandChildren;
	_self.simpleContent  = _self.expandChildren;
	_self.complexContent = _self.expandChildren;
	
	// get enumeration values
	_self.enumeration = function(parent, name, obj) {
		_.forEach(parent.children, function(e) {
			_self[e.$value] = e.$value;
		});
		return obj;
	};
	
	// set an extend value
	_self.extension = function(parent, name, obj) {
		
		// expand the children
		_self.expandChildren(parent, name, obj);
		
		var typeName = parent.$base.replace(/^vim25\:/, '');
		
		if (_.has(types, typeName)) {
			
			// modify circular references
			_.forEach(obj, function(v, k) {
				if (v === types[typeName] || v === types[name]) {
					obj.prop[k] = function() {
						return typeName;
					};
				}
				else if (typeof(v) === 'function') {
					obj.prop[k] = v;
				}
			});
			obj.inherits = typeName;
		}
		else if (parent.$base === 'xsd:string') {
			obj.prop[parent.valueKey] = parent.$base;
		}
		
		return obj;
	};

	// get an element
	_self.element = function(parent, name, obj) {
		if (parent.$type.match(/^vim25\:/)) {
			var typeName = parent.$type.replace(/^vim25\:/, '');
			obj.prop[parent.$name] = typeName;
			obj.deps[typeName] = obj.deps[typeName] || [];
			obj.deps[typeName].push(parent.$name);
		}
		else {
			obj.prop[parent.$name] = parent.$type;
		}
		return obj;
	};
	
	// set an attribute
	_self.attribute = function(parent, name, obj) {
		obj.prop.attributes = obj.prop.attributes || {};
		obj.prop.attributes[parent.$name] = parent.$type;
		return obj;
	};
	
	return function() {
		
		// get the types defined in the wsdl
		var simpleTypes  = _.get(_client.client.wsdl, '_includesWsdl[0].definitions.schemas.urn:vim25.types') || {};
		var complexTypes = _.get(_client.client.wsdl, '_includesWsdl[0].definitions.schemas.urn:vim25.complexTypes') || {};
		var allTypes     = _.merge(_.cloneDeep(simpleTypes), _.cloneDeep(complexTypes));
		
		// build all of the models
		_.forEach(allTypes, function(type, name) {
			
			types[name] = {
				prop: {},
				inherits: null,
				deps: {}
			};
			
			_self.getChildren(type, name, types[name]);
		});
		
		// replace circular references
		_.forEach(types, function(type, name) {
			_.forEach(type.prop, function(ptype, pname) {
				
				_.forEach(type.deps, function(deps, dname) {
					
					if (dname === name || _.includes(_.keys(types[dname].deps), name)) {
						_.forEach(deps, function(field) {
							types[name].prop[field] = function() {
								return dname;
							};
						});
					}
				});
			});
		});

		
		// make all types into functions
		_.forEach(types, function(type, name) {
			
			// create the function
			op[name] = function() {
				_.forEach(type.prop, function(v, k) {
					if (_.has(types, v)) {
						// Prevents infinite recursion loop, if child is of same type
						if (v !== name) {
							types[name].prop[k] = op[v]();
						}
					}
					else if (typeof(v) === 'function') {
						types[name].prop[k] = v();
					}
				});
				
				if (_.has(types, type.inherits)) {
					return _.merge(_.clone(op[type.inherits]()), types[name].prop);
				}
				else {
					return _.clone(types[name].prop);
				}
			};
		});

		return op;
	};
};
/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	// modules
	var _     = env.lodash;
	var util  = env.util;

	/**
	 * recursive formatting function
	 */
	function formatValue(value) {
		
		var out;
		var type = util.sType(value);
		
		// if there is a type, check all sub items for types
		if (_.has(value, '$type') && _.has(value, 'attributes')) {
			out = util.moRef(value);
		}
		else if (type) {
			if (util.isArray(value)) {
				out = [];
				
				_.forEach(value[_.keys(value)[1]], function(obj) {
					out.push(formatValue(obj));
				});
			}
			else if (util.isBoolean(value)) {
				out = Boolean(value.$value);
			}
			else if (_.has(value, '$value')) {
				out = value.$value;
			}
			else {
				out = formatValue(_.omit(value, 'attributes'));
			}
			
		}
		else if (Array.isArray(value)) {
			out = [];
			_.forEach(value, function(val) {
				if (util.sType(val) || util.isArray(val) || util.hasKeys(val)) {
					out.push(formatValue(val));
				}
				else {
					out.push(val);
				}
			});
		}
		else if (util.hasKeys(value)) {
			out = {};
			_.forEach(value, function(val, key) {
				if (util.sType(val) || util.isArray(val) || util.hasKeys(val)) {
					out[key] = formatValue(val);
				}
				else {
					out[key] = val;
				}
			});
		}
		else {
			out = value;
		}
		return out;
	}
	
	
	// format each object
	function formatProp(obj) {
		
		var out      = {};
		var props    = obj.propSet;
		//out.moRef    = util.moRef(obj.obj);
		out.id = util.moRef(obj.obj).id;
		
		// loop through the propSet
		if (Array.isArray(props)) {
			_.forEach(props, function(prop) {
				out[prop.name] = formatValue(prop.val);
			});
		}
		else {
			out[props.name] = formatValue(props.val);
		}
		
		return out;
	}
	
	// since filters with dot notation return field names with dots, expand those fields
	// and remove the dot named field
	function expandFields(obj) {
		
		var out = {};
		
		_.forEach(obj, function(val, key) {
			if (_.includes(key, '.')) {
				_.set(out, key, val);
			}
			else {
				out[key] = val;
			}
		});

		return out;
	}
	
	
	// main formatting function
	function format(response) {
		
		var newObj = [];
		
		if (response.objects) {
			
			// check if objects is an array
			if (Array.isArray(response.objects)) {
				_.forEach(response.objects, function(obj) {
					newObj.push(expandFields(formatProp(obj, newObj)));
				});
			}
			else {
				newObj = expandFields(formatProp(response.objects, newObj));
			}
			
			return newObj;
		}
		
		// if no objects return the raw response
		return response;
	}
	
	
	// return format function
	return format;
};
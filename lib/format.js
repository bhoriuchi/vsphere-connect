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
		if (_.has(value, 'attributes.type') && _.has(value, '$value') && _.keys(value).length === 2) {
			out = util.moRef(value);
		}
		else if (type) {
			if (util.isArray(value)) {
				out = [];
				
				var subtype = type;
				
				if (subtype.match(/^ArrayOf/)) {
					subtype = subtype.replace(/^ArrayOf/, '');

					if (!Array.isArray(_.get(value, subtype)) && value[subtype]) {
						value[subtype] = [value[subtype]];
					}
				}
				
				_.forEach(value[_.keys(value)[1]], function(obj) {
					out.push(formatValue(obj));
				});
			}
			else if (util.isBoolean(value)) {
				
				// check for valid true values, otherwise false
				if (_.includes(['1', 'true'], _.lowerCase(value.$value))) {
					out = true;
				}
				else {
					out = false;
				}
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
		var props    = _.get(obj, 'propSet');
		var moRef    = _.has(obj, 'obj') ? util.moRef(obj.obj) : util.moRef(obj);
		out.id       = moRef.id;
		out.type     = moRef.type;

		// loop through the propSet
		if (Array.isArray(props)) {
			_.forEach(props, function(prop) {
				out[prop.name] = formatValue(prop.val);
			});
		}
		else if (_.has(props, 'name')) {
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
		var objects = _.get(response, 'objects') || response;
		
		if (objects) {

			// check if objects is an array
			if (Array.isArray(objects)) {
				_.forEach(objects, function(obj) {
					newObj.push(expandFields(formatProp(obj)));
				});
			}
			else {
				newObj = expandFields(formatProp(objects));
			}
			return newObj;
		}

		// if no objects return the raw response
		return response;
	}
	
	
	// return format function
	return format;
};
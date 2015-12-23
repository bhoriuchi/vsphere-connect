/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	var _self = this;
	
	var _     = env.lodash;
	var util  = env.util;
	
	_self.formatValueEx = function(value) {

		var type = _.get(value.attributes, 'xsi:type') || _.get(value.attributes, 'type') || null;
		
		if (_.has(value, '$type') && _.has(value, 'attributes')) {
			return util.moRef(value);
		}
		else if (type === 'xsd:boolean' || type === 'boolean') {
			return Boolean(value.$value);
		}
		else if (typeof(type) === 'string' && type.substring(0, 5) === 'Array') {
			return _self.formatValue(value);
		}
		else {
			return _.omit(value, 'attributes');
		}
		
	};
	
	
	_self.formatValue = function(value) {
		
		var out;
		var type = _.get(value.attributes, 'xsi:type') || _.get(value.attributes, 'type') || null;
		
		if (typeof(type) === 'string' && type.substring(0, 5) === 'Array') {
			out = [];
			_.forEach(value[_.keys(value)[1]], function(item) {
				out.push(_self.formatValueEx(item));
			});
		}
		else {
			out = _self.formatValueEx(value);
		}
		
		return out;
	};
	
	
	
	function format(response) {
		
		var obj = {};
		var props;
		
		if (response.objects) {
			
			// set the moRef
			obj.moRef = util.moRef(response.objects.obj);
			
			// loop through the propSet
			_.forEach(response.objects.propSet, function(prop) {
				obj[prop.name] = _self.formatValue(prop.val);
			});

			
			return obj;
		}
		
		
		return response;
	}
	
	return format;
};
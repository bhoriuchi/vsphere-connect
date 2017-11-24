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
	var Promise   = env.promise;
	
	// pointer to client object
	var _client   = c._client;
	
	// constants
	var STATUS    = env.statics.status;
	
	/**
	 * task monitor
	 * 
	 * @param {string} id - id of task to monitor
	 * @param {number} delay - delay in milliseconds between polling cycles
	 * @param {number} timeout - time in milliseconds to allow the monitor to run
	 * @param {number} start - unix timestamp of when the task started
	 */
	function task(id, delay, timeout, start) {
		
		if (!id) {
			return new Promise (function(resolve, reject) {
				reject({
					errorCode: 500,
					message: 'no task id to monitor'
				});
			});
		}
		
		// create a default delay
		delay = (!isNaN(delay) && Number(delay) > 0)  ? Number(delay) : 1000;
		
		// get a timestamp
		var now = (new Date()).valueOf();
		
		// set the start time if one doesnt exist
		start   = start || now;
		
		// check for timeout
		if (!isNaN(timeout) && timeout > 0 && now >= (start + timeout)) {
			throw {
				errorCode: 408,
				message: 'The task monitor timed out'
			};
		}
		
		
		// get the task
		return _client.retrieve({
			type: 'Task',
			id: id,
			properties: [
			    'info.state',
			    'info.error',
			    'info.result',
			    'info.startTime',
			    'info.completeTime',
			    'info.entity',
			    'info.description'
			]
		})
		.then(function(taskInfo) {

			// get the state
			var state = _.get(taskInfo, '[0].info.state');
			
			// emit an event
			_client.emit('task.state', {
				id: id,
				state: state
			});

			// if there is no state, throw an error
			if (!state) {
				console.log('throwing 500');
				throw {
					errorCode: 500,
					message: 'Unable to monitor task state'
				};
			}
			
			// if success send the task info
			else if (state === 'success') {
				return taskInfo[0];
			}
			
			// if the state is an error, throw an error
			else if (state === 'error') {
				throw {
					errorCode: 409,
					message: 'The task completed with an error',
					info: taskInfo[0]
				};
			}
			
			// if not success try to get the task again after a delay
			return Promise.delay(delay).then(function() {
				return task(id, delay, timeout, start);
			});
		});
		
	}
	
	// determine if the task should be monitored or to simply return the task id
	function taskAsync(args, result) {
		
		// format the result
		result = env.format(result);
		
		// if the delete should not be asyncronous and the task should be monitored
		if (args.async === false) {

			// set the polling period and timeout defaults
			args.delay   = !isNaN(args.delay) ? args.delay : 1000;
			args.timeout = (!isNaN(args.timeout) && args.timeout >= 0) ? args.timeout : 0;
			
			// start the monitor
			return task(result.id, args.delay, args.timeout, (new Date()).valueOf());
		}
		
		// return the result
		return result;
	}
	
	
	
	// return the monitors and helpers
	return {
		task      : task,
		taskAsync : taskAsync
	};
};
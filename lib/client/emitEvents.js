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
	var _client     = env._client;
	
	// constants
	var STATUS    = env.statics.status;
	
	// get the vsphere events and emit them from the client
	function getEvents() {

		// start a log that will be emitted for debuging/monitoring
		var log = [];
		
		// check that the client is connected, clear the interval and return
		if (_client.status !== STATUS.CONNECTED) {
			
			util.log(log, 'Client is not connected, clearning interval and exiting');
			
			try {
				clearInterval(_client.events._interval);
				util.log(log, 'Interval cleared');
				
			} catch(err) {}
			
			// emit the final log, RIP log.
			_client.emit('emitlog', log);
			
			return;
		}
		
		// start by getting the server time
		return _client.time().then(function(time) {
			
			// convert the time to a date object
			var serverTime = new Date(time);
			
			util.log(log, 'Server time is ' + serverTime);

			// check for last event emitted, if none use current time
			// if last event is emitted greater than 1 interval
			// set last emit to the last interval
			if (!_client.events._lastEvent) {
				// set the first interval to look back at the previous interval since it
				// has already waited 1 interval
				_client.events._lastEvent = new Date(serverTime - _client.events.interval);
			}
			
			util.log(log, 'Last event time ' + _client.events._lastEvent);
			
			// query the events
			return _client.method('QueryEvents', {
				_this: util.moRef('EventManager', 'EventManager'),
				filter: {
					time: {
						beginTime: _client.events._lastEvent.toISOString()
					}
				}
			})
			.then(function(events) {
				
				var latest, emitted = [];
				
				// set the events to an array
				events = Array.isArray(events) ? events : (events ? [events] : []);

				util.log(log, events.length + ' events found');
				
				// if there were no events, set the last event time to the previous
				// last event time plus the interval time since that is when the last
				// search should have started
				if (events.length === 0) {
					_client.events._lastEvent = new Date(serverTime.valueOf() - _client.events.interval);
					util.log(log, 'New lastEvent time is ' + _client.events._lastEvent);
				}
				
				// otherwise loop through the event and look for ones to emit
				else {
					_.forEach(events, function(event) {
						
						// get the type
						var type = _.get(event, 'attributes.xsi:type');
						var key  = _.get(event, 'key');

						// determine if the current event is the latest 
						try {
							var created = new Date(_.get(event, 'createdTime'));
							latest = (!latest || created > latest) ? created : latest;
						} catch (err) {}
						
						
						// if the event has not already been emitted, emit it
						if (!_.includes(_client.events._lastEmit, key)) {
							
							util.log(log, 'Emitting ' + type + '(' + key + ')');
							
							// emit the event
							_client.emit(type, _.omit(event, 'attributes'));
							
							// record that it was emitted
							emitted.push(key);
						}
					});
					
					// update the lastEmit
					_client.events._lastEmit = emitted;
					
					// if there was no latest, set the interval to the current server time minus 1 interval
					if (!latest) {
						_client.events._lastEvent = new Date(serverTime - _client.events.interval);
					}
					
					// if there was a latest, set the last event to itself plus 1 second
					else {
						_client.events._lastEvent = new Date(latest.valueOf() + 1000);
					}
					
					util.log(log, 'New lastEvent time is ' + _client.events._lastEvent);
				}
			});
		})
		.then(function(obj) {
			
			// emit the log
			_client.emit('emitlog', log);
			
			// return the result in case it is used somewhere
			return obj;
		});
	}
	
	
	
	// check for events to emit and start the interval
	return function() {

		// if there are events, start an interval
		if (_client.events) {
			_client.events._interval = setInterval(getEvents, _client.events.interval);
			_client.events._lastEmit = [];
		}
	};
};
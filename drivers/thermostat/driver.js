/* global Homey, module */
(function() {
	'use strict';
}());
var path = require('path');
var request = require('request');
var extend = require('extend');
var api_url = 'https://portal.icy.nl';
/*
 *  SwitchTime list class
 */
var SwitchTimeList = function() {
		// Current number of items
		var count = 0;
		// Array of items
		var list = [];
		// Setters & Getters
		this.setCount = function(val) {
			count = val;
		};
		this.getCount = function() {
			return count;
		};
		this.getList = function() {
			return list;
		};
		this.setList = function(val) {
			list = val;
		};
		this.getListItem = function(index) {
			return list[index];
		};
		this.setListItem = function(index, val) {
			list[index] = val;
		};
	};
SwitchTimeList.prototype = {
	// Add item to array
	add: function(addSwitchTime) {
		var exists = this.ifExists(addSwitchTime);
		if (!exists) {
			var newItem = new SwitchTime(addSwitchTime.createTime());
			this.setListItem(this.getCount(), newItem);
			this.setCount(this.getCount() + 1);
			return true;
		} else {
			return false;
		}
	},
	//Edit the oldSwitchTime with the newSwitchTime
	edit: function(oldSwitchTime, newSwitchTime) {
		var exists;
		if (this.compare(newSwitchTime, oldSwitchTime)) {
			exists = false;
		} else {
			exists = this.ifExists(newSwitchTime);
		}
		if (!exists) {
			for (var x = 0; x < this.getCount(); x++) {
				if (this.compare(this.getListItem(x), oldSwitchTime)) {
					this.setListItem(x, newSwitchTime);
					return true;
				}
			}
			return false;
		} else {
			return false;
		}
	},
	// Check if the switchTime exists
	ifExists: function(newSwitchTime) {
		for (var x = 0; x < this.getCount(); x++) {
			if (this.compare(this.getListItem(x), newSwitchTime)) {
				return true;
			}
		}
		return false;
	},
	// Get item at index
	get: function(index) {
		return this.getListItem(index);
	},
	// Remove item at given index
	remove: function(index) {
		if (index !== (this.getCount() - 1)) {
			this.setListItem(index, this.getListItem(this.getCount() - 1));
		}
		this.setCount(this.getCount() - 1);
	},
	// Get the list length
	length: function() {
		return this.getCount();
	},
	// Get switchtime list of one day sorted, returns a Array of SwitchTimes
	getSwitchTimeDay: function(day) {
		var returnArray = [];
		for (var x = 0; x < this.length(); x++) {
			if (this.getListItem(x).getDay() === day) {
				returnArray.push(this.getListItem(x));
			}
		}
		returnArray.sort(function(a, b) {
			return a.getTotalMinute() - b.getTotalMinute();
		});
		return returnArray;
	},
	// Compare two switchTime objects and returns a boolean
	compare: function(a, b) {
		if ((a.getDay() === b.getDay()) & (a.getHour() === b.getHour()) & (a.getMinute() === b.getMinute())) {
			return true;
		} else {
			return false;
		}
	}
};
// Thermostat settings
var controlSettings = 0;
var nodeSettings = 0;
var uid = 0;
var setTemp = 0; // Thermostat set temperature
var currentTemp = 0; // Thermostat measured temperature
var comfortTemp = 0; // Thermostat comfort temperature
var comfortPeriod = 0; // Thermostat comfort period
var rustTemp = 0; // Thermostat rust temperature
var rustPeriod = 0; // Thermostat rust period
var antivorstTemp = 0; // Thermostat anti-vorst temperature
var maxTemp = 0; // Thermostat maximum temperature
var comfortShorttime = 0;
var lightsensorProfile = 0;
var heatingProfile = 0;
var thermostatColor = 1; // Thermostat color 1 = black, 2 = white
var weekClock = new SwitchTimeList(); // Thermostat week clock-switch array
var currentSelectedMode = 1; // Thermostat mode
var previousThermostatMode = null;
var currentThermostatMode = null;
var heatingDemand = 0;
var clockActivated = 0; // Thermostat clock program activated
var self = module.exports = {
	init: function(devices, callback) {
		// we're ready
		var first_device = false;
		devices.forEach(function(device_data) {
			Homey.manager('cron').unregisterTask(device_data.id, function(err, success) {
				if (err) {
					Homey.log(err);
				}
			});
			Homey.manager('cron').registerTask(device_data.id, '* * * * *', device_data, function(err, task) {
				if (err) {
					Homey.log(err);
				}
			});
			Homey.manager('cron').on(device_data.id, function(device) {
				getThermostatInfo(device, true, function(err, info) {
					if (err) {
						Homey.log(err);
					}
				});
			});
			Homey.manager('flow').on('trigger.mode_changed', function(callback, args, state) {
				if (args.mode === state.mode) {
					callback(null, true); // If true, this flow should run. The callback is (err, result)-style.
				} else {
					callback(null, false);
				}
			});
			Homey.manager('flow').on('trigger.mode', function(callback, args) {
				callback(null, true); // If true, this flow should run. The callback is (err, result)-style.
			});
			Homey.manager('flow').on('condition.mode', function(callback, args) {
				getThermostatInfo(device, function(err, data) {
					callback(err, currentThermostatMode === args.mode);
				});
			});
			Homey.manager('flow').on('action.mode', function(callback, args) {
				module.exports.realtime(args.device, "icythermostat_mode", args.mode);
				callback(null, true);
			});
			if (!first_device) {
				first_device = true;
				Homey.manager('settings').set('first_device', device_data);
			}
		});
		callback();
	},
	capabilities: {
		target_temperature: {
			get: function(device, callback) {
				getThermostatInfo(device, true, function(err, info) {
					if (info !== undefined && info.temperature1 !== undefined) {
						callback(err, info.temperature1);
					}
				});
			},
			set: function(device, target_temperature, callback) {
				if (target_temperature < 5) {
					target_temperature = 5;
				}
				if (target_temperature > 30) {
					target_temperature = 30;
				}
				setTemp = roundHalf(target_temperature);
				sendData(device, callback);
			}
		},
		measure_temperature: {
			get: function(device, callback) {
				getThermostatInfo(device, function(err, info) {
					if (info !== undefined && info.temperature2 !== undefined) {
						callback(err, info.temperature2);
					}
				});
			}
		},
		icythermostat_mode: {
			get: function(device, callback) {
				getThermostatInfo(device, function(err, data) {
					callback(err, currentThermostatMode);
				});
			},
			set: function(device, icythermostat_mode, callback) {
				currentSelectedMode = setThermostatMode(icythermostat_mode);
				sendData(device, callback);
			}
		}
	},
	pair: function(socket) {
		// Send log
		Homey.log('ICY E-Thermostaat pairing has started...');
		// Define variables
		var tempSerialthermostat = '';
		var tempUsername = '';
		var tempPassword = '';
		socket.on('get_devices', function(data, callback) {
			// Set passed credentials in variables
			tempUsername = data.username;
			tempPassword = data.password;
			// Test credentials, get token.
			request.post(api_url + '/login', {
				// Build post data
				form: {
					'username': tempUsername,
					'password': tempPassword
				},
				// Send data as json
				json: true
				// On return
			}, function(err, response, body) {
				// If an error has occurred
				if (err || body === undefined) {
					return socket.emit('error', 'error');
				}
				// Checking credentials
				Homey.log('ICY E-Thermostaat username/password are being checked');
				// If status is 401 - Not authorized
				if (body.status !== undefined && body.status.code !== undefined && body.status.code === 401) {
					// Send log
					Homey.log('ICY E-Thermostaat username/password are wrong');
					// Return error
					socket.emit('error', 'notauthorized');
				} else if (body.status !== undefined && body.status.code !== undefined && body.status.code === 200) {
					// If status is 200 - Ok
					// Send log
					Homey.log('ICY E-Thermostaat username/password are correct');
					// Set thermostat serial
					tempSerialthermostat = body.serialthermostat1;
					// Credentials work, continue
					socket.emit('continue', null);
					// Anything else should give error
				} else {
					Homey.log('ICY E-Thermostaat username/password could not be checked');
					// Return error
					socket.emit('error', 'notauthorized');
				}
				return;
			});
		});
		socket.on('list_devices', function(data, callback) {
			var devices = [{
				data: {
					id: tempSerialthermostat,
					username: tempUsername,
					password: tempPassword
				},
				name: 'E-Thermostaat'
			}];
			callback(null, devices);
		});
		socket.on('disconnect', function(data, callback) {
			Homey.log('disconnect!!!', arguments);
		});
	}
};
var thermostatInfoCache = {
	updated_at: new Date("January 1, 1970"),
	data: {}
};

function icyData(data) {
	uid = data.uid;
	if (data !== undefined) {
		// Parse dayclock
		var dayClock = data["day-clock"];
		// New v1.2
		// Parse weekclock
		var tempArray = new SwitchTimeList();
		if (data["week-clock"] !== undefined) {
			for (var i = 0;
			(data["week-clock"][i] !== 0xFFFF) && i < data["week-clock"].length; i++) {
				if (data["week-clock"][i] !== undefined) {
					tempArray.add(new SwitchTime(data["week-clock"][i]));
				}
			}
		}
		weekClock = tempArray;
		// Parse configurationuration thermostat mode
		controlSettings = data.configuration[0];
		var thermostatMode = (controlSettings >> 5) & 0x07;
		currentSelectedMode = thermostatMode;
		heatingDemand = (controlSettings >> 2) & 0x01;
		// Clock activated
		clockActivated = (controlSettings >> 4) & 0x01;
		// Node Settings
		nodeSettings = data.configuration[1];
		var automatischInschakelen = (nodeSettings >> 7) & 0x01;
		// Antivorst temp
		if ((data.configuration[4] % 2) > 0) {
			antivorstTemp = (data.configuration[4] >> 1) + 0.5;
		} else {
			antivorstTemp = (data.configuration[4] >> 1);
		}
		// Rust temp
		if ((data.configuration[5] % 2) > 0) {
			rustTemp = (data.configuration[5] >> 1) + 0.5;
		} else {
			rustTemp = (data.configuration[5] >> 1);
		}
		// Rust period
		rustPeriod = data.configuration[2];
		// Comfort temp
		if ((data.configuration[6] % 2) > 0) {
			comfortTemp = (data.configuration[6] >> 1) + 0.5;
		} else {
			comfortTemp = (data.configuration[6] >> 1);
		}
		// Comfort period
		comfortPeriod = data.configuration[3] * 10;
		// Maximum temp
		if ((data.configuration[7] % 2) > 0) {
			maxTemp = (data.configuration[7] >> 1) + 0.5;
		} else {
			maxTemp = (data.configuration[7] >> 1);
		}
		comfortShorttime = data.configuration[8];
		lightsensorProfile = data.configuration[9];
		heatingProfile = data.configuration[10];
		thermostatColor = data.configuration[11];
		currentThermostatMode = getThermostatMode(currentSelectedMode);
	}
}

function sendData(device, callback) {
	// send the data
	getToken(device, function(token) {
		if (token !== false) {
			request.post(api_url + '/data', {
				form: {
					'uid': device.id,
					'temperature1': setTemp.toFixed(1),
					'configuration': [((controlSettings & 0x1F) + ((currentSelectedMode << 5) & 0xE0)), nodeSettings, rustPeriod, (comfortPeriod / 10), icyNumber(antivorstTemp), icyNumber(rustTemp), icyNumber(comfortTemp), icyNumber(maxTemp), comfortShorttime, lightsensorProfile, heatingProfile, thermostatColor]
				},
				headers: {
					'Session-token': token
				},
				json: true
			}, function(err, response, body) {
				if (err) {
					return callback(err);
				}
				currentThermostatMode = getThermostatMode(currentSelectedMode);
				self.realtime(device, 'target_temperature', setTemp);
				self.realtime(device, 'icythermostat_mode', currentThermostatMode);
				checkForChangeMode(device);
			});
		}
	});
}

function checkForChangeMode(device_data) {
	if (currentThermostatMode !== null) {
		if (previousThermostatMode !== null && previousThermostatMode !== currentThermostatMode) {
			Homey.manager('flow').triggerDevice('mode_changed', null, {
				'mode': currentThermostatMode
			}, device_data, function(err, result) {
				if (err) return Homey.error(err);
			});
			Homey.manager('flow').triggerDevice('mode', null, null, device_data, function(err, result) {
				if (err) return Homey.error(err);
			});
		}
		previousThermostatMode = currentThermostatMode;
	}
}

function getThermostatMode(mode) {
	switch (mode) {
	case 1:
		return 'comfort';
	case 2:
		return 'saving';
	case 5:
		return 'fixed';
	case 0:
		return 'away';
	default:
		break;
	}
}

function setThermostatMode(mode) {
	switch (mode) {
	case 'comfort':
		setTemp = comfortTemp;
		return 1;
	case 'saving':
		setTemp = rustTemp;
		return 2;
	case 'fixed':
		return 5;
	case 'away':
		setTemp = antivorstTemp;
		return 0;
	default:
		break;
	}
}

function getThermostatInfo(device, force, callback) {
	if (typeof force === 'function') {
		callback = force;
	}
	// Send log
	Homey.log('ICY E-Thermostaat checking data');
	// Check if cache is within time range
	if (!force && ((new Date()) - thermostatInfoCache.updated_at) < 120000) {
		// Cache is younger then 2 minutes, serve cache instead of live data.
		callback(thermostatInfoCache.data);
	} else {
		// Cache is older then 2 minutes, get fresh data
		// Get token
		getToken(device, function(token) {
			if (token !== false) {
				request.get(api_url + '/data', {
					form: {
						'username': device.username,
						'password': device.password
					},
					headers: {
						'Session-token': token
					},
					json: true
				}, function(err, response, data) {
					if (err) {
						return callback(err);
					}
					// Update cache data
					thermostatInfoCache.updated_at = new Date();
					thermostatInfoCache.data = data;
					// Calculate set temperature
					setTemp = parseFloat(data.temperature1);
					self.realtime(device, 'target_temperature', setTemp);
					// Calculate current temperature
					currentTemp = parseFloat(data.temperature2);
					icyData(data);
					self.realtime(device, 'measure_temperature', currentTemp);
					self.realtime(device, 'icythermostat_mode', currentThermostatMode);

					checkForChangeMode(device);

					// Return new data
					callback(null, thermostatInfoCache.data);
				});
			}
		});
	}
}

function setThermostatTemperature(device, temperature, callback) {
	// Send log
	Homey.log('ICY E-Thermostaat sending new temperature');
	// Get token
	getToken(device, function(token) {
		if (token !== false) {
			request.post(api_url + '/data', {
				form: {
					'uid': device.id,
					'temperature1': temperature
				},
				headers: {
					'Session-token': token
				},
				json: true
			}, function(err, response, body) {
				if (err) {
					return callback(err);
				}
				// update thermosmart info
				getThermostatInfo(device, true, callback);
			});
		}
	});
}

function getToken(device, callback) {
	Homey.log('ICY E-Thermostaat retreiving new token');
	// Test credentials, get token.
	request.post(api_url + '/login', {
		form: {
			'username': device.username,
			'password': device.password
		},
		json: true
	}, function(err, response, body) {
		if (err) {
			return callback(err);
		}
		if (body.status !== undefined && body.status !== null && body.status.code !== undefined && body.status.code !== null) {
			// If status is 200 - Ok
			if (body.status.code === 200) {
				module.exports.setAvailable(device);
				// Send log
				Homey.log('ICY E-Thermostaat username/password are correct, returning token.');
				// Return token
				Homey.manager('settings').set('token', body.token);
				callback(body.token);
			} else {
				callback(false);
			}
		} else {
			module.exports.setUnavailable(device, "ICY E-Thermostaat Webservice Offline.");
			callback(false);
		}
	});
}

function icyNumber(int) {
	if (int % 1 > 0) {
		return (int << 1) + 1;
	} else {
		return int << 1;
	}
}

function roundHalf(num) {
	return Math.round(num * 2) / 2;
}
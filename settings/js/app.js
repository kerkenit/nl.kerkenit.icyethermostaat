/* global device */
"use strict";
// Current version
var version = 1.4;
var apiHost = "https://portal.icy.nl";
/*
 *  PopMessage Controller class
 */
var popMessage;
var PopMessage = function(title, text, action, returnPage, eventElement) {
		this.title = title;
		this.text = text;
		this.action = action;
		this.returnPage = returnPage;
		this.eventElement = eventElement;
		$("#message-box").css({
			"padding": "4% 5% 60px 5%"
		});
	};
PopMessage.prototype = {
	show: function() {
		$("#message-title").html(this.title);
		$("#message-message").html(this.text);
		$("#message").css({
			"display": "block"
		});
		$("#error-btn").css({
			"display": "none"
		});
		$("#message-btn").css({
			"display": "none"
		});
		$("#option-btn").css({
			"display": "none"
		});
		$("#exit-btn").css({
			"display": "none"
		});
		if (this.action === "message") {
			// Display the button
			$("#message-btn").css({
				"display": "block"
			});
			// Remove button binding
			$("#message-btn").off();
			// Add button binding
			if (this.returnPage !== undefined) {
				$("#message-btn").on('click', function(e) {
					$("#message").css({
						"display": "none"
					});
					e.preventDefault();
				});
			} else {
				$("#message-btn").on('click', function(e) {
					$("#message").css({
						"display": "none"
					});
					e.preventDefault();
				});
			}
		} else if (this.action === "error") {
			// Display the button
			$("#error-btn").css({
				"display": "block"
			});
			// Remove button binding
			$("#error-btn").off();
			// Add button binding
			$("#error-btn").on('click', function(e) {
				$("#message").css({
					"display": "none"
				});
				$.mobile.showPageLoadingMsg();
				e.preventDefault();
			});
		} else if (this.action === "option") {
			// Display the button
			$("#option-btn").css({
				"display": "block"
			});
			// Remove button binding
			$("#option-btn-yes").off();
			$("#option-btn-no").off();
			// Add button binding
			$("#option-btn-yes").on('click', function(e) {
				$("#message").css({
					"display": "none"
				});
				popMessage.eventElement.removeConfirmed();
				e.preventDefault();
			});
			$("#option-btn-no").on('click', function(e) {
				$("#message").css({
					"display": "none"
				});
				e.preventDefault();
			});
		}
	}
};
/*
 *  edit-calendar Controller class
 */
var EditCalendar = function(switchTime) {
		this.pageHeight = Math.floor(($(".ui-mobile").height() * 0.3) / 3);
		this.switchTime = switchTime;
		this.switchTime.setPageHeight(this.pageHeight);
		this.updateSpinner(switchTime);
		this.state = "new";
		this.maximumSwitchTimes = 30;
		// Vars
		scrollEvent = new ScrollEvent(this.pageHeight);
		// Setters & Getters
		this.setScrollEvent = function(val) {
			scrollEvent = val;
		};
		this.getScrollEvent = function() {
			return scrollEvent;
		};
	};
EditCalendar.prototype = {
	// Show the editCalendar screen
	show: function(state) {
		// Hide navigation
		$("#nav").css({
			"visibility": "hidden"
		});
		// Remove bindings
		$("#edit-calendar-cancel").off();
		$("#edit-calendar-save").off();
		$("#edit-calendar-remove").off();
		$("#edit-calendar-scrollbar").off();
		// Save the state
		this.state = state;
		// Set week
		this.setWeekMenuDay(currentDay);
		// Create new swtichTIme
		if (state === "new") {
			$("#edit-calendar-dayPicker").css({
				"visibility": "visible"
			});
			$("#edit-calendar-remove").css({
				"visibility": "hidden"
			});
			$("#edit-calendar-dayPicker-today").off();
			$("#edit-calendar-dayPicker-week").off();
			$("#edit-calendar-dayPicker-work").off();
			// Reset the dayPicker
			editCalendar.changeInterval(0);
			$("#edit-calendar-dayPicker-today").on('click', function(e) {
				editCalendar.changeInterval(0);
				e.preventDefault();
			});
			$("#edit-calendar-dayPicker-week").on('click', function(e) {
				editCalendar.changeInterval(1);
				e.preventDefault();
			});
			$("#edit-calendar-dayPicker-work").on('click', function(e) {
				editCalendar.changeInterval(2);
				e.preventDefault();
			});
		}
		// Edit switchtime
		else if (state === "edit") {
			$("#edit-calendar-dayPicker").css({
				"visibility": "hidden"
			});
			$("#edit-calendar-remove").css({
				"visibility": "visible"
			});
		}
		// Set picker height
		$(".edit-calendar-image").css({
			"height": this.pageHeight + "px"
		});
		$(".edit-calendar-value").css({
			"line-height": this.pageHeight + "px"
		});
		// Change page
		// Button bindings
		$("#edit-calendar-cancel").on('click', this.cancel);
		$("#edit-calendar-save").on('click', this.save);
		$("#edit-calendar-remove").on('click', this.popRemove);
		//Mobile
		$('#edit-calendar-scrollbar').on('click', this.getScrollEvent().start);
		$('#edit-calendar-scrollbar').on('touchmove', this.getScrollEvent().move);
		$('#edit-calendar-scrollbar').on('touchend', this.getScrollEvent().end);
		//
/* PC
         $('#edit-calendar-scrollbar-overlay').bind('mousedown', this.getScrollEvent().start);
         $('#edit-calendar-scrollbar-overlay').bind('mousemove', this.getScrollEvent().move);
         $('#edit-calendar-scrollfield').bind('mouseup', this.getScrollEvent().end);
         */
	},
	// Save the current switchtime
	save: function() {
		var newSwitchTime = editCalendar.getSpinner();
		var added = false;
		var dayToAdd;
		if ((scrollEvent.getOpperator() !== 0) || (newSwitchTime.getHour() % 1) != 0 || (newSwitchTime.getMinute() % 10) != 0) {
			setTimeout(editCalendar.save, 100);
		} else {
			// Try to add/change the time
			if (editCalendar.state == "new") {
				var selectorPos = parseInt($("#edit-calendar-dayPicker-selector").css("top"), 10);
				if (selectorPos == 72) {
					added = weekClock.add(newSwitchTime);
				} else if (selectorPos == 82) {
					for (dayToAdd = 0; dayToAdd < 7; dayToAdd++) {
						newSwitchTime.setDay(dayToAdd);
						added = weekClock.add(newSwitchTime);
					}
				} else {
					for (dayToAdd = 0; dayToAdd < 5; dayToAdd++) {
						newSwitchTime.setDay(dayToAdd);
						added = weekClock.add(newSwitchTime);
					}
				}
			} else {
				added = weekClock.edit(editCalendar.switchTime, newSwitchTime);
			}
			// Check if the time is added/changed
			if (added & (weekClock.length() <= editCalendar.maximumSwitchTimes)) {
				sendClock();
				// Load the current data
				loadWeekClock(currentDay, currentPage);
				// Change the page to calendar
				// Show the Navigation
				$("#nav").css({
					"visibility": "visible"
				});
			} else if (added) {
				popMessage = new PopMessage("", "Tijd toevoegen is mislukt. Het maximum aantal is bereikt.", "message", "#edit-calendar");
				popMessage.show();
			} else {
				popMessage = new PopMessage("", "Tijd toevoegen is mislukt. De opgegeven tijd bestaat al.", "message", "#edit-calendar");
				popMessage.show();
			}
		}
		return false;
	},
	// Go back to the calendar withouth saving
	cancel: function() {
		// Return to the parent
		// Show the Navigation
		$("#nav").css({
			"visibility": "visible"
		});
		// Start receiving data
		startReceiveTimer(true);
		return false;
	},
	// Pop message for removing current time
	popRemove: function() {
		popMessage = new PopMessage("", "Weet u zeker dat u deze tijd wilt verwijderen?", "option", "#calendar", editCalendar);
		popMessage.show();
		return false;
	},
	// Function is called when the remove is confirmed by the user
	removeConfirmed: function() {
		for (var x = 0; x < weekClock.length(); x++) {
			if (weekClock.compare(weekClock.get(x), editCalendar.getSwitchTime())) {
				weekClock.remove(x);
			}
		}
		sendClock();
		// Load the current day
		loadWeekClock(currentDay, currentPage);
		// Show the Navigation
		$("#nav").css({
			"visibility": "visible"
		});
	},
	// Update spinner to current switchTime
	updateSpinner: function(switchTime) {
		// Set state scroll
		$("#stateScroll").css("-webkit-transition-duration", "0s");
		$("#stateScroll").css({
			"-webkit-transform": "translate(0px, " + ((-this.pageHeight * switchTime.getState()) + this.pageHeight) + "px)"
		});
		// Set hour scroll
		$("#hourScroll").css("-webkit-transition-duration", "0s");
		$("#hourScroll").css({
			"-webkit-transform": "translate(0px, " + ((-this.pageHeight * switchTime.getHour()) + this.pageHeight) + "px)"
		});
		// Set minute scroll
		$("#minuteScroll").css("-webkit-transition-duration", "0s");
		$("#minuteScroll").css({
			"-webkit-transform": "translate(0px, " + ((-this.pageHeight * (switchTime.getMinute() / 10)) + this.pageHeight) + "px)"
		});
	},
	getSpinner: function() {
		var returnSwitchTime = new SwitchTime(0, 0);
		returnSwitchTime.setState((editCalendar.getSpinnerValue("#stateScroll") / -this.pageHeight) + 1);
		returnSwitchTime.setHour((editCalendar.getSpinnerValue("#hourScroll") / -this.pageHeight) + 1);
		returnSwitchTime.setMinute(((editCalendar.getSpinnerValue("#minuteScroll") / -this.pageHeight) * 10) + 10);
		returnSwitchTime.setDay(this.switchTime.getDay());
		return returnSwitchTime;
	},
	getSpinnerValue: function(id) {
		var tempMatrix = $(id).css("-webkit-transform");
		tempMatrix = tempMatrix.substr(7, tempMatrix.length - 8).split(', ');
		return parseInt(tempMatrix[5], 10);
	},
	// Get the current switchTime
	getSwitchTime: function() {
		return this.switchTime;
	},
	changeInterval: function(selectedInterval) {
		switch (selectedInterval) {
		case 0:
			{
				$("#edit-calendar-dayPicker-selector").css({
					"top": "72%"
				});
				this.setWeekMenuDay(currentDay);
			}
			break;
		case 1:
			{
				$("#edit-calendar-dayPicker-selector").css({
					"top": "82%"
				});
				this.setWeekMenu(true);
			}
			break;
		case 2:
			{
				$("#edit-calendar-dayPicker-selector").css({
					"top": "92%"
				});
				this.setWeekMenu(false);
			}
			break;
		}
	},
	setWeekMenuDay: function(day) {
		for (var x = 0; x < 7; x++) {
			if (x == day) {
				$("#edit-" + getWeekClockId(x)).addClass("selected");
			} else {
				$("#edit-" + getWeekClockId(x)).removeClass("selected");
			}
		}
	},
	setWeekMenu: function(bool) {
		var maxDays;
		if (bool) {
			maxDays = 7;
		} else {
			maxDays = 5;
		}
		for (var x = 0; x < 7; x++) {
			if (x < maxDays) {
				$("#edit-" + getWeekClockId(x)).addClass("selected");
			} else {
				$("#edit-" + getWeekClockId(x)).removeClass("selected");
			}
		}
	}
};
/*
 * New added in v1.2
 */
var scrollEvent;
var ScrollEvent = function(elementHeight) {
		// Vars
		var startY = 0; // Start position x
		var endY = 0; // Y position
		var divId = 0; // Div ID of field to scroll
		var startTime = 0; // starTime of action
		var opperator = 0; // Var for scrolling down or up
		var maxY = 0; // Maximum value of Y;
		var position = 0; // Position of the scrollField
		var offSet = 0; // Current offSet
		this.elementHeight = elementHeight;
		// Setters & Getters
		this.setStartY = function(val) {
			startY = val;
		};
		this.getStartY = function() {
			return startY;
		};
		this.setEndY = function(val) {
			endY = val;
		};
		this.getEndY = function() {
			return endY;
		};
		this.setDivId = function(val) {
			divId = val;
		};
		this.getDivId = function() {
			return divId;
		};
		this.setStartTime = function(val) {
			startTime = val;
		};
		this.getStartTime = function() {
			return startTime;
		};
		this.setOpperator = function(val) {
			opperator = val;
		};
		this.getOpperator = function() {
			return opperator;
		};
		this.setMaxY = function(val) {
			maxY = val;
		};
		this.getMaxY = function() {
			return maxY;
		};
		this.setPosition = function(val) {
			position = val;
		};
		this.getPosition = function() {
			return position;
		};
		this.setOffSet = function(val) {
			offSet = val;
		};
		this.getOffSet = function() {
			return offSet;
		};
	};
ScrollEvent.prototype = {
	/*
	 * Spinner events
	 */
	start: function(e) {
		// Mobbile
		var event = e.originalEvent.touches[0];
		// PC
		//var event = e;
		var xPos;
		var border1 = $('#edit-calendar-scrollbar').width() * 0.5;
		var border2 = $('#edit-calendar-scrollbar').width() * 0.75;
		scrollEvent.setPosition($("#edit-calendar-scrollbar").offset());
		xPos = event.pageX - scrollEvent.getPosition().left;
		scrollEvent.setStartY(event.pageY - scrollEvent.getPosition().top);
		if (xPos >= border2) {
			scrollEvent.setDivId("#minuteScroll");
		} else if (xPos >= border1) {
			scrollEvent.setDivId("#hourScroll");
		} else {
			scrollEvent.setDivId("#stateScroll");
		}
		var tempMatrix = $(scrollEvent.getDivId()).css("-webkit-transform");
		tempMatrix = tempMatrix.substr(7, tempMatrix.length - 8).split(', ');
		scrollEvent.setOffSet(parseInt(tempMatrix[5], 10));
		scrollEvent.setStartTime(new Date());
		scrollEvent.setMaxY(-1 * ($(scrollEvent.getDivId()).height() - (scrollEvent.elementHeight * 2)));
/* PC
         var yPos = event.pageY - scrollEvent.getPosition().top ;
         scrollEvent.setEndY( yPos );
         if ( scrollEvent.getStartY() < scrollEvent.getEndY())
         scrollEvent.setOpperator(-1);
         else
         scrollEvent.setOpperator(1);
         */
		e.preventDefault();
	},
	move: function(e) {
		// Mobbile
		var event = e.originalEvent.touches[0];
		// PC
		//var event = e;
		//if( scrollEvent.getOpperator() != 0)
		{
			var yPos = event.pageY - scrollEvent.getPosition().top;
			scrollEvent.setEndY(yPos);
			switch (scrollEvent.getOpperator()) {
			case -1:
				if (!((scrollEvent.getStartY() > scrollEvent.getEndY()) && scrollEvent.getOpperator() == -1)) {
					scrollEvent.setOpperator(1);
					scrollEvent.setStartTime(new Date());
				}
				break;
			case 1:
				if (!((scrollEvent.getStartY() < scrollEvent.getEndY()) && scrollEvent.getOpperator() == 1)) {
					scrollEvent.setOpperator(-1);
					scrollEvent.setStartTime(new Date());
				}
				break;
			case 0:
				if (scrollEvent.getStartY() < scrollEvent.getEndY()) {
					scrollEvent.setOpperator(-1);
				} else {
					scrollEvent.setOpperator(1);
				}
				break;
			default:
				// NOOP
			}
			var currentSelected = scrollEvent.getOffSet() + scrollEvent.getEndY() - scrollEvent.getStartY();
			scrollEvent.scrollWheel(scrollEvent.getDivId(), 0, currentSelected);
		}
		e.preventDefault();
	},
	end: function(e) {
		var deltaT = new Date() - scrollEvent.getStartTime();
		var deltaY = scrollEvent.getEndY() - scrollEvent.getStartY();
		var currentSelected = 0;
		var hourWheelOffset;
		if (deltaT < 300) {
			var speed = Math.abs(deltaY / deltaT);
			currentSelected = scrollEvent.getOffSet() + ((speed * 1500) * (deltaY / $(scrollEvent.getDivId).height()));
		} else {
			currentSelected = scrollEvent.getOffSet() + deltaY;
		}
		hourWheelOffset = Math.round(currentSelected / scrollEvent.elementHeight) * scrollEvent.elementHeight;
		if (hourWheelOffset > scrollEvent.elementHeight) {
			hourWheelOffset = scrollEvent.elementHeight;
		} else if (hourWheelOffset < scrollEvent.getMaxY()) {
			hourWheelOffset = scrollEvent.getMaxY();
		}
		var speedFactor = scrollEvent.getSpeedFactor(Math.abs(deltaY));
		scrollEvent.scrollWheel(scrollEvent.getDivId(), speedFactor, hourWheelOffset);
		setTimeout(function() {
			scrollEvent.setOpperator(0);
		}, (speedFactor * 1000) + 100);
		e.preventDefault();
	},
	scrollWheel: function(id, duration, value) {
		$(id).css("-webkit-transition-duration", duration + "s");
		$(id).css("-webkit-transform", "translate(0px, " + (value) + "px)");
	},
	getSpeedFactor: function(absoluteDeltaY) {
		if (absoluteDeltaY < scrollEvent.elementHeight) {
			return 0.8;
		} else if (absoluteDeltaY < scrollEvent.elementHeight * 2) {
			return 1.2;
		} else if (absoluteDeltaY < scrollEvent.elementHeight * 3) {
			return 1.5;
		} else if (absoluteDeltaY < scrollEvent.elementHeight * 5) {
			return 2;
		} else {
			return 2.5;
		}
	}
};
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
		if (index != (this.getCount() - 1)) {
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
			if (this.getListItem(x).getDay() == day) {
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
		if ((a.getDay() == b.getDay()) & (a.getHour() == b.getHour()) & (a.getMinute() == b.getMinute())) {
			return true;
		} else {
			return false;
		}
	}
};
/*
 *  SwitchTime class
 */
var SwitchTime = function(conTime, conDay) {
		// Reserve pageHeight
		var pageHeight = 0;
		var day = 0;
		var state = 0;
		var hour = 0;
		var minute = 0;
		if (arguments.length == 1) {
			var temp = (conTime & 0x3FFF);
			day = Math.floor(temp / 1440);
			temp = temp % 1440;
			state = conTime >> 14;
			hour = Math.floor(temp / 60);
			minute = temp % 60;
		} else {
			day = conDay;
		}
		// Setters & Getters
		this.setPageHeight = function(val) {
			pageHeight = val;
		};
		this.getPageHeight = function() {
			return pageHeight;
		};
		this.setState = function(val) {
			state = val;
		};
		this.getState = function() {
			return state;
		};
		this.setDay = function(val) {
			day = val;
		};
		this.getDay = function() {
			return day;
		};
		this.setHour = function(val) {
			hour = val;
		};
		this.getHour = function() {
			return hour;
		};
		this.setMinute = function(val) {
			minute = val;
		};
		this.getMinute = function() {
			return minute;
		};
	};
SwitchTime.prototype = {
	// get the total minute
	getTotalMinute: function() {
		return (this.getHour() * 60) + this.getMinute();
	},
	// Returns the E-Thermostaat switch time from the current object
	createTime: function() {
		var returnTime = 0;
		returnTime = this.getState() << 14;
		returnTime += this.getDay() * 1440;
		returnTime += this.getHour() * 60;
		returnTime += this.getMinute();
		return returnTime;
	}
};
// Login session id;
var apiSessionToken = null;
var remindLogin = 0;
// Timers
var updateTimer = null;
var sendDataTimer = 0;
var heatingTimer = 0;
// Retry's
var retry = 4;
// Flags
var receiveData = true;
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
var heatingDemand = 0;
var clockActivated = 0; // Thermostat clock program activated
// Calendar settings
var currentDay = 0; // Calendar day to display
// Selected nav
var selectedMenu = "nav-menu-temp";
// Selected page of Calendar
var currentPage = 0;
// Calendar edit settings
var switchTime;
// Function is called when DOM is loaded, it binds the different event listeners to the DOM object

function onLoad() {
	$(document).bind("ready", onDeviceReady);
}
// Function is called when the Phonegap library is fully loaded.
// This functions initializes Jquery Mobile and binds the vclick events

function onDeviceReady() {
	console.log("Device Ready");
	// Set default transition
	// Login button binding
	jQuery.fn.visibilityToggle = function(visibility) {
		if (visibility === undefined) {
			return this.css('visibility', function(i, visibility) {
				return (visibility == 'visible') ? 'hidden' : 'visible';
			});
		} else {
			return this.css('visibility', visibility ? 'visible': 'hidden');
		}
	};
	// Menu button binding
	$("#btn_thermostat").on('click', function(e) {
		e.preventDefault();
		loadThermostat();
		return false;
	});
	$("#btn_calendar").on('click', function(e) {
		e.preventDefault();
		loadCalendar();
		return false;
	});
	$("#btn_settings").on('click', function(e) {
		e.preventDefault();
		loadSettings();
		return false;
	});
	$("#btn_info").on('click', function(e) {
		e.preventDefault();
		loadInfo();
		return false;
	});
	// Thermostat button binding
	$("#plus").on('click', function(e) {
		increment();
	});
	$("#minus").on('click', function(e) {
		decrement();
		e.preventDefault();
	});
	$("#thermostat-1").on('click', function(e) {
		setThermostatMode(1, true);
		startSendTimer(2000);
		e.preventDefault();
	});
	$("#thermostat-2").on('click', function(e) {
		setThermostatMode(2, true);
		startSendTimer(2000);
		e.preventDefault();
	});
	$("#thermostat-0").on('click', function(e) {
		setThermostatMode(0, true);
		startSendTimer(2000);
		e.preventDefault();
	});
	$("#thermostat-5").on('click', function(e) {
		setThermostatMode(5, true);
		startSendTimer(2000);
		e.preventDefault();
	});
	// Calendar button binding
	$("#calendar-ma").bind('touchend', function(e) {
		loadWeekClock(0, 0);
		return false;
	});
	$("#calendar-di").bind('touchend', function(e) {
		loadWeekClock(1, 0);
		return false;
	});
	$("#calendar-wo").bind('touchend', function(e) {
		loadWeekClock(2, 0);
		return false;
	});
	$("#calendar-do").bind('touchend', function(e) {
		loadWeekClock(3, 0);
		return false;
	});
	$("#calendar-vr").bind('touchend', function(e) {
		loadWeekClock(4, 0);
		return false;
	});
	$("#calendar-za").bind('touchend', function(e) {
		loadWeekClock(5, 0);
		return false;
	});
	$("#calendar-zo").bind('touchend', function(e) {
		loadWeekClock(6, 0);
		return false;
	});
	$("#calendar-nextpage").on('click', function(e) {
		loadWeekClock(currentDay, (currentPage + 1));
		e.preventDefault();
	});
	$("#calendar-prevpage").on('click', function(e) {
		loadWeekClock(currentDay, (currentPage - 1));
		return false;
	});
	$("#calendar-add-switchTime").on('click', function(e) {
		addClock(currentDay);
		e.preventDefault();
	});
	// Edit calendar

	// App settings
	$("#set-thermostat-color-black").on('click', function(e) {
		changThermostatColorSelection(1);
		e.preventDefault();
	});
	$("#set-thermostat-color-white").on('click', function(e) {
		changThermostatColorSelection(2);
		e.preventDefault();
	});
	$("#save-settings-app").on('click', function(e) {
		saveThermostatColor();
		startSendTimer();
		loadSettings();
		$("#nav").css({
			"visibility": "visible"
		});
		e.preventDefault();
	});
	// Error
	$("#error-btn").on('click', function(e) {
		$("#error").css({
			"visibility": "hidden"
		});
		$("#error-btn").css({
			"visibility": "hidden"
		});
		$.mobile.showPageLoadingMsg();
		e.preventDefault();
	});
	// Message
	$("#message-btn").on('click', function(e) {
		$("#error").css({
			"visibility": "hidden"
		});
		$("#message-btn").css({
			"visibility": "hidden"
		});
		e.preventDefault();
	});
	//disable scrolling
	$("#thermostat").bind('scrollstart', function(e) {
		return false;
	});
	$("#calendar").bind('scrollstart', function(e) {
		return false;
	});
	$("#edit-calendar").bind('scrollstart', function(e) {
		return false;
	});
	$("#settings").bind('scrollstart', function(e) {
		return false;
	});
	$("#settings-info").bind('scrollstart', function(e) {
		return false;
	});
	$("#settings-app").bind('scrollstart', function(e) {
		return false;
	});
	$("#my-account").bind('scrollstart', function(e) {
		return false;
	});
	$("#info").bind('scrollstart', function(e) {
		return false;
	});
	$("#nav").bind('scrollstart', function(e) {
		return false;
	});
	$("#message").bind('scrollstart', function(e) {
		return false;
	});
	Homey.get('token', function(err, token) {
		if (token !== undefined && token !== null && token.length > 0) {
			apiSessionToken = token;
			// Get data from Thermostat
			loadThermostatData("true");
			// Set the remindLogin flag
			remindLogin = true;
		}
	});
}

function back() {
	var activePage = $('.ui-page-active').attr('id');
	if ((activePage == "thermostat") && remindLogin) {
		goHome(1);
	} else if (activePage == "thermostat") {
		goHome(1);
	} else if (activePage == "edit-calendar") {
		startReceiveTimer(true);
		loadCalendar();
	} else if (activePage == "settings-app" || activePage == "settings-thermostat" || activePage == "my-account") {
		startReceiveTimer(true);
		loadSettings();
	} else {
		loadThermostat();
	}
	return false;
}

function goHome(bool) {
	// Remove any message
	$("#message").css({
		"display": "none"
	});
	if ((sendDataTimer != 0) && (retry > 0)) {
		sendData(0);
	}
	if ((sendDataTimer != 0) && (apiSessionToken == null)) {
		popMessage = new PopMessage("", "Het instellen van de thermostaat is vorige keer niet gelukt, u kunt inloggen om het opnieuw te proberen.", "message");
		popMessage.show();
	}
	stopTimers(1);
	$("#nav").css({
		"visibility": "hidden"
	});
	retry = 4;
	$("input").blur();
	return false;
} /*********************************************/
/*  Communication                            */
/*********************************************/

function checkVersion(callback) {
	var killversion;
	var updateversion;
	console.log("Checking version");
	// Enable receiving data
	receiveData = true;
	$.ajax({
		type: "GET",
		url: apiHost + "/version",
		timeout: 5000,
		dataType: 'json',
		cache: false,
		complete: function() {},
		success: function(data) {
			killversion = data["kill-version"];
			updateversion = data["update-version"];
			// Remove password from localstorage
			console.log("Start APP");
			// Check if version is not to old
			if (killversion && version <= killversion) {
				$.mobile.hidePageLoadingMsg();
				popMessage = new PopMessage("", "Helaas is deze versie van de App te oud." + "We verzoeken u de App te upgraden.", "error");
				popMessage.show();
			}
			// Check if API is up and running
			else if (!data["allow-run"]) {
				$.mobile.hidePageLoadingMsg();
				popMessage = new PopMessage("", data["message"], "exit");
				popMessage.show();
			}
			// Start the app
			else {
				var showUpdateWarning = (updateversion && version <= updateversion);
				var showMessage = false;
				if (data["message"] != '0') {
					showMessage = true;
				}
				// Check if warning message needs to be displayed
				if (showUpdateWarning & showMessage) {
					$.mobile.hidePageLoadingMsg();
					popMessage = new PopMessage("", "De door u geinstalleerde versie van de App is verouderd en stopt binnenkort met functioneren." + "We raden u aan de App te upgraden. \n\r" + data["message"], "message");
					popMessage.show();
				} else if (showUpdateWarning) {
					$.mobile.hidePageLoadingMsg();
					popMessage = new PopMessage("", "De door u geinstalleerde versie van de App is verouderd en stopt binnenkort met functioneren." + "We raden u aan de App te upgraden. ", "message");
					popMessage.show();
				} else if (showMessage) {
					$.mobile.hidePageLoadingMsg();
					popMessage = new PopMessage("", data["message"], "message");
					popMessage.show();
				}
				if (Homey.get('token') !== undefined)
				//if( remindLogin )
				{
					apiSessionToken = Homey.get('token');
					// Get data from Thermostat
					loadThermostatData("true");
					// Set the remindLogin flag
					remindLogin = true;
				}
			}
			retry = 4;
			if ($.isFunction(callback)) {
				callback();
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (retry > 0) {
				retry--;
				checkVersion();
			} else {
				errorHandler(jqXHR, textStatus, errorThrown);
			}
			if ($.isFunction(callback)) {
				callback();
			}
		}
	});
}

function loadThermostatData(isFirst) {
	console.log("Loading thermostat data");
	updateTimer = null;
	$.ajax({
		type: "GET",
		url: apiHost + "/data",
		headers: {
			'Session-Token': apiSessionToken
		},
		dataType: 'json',
		timeout: 15000,
		cache: false,
		success: function(data) {
			console.log("Data received and receiveData status:" + receiveData);
			if (receiveData) {
				// get UID
				uid = data["uid"];
				// get last seen time of the HUB
				var lastSeen = new Date();
				lastSeen = parseDate(data["last-seen"]);
				// Calculate set temperature
				setTemp = parseFloat(data["temperature1"]);
				// Calculate current temperature
				currentTemp = parseFloat(data["temperature2"]);
				// Parse dayclock
				var dayClock = data["day-clock"];
				// New v1.2
				// Parse weekclock
				var tempArray = new SwitchTimeList();
				var counter;
				for (counter = 0;
				(data["week-clock"][counter] != 0xFFFF) && counter < 30; counter++) {
					tempArray.add(new SwitchTime(data["week-clock"][counter]));
				}
				weekClock = tempArray;
				// Parse configurationuration thermostat mode
				controlSettings = data.configuration[0];
				var thermostatMode = (controlSettings >> 5) & 0x07;
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
				// Load current settings
				$("#comfort-temp").html(comfortTemp);
				$("#comfort-period").html(comfortPeriod);
				$("#rust-temp").html(rustTemp);
				$("#rust-period").html(rustPeriod);
				$("#antivorst-temp").html(antivorstTemp);
				$("#max-temp").html(maxTemp);
				changeState("#settings-thermostat .selector-selected", automatischInschakelen);
				// Set thermostat color
				changThermostatColorSelection(thermostatColor);
				if (thermostatColor == 1) {
					$('#thermostatImage').attr("src", "./images/thermostat.png");
				} else if (thermostatColor == 2) {
					$('#thermostatImage').attr("src", "./images/thermostat-wit.png");
				}
				// Set the thermostatMode
				setThermostatMode(thermostatMode, false);
				// Set heating display
				if (heatingDemand || clockActivated) {
					if (heatingTimer == 0) {
						heatingTimer = setTimeout("toggleDisplayIcon()", 1000);
					}
				} else {
					$("#thermostat-arrow").css({
						"visibility": "hidden"
					});
					$("#thermostat-clock").css({
						"visibility": "hidden"
					});
					$("#thermostat-spacer").css({
						"visibility": "visible"
					});
					clearTimeout(heatingTimer);
					heatingTimer = 0;
				}
				// Update themperature values
				updateTemp("current", currentTemp);
				updateTemp("set", setTemp);
				// Calendar Init
				loadWeekClock(currentDay, currentPage);
				if (isFirst) {
					// Show message if HUB is offline.
					var checkDate = new Date();
					checkDate.setHours(checkDate.getHours() - 1);
					if (checkDate > lastSeen) {
						if ($("#message").css("display") != "none") {
							// Remove button binding
							$("#message-btn").off();
							$("#message-btn").on('click', function(e) {
								popMessage = new PopMessage("", "Uw E-thermostaat is momenteel niet bereikbaar, zie 'vragenlijst' op <a href=\"http://e-thermostaat.nl/help\" rel=\"external\" target=\"_blank\">e-thermostaat.nl/help</a>.", "message");
								popMessage.show();
								e.preventDefault();
							});
						} else {
							popMessage = new PopMessage("", "Uw E-thermostaat is momenteel niet bereikbaar, zie 'vragenlijst' op <a href=\"http://e-thermostaat.nl/help\" rel=\"external\" target=\"_blank\">e-thermostaat.nl/help</a>.", "message");
							popMessage.show();
						}
					}
					// Change to thermostat page
					loadThermostat();
					// Start receive timer
					startReceiveTimer(true);
					// Enable menu
					$("#nav").css({
						"visibility": "visible"
					});
					// Hide loading message
					$.mobile.hidePageLoadingMsg();
				} else {
					startReceiveTimer(false);
				}
				retry = 4;
				console.log("Finished loading thermostat data");
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(jqXHR.status + " " + ((jqXHR.status % 500) < 10));
			if (retry > 0 && ((jqXHR.status % 500) < 10)) {
				retry--;
				loadThermostatData(isFirst);
			} else {
				errorHandler(jqXHR, textStatus, errorThrown);
			}
		}
	});
}

function sendData(startReceiving) {
	console.log("Sending data");
	var dataString = "";
	// temperature1
	dataString += 'uid=' + uid + '&';
	// temperature1
	dataString += 'temperature1=' + setTemp.toFixed(1);
	// configurationuration
	//console.log( currentSelectedMode );
	dataString += '&configuration%5B%5D=' + ((controlSettings & 0x1F) + ((currentSelectedMode << 5) & 0xE0));
	dataString += '&configuration%5B%5D=' + nodeSettings;
	dataString += '&configuration%5B%5D=' + rustPeriod;
	dataString += '&configuration%5B%5D=' + (comfortPeriod / 10);
	dataString += '&configuration%5B%5D=' + icyNumber(antivorstTemp);
	dataString += '&configuration%5B%5D=' + icyNumber(rustTemp);
	dataString += '&configuration%5B%5D=' + icyNumber(comfortTemp);
	dataString += '&configuration%5B%5D=' + icyNumber(maxTemp);
	dataString += '&configuration%5B%5D=' + comfortShorttime;
	dataString += '&configuration%5B%5D=' + lightsensorProfile;
	dataString += '&configuration%5B%5D=' + heatingProfile;
	dataString += '&configuration%5B%5D=' + thermostatColor;
	console.log(dataString);
	// send the data
	$.ajax({
		type: "POST",
		url: apiHost + "/data",
		headers: {
			'Session-Token': apiSessionToken
		},
		dataType: 'json',
		data: dataString,
		timeout: 10000,
		success: function(data) {
			sendDataTimer = 0;
			retry = 4;
			if (startReceiving) {
				startReceiveTimer(true);
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (retry > 0) {
				retry--;
				console.log("Error" + textStatus + "Thrown: " + errorThrown);
				sendDataTimer = setTimeout("sendData(" + startReceiving + ")", 1000);
			} else {
				errorHandler(jqXHR, textStatus, errorThrown);
			}
		}
	});
}

function sendClock() {
	console.log("Sending Clock");
	var dataString = "";
	// UID
	dataString += 'uid=' + uid;
	// Weekclock
	var x = 0;
	for (x; x < weekClock.length(); x++) {
		dataString += '&week-clock%5B%5D=' + weekClock.get(x).createTime();
	}
	for (x; x < 30; x++) {
		dataString += '&week-clock%5B%5D=65535';
	}
	console.log(dataString);
	// send the data
	$.ajax({
		type: "POST",
		url: apiHost + "/data",
		headers: {
			'Session-Token': apiSessionToken
		},
		dataType: 'json',
		data: dataString,
		timeout: 10000,
		success: function(data) {
			console.log("data send");
			sendDataTimer = 0;
			retry = 4;
			startReceiveTimer(true);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (retry > 0) {
				retry--;
				console.log("Error" + textStatus + "Thrown: " + errorThrown);
				sendDataTimer = setTimeout("sendClock()", 1000);
			} else {
				errorHandler(jqXHR, textStatus, errorThrown);
			}
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

function errorHandler(jqXHR, textStatus, errorThrown) {
	var errorPage = $('.ui-page-active').attr('id');
	console.log(jqXHR.status + " : " + textStatus + " : " + errorThrown);
	goHome(0);
	switch (jqXHR.status) {
	case 0:
		{
			popMessage = new PopMessage("", "Het is niet gelukt verbinding te maken. Controleer uw netwerk instellingen en probeer opnieuw.", "error");
		}
		break;
	case 400:
		{
			if (errorPage === "login") {
				popMessage = new PopMessage("", "Inloggen is niet gelukt. U heeft &#233&#233n van de velden niet ingevuld of onjuiste tekens gebruikt.", "error");
			} else {
				popMessage = new PopMessage("", "Error: 400, u dient contact op te nemen met de service afdeling", "error");
			}
		}
		break;
	case 401:
		{
			if (errorPage === "login") {
				popMessage = new PopMessage("", "Inloggen is niet gelukt. Controleer uw gebruikersnaam en wachtwoord en probeer het opnieuw.", "error");
			} else {
				popMessage = new PopMessage("", "Uw inlog sessie is verlopen, u dient opnieuw in te loggen.", "error");
			}
		}
		break;
	case 403:
		{
			if (errorPage === "login") {
				popMessage = new PopMessage("", "Toegang tijdelijk geblokkeerd wegens te veel foutieve login pogingen.", "error");
			} else {
				popMessage = new PopMessage("", "Error: 403, u dient contact op te nemen met de service afdeling", "error");
			}
		}
		break;
	case 503:
		{
			popMessage = new PopMessage("", "Wegens technische onderhoud is de App momenteel niet beschikbaar", "error");
		}
		break;
	default:
		{
			popMessage = new PopMessage("", "Onbekende fout, u dient contact op te nemen met de service afdeling", "error");
		}
		break;
	}
	$.mobile.hidePageLoadingMsg();
	popMessage.show();
} /*********************************************/
/*  ICY - Util                               */
/*********************************************/

function changeState(id, state) {
	if (state) {
		$(id).css({
			"left": "50%"
		});
	} else {
		$(id).css({
			"left": "0%"
		});
	}
}

function changeReminder(page, save) {
	var id = page + " .selector-selected";
	if ($(id).css("left") == "50%") {
		changeState(id, false);
		if (save) {
			remindLogin = false;
		}
	} else {
		changeState(id, true);
		if (save) {
			remindLogin = true;
		}
	}
} /*********************************************/
/*  Menu                                     */
/*********************************************/

function loadThermostat() {
	$('#nav-menu-selector').css({
		"left": "1%"
	});
	changeTextColor(selectedMenu, "#ababab");
	changeTextColor("nav-menu-temp", "#ffffff");
	selectedMenu = "nav-menu-temp";
	$("#nav").css({
		"visibility": "visible"
	});
}

function loadCalendar() {
	$('#nav-menu-selector').css({
		"left": "26%"
	});
	changeTextColor(selectedMenu, "#ababab");
	changeTextColor("nav-menu-prog", "#ffffff");
	selectedMenu = "nav-menu-prog";
	$("#nav").css({
		"visibility": "visible"
	});
}

function loadSettings() {
	$('#nav-menu-selector').css({
		"left": "51%"
	});
	changeTextColor(selectedMenu, "#ababab");
	changeTextColor("nav-menu-set", "#ffffff");
	selectedMenu = "nav-menu-set";
	$("#nav").css({
		"visibility": "visible"
	});
}

function loadInfo() {
	$('#nav-menu-selector').css({
		"left": "76%"
	});
	changeTextColor(selectedMenu, "#ababab");
	changeTextColor("nav-menu-info", "#ffffff");
	selectedMenu = "nav-menu-info";
	$("#nav").css({
		"visibility": "visible"
	});
}

function changeTextColor(divID, color) {
	$(divID).css({
		"color": color
	});
} /*********************************************/
/*  Thermostat                               */
/*********************************************/

function updateTemp(divID, temp) {
	if ((temp % 1) > 0) {
		$("#" + divID + "-temp").html(temp - 0.5);
		$("#" + divID + "-temp-precision").visibilityToggle(true);
	} else {
		$("#" + divID + "-temp").html(temp);
		$("#" + divID + "-temp-precision").visibilityToggle(false);
	}
}
// ToDo combine increment en decrement to one function

function increment() {
	if (currentSelectedMode == 1) {
		if (setTemp < maxTemp) {
			setTemp += 0.5;
		}
	} else {
		setThermostatMode(1, false);
		setTemp = comfortTemp;
	}
	updateTemp("set", setTemp);
	startSendTimer(2000);
}

function decrement() {
	if (currentSelectedMode == 1) {
		if (setTemp > antivorstTemp) {
			setTemp -= 0.5;
		}
	} else {
		setThermostatMode(1, false);
		setTemp = comfortTemp;
	}
	updateTemp("set", setTemp);
	startSendTimer(2000);
}

function setThermostatMode(mode, updateValue) {
	var imageSrc;
	switch (mode) {
	case 0:
		imageSrc = "./images/icons/antivorst.png";
		if (updateValue) {
			setTemp = antivorstTemp;
		}
		break;
	case 1:
		imageSrc = "./images/icons/comfort.png";
		if (updateValue) {
			setTemp = comfortTemp;
		}
		break;
	case 2:
		imageSrc = "./images/icons/rust.png";
		if (updateValue) {
			setTemp = rustTemp;
		}
		break;
	case 5:
		imageSrc = "./images/icons/vt.png";
		break;
	default:
		{
			imageSrc = "./images/icons/antivorst.png";
			if (updateValue) {
				setTemp = antivorstTemp;
			}
			mode = 0;
		}
	}
	$("#thermostat-" + mode).addClass("selected");
	if (mode != currentSelectedMode) {
		$("#thermostat-" + currentSelectedMode).removeClass("selected");
	}
	$("#thermostat-spacer").attr('src', imageSrc);
	currentSelectedMode = mode;
	updateTemp("set", setTemp);
}

function startSendTimer(interval) {
	clearTimeout(sendDataTimer);
	stopReceiveTimer();
	sendDataTimer = setTimeout("sendData(1)", interval);
}

function stopSendTimer(doNotSend) {
	clearTimeout(sendDataTimer);
	sendDataTimer = 0;
	if (!doNotSend) {
		sendData(0);
	}
}

function startReceiveTimer(restart) {
	if (restart) {
		receiveData = true;
	}
	if (receiveData) {
		if (updateTimer == null) {
			updateTimer = setTimeout("loadThermostatData(false)", 5000);
		}
	}
}

function stopReceiveTimer() {
	// Clear the receiveData flag
	receiveData = false;
	// Clear receive timer
	clearTimeout(updateTimer);
	// Reset updateTimer
	updateTimer = null;
}

function stopTimers(doNotSend) {
	stopReceiveTimer();
	if (sendDataTimer != 0) {
		stopSendTimer(doNotSend);
	}
}

function toggleDisplayIcon() {
	console.log(" Toggle Heating");
	//heating
	if (heatingDemand && ($("#thermostat-spacer").css("visibility") === "visible")) {
		$("#thermostat-arrow").css({
			"visibility": "visible"
		});
		$("#thermostat-spacer").css({
			"visibility": "hidden"
		});
		$("#thermostat-clock").css({
			"visibility": "hidden"
		});
	}
	// clock
	else if (clockActivated && (($("#thermostat-arrow").css("visibility") === "visible") || ($("#thermostat-spacer").css("visibility") == "visible"))) {
		$("#thermostat-arrow").css({
			"visibility": "hidden"
		});
		$("#thermostat-spacer").css({
			"visibility": "hidden"
		});
		$("#thermostat-clock").css({
			"visibility": "visible"
		});
	}
	// status
	else {
		$("#thermostat-clock").css({
			"visibility": "hidden"
		});
		$("#thermostat-arrow").css({
			"visibility": "hidden"
		});
		$("#thermostat-spacer").css({
			"visibility": "visible"
		});
	}
	heatingTimer = setTimeout("toggleDisplayIcon()", 1000);
}

function saveThermostatColor() {
	if ($('#settings-app-color-selector').css('margin-left') == '-73px') {
		$('#thermostatImage').attr("src", "./images/thermostat.png");
		thermostatColor = 1;
	} else if ($('#settings-app-color-selector').css('margin-left') == '2px') {
		$('#thermostatImage').attr("src", "./images/thermostat-wit.png");
		thermostatColor = 2;
	}
}

function changThermostatColorSelection(color) {
	if (color == 1) {
		$('#settings-app-color-selector').css({
			"margin-left": "-73px"
		});
	} else if (color == 2) {
		$('#settings-app-color-selector').css({
			"margin-left": "2px"
		});
	}
} /*********************************************/
/*  Calendar                                 */
/*********************************************/

function loadWeekClock(day, page) {
	console.log("Loading week clock");
	var selectedDay = "";
	$("#calendar-content").html(returnTable(day, page));
	$("#" + getWeekClockId(day)).addClass("selected");
	if (day != currentDay) {
		$("#" + getWeekClockId(currentDay)).removeClass("selected");
	}
	currentPage = page;
	currentDay = day;
}

function getWeekClockId(day) {
	switch (day) {
	case 0:
		{
			return "calendar-ma";
		}
		break;
	case 1:
		{
			return "calendar-di";
		}
		break;
	case 2:
		{
			return "calendar-wo";
		}
		break;
	case 3:
		{
			return "calendar-do";
		}
		break;
	case 4:
		{
			return "calendar-vr";
		}
		break;
	case 5:
		{
			return "calendar-za";
		}
		break;
	case 6:
		{
			return "calendar-zo";
		}
		break;
	}
}

function returnTable(id, page) {
	var returnString = "";
	var sortArray = weekClock.getSwitchTimeDay(id);
	var counter = 0;
	var numberOfItems = 4;
	var offSet = 0;
	var imgSrc;
	if (window.innerHeight > 410) {
		numberOfItems = 5;
	}
	if (page > 0) {
		offSet = numberOfItems * page;
	}
	for (counter = offSet;
	(counter < (offSet + numberOfItems)) && (sortArray.length > counter); counter++) {
		switch (sortArray[counter].getState()) {
			// Antivorst
		case 0:
			imgSrc = "./images/icons/antivorst-icon.png";
			break;
			// Rust
		case 1:
			imgSrc = "./images/icons/rust-icon.png";
			break;
			// Comfort
		case 2:
			imgSrc = "./images/icons/comfort-icon.png";
			break;
		}
		var hour = "00" + sortArray[counter].getHour();
		var minute = "00" + sortArray[counter].getMinute();
		returnString += "<div class=\"weekprogram\" onclick=\"editClock(" + sortArray[counter].createTime() + "," + id + "); \"><img src=\"" + imgSrc + "\"></img><p>" + hour.slice(-2) + ":" + minute.slice(-2) + "</p></div>";
	}
	if (sortArray.length > (numberOfItems * (page + 1))) {
		$("#calendar-nextpage").css({
			"visibility": "visible"
		});
	} else {
		$("#calendar-nextpage").css({
			"visibility": "hidden"
		});
	}
	if (page > 0) {
		$("#calendar-prevpage").css({
			"visibility": "visible"
		});
	} else {
		$("#calendar-prevpage").css({
			"visibility": "hidden"
		});
	}
	if (returnString === "") {
		returnString += "<div class=\"settings-content\"><p>U heeft geen schakelmomenten ingesteld voor deze dag. </p></div>";
	}
	$("#calendar-content").html(returnString);
	return returnString;
}
/*
 * New added in v1.2
 */
var editCalendar;

function editClock(time) {
	// stop receiving data
	stopTimers(0);
	editCalendar = new EditCalendar(new SwitchTime(time));
	editCalendar.show("edit");
}

function addClock(day) {
	// stop receiving data
	stopTimers(0);
	editCalendar = new EditCalendar(new SwitchTime(0, day));
	editCalendar.show("new");
}
/*
 * 2011-09-12 19:21:49
 */

function parseDate(string) {
	if (!string) {
		return;
	}
	var returnDate = new Date();
	returnDate.setFullYear(string.substr(0, 4));
	returnDate.setMonth(string.substr(5, 2) - 1);
	returnDate.setDate(string.substr(8, 2));
	returnDate.setHours(string.substr(11, 2));
	returnDate.setMinutes(string.substr(14, 2));
	returnDate.setSeconds(string.substr(17, 2));
	return returnDate;
}
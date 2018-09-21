/*Script entirely borrowed from https://github.com/cjkeilig/AddtoGCal/blob/master/browser_action.js
* Credit goes to the author cjkeilig */
var browseraction = {};
browseraction.QUICK_ADD_API_URL_= 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/quickAdd';
browseraction.LIST_EVENTS = 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/?q=freetime';
browseraction.UPDATE_EVENT= 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}';
browseraction.CALENDAR_LIST_API_URL_ = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
browseraction.EVENT_TO_UPDATE ={};
$(document).ready(function(){

  browseraction.getCalList = function() {
    chrome.identity.getAuthToken({'interactive': true}, function (authToken) {
      $.ajax(browseraction.CALENDAR_LIST_API_URL_, {
        headers: {
          'Authorization': 'Bearer ' + authToken
        },
        success: function(data) {
          var dropDown = $('#quick-add-calendar-list');
          for (var i = 0; i < data.items.length; i++) {
            var calendar = data.items[i];
            console.log(calendar);
            if(calendar.accessRole === "owner"){
              dropDown.append($('<option>', {
                value: calendar.id,
                text: calendar.id
              }));
            }
          }
          browseraction.listEvents('test',$('#quick-add-calendar-list').val());
        }
      });
    });
  }
  browseraction.createQuickAddEvent_ = function(text,calendarId) {
    var quickAddUrl = browseraction.QUICK_ADD_API_URL_.replace('{calendarId}', encodeURIComponent(calendarId)) + '?text=' + encodeURIComponent(text);
    chrome.identity.getAuthToken({'interactive': false}, function (authToken){
      $.ajax(quickAddUrl, {
        type: 'post',
        headers: {
          'Authorization': 'Bearer ' + authToken
        },
        success: function(response) {
          'use strict'
          $('#quick-add-event-title').val('Scheduled');
        },
        error: function(response) {
          alert("Error" + response);
        }
      });
    });
  }
  browseraction.updateEvent = function(data,calendarId, eventId) {
    var updateUrl = browseraction.UPDATE_EVENT.replace('{calendarId}', encodeURIComponent(calendarId)).replace('{eventId}', encodeURIComponent(eventId));
    chrome.identity.getAuthToken({'interactive': false}, function (authToken){
      $.ajax(updateUrl, {
        type: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + authToken,
          'Accept'       : 'application/json',
          'Content-Type' : 'application/json'
        },
        data : data,
        success: function(response) {
          'use strict'
          $('#quick-add-event-title').val('Scheduled');
        },
        error: function(response) {
          alert("Error" + response);
        }
      });
    });
  }
  browseraction.listEvents = function(text,calendarId) {
    var quickAddUrl = browseraction.LIST_EVENTS.replace('{calendarId}', encodeURIComponent(calendarId));
    chrome.identity.getAuthToken({'interactive': false}, function (authToken){
      $.ajax(quickAddUrl, {
        type: 'GET',
        headers: {
          'Authorization': 'Bearer ' + authToken
        },
        success: function(response) {
          'use strict'
          browseraction.EVENT_TO_UPDATE = response.items[0];

        },
        error: function(response) {
          alert("Error" + response);
        }
      });
    });
  }
  $('#quick-add-button').on('click', function() {
    console.log($('#quick-add-event-title').val().toString());
    console.log($('#quick-add-calendar-list').val());
    var calendarAction = $('#quick-add-event-title').val().toString() + " " + $('#time').val().toString();
    browseraction.createQuickAddEvent_(calendarAction, $('#quick-add-calendar-list').val());

  });

  browseraction.share = function() {
    function updateTabInfo (tabs) {
      var currentTab = tabs[0];
      console.log(currentTab);
      $("#quick-add-event-title").html(currentTab.url);
    }
    chrome.tabs.query({
      'active': true,
      currentWindow: true
    }, updateTabInfo.bind(this));
  }

  browseraction.getCalList();
  browseraction.share();
})

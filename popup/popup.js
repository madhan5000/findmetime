/*Script entirely borrowed from https://github.com/cjkeilig/AddtoGCal/blob/master/browser_action.js
* Credit goes to the author cjkeilig */

$(document).ready(function(){
  var browseraction = {};
  browseraction.QUICK_ADD_API_URL_= 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/quickAdd';
  browseraction.CALENDAR_LIST_API_URL_ = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
  browseraction.getCalList = function() {
    chrome.identity.getAuthToken({'interactive': true}, function (authToken) {
      $.ajax(browseraction.CALENDAR_LIST_API_URL_, {
        headers: {
          'Authorization': 'Bearer ' + authToken
        },
        success: function(data) {
          var calendars = {};
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
          $('#quick-add-button').on('click', function() {
            browseraction.createQuickAddEvent_($('#quick-add-event-title').val().toString(), $('#quick-add-calendar-list').val());
            $('#quick-add-event-title').val('');
          });
        }
      });
    });
  }
  browseraction.createQuickAddEvent_ = function(text,calendarId) {
    var quickAddUrl = browseraction.QUICK_ADD_API_URL_.replace('{calendarId}', encodeURIComponent(calendarId)) + '?text=' + encodeURIComponent(text);
    chrome.identity.getAuthToken({'interactive': false}, function (authToken){
      $.ajax(quickAddUrl, {
        type: 'POST',
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

  browseraction.getCalList();
  $('#quick-add-button').on('click', function() {
    console.log($('#quick-add-event-title').val().toString());
    console.log($('#quick-add-calendar-list').val());
    browseraction.createQuickAddEvent_($('#quick-add-event-title').val().toString(), $('#quick-add-calendar-list').val());

  });

  browseraction.share = function() {
    function updateTabInfo (tabs) {
      var currentTab = tabs[0]
      console.log(currentTab);
      $("#quick-add-event-title").html(currentTab.url);
      this.tabUrl = currentTab.url;
    }
    chrome.tabs.query({
      'active': true,
      currentWindow: true
    }, updateTabInfo.bind(this));
  }
  browseraction.share();
})

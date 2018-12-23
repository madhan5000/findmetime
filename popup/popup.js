/*Script entirely borrowed from https://github.com/cjkeilig/AddtoGCal/blob/master/browser_action.js
* Credit goes to the author cjkeilig */


var browseraction = {};
browseraction.AUTH_TOKEN = "";
browseraction.QUICK_ADD_API_URL_= 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/quickAdd';
browseraction.LIST_EVENTS = 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/?q=freetime';
browseraction.UPDATE_EVENT= 'https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}';
browseraction.CALENDAR_LIST_API_URL_ = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';
browseraction.EVENT_TO_UPDATE ={};
browseraction.getCalList = function(authToken) {
  $.ajax(browseraction.CALENDAR_LIST_API_URL_, {
    headers: {
      'Authorization': 'Bearer ' + browseraction.AUTH_TOKEN
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
}
browseraction.createQuickAddEvent_ = function(text,calendarId) {
  var quickAddUrl = browseraction.QUICK_ADD_API_URL_.replace('{calendarId}', encodeURIComponent(calendarId)) + '?text=' + encodeURIComponent(text);
  
    $.ajax(quickAddUrl, {
      type: 'post',
      headers: {
        'Authorization': 'Bearer ' + browseraction.AUTH_TOKEN
      },
      success: function(response) {
        'use strict'
        $('#quick-add-event-title').val('Scheduled');
      },
      error: function(response) {
        alert("Error" + response);
      }
    });
  
}
browseraction.updateEvent = function(data,calendarId) {
  console.log(data);
  var eventId   = data.id;
  var updateUrl = browseraction.UPDATE_EVENT.replace('{calendarId}', encodeURIComponent(calendarId)).replace('{eventId}', encodeURIComponent(eventId));
  delete data.id;
    $.ajax(updateUrl, {
      type: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + browseraction.AUTH_TOKEN,
        'Content-Type' : 'application/json'
      },
      data : JSON.stringify(data),
      success: function(response) {
        'use strict'
        $('#quick-add-event-title').val('Scheduled');
      },
      error: function(response) {
        console.log(response);
        
      }
    });
  
}
browseraction.listEvents = function(text,calendarId) {
  var quickAddUrl = browseraction.LIST_EVENTS.replace('{calendarId}', encodeURIComponent(calendarId));
 
    $.ajax(quickAddUrl, {
      type: 'GET',
      headers: {
        'Authorization': 'Bearer ' + browseraction.AUTH_TOKEN
      },
      success: function(response) {
        'use strict'
        browseraction.EVENT_TO_UPDATE ={start: response.items[0].start,end : response.items[0].end, summary:"", id: response.items[0].id,location:"",description:"",reminders:response.items[0].reminders} ;
        //browseraction.EVENT_TO_UPDATE={id: response.items[0].id,summary:''}
      },
      error: function(response) {
        alert("Error" + response);
      }
    });
}
$(document).ready(function(){
  $("#logout").on('click',logout);
 
  
  $('#quick-add-button').on('click', function() {
    console.log($('#quick-add-event-title').val().toString());
    console.log($('#quick-add-calendar-list').val());
    var calendarAction = $('#quick-add-event-title').val().toString() + " " + $('#time').val().toString();
    //browseraction.createQuickAddEvent_(calendarAction, $('#quick-add-calendar-list').val());
   // browseraction.listEvents($('#quick-add-event-title').val().toString() ,$('#quick-add-calendar-list').val());
   browseraction.EVENT_TO_UPDATE.summary = $('#quick-add-event-title').val().toString();
   browseraction.updateEvent(browseraction.EVENT_TO_UPDATE,$('#quick-add-calendar-list').val());
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

 // browseraction.getCalList();
  browseraction.share();
  login();
})

function isLoggedIn(token) {
  // The user is logged in if their token isn't expired
  return jwt_decode(token).exp > Date.now() / 1000;
}
function logout() {
  // Remove the idToken from storage
  localStorage.clear();
  login();
}
function login(){
  const authResult = JSON.parse(localStorage.authResult || '{}');
  const token = authResult.id_token;
  if (token && isLoggedIn(token)) {
    fetch(`https://${env.AUTH0_DOMAIN}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${authResult.access_token}`
      }
    }).then(resp => resp.json()).then((profile) => {
      var userId = profile.sub;
      console.log(`https://madhan.info/token?userid=${userId}`);
      fetch(`https://madhan.info/token?userid=${userId}`).then(resp => resp.json()).then((resp)=>{
        browseraction.AUTH_TOKEN = resp.token;
        browseraction.getCalList(resp.token);
     })
    })
  } else {
    chrome.runtime.sendMessage({
      type: "authenticate"
    });
  }
}


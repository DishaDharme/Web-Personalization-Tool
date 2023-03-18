

document.cookie = "timer3=";
localStorage['notific'] = '';


// Set global vars

var openedTabs = {};
var closedTabs = [];
var tabtourl = {};

// Opened tab

function openedTab(tab) {
  openedTabs[tab.id] = tab;
}


// Closed tab

function closedTab(id) {
  if (openedTabs[id] !== undefined) {
    openedTabs[id].time = timeNow(0);
    closedTabs.unshift(openedTabs[id]);
  }
}


// Updated tab

function updatedTab(tab) {
  if (tab.status == 'complete') {
    if (openedTabs[tab.id] !== undefined) {
      openedTabs[tab.id].title = tab.title;
      openedTabs[tab.id].url = tab.url;
    }
  }
}


// Most visited init

var mostVisitedInit = function () {

  var mv = [];
  var infmv = 45;
  var r = 0;

  chrome.history.search({ text: '', maxResults: 0, startTime: (new Date()).getTime() - (28 * 24 * 3600 * 1000), endTime: (new Date()).getTime() }, function (hi) {

    if (hi.length > 0) {

      hi.sort(function (a, b) { return b.visitCount - a.visitCount });

      for (i = 0; i < 99; i++) {

        if (r == infmv) { break; }

        if (hi[i] !== undefined) {

          if ((/^(http|https|ftp|ftps|file|chrome|chrome-extension|chrome-devtools)\:\/\/(.*)/).test(hi[i].title) == false && (/^(ftp|ftps|file|chrome|chrome-extension)\:\/\/(.*)/).test(hi[i].url) == false) {

            var currentTime = new Date(hi[i].lastVisitTime);
            var hours = currentTime.getHours();
            var minutes = currentTime.getMinutes();
            if (hours < 10) { hours = '0' + hours; }
            if (minutes < 10) { minutes = '0' + minutes; }
            var time = hours + ':' + minutes;

            var title = hi[i].title;
            var url = hi[i].url;
            var furl = 'chrome://favicon/' + hi[i].url;

            if (title == '') {
              title = url;
            }

            mv.push({ url: url, favicon: furl, title: title.replace(/\"/g, '&#34;'), visitCount: hi[i].visitCount });

            r++;
          }

        }

      }

      localStorage['mv-cache'] = JSON.encode(mv);

    } else {
      localStorage['mv-cache'] = 'false';
    }

  });

};

// Default values

var defaultValues = {
  "rh-itemsno": 20,
  "rct-itemsno": 0,
  "mv-itemsno": 0,
  "rb-itemsno": 0,
  "mv-blocklist": "false",
  "rh-historypage": "yes",
  "rh-date": "mm/dd/yyyy",
  "rh-width": "275px",
  "rh-search": "yes",
  "rh-list-order": "rh-order,rct-order,rb-order,mv-order",
  "rh-time": "yes",
  "rh-group": "yes",
  "rh-orderby": "date",
  "rh-order": "desc",
  "rh-timeformat": "24",
  "rh-click": "current",
  "rh-share": "yes",
  "rh-filtered": "false",
  "rh-pinned": "false",
  "rhs-showurl": "no",
  "rhs-showsep": "no",
  "rhs-showext": "no",
  "rhs-showbg": "no"
};

for (var v in defaultValues) {
  if (!localStorage[v] || localStorage[v] == null || localStorage[v] == '') {
    localStorage[v] = defaultValues[v];
  }
}
// Listeners
chrome.tabs.onRemoved.addListener(function (tabid, info) {

    if (tabtourl[tabid] !== '') {

        var time = new Date();
        localStorage[tabtourl[tabid]] = localStorage[tabtourl[tabid]] + '-' + time.getHours() + ':' + time.getMinutes();
        var arr = localStorage[tabtourl[tabid]].split('-');
        var start = arr[1].split(':');
        var end = arr[2].split(':');
        var timespent = ((parseInt(end[0]) * 60) + parseInt(end[1])) - ((parseInt(start[0]) * 60) + parseInt(start[1]));
        localStorage[tabtourl[tabid]] = localStorage[tabtourl[tabid]] + '-' + timespent;
       
        if (localStorage['categoryTime'] == null)
            localStorage['categoryTime'] = timespent;
        else
            localStorage['categoryTime'] = localStorage['categoryTime'] + '-' + timespent;
        var category;
        var hostname = tabtourl[tabid];
        var request = new XMLHttpRequest();
        request.open("POST", "https://www.klazify.com/api/categorize?url=https://" + hostname);
        request.setRequestHeader("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiM2Y3MjUzYjRkYjBmNGVlODRlNTdkZTNkMzYwNWRiMjA3N2Y5NDFmOGY4YmZmMGY5OGU4YWZhYTA4YTE0ZmVkZTU0MGQxOWUxODkzZTlmYjYiLCJpYXQiOjE2NzE1MTY1MjEsIm5iZiI6MTY3MTUxNjUyMSwiZXhwIjoxNzAzMDUyNTIxLCJzdWIiOiI5NzI4Iiwic2NvcGVzIjpbXX0.QTjSVXFLqP49RL3Pi6VnoAcHOW0Rln1JLpa67Cvt-Fm7lyKTxzQUEvLucwbDnotlsuSGhVgEJ_FTkDrNQdlaCg");
        request.onload = function () {
            var index = JSON.parse(request.response).domain.categories[0].name.lastIndexOf("/");
            category = JSON.parse(request.response).domain.categories[0].name.substring(index + 1);
          
            if (localStorage['category'] == null)
                localStorage['category'] = category;
            else
                localStorage['category'] = localStorage['category'] + '-' + category;
            
        };
        request.send();
    }
});
chrome.tabs.onCreated.addListener(function (tab) {
  openedTab(tab);
  if (localStorage['rh-historypage'] == 'yes' && (tab.url == 'chrome://history/' || ('pendingUrl' in tab && tab.pendingUrl == 'chrome://history/'))) {
    chrome.tabs.update(tab.id, { url: 'history.html', selected: true }, function () { });
  }
});
chrome.tabs.onUpdated.addListener(function (id, info, tab) {

    updatedTab(tab);
    if (tabtourl[tab.id] === undefined) {
        tabtourl[tab.id] = ' ';

    }
    else {

        if (new URI(info.url).get('host') !== '') {
            tabtourl[tab.id] = new URI(info.url).get('host');
          
        }
    }
    if (getVersionType() == 'pageAction') {
        chrome.pageAction.show(id);

    }
});
chrome.history.onVisited.addListener(function (result) {
    if (new URI(result.url).get('host') !== '') {
        var time = new Date();
        localStorage[new URI(result.url).get('host')] = new URI(result.url).get('host') + '-' + time.getHours() + ':' + time.getMinutes();
                
     }
});

// Page action icon
chrome.tabs.onCreated.addListener(function (tab) {
  //chrome.pageAction.show(tab.id);
    var time = new Date();
  
  if (localStorage['notific'] == '') {
    var data = tab.id + '-' + time.getHours() + ':' + time.getMinutes() + ',';
    localStorage['notific'] = data;
  }
  else {

    localStorage['notific'] = localStorage['notific'] + tab.id + '-' + time.getHours() + ':' + time.getMinutes() + ',';

  }
});


// Startup

// test function for notification

// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.');
    return;
  }

  if (Notification.permission !== 'granted')
    Notification.requestPermission();
});

function test() {

  chrome.windows.getAll({ populate: true }, getAllOpenWindows);
  function getAllOpenWindows(winData) {
    var tabs = [];
    for (var i in winData) {
      if (winData[i].focused === true) {
        var winTabs = winData[i].tabs;
        
      }

    }

    var i, j, k;
    var decoded = decodeURIComponent(document.cookie);
    var carr = decoded.substring(7).split(",");
   
    for (i = 0; i < carr.length - 1; i++) {
      var tarr = carr[i].split(':');
      var tyme = tarr[1];
      var khost = tarr[0];
      var notificdata = localStorage['notific'];
      var notificarr = notificdata.split(',');
      for (j = 0; j < winTabs.length; j++) {
        var thost = new URI(winTabs[j].url).get('host');
        if (khost.toString() == thost.toString()) {
           
          for (k = 0; k < notificarr.length; k++) {

            var notific = notificarr[k].split('-');
            var start = notific[1].split(':');
            var test = new Date();
            if (notific[0] == winTabs[j].id) {
              if (((parseInt(start[0]) * 60) + parseInt(start[1])) + parseInt(tyme.toString()) < (parseInt(test.getHours()) * 60) + parseInt(test.getMinutes())) {
               // let text = localStorage['stopnotific'];
               
              //  if (!text.includes(winTabs[j].id)) {
                  var notification = new Notification('Reminder for Website Timer', {
                    body: khost.toString(),
                    icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png'

                  });

                 /*  if (localStorage['stopnotific'].toString() == '') {
                    localStorage['stopnotific'] = winTabs[j].id + ',';
                  }
                  else {
                    localStorage['stopnotific'] = localStorage['stopnotific'].toString() + winTabs[j].id + ',';
                  } */
              //  }
                
               
              }
            }
          }

        }

      }
    }

  }



}

setInterval(test, 10000);

$(window).unload(function () {
    localStorage.removeItem("notific");
    tabtourl.splice(0, tabtourl.length);
    return '';

});

mostVisitedInit();
mostVisitedInit.periodical(3 * 60 * 1000);

if (getVersionType() == 'pageAction') {
  chrome.windows.getAll({}, function (wins) {
    for (var i in wins) {
      if (wins[i].id !== undefined) {
        chrome.tabs.getAllInWindow(wins[i].id, function (tabs) {
          for (var n in tabs) {
            if (tabs[n].id !== undefined) {
              chrome.pageAction.show(tabs[n].id);
              openedTab(tabs[n]);
            }
          }
        });
      }
    }
  });
}


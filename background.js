window.onload = function(){

};

chrome.runtime.onInstalled.addListener(function(info){
  if(!Identity.getUniqueId()){
      Identity.setUniqueId();
  }

  console.log('on installed', arguments);

});
chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
      console.log(request);
        if (request) {
            if (request.message) {
                if (request.message == "uniqueId") {
                    localStorage.setItem('userId',request.userId);
                    sendResponse({uniqueId: localStorage.getItem('uniqueId')});
                }
            }
        }
        return true;
    });
changeServer = function(current){
  var server = localStorage.getItem('server');
  localStorage.setItem('current',current);

}

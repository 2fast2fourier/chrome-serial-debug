chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    id: "mainwin",
    innerBounds: {
      width: 640,
      height: 480
    }
  }, function(win){
  	win.onClosed.addListener(function(){
  	  //close open connections
  	  chrome.serial.getConnections(function(connections){
		connections.forEach(function(connection){
		  chrome.serial.disconnect(connection.connectionId, function(){});
		});
	  });
  	});
  });
})

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    id: "mainwin",
    innerBounds: {
      width: 640,
      height: 480
    }
  });
})

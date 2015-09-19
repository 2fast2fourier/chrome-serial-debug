var connectionId = -1;
var e_dtr, e_rts;
var e_monitor, dtr, rts;

var interval = false;
var paused = false;

var disconnectBtn, pauseBtn;
var eventPre;
var eventList = [];
var receiveBuffer = '';

function onSetControlSignals(result) {
  checkError();
  console.log("onSetControlSignals: " + result);
};

function changeSignals() {
  chrome.serial.setControlSignals(connectionId,
                                  { dtr: dtr, rts: rts },
                                  onSetControlSignals);
}

function checkError(err, name, status){
  if(chrome.runtime.lastError){
    addEvent('Chrome lastError: '+chrome.runtime.lastError.message);
    return true;
  }
  if(err){
    addEvent('Error: '+name+' returned: '+status);
    return true;
  }
  return false;
}

function checkConnection(){
  if(connectionId < 0){
    addEvent('Not connected!');
    return false;
  }
  return true;
}

function updatePauseButton(){
  if(paused){
    pauseBtn.value = 'Unpause';
  }else{
    pauseBtn.value = 'Pause';
  }
}

function togglePause(){
  if(paused){
    addEvent('Resuming Connection');
    chrome.serial.setPaused(connectionId, false, function(){
      checkError();
      chrome.serial.getInfo(connectionId, function(info){
        checkError();
        if(info.paused){
          addEvent('Error: Connection is still paused!');
        }
        paused = info.paused;
        updatePauseButton();
      });
    });
  }else{
    chrome.serial.setPaused(connectionId, true, function(){
      checkError();
      addEvent('Paused Connection');
      getInfo();
    });
  }
}

function onGetControlSignals(signals) {
  if(!checkError()){
    addEvent('DCD: '+signals.dcd+' CTS: '+signals.cts+' RI: '+signals.ri+' DSR: '+signals.dsr)
  }
}

function readSignals() {
  if(connectionId >= 0){
    chrome.serial.getControlSignals(connectionId, onGetControlSignals);
  }
}

function send(code, preMessage){
  if(!checkConnection()){
    return;
  }
  if(preMessage){
    addEvent(preMessage);
  }
  chrome.serial.send(connectionId, new Uint8Array([code]).buffer, function(res){
    checkError(res.error, 'serial.send', res.error);
  });
}

function getInfo(){
  chrome.serial.getInfo(connectionId, function(info){
    checkError();
    if(!paused && info.paused){
      addEvent('Connection has Paused');
    }
    paused = info.paused;
    updatePauseButton();
  });
}

function onConnect(connectionInfo) {
  checkError();
  if (!connectionInfo) {
    setStatus('Could not open');
    return;
  }
  connectionId = connectionInfo.connectionId;
  setStatus('Connected');

  disconnectBtn.value = 'Disconnect';

  dtr = false;
  rts = false;
  changeSignals();
  getInfo();
};

function setStatus(status) {
  document.getElementById('status').innerText = status;
}

function buildPortPicker(ports) {
  var eligiblePorts = ports.filter(function(port) {
    return !port.path.match(/[Bb]luetooth/);
  });

  var portPicker = document.getElementById('port-picker');
  eligiblePorts.forEach(function(port) {
    var portOption = document.createElement('option');
    portOption.value = portOption.innerText = port.path;
    portPicker.appendChild(portOption);
  });

  portPicker.onchange = function() {
    if (connectionId != -1) {
      chrome.serial.disconnect(connectionId, openSelectedPort);
      return;
    }
    openSelectedPort();
  };
}

function disconnect(callback){
  if (connectionId != -1) {
    chrome.serial.disconnect(connectionId, function(){
      checkError();
      connectionId = -1;
      disconnectBtn.value = 'Connect';
      addEvent('Disconnected');
    });
  }
}

function openSelectedPort() {
  var portPicker = document.getElementById('port-picker');
  var selectedPort = portPicker.options[portPicker.selectedIndex].value;
  chrome.serial.connect(selectedPort, onConnect);
}

function addEvent(text){
  console.log('Event: ', text);
  eventList.push(text);
  updateEventText();
}

function updateEventText() {
  eventPre.innerHTML = eventList.join('\n');
  eventPre.scrollTop = eventPre.scrollHeight;
}

function triggerBreak(){
  send(66, 'Triggering Remote Break');
}

function triggerFrame() {
  send(68, 'Triggering Remote Framing Error');
}

function sendPing() {
  send(65, 'Sending Ping...');
}

function toggleConnection(){
  if(connectionId >= 0){
    disconnect();
  }else{
    openSelectedPort();
  }
}

onload = function() {
  e_dtr = document.getElementById('dtr_input');
  e_rts = document.getElementById('rts_input');
  e_dtr.onchange = function() {
    dtr = e_dtr.checked;
    changeSignals();
  }
  e_rts.onchange = function() {
    rts = e_rts.checked;
    changeSignals();
  }

  eventPre = document.getElementById('events');

  var breakBtn = document.getElementById('break_btn');
  breakBtn.addEventListener('click', triggerBreak, false);

  var frameBtn = document.getElementById('frame_btn');
  frameBtn.addEventListener('click', triggerFrame, false);

  var readSignalBtn = document.getElementById('read_signals_btn');
  readSignalBtn.addEventListener('click', readSignals, false);

  var pingBtn = document.getElementById('ping_btn');
  pingBtn.addEventListener('click', sendPing, false);

  disconnectBtn = document.getElementById('disconnect_btn');
  disconnectBtn.addEventListener('click', toggleConnection, false);

  pauseBtn = document.getElementById('pause_btn');
  pauseBtn.addEventListener('click', togglePause, false);

  chrome.serial.getDevices(function(devices) {
    buildPortPicker(devices)
    openSelectedPort();
  });

  chrome.serial.onReceive.addListener(function(info){
    var data = new Uint8Array(info.data);
    for(ix=0;ix<data.length;ix++){
      if(data[ix] === 10 || data[ix] === 13){
        if(receiveBuffer.length > 0){
          addEvent('Received: ' + receiveBuffer);
          receiveBuffer = '';
        }
      }else{
        receiveBuffer += String.fromCharCode(data[ix]);
      }
    }
    console.log('data', data, receiveBuffer);
  });

  chrome.serial.onReceiveError.addListener(function(error){
    addEvent('Serial onReceiveError: '+error.error);
    getInfo();
  });

  updateEventText();
};


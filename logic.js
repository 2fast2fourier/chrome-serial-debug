var connectionId = -1;
var e_dtr, e_rts, e_dcd, e_cts, e_ri, e_dsr;
var dtr, rts;

var interval = false;

var disconnectBtn;
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

function checkError(){
  if(chrome.runtime.lastError){
    addEvent('Chrome Error: '+chrome.runtime.lastError.message);
  }
}

function onGetControlSignals(signals) {
  checkError();
  e_dcd.innerText = signals.dcd;
  e_cts.innerText = signals.cts;
  e_ri.innerText = signals.ri;
  e_dsr.innerText = signals.dsr;
}

function readSignals() {
  if(connectionId >= 0){
    chrome.serial.getControlSignals(connectionId, onGetControlSignals);
  }
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

  interval = setInterval(readSignals, 1000);
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
      clearInterval(interval);
      chrome.serial.disconnect(connectionId, openSelectedPort);
      return;
    }
    openSelectedPort();
  };
}

function disconnect(callback){
  if (connectionId != -1) {
    clearInterval(interval);
    chrome.serial.disconnect(connectionId, function(){
      checkError();
      clearInterval(interval);
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
  if(connectionId < 0){
    addEvent('Not connected!');
    return;
  }
  addEvent('Triggering Break');
  chrome.serial.send(connectionId, new Uint8Array([66]).buffer, function(){
    checkError();
    console.log('sent break');
  });
}

function triggerFrame() {
  if(connectionId < 0){
    addEvent('Not connected!');
    return;
  }
  addEvent('Triggering Framing Error');
  updateEventText();
  chrome.serial.send(connectionId, new Uint8Array([68]).buffer, function(){
    checkError();
    console.log('sent frame');
  });
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

  e_dcd = document.getElementById('dcd_status');
  e_cts = document.getElementById('cts_status');
  e_ri = document.getElementById('ri_status');
  e_dsr = document.getElementById('dsr_status');

  eventPre = document.getElementById('events');

  var breakBtn = document.getElementById('break_btn');
  breakBtn.addEventListener('click', triggerBreak, false);

  var frameBtn = document.getElementById('frame_btn');
  frameBtn.addEventListener('click', triggerFrame, false);

  disconnectBtn = document.getElementById('disconnect_btn');
  disconnectBtn.addEventListener('click', toggleConnection, false);

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
  });

  updateEventText();
};


// This sketch for use with the Chrome Serial Debug app to provide
// remote serial device functionality.
// This can be used with any Arduino that has an FTDI USB-Serial chip.

// NOTE: Some Arduino units have an Atmel USB-Serial interface that will not
// recognize break condition or framing errors.

void serialBreak(int millis){
  Serial.println("Breaking...");
  delay(100);
  Serial.end();
  pinMode(1, OUTPUT);
  digitalWrite(1, LOW);
  delay(millis);
  digitalWrite(1, HIGH);
  Serial.begin(9600);
  Serial.println("Break Finished");
}

void serialPseudoFramingError(){
  Serial.println("Generating Framing Error...");
  delay(100);
  Serial.end();
  pinMode(1, OUTPUT);
  for(int ix=0;ix<45;ix++){
    digitalWrite(1, LOW);
    delayMicroseconds(100);
    digitalWrite(1, HIGH);
    delayMicroseconds(50);
  }
  Serial.begin(9600);
  Serial.println("Framing Error Finished");
}

void setup() {
  Serial.begin(9600);
}

int command = 0;
void loop() {
  command = Serial.read();
  switch(command){
    case 65:
      Serial.println("Pong");
      break;
    case 66:
      serialBreak(1000);
      break;
    case 68:
      serialPseudoFramingError();
      break;
  }
  delay(10);
}

void serialBreak(int millis){
  Serial.println("Breaking...");
  Serial.end();
  pinMode(1, OUTPUT);
  digitalWrite(1, LOW);
  delay(millis);
  digitalWrite(1, HIGH);
  Serial.begin(9600);
  Serial.println("\nBreak Finished");
}

void serialPseudoFramingError(){
  Serial.println("Generating Framing Error...");
  Serial.end();
  pinMode(1, OUTPUT);
  for(int ix=0;ix<45;ix++){
    digitalWrite(1, LOW);
    delayMicroseconds(100);
    digitalWrite(1, HIGH);
    delayMicroseconds(50);
  }
  Serial.begin(9600);
  Serial.println("");
  Serial.println("Framing Error Finished");
}

void setup() {
  pinMode(13, OUTPUT);
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
      serialBreak(2000);
      break;
    case 67:
      Serial.println("Flashing");
      digitalWrite(13, HIGH);
      delay(1000);
      digitalWrite(13, LOW);
      break;
    case 68:
      serialPseudoFramingError();
      break;
  }
  delay(10);
}

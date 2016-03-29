// Based on Arduino Keyboard example

#include "Keyboard.h"

const int buttonPinA = 6;          // input pin for pushbutton
const int buttonPinB = 9;          // input pin for pushbutton 2

int previousButtonStateA = HIGH;   // for checking the state of a pushButton
int previousButtonStateB = HIGH;   // for checking the state of a pushButton

void setup() {
  // make the pushButton pin an input:
  pinMode(buttonPinA, INPUT);
  pinMode(buttonPinB, INPUT);
  // initialize control over the keyboard:
  Keyboard.begin();
}

void loop() {
  // read the pushbuttons:
  int buttonStateA = digitalRead(buttonPinA);
  int buttonStateB = digitalRead(buttonPinB);
  
  // if the button state A has changed,
  if ((buttonStateA != previousButtonStateA)
      // and it's currently pressed:
      && (buttonStateA == HIGH)) {
        
    // type out a message
    Keyboard.print("H"); // 'H' for home
  }
  
  // if the button state B has changed,
  if ((buttonStateB != previousButtonStateB)
      // and it's currently pressed:
      && (buttonStateB == HIGH)) {
        
    // type out a message
    Keyboard.print("C"); // 'C' for Camera
  }
  
  // save the current button state for comparison next time:
  previousButtonStateA = buttonStateA;
  previousButtonStateB = buttonStateB;
}


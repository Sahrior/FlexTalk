#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
// 0x3F address i2c
// 0x27 address i2c

void setup()
{
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("SIGN LANGUAGE");

  pinMode(13, OUTPUT);
}

void loop()
{
  int s2 = analogRead(A2);
  int s3 = analogRead(A0);
  int s4 = analogRead(A1);

  bool b2 = (s2 < 80);
  bool b3 = (s3 < 60);
  bool b4 = (s4 < 60);

  Serial.println(s2);

  if (b2 && !b3 && !b4)
  {
    digitalWrite(13, LOW);
    Serial.println("WashRoom");
    lcd.setCursor(0, 1);
    lcd.print("WASHROOM        ");
    delay(2000);
  }
  else if (!b2 && b3 && !b4)
  {
    digitalWrite(13, HIGH);
    Serial.println("Drink Water");
    lcd.setCursor(0, 1);
    lcd.print("DRINK WATER     ");
    delay(2000);
  }
  else if (b2 && b3 && !b4)
  {
    digitalWrite(13, LOW);
    Serial.println("Go out");
    lcd.setCursor(0, 1);
    lcd.print("GO OUT          ");
    delay(2000);
  }
  else if (!b2 && !b3 && b4)
  {
    digitalWrite(13, LOW);
    Serial.println("Food");
    lcd.setCursor(0, 1);
    lcd.print("FOOD            ");
    delay(2000);
  }
  else if (b2 && !b3 && b4)
  {
    digitalWrite(13, HIGH);
    Serial.println("I need help");
    lcd.setCursor(0, 1);
    lcd.print("I NEED HELP     ");
    delay(2000);
  }
  else if (!b2 && b3 && b4)
  {
    digitalWrite(13, LOW);
    Serial.println("Medicine");
    lcd.setCursor(0, 1);
    lcd.print("MEDICINE        ");
    delay(2000);
  }
  else if (b2 && b3 && b4)
  {
    digitalWrite(13, HIGH);
    Serial.println("Call doctor");
    lcd.setCursor(0, 1);
    lcd.print("CALL DOCTOR     ");
    delay(2000);
  }
  else
  {
    Serial.println("NOTHING");
    lcd.setCursor(0, 1);
    lcd.print("NOTHING         ");
  }
}
/*
 * Date: April 29, 2021
 * Code written by Alick Campbell as a section of the Final Project given for ECSE3038 course on April 26, 2021.
 * Open Licence ibrary code was used for the MPU6050.
*/

#include <SoftwareSerial.h>
#include <util/delay.h>
#include <Wire.h>
#define timeout 10000
#define TEMP_IN A7
#define RX 10
#define TX 11

SoftwareSerial ESP01 (RX,TX); // RX | TX



// esp-01 variables
String ssid = "MonaConnect";
String password = "";
String host = "10.22.12.17";
String mac = "";
String PORT = "5000";
String Command  = "";
String post = "";
String body = "";
int countTrueCommand;
int countTimeCommand; 
int found = 0;

// time stuff
unsigned long start_time = 0;
long loop_timer;

// Gyro variables 
int gyro_x, gyro_y, gyro_z;
long gyro_x_cal, gyro_y_cal, gyro_z_cal;
boolean set_gyro_angles;

long acc_x, acc_y, acc_z, acc_total_vector;
float angle_roll_acc, angle_pitch_acc;

float angle_pitch, angle_roll;
int angle_pitch_buffer, angle_roll_buffer;
float angle_pitch_output, angle_roll_output;

// LM35DT variable
int temp;

// state variables
unsigned char wifiUp = 0; 


void setup() {
  Serial.begin(9600);
   
  LM35DTSetup();
  gyroSetup();
   
//  loop_timer = micros();                                               //Reset the loop timer
  espSetup();
  // get mac address
  for(int i = 0; i < 4; i++)
  mac = getMacAddress();
}

void loop(){
  start_time = millis();
  while ((millis() - start_time) < timeout)
  {
  read_mpu_6050_data();   
 //Subtract the offset values from the raw gyro values
  gyro_x -= gyro_x_cal;                                                
  gyro_y -= gyro_y_cal;                                                
  gyro_z -= gyro_z_cal;                                                
         
  //Gyro angle calculations . Note 0.0000611 = 1 / (250Hz x 65.5)
  angle_pitch += gyro_x * 0.0000611;                                   //Calculate the traveled pitch angle and add this to the angle_pitch variable
  angle_roll += gyro_y * 0.0000611;                                    //Calculate the traveled roll angle and add this to the angle_roll variable
  //0.000001066 = 0.0000611 * (3.142(PI) / 180degr) The Arduino sin function is in radians
  angle_pitch += angle_roll * sin(gyro_z * 0.000001066);               //If the IMU has yawed transfer the roll angle to the pitch angel
  angle_roll -= angle_pitch * sin(gyro_z * 0.000001066);               //If the IMU has yawed transfer the pitch angle to the roll angel
  
  //Accelerometer angle calculations
  acc_total_vector = sqrt((acc_x*acc_x)+(acc_y*acc_y)+(acc_z*acc_z));  //Calculate the total accelerometer vector
  //57.296 = 1 / (3.142 / 180) The Arduino asin function is in radians
  angle_pitch_acc = asin((float)acc_y/acc_total_vector)* 57.296;       //Calculate the pitch angle
  angle_roll_acc = asin((float)acc_x/acc_total_vector)* -57.296;       //Calculate the roll angle
  
  angle_pitch_acc -= 0.0;                                              //Accelerometer calibration value for pitch
  angle_roll_acc -= 0.0;                                               //Accelerometer calibration value for roll

  if(set_gyro_angles){                                                 //If the IMU is already started
    angle_pitch = angle_pitch * 0.9996 + angle_pitch_acc * 0.0004;     //Correct the drift of the gyro pitch angle with the accelerometer pitch angle
    angle_roll = angle_roll * 0.9996 + angle_roll_acc * 0.0004;        //Correct the drift of the gyro roll angle with the accelerometer roll angle
  }
  else{                                                                //At first start
    angle_pitch = angle_pitch_acc;                                     //Set the gyro pitch angle equal to the accelerometer pitch angle 
    angle_roll = angle_roll_acc;                                       //Set the gyro roll angle equal to the accelerometer roll angle 
    set_gyro_angles = true;                                            //Set the IMU started flag
  }
  
  //To dampen the pitch and roll angles a complementary filter is used
  angle_pitch_output = angle_pitch_output * 0.9 + angle_pitch * 0.1;   //Take 90% of the output pitch value and add 10% of the raw pitch value
  angle_roll_output = angle_roll_output * 0.9 + angle_roll * 0.1;      //Take 90% of the output roll value and add 10% of the raw roll value

//  Serial.print(" | Angle  = "); Serial.println(myRound(angle_pitch_output));
//  Serial.print(" | Temperature = "); Serial.println(myRound(getTemp()));
   
// while(micros() - loop_timer < 4000);                                 // wait until the loop_timer reaches 4000us (250Hz) before starting the next loop
// loop_timer = micros();// Reset the loop timer
 _delay_us(4000);
  }
  // sendPost
  // checking delay
  Serial.print("This is the delay you got - ");Serial.print((millis() - start_time)/1000.0); Serial.println(" secs");
  sendPost();
}

void setup_mpu_6050_registers()
{
  //Activate the MPU-6050
  Wire.beginTransmission(0x68);                                        //Start communicating with the MPU-6050
  Wire.write(0x6B);                                                    //Send the requested starting register
  Wire.write(0x00);                                                    //Set the requested starting register
  Wire.endTransmission();                                             
  //Configure the accelerometer (+/-8g)
  Wire.beginTransmission(0x68);                                        //Start communicating with the MPU-6050
  Wire.write(0x1C);                                                    //Send the requested starting register
  Wire.write(0x10);                                                    //Set the requested starting register
  Wire.endTransmission();                                             
  //Configure the gyro (500dps full scale)
  Wire.beginTransmission(0x68);                                        //Start communicating with the MPU-6050
  Wire.write(0x1B);                                                    //Send the requested starting register
  Wire.write(0x08);                                                    //Set the requested starting register
  Wire.endTransmission();                                             
}

void read_mpu_6050_data()
{                                             // subroutine for reading the raw gyro and accelerometer data
  Wire.beginTransmission(0x68);                                        //Start communicating with the MPU-6050
  Wire.write(0x3B);                                                    //Send the requested starting register
  Wire.endTransmission();                                              //End the transmission
  Wire.requestFrom(0x68,14);                                           //Request 14 bytes from the MPU-6050
  while(Wire.available() < 14);                                        //Wait until all the bytes are received
  acc_x = Wire.read()<<8|Wire.read();                                  
  acc_y = Wire.read()<<8|Wire.read();                                  
  acc_z = Wire.read()<<8|Wire.read();                                  
  temp = Wire.read()<<8|Wire.read();                                   
  gyro_x = Wire.read()<<8|Wire.read();                                 
  gyro_y = Wire.read()<<8|Wire.read();                                 
  gyro_z = Wire.read()<<8|Wire.read();                                 
}

int myRound (float temp)
{
  boolean neg;
  if (temp < 0)
  {
     temp = abs(temp);
     neg = true;
  }
  else
  {
    neg = false;
  }
  float dp = temp - (int)temp;
  if (dp >= 0.5) 
  {
    if (neg) return ((int)temp+1)*(-1);
    else return (int)temp+1;
  }
  else 
  {
    if(neg) return ((int) temp)*(-1);
    else return (int) temp;
  }
}

float getTemp()
{
  int ADCin = analogRead(TEMP_IN);
  return ((ADCin/1024.0)*5)/0.01;
}

void espSetup()
{
  ESP01.begin(9600);
  sendCommand("AT",5,"OK"); // check if connection is okay
  sendCommand("AT+CWMODE=1",5,"OK"); // set client mode
  if(sendCommand("AT+CWJAP=\""+ ssid +"\",\""+ password +"\"",20,"OK")) wifiUp = 1;
  else wifiUp = 0;

}

void gyroSetup()
{
    Wire.begin();                                                        //Start I2C as master
  setup_mpu_6050_registers();                                          //Setup the registers of the MPU-6050 
  for (int cal_int = 0; cal_int < 1000 ; cal_int ++){                  //Read the raw acc and gyro data from the MPU-6050 for 1000 times
    read_mpu_6050_data();                                             
    gyro_x_cal += gyro_x;                                              //Add the gyro x offset to the gyro_x_cal variable
    gyro_y_cal += gyro_y;                                              //Add the gyro y offset to the gyro_y_cal variable
    gyro_z_cal += gyro_z;                                              //Add the gyro z offset to the gyro_z_cal variable
    delay(3);                                                          //Delay 3us to have 250Hz for-loop
  }

  // divide by 1000 to get avarage offset
  gyro_x_cal /= 1000;                                                 
  gyro_y_cal /= 1000;                                                 
  gyro_z_cal /= 1000;   
}

void LM35DTSetup()
{
  // setup LM35DT
  pinMode(TEMP_IN, INPUT);
}

void sendPost() 
{
    sendCommand("AT+CIPSTART=\"TCP\",\""+ host +"\"," + PORT,15,"OK");
    body="";
    body+= "{";
    body += "\"patient_id\":"+mac+",";
    body+= "\"position\":"+ String(myRound(angle_pitch_output)) +",";
    body+= "\"temperature\":"+String(myRound(getTemp()));
    body+= "}";
    post="";
    post = "POST /tank HTTP/1.1\r\nHost: ";
    post += host;
    post += "\r\nContent-Type: application/json\r\nContent-Length:";
    post += body.length();
    post += "\r\n\r\n";
    post += body;
    post += "\r\n";
    Command = "AT+CIPSEND=";
    Command+= String(post.length());
    sendCommand(Command, 10, "OK");
    sendCommand(post, 15,"OK");
    sendCommand("AT+CIPCLOSE=0", 10, "OK");
}

int sendCommand(String command, int maxTime, char readReply[]) 
{
  Serial.flush();
  Serial.print(countTrueCommand);
  // program gets stuck here after it is eligible to send data
  Serial.print(". at command => ");
  Serial.print(command);
  Serial.print(" ");
  found = 0;
  while(countTimeCommand < (maxTime*1))
  {
    ESP01.println(command); 
    if(ESP01.find(readReply))//ok
    {
      found = 1;
      break;
    }
  
    countTimeCommand++;
  }
  
  if(found == 1)
  {
    Serial.println("OK");
    countTrueCommand++;
    countTimeCommand = 0;
  }
  
  if(found == 0)
  {
    Serial.println("Fail");
    countTrueCommand = 0;
    countTimeCommand = 0;
  }
  

  return found;
 }

String getMacAddress()
 {
    
    ESP01.println("AT+CIPSTAMAC?");
    int sizee =  ESP01.available();
    char response1[sizee];
    String response = "";
    String mac = "";
    for (int x = 0; x <sizee; x++)
    {
      response1[x] = ESP01.read();
      response+= response1[x];
    }
    
    int x = response.indexOf('"');
    int from = x+1;
    
    for(int i = x; i < (response.indexOf('"', from))+1; i++)
    {
    mac += response1[i];
    }
    delay(400);
    return mac;
 }

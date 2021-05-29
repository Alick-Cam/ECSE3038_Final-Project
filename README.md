# ECSE3038_Final-Project
This is the Final Project for the course ECSE3038 that was issued April 26, 2021.

## Specification 
An embedded system should be built to collect the following data:
1. Temperature 
2. Orientation

This data was then posted to a RESTFUL api written in the Flask framework. Also, Data is stored in a Database and also 
displayed on a front end written in HTML, CSS and JavaScript.

Note
When testing change the constant ip to your machine's ip address in both graph.js and grid.js

## Methodology *Key info* 
### Embedded System 
Send data every 10 seconds

### Graph 
Receive all records that got posted in the database for *this* mac address in the last 30 mins

After this reception, graph data.

Further data will be received through socket (functionality controlled by state variable *gotPrev*). 

Graph was designed to build up to 180 points (since data sent every 10s) and maintain 180 points by:
1. push()
2. reverse()
3. pop()
4. reverse() 
on both *xValues* and *yValues* arrays then graphing.

### Grid 
1. Recieve data through *message* socket as they are posted by any number of embedded systems.
2. Find the card in the *grid* with matching *patient_id*
3. Update the temperature and the position.




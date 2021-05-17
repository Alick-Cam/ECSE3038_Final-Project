from flask import Flask, request, json, jsonify
from flask_pymongo import PyMongo
from marshmallow import Schema, fields, ValidationError
from bson.json_util import dumps
from json import loads

app = Flask(__name__)
app.config["MONGO_URI"]='mongodb+srv://backendDev:backendDev@cluster0.dp4qj.mongodb.net/ECSE3038_Final-Project?ssl=true&ssl_cert_reqs=CERT_NONE'
# app.config["MONGO_URI"] = 'mongodb+srv://backendDev:backendDev@cluster0.dp4qj.mongodb.net/Iot_Patients?ssl=true&ssl_cert_reqs=CERT_NONE'

mongo = PyMongo(app)

class RecordValidation(Schema):
    patient_id = fields.String(required = True)
    position = fields.Integer(required = True, strict = True)
    temperature = fields.Integer(required = True, strict = True)

class PatientValidation(Schema):
    fname = fields.String(required = True)
    lname = fields.String(required = True)
    patient_id = fields.String(requred = True)

@app.route("/api/record", methods = ["POST"])
def new_record():
    req = request.json 
    print(req)
    # Just incase the request has additional unwanted records
    database = {
        "patient_id" : req["patient_id"],
        "position" : req["position"],
        "temperature":req["temperature"]
    }
    try:
        recordTemp = RecordValidation().load(database) # only fails when it gets bad data (violates schema)
        mongo.db.record.insert_one(recordTemp) # fails when db isnt connected and such
        return {"success":True, "msg":"Data saved in database successfully"}
    except ValidationError as ve:
        return ve.messages, 400 # Bad Request hence data was not saved to the database
    except Exception as e:
        return e.messages, 500 # data was not saved to the database because of some internal server error

# Frontend requests 
@app.route("/api/patient")
def get_patients():
    allobjects = mongo.db.patient.find()
    jsonobject = jsonify(loads(dumps(allobjects))) # convert python list to json(Response instance in python) ("<class 'flask.wrappers.Response'>")
    # print(type(jsonobject))
    return jsonobject

@app.route('/api/patient', methods = ['POST'])
def add_patient():
    req = request.json
    # Just incase the request has additional unwanted records 
    database = {
        "fname" : req["fname"],
        "lname" : req["lname"],
        "patient_id":req["patient_id"]
    }  
    try:
        patientTemp = PatientValidation().load(database) # only fails when it gets bad data (violates schema)
        mongo.db.patient.insert_one(patientTemp) # fails when db isnt connected and such
        return {"success":True, "msg":"Data saved in database successfully"}
    except ValidationError as ve:
        return ve.messages, 400 # Bad Request hence data was not saved to the database
    except Exception as e:
        return e.messages, 500 # data was not saved to the database because of some internal server error

@app.route('/api/patient/<id>', methods = ["GET", "PATCH", "DELETE"])
def get_a_patient(id):
    anobject = mongo.db.patient.find_one({"patient_id":id})
    jsonobject = loads(dumps(anobject))
    if request.method == "GET":
        return jsonobject
    elif request.method == "PATCH":
        req = request.json
        if "fname" in req:
            jsonobject["fname"] = req["fname"]
            mongo.db.patient.update_one({"patient_id":id}, {"$set":{"fname":jsonobject["fname"]}})
        if "lname" in req:
            jsonobject["lname"] = req["lname"]
            mongo.db.patient.update_one({"patient_id":id}, {"$set":{"lname": jsonobject["lname"]}})
        if "patient_id" in req:
            jsonobject["patient_id"] = req["patient_id"]
            mongo.db.patient.update_one({"patient_id":id}, {"$set":{"patient_id":jsonobject["patient_id"]}})
        anobject = mongo.db.patient.find_one({"patient_id":jsonobject["patient_id"]})
        jsonobject = loads(dumps(anobject))
        return jsonobject
    elif request.method == "DELETE":
        mongo.db.patient.delete_one({"patient_id":id})
        

    
        



if __name__ == "__main__":
    app.run(debug = True, host="0.0.0.0") 
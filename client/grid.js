console.log("I'm linked bro")

const ip = "10.22.8.50"
const port = "3000"
var editcount = 0;
var createPCCount = 0;
var record = {"temperature":32, "position": 0} // dummy data

function createPatientCard(patient, record, id) {

    let useThisId;
    if (id == 0)
    {
        createPCCount++
        useThisId = createPCCount;
    }
    else {
        useThisId = id
    }

    var patientCard = document.createElement("DIV")
    patientCard.classList.add("patient-cards")
    patientCard.setAttribute("id", "card"+useThisId.toString())
    patientCard.addEventListener("click", nextPage)
    
    var patientID = document.createElement("DIV")
    patientID.classList.add("patient-id")
    patientID.innerText = patient["patient_id"]

    var patientName = document.createElement("DIV")
    patientName.classList.add("patient-name")
    patientName.innerText = patient["fname"]+" "+patient["lname"]

    var patientDataWrap = document.createElement("DIV")
    patientDataWrap.classList.add("patient-data-wrap")

    var patientTemp = document.createElement("DIV")
    patientTemp.classList.add("patient-data")
    

    var patientTempHead = document.createElement("DIV")
    patientTempHead.innerHTML = "Temp:"

    var patientTempData = document.createElement("DIV")
    patientTempData.innerHTML = record["temperature"].toString()+"°C"

    var patientPos = document.createElement("DIV")
    patientPos.classList.add("patient-data")

    var patientPosHead = document.createElement("DIV")
    patientPosHead.innerHTML = "Position:"

    var patientPosData = document.createElement("DIV")
    patientPosData.innerText = record["position"].toString()+"°"

    var patientAge = document.createElement("DIV")
    patientAge.classList.add("patient-data")

    var patientAgeHead = document.createElement("DIV")
    patientAgeHead.innerHTML = "Age:"

    var patientAgeData = document.createElement("DIV")
    patientAgeData.innerHTML = patient["age"].toString()

    var patientEdits = document.createElement("DIV")
    patientEdits.classList.add("patient-edits")

    var editButton = document.createElement("BUTTON")
    editButton.innerHTML = "Edit"


    var deleteButton = document.createElement("BUTTON")
    deleteButton.innerHTML = "Delete"

    patientCard.appendChild(patientID)
    patientCard.appendChild(patientName)
    patientCard.appendChild(patientDataWrap)
    patientCard.appendChild(patientEdits)

    patientDataWrap.appendChild(patientTemp)
    patientDataWrap.appendChild(patientPos)
    patientDataWrap.appendChild(patientAge)

    patientTemp.appendChild(patientTempHead)
    patientTemp.appendChild(patientTempData)

    patientPos.appendChild(patientPosHead)
    patientPos.appendChild(patientPosData)

    patientAge.appendChild(patientAgeHead)
    patientAge.appendChild(patientAgeData)

    patientEdits.appendChild(editButton)
    patientEdits.appendChild(deleteButton)

    return patientCard  
}   

function editOrDelReq(e) {
    let thisButton = e.target
    let oldIdNode = thisButton.parentNode.parentNode.childNodes[0] 
    let oldNameNode = thisButton.parentNode.parentNode.childNodes[1]
    let oldAgeNode = thisButton.parentNode.previousSibling.childNodes[2].childNodes[1]


    if (thisButton.innerHTML == "Edit"){
        editcount++
        // change age node to input type
        let ageIn = document.createElement("INPUT")
        ageIn.type = "text"
        ageIn.classList.add("inputs")  
        ageIn.setAttribute("id","agein"+editcount.toString())
        ageIn.placeholder = "25"
        // ageIn is the newnode
        thisButton.parentNode.previousSibling.childNodes[2].replaceChild(ageIn,oldAgeNode)
        // change name node to input type
        let nameIn = document.createElement("INPUT")
        nameIn.type = "text"
        nameIn.classList.add("inputs")
        nameIn.setAttribute("id", "namein"+editcount.toString())
        nameIn.placeholder =  thisButton.parentNode.previousSibling.previousSibling.innerText
        // nameIn is the newNode
        thisButton.parentNode.parentNode.replaceChild(nameIn, oldNameNode)
        // change id node to input type
        let IDIn = document.createElement("INPUT")
        IDIn.type = "text"
        IDIn.classList.add("inputs")
        IDIn.setAttribute("id", "idin"+editcount.toString())
        IDIn.placeholder = thisButton.parentNode.previousSibling.previousSibling.previousSibling.innerText
        // IDIn id the newnode
        thisButton.parentNode.parentNode.replaceChild(IDIn, oldIdNode)
        // replace the two buttons in the patient-edits div with updatebutton and add a event listener to it
        // create update button
        let updateButton = document.createElement("BUTTON")
        updateButton.innerText = "Update"
        updateButton.classList.add("update-button") // format all update buttons
        updateButton.setAttribute("id", "update"+editcount.toString())
        updateButton.addEventListener("click", patchReq)
        thisButton.parentNode.appendChild(updateButton)
        thisButton.parentNode.parentNode.childNodes[3].removeChild(thisButton.parentNode.parentNode.childNodes[3].childNodes[1])
        thisButton.parentNode.parentNode.childNodes[3].removeChild(thisButton.parentNode.parentNode.childNodes[3].childNodes[0])

    } else if (thisButton.innerHTML == "Delete") {
        // get mac address in the card to build url
        let mac = thisButton.parentNode.parentNode.childNodes[0].innerHTML
        let url = "http://"+ip+":"+port+"/api/patient/"+mac
 

        // send delete request
        fetch(url, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: null,
          })
          .then(res => {
              return res.json()
          })
          .then (json => {
                console.log(json)
                // remove all cards from grid
                let grid = document.getElementsByClassName("grid")[0]
                grid.innerHTML=""
                editcount = 0;
                createPCCount = 0;
                getReq()
          })
          .catch (err => console.error(err))

        
        
    }
}

function patchReq(e) {
    let thisUpdateButton = e.target
    // get id placeholder to build URL
    let mac = thisUpdateButton.parentNode.parentNode.childNodes[0].placeholder
    // get new placeholder to build json body
    let macUpdate = thisUpdateButton.parentNode.parentNode.childNodes[0].value
    // get fullname
    let name = thisUpdateButton.parentNode.parentNode.childNodes[1].value
    // get age 
    let age = thisUpdateButton.parentNode.parentNode.childNodes[2].childNodes[2].childNodes[1].value
    let jsonBody = new Object();

    // do the validations and build the patch
    if (name != "") {
        let namearray = name.split(" ")
        jsonBody.fname = namearray[0]
        if (namearray.length == 2) {
        jsonBody.lname = namearray[1]
        }
    }

    if (age != "") {
       jsonBody.age = parseInt(age, 10)
    }

    if (macUpdate !="") {
        jsonBody.patient_id = macUpdate
    }
    console.log(jsonBody)
    // LEFT HERE tonight
    // build url
    let url = "http://"+ip+":"+port+"/api/patient/"+mac 

    let stringobj = JSON.stringify(jsonBody)
    fetch (url, {
        method:"PATCH",
        body:stringobj,
        headers:{
            "Content-Type":"application/json",
        },
    })

    .then((res) => res.json())
    .then((json) => {
        console.log(json);
        // identify card
        // delete card
        // get patient with id 
        // insert new card with new details
        
        // check the number at the end of the card id to get the position of the card on the screen
        let cardId = thisUpdateButton.parentNode.parentNode.id
        let splitStringArray = cardId.split("")
        // all card ids are in the form "cardXX"
        let position = ""
        for (let i = 4; i < splitStringArray.length; i++) {
            position += splitStringArray[i]
        }
        let positionInt = parseInt(position, 10)

        // going to use replaceChilld()
        
        let parent = document.getElementsByClassName("grid")[0]
        let oldChildNode = parent.childNodes[positionInt]
        parent.replaceChild(createPatientCard(json,record, positionInt),oldChildNode)
        // add listener to its buttons
        let buttonsCollection = document.getElementById("card"+positionInt.toString()).getElementsByTagName("BUTTON")
        for (let i = 0 ; i < buttonsCollection.length; i++) {
            buttonsCollection[i].addEventListener("click", editOrDelReq)
        }

    })
    .catch(err => {console.error(err)})
  
}

function getReq () {
    // GET request

    let url = "http://"+ip+":"+port+"/api/patient"
    fetch (url)
    .then((res) => res.json())
    .then((json) => {
        console.log(json)
        for (let i = 0; i < json.length ; i++) {
            document.getElementsByClassName("grid")[0].append(createPatientCard(json[i], record, 0))
        }
        for (let i = 0 ; i < document.getElementsByTagName("BUTTON").length; i++ ) {
            document.getElementsByTagName("BUTTON")[i].addEventListener("click", editOrDelReq)
        }
    })
    .catch (err => console.error(err))
}

function nextPage(e) { 

    if (e.target.tagName != "BUTTON" && e.target.tagName != "INPUT") {
        let cardid = e.currentTarget.id
        console.log(document.getElementById(cardid).childNodes[0].innerHTML)
        let mac = document.getElementById(cardid).childNodes[0].innerHTML
        sessionStorage.setItem("patient_id", mac)
        let url = "http://127.0.0.1:5501/client/graph.html"
        location.href=url;
    }


}
// get request when the page loads
getReq()

var socket = io('http://'+ip+":" + port);
socket.on('connect', function() {
    socket.emit('frontendconnect', {data: 'Grid connected!'});
});

socket.on('message', function(message) {
    console.log("Socket Print")
    console.log(message)
    let noOfCards = document.getElementsByClassName("grid")[0].getElementsByClassName("patient-id").length
    for (let i = 0; i < noOfCards; i ++) {
        if (document.getElementsByClassName("grid")[0].getElementsByClassName("patient-id")[i].innerHTML == message["patient_id"]) {
            let cardOfInterest = document.getElementsByClassName("grid")[0].getElementsByClassName("patient-id")[i].parentElement
            let temp = cardOfInterest.getElementsByClassName("patient-data")[0].childNodes[1]
            temp.innerHTML = message["temperature"].toString()+"°C"
            let pos = cardOfInterest.getElementsByClassName("patient-data")[1].childNodes[1]
            pos.innerHTML = message["position"].toString()+"°"
    
        }
    }
    })  
  
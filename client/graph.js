var macAd
const ip = "10.22.8.42"
const port = "3000"
var xValues = []; /*50,60,70,80,90,100,110,120,130,140,150*/
var yValues = []; /*7,8,8,9,9,9,10,11,14,14,15*/
window.onload = function () {
    let mac= sessionStorage.getItem("patient_id")
    console.log(mac)
    return mac
}
macAd = onload()
document.getElementById("back-to-cards").addEventListener("click" , goBack)

function goBack(e)  {
    let url = "http://127.0.0.1:5500/client/grid.html"
    location.href=url;
}
getReq()
// make connection 
var socket = io('http://'+ip+":" + port);
socket.on('connect', function() {
    socket.emit('frontendconnect', {data: 'Graph connected!'});
});

socket.on('message', function(message) {

  if (message["patient_id"] == macAd) {
      console.log(message)
      document.getElementById("temp-data").innerHTML = message["temperature"].toString()+"°C"
      document.getElementById("pos-data").innerHTML = message["position"].toString()+"°"
      if(xValues.length == 180) {
        xValues =[]
        yValues = []
      }
      let time = message["last_updated"].split("-")
      xValues.push(time[1])
      yValues.push(message["temperature"])
      plotData();
  }
});

function getReq () {
    // GET request

    let url = "http://"+ip+":"+port+"/api/patient/"+macAd
    console.log(url) 
    fetch (url)
    .then((res) => res.json())
    .then((json) => {
        console.log(json)
        document.getElementById("fname").innerHTML = json["fname"]
        document.getElementById("lname").innerHTML = json["lname"]
        document.getElementById("mac-address").innerHTML = json["patient_id"]
        

    })
    .catch((error) => {
        console.error(error)
    })
}

// var myChart = new Chart("myChart", {
//     type: "line",
//     data: {},
//     options: {}
//   });


function plotData() {
new Chart("myChart", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [{
      label:"Temperature vs Time",
      fill: true,
      lineTension: 0,
      backgroundColor: "rgba(0,0,255,1.0)",
      borderColor: "rgba(0,0,255,0.1)",
      data: yValues
    }]
  },
  options: {
    legend: {display: true},
    scales: {
      yAxes: [{ticks: {min: 5, max:70}}],
    }
  }
});
}

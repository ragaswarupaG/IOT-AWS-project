var awsIot = require("aws-iot-device-sdk");

var device = awsIot.device({
  keyPath: "./certs/private.pem.key",
  certPath: "./certs/device-certificate.pem.crt",
  caPath: "./certs/AmazonRootCA1.pem",
  clientId: "first-try",
  host: "a34uki0yf1mcgz-ats.iot.us-east-1.amazonaws.com",
});

var current = new Date();
const url = `http://api.openweathermap.org/data/2.5/forecast?lat=1.3521&lon=103.819&appid=PUTYOUROWNAPPID&units=metric`;

let humidityToday = null
let outsideTemp = null

async function fetchWeather() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();
    const todayStart = Math.floor(Date.now() / 86400000) * 86400;
    const todayEnd = todayStart + 86400;

    const forecastToday = data.list.find(
      (forecast) => forecast.dt >= todayStart && forecast.dt < todayEnd
    );

     humidityToday = forecastToday ? forecastToday.main.humidity : null;
     outsideTemp = forecastToday ? forecastToday.main.temp : null

    if (humidityToday !== null) {
      console.log(
        `Humidity for ${new Date().toUTCString()}: ${humidityToday}%`
      );
    } else {
      console.log("No humidity data for today.");
    }


    if (outsideTemp !== null) {
      console.log(
        `Temperature for ${new Date().toUTCString()}: ${outsideTemp}`
      );
    } else {
      console.log("No temperature data for today.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchWeather();

function houseData(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getHouseData() {
  return {
    time: current,
    device_id: 1,
    outside_temperature: outsideTemp,
    aircon_temperature: houseData(15, 32),
    humidity: humidityToday,
    co2_levels: houseData(300, 1500) ,
    co_levels: houseData(0, 35) ,
  };
}

device.on("connect", function () {
  console.log("connect");
  device.subscribe("topic_1");

  var data = getHouseData();
  device.publish(
    "topic_1",
    JSON.stringify(data)
  );
});

device.on("message", function (topic, payload) {
  console.log("message", topic, payload.toString());
});

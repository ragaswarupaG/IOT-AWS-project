var AWS = require("aws-sdk");
var iotdata = new AWS.IotData({
  // endpoint: "a34uki0yf1mcgz-ats.iot.us-east-1.amazonaws.com",
  endpoint: "enter own IOT core endpoint!",

});

exports.handler = function (event, context, callback) {
  console.log("Device_Id: " + event.device_id.toString());

  let messages = [];

  if (event.aircon_temperature > event.outside_temperature) {
    var adjustment = (event.aircon_temperature - event.outside_temperature) / 2;
    event.aircon_temperature -= adjustment;

    messages.push(
      `ComfyHome: Decreasing the air conditioner temperature by ${adjustment.toFixed(
        2
      )}. New temperature: ${event.aircon_temperature.toFixed(2)}`
    );
  }

  if (event.humidity > 60) {
    messages.push(
      `ComfyHome: Turning on the dehumidifiers. Current humidity: ${event.humidity}%`
    );
  }

  if (event.humidity < 60) {
    messages.push(
      `ComfyHome: Turning on the humidifiers. Current humidity: ${event.humidity}%`
    );
  }

  if (event.co2_levels > 1000 && event.co2_levels <= 2000) {
    messages.push(
      `ComfyHome: Elevated CO₂ levels detected (${event.co2_levels} ppm). Please open your windows for ventilation.`
    );
  }

  if (event.co2_levels > 2000 && event.co2_levels <= 5000) {
    messages.push(
      `ComfyHome: High CO₂ levels detected (${event.co2_levels} ppm). ComfyHome is going to open the windows and turn on the exhaust fan immediately to prevent discomfort or drowsiness.`
    );
  }

  if (event.co2_levels > 5000) {
    messages.push(
      `ComfyHome: Dangerous CO₂ levels detected (${event.co2_levels} ppm). ComfyHome has opened the windows and turned on the exhaust fan.`
    );
  }
  if (event.co_levels > 9 && event.co_levels <= 15) {
    messages.push(
      `ComfyHome: Elevated CO levels detected (${event.co_levels} ppm). Please open your windows immediately for ventilation.`
    );
  }

  if (event.co_levels > 15 && event.co_levels <= 30) {
    messages.push(
      `ComfyHome: CO levels are rising dangerously (${event.co_levels} ppm). ComfyHome will turn off the airconditioning and will open the windows.`
    );
  }

  if (event.co_levels > 30) {
    messages.push(
      `Critical Warning: Hazardous CO levels detected (${event.co_levels} ppm). Evacuate the area, ComfyHome has opened the windows and turned on the exhaust fan.`
    );
  }

  var postData = JSON.stringify({
    command: messages,
  });
  var params = {
    topic: "topic_1",
    payload: postData,
    qos: 0,
  };
  iotdata.publish(params, function (err, data) {
    if (err) {
      console.log("Error: ", err);
    } else {
      console.log("Success...");
    }
    callback();
  });
};

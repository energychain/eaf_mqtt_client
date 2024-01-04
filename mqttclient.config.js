const mqtt = require('mqtt');
const CONNECT_URL = "mqtt://test.mosquitto.org:1883/";
const METERS = {
    MQTT1:{
        meterId: "mqtt1-test",
        topic:"revspace/sensors/power/L1/total",
        parser:function(message) { return message.substring(0,message.indexOf('.')) * 1; }
    },
    MQTT2:{
        meterId: "mqtt2-test",
        topic:"revspace/sensors/power/L2/total",
        parser:function(message) { return message.substring(0,message.indexOf('.')) * 1; }
    },
    MQTT3:{
        meterId: "mqtt3-test",
        topic:"revspace/sensors/power/L3/total",
        parser:function(message) { return message.substring(0,message.indexOf('.')) * 1; }
    }
}

module.exports = {
    connect: (connectUrl,connectOptions) => {
        if((typeof connectUrl == 'undefined')||(connectUrl == null)) {
                connectUrl=CONNECT_URL;
        }
        return new Promise((resolve, reject) => {
            const mqttClient = mqtt.connect(connectUrl,connectOptions);
            mqttClient.on('connect', () => {
                const topics = [];
                const mapTopicToMeter = {};

                for (const [key, value] of Object.entries(METERS)) {
                    topics.push(value.topic);
                    mapTopicToMeter[value.topic] = key;
                    value.forward = function(meter, value) {
                        console.log("Unhandled forward ", meter, value);
                    }
                }

                mqttClient.subscribe(topics, (err) => {});
                mqttClient.on('message', (topic, payload) => {
                    METERS[mapTopicToMeter[topic]].forward(mapTopicToMeter[topic], METERS[mapTopicToMeter[topic]].parser(payload.toString()));
                })
                mqttClient.meters = METERS;

                resolve(mqttClient);
            })
        })
    }
}
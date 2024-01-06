const mqtt = require('mqtt');

class MqttClient {
  constructor(options) {
    this.options = options;
    this.client = null;
    this.topics = [];
    this.callbacks = {};

    this.connect();
  }

  connect() {
    if(typeof this.reconnectTimeout == 'undefined') {
      this.reconnectTimeout = new Date().getTime();
    }
    if(this.reconnectTimeout > new Date().getTime() - 5000) {
      this.client = {
        connected:false
      };
      return;
    }

    this.client = mqtt.connect(this.options);
    this.reconnectTimeout = new Date().getTime();
    this.client.on('connect', () => {
      console.log('Connected to MQTT server');
      this.topics.forEach((topic) => {
        console.log("Subscribe to",topic);
        this.subscribe(topic);
      });
    });

    this.client.on('error', (error) => {
      console.log('Error connecting to MQTT server:', error);
      setTimeout(() => {
        this.connect();
      }, 5000);
    });

    this.client.on('close', () => {
      console.log('MQTT connection closed');
      setTimeout(() => {
        // this.connect();
      }, 60000);
    });
  }

  subscribe(topic, callback) {
    
    if (!this.client.connected) {
        this.topics.push(topic);
        if (callback) {
          this.callbacks[topic] = callback;
        }
        return;
      }
  
      this.client.subscribe(topic, { qos: 1 }, (error) => {
        function isValidTopic(topic, subscription) {
            const topicParts = topic.split('/');
            const subscriptionParts = subscription.split('/');
          
            if (topicParts.length !== subscriptionParts.length) {
              return false;
            }
          
            for (let i = 0; i < topicParts.length; i++) {
              if (subscriptionParts[i] === '+' || subscriptionParts[i] === '#') {
                continue;
              }
          
              if (topicParts[i] !== subscriptionParts[i]) {
                return false;
              }
            }
          
            return true;
          }

        if (error) {
          console.log('Error subscribing to topic:', error);
          return;
        }
  
        if (callback) {
          this.callbacks[topic] = callback;
        }
        const parent = this;

        // Add event listener for incoming messages on this topic
        this.client.on('message', (receivedTopic, payload) => {
          if ((isValidTopic(receivedTopic, topic)) && (typeof parent.callbacks[topic] == 'function')) {
            parent.callbacks[topic](receivedTopic, payload);
          }
        });
      });
  }

  publish(topic, message) {
    if (!this.client.connected) {
      console.log('MQTT connection not established, message not sent');
      return;
    }

    this.client.publish(topic, ""+message, { qos: 1 }, (error) => {
      if (error) {
        console.log('Error publishing message:', error);
      }
    });
  }
}

module.exports = MqttClient;
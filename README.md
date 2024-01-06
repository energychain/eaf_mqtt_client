[![STROMDAO logo](https://static.corrently.cloud/stromdao_988.png)](https://stromdao.de/)

# eaf_mqtt_client
The primary purpose of the eaf_mqtt_client is to facilitate the secure exchange of energy data between utilities and their customers. By utilizing a self-hosted MQTT broker and connecting the [STROMDAO Energy Application Framework]((https://github.com/energychain/STROMDAO_EAFs)), utilities can provide a platform for customers to run energy-based applications and services. This enables customers to leverage their energy data to make informed decisions and optimize their energy consumption.


## Introduction


## Usage
Specify MQTT_URL in `.env`.
Start the project with `npm start` command. 
After starting, open the http://localhost:3101/ URL in your browser. 
On the welcome page you could see the status of received readings via MQTT and forwarded (processed) readings to EAF.

## Demo MQTT Broker
Contact dev@stromdao.com to receive credentials.

## Subscribed topics
The script subscribes to the topic `stromdao-eaf/metering/updateReading/#`.

When a new message is published to a subtopic like `stromdao-eaf/metering/updateReading/MyMeter``, the published value is forwarded to the [metering.updateReading](https://eaf-metering.corrently.cloud/html/docs/index.html#!/MeteringApi#apiReadingPost) service of STROMDAO EAF, where MyMeter is used as the meterId.

## Published topics
In addition to forwarding meter readings, the script also publishes electricity prices from the STROMDAO EAF every 5 minutes to the topics below `stromdao-eaf/tariff/`

## NPM scripts

- `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
- `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
- `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
- `npm run ci`: Run continuous test mode with watching
- `npm test`: Run tests & generate coverage report
- `npm run dc:up`: Start the stack with Docker Compose
- `npm run dc:down`: Stop the stack with Docker Compose

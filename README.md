[![STROMDAO logo](https://static.corrently.cloud/stromdao_988.png)](https://stromdao.de/)

# eaf_mqtt_client
MQTT client to get meter readings for dynamic tariffs in [STROMDAO EAF](https://github.com/energychain/STROMDAO_EAFs)

## Usage
Start the project with `npm run dev` command. 
After starting, open the http://localhost:3101/ URL in your browser. 
On the welcome page you can test the generated services via API Gateway and check the nodes & services.

## Services
- **api**: API Gateway services
- **mqttclient**: Sample service with `hello` and `welcome` actions.


## Useful links

* Moleculer website: https://moleculer.services/
* Moleculer Documentation: https://moleculer.services/docs/0.14/

## NPM scripts

- `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
- `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
- `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
- `npm run ci`: Run continuous test mode with watching
- `npm test`: Run tests & generate coverage report
- `npm run dc:up`: Start the stack with Docker Compose
- `npm run dc:down`: Stop the stack with Docker Compose

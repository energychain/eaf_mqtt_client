"use strict";
const MQTTDispatcher = require("../mqttclient");
const Cron = require("@r2d2bzh/moleculer-cron");

let masterconnection = null;

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */

module.exports = {
	name: "mqttclient",

	mixins: [Cron],

	/**
	 * Settings
	 */
	settings: {

	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/** 
	 * Cron Jobs
	 */
	crons: [
        {
            name: "Publish Price Info",
            cronTime: '00 */5 * * *',
            onTick: async function() {
				let forecast = await this.call("tariff.prices");
				for(let i=0;i<forecast.length;i++) {
					masterconnection.publish("stromdao-eaf/tariff/"+forecast[i].time+"/epoch", forecast[i].epoch);
					masterconnection.publish("stromdao-eaf/tariff/"+forecast[i].time+"/price", forecast[i].price);
					masterconnection.publish("stromdao-eaf/tariff/"+forecast[i].time+"/jwt", forecast[i].jwt);
				}
				masterconnection.publish("stromdao-eaf/tariff/now/time", forecast[0].time);
				masterconnection.publish("stromdao-eaf/tariff/now/epoch", forecast[0].epoch);
				masterconnection.publish("stromdao-eaf/tariff/now/price", forecast[0].price);
				masterconnection.publish("stromdao-eaf/tariff/now/jwt", forecast[0].jwt);
            },
            runOnInit: function() {
                console.log("Publish Price Info");
            },
            manualStart: false,
            timeZone: 'UTC'
        }
	],
	/**
	 * Actions
	 */
	actions: {

		/**
		 * Say a 'Hello' action.
		 *
		 * @returns
		 */
		hello: {
			rest: {
				method: "GET",
				path: "/hello"
			},
			async handler() {
				return "Hello Moleculer";
			}
		}
	},

	/**
	 * Events
	 */
	events: {
		"mqtt.updateReading"(ctx) {
			// Handle a bit of Rate Limiting
			if(typeof this.rateLimit == 'undefined') this.rateLimit = {};

			if(typeof this.rateLimit[ctx.params.meterId] !== 'undefined') {
				if((new Date().getTime() - this.rateLimit[ctx.params.meterId]) < 300000) {
					return;
				}			
			}
			ctx.call("metering.updateReading", {meterId:ctx.params.meterId,reading:ctx.params.value * 1,time:new Date().getTime()});
			this.rateLimit[ctx.params.meterId] = new Date().getTime();
        }
	},

	/**
	 * Methods
	 */
	methods: {
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started(ctx) {
		
		if(typeof process.env.MQTT_URL == 'undefined') {
			throw new Error("MQTT_URL not defined in .env file");
		}

		masterconnection =  new MQTTDispatcher(process.env.MQTT_URL);
		
		const instance = this;

		masterconnection.subscribe('stromdao-eaf/metering/updateReading/#',async function (receivedTopic, message) {
				const parts = receivedTopic.split('/');
				if (parts.length !== 4 || parts[0] !== 'stromdao-eaf' || parts[1] !== 'metering') {
				  console.error(`Invalid topic format: ${receivedTopic}`);
				} else {
					instance.broker.emit("mqtt."+parts[2], {meterId:parts[3],value: 1 * message.toString() }, ["mqttclient"]);
				}
		});
	},
	async stopped() {

	}
};

"use strict";
const MQTTDispatcher = require("../mqttclient");
const Cron = require("@r2d2bzh/moleculer-cron");
const RATE_LIMIT = 5000;

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
				console.log("Publish Price Info");
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
               
            },
            manualStart: false,
            timeZone: 'UTC'
        }
	],
	/**
	 * Actions
	 */
	actions: {
		emqxApiPost: {
			rest: {
				method: "POST",
				path: "/emqxApiPost"
			},
			async handler(ctx) {
				// This action exists to reduce X-Domain policy issues during setup
				const axios = require("axios");
				const res = await axios.post(ctx.params.restapi,ctx.params.payload, {auth: {
					username: ctx.params.apikey,
					password: ctx.params.apisecret
				  }}
				);
				return res.data;
			}
		},
		info: {
			rest: {
				method: "GET",
				path: "/info"
			},
			async handler() {
				return {
					MQTT_URL: process.env.MQTT_URL
				}
			}
		},
		readings: {
			rest: {
				method: "GET",
				path: "/readings"
			},
			async handler() {
				return this.readingsLog;
			}
		},
		processed: {
			rest: {
				method: "GET",
				path: "/processed"
			},
			async handler() {
				return this.processedLog;
			}
		}
	},

	/**
	 * Events
	 */
	events: {
		"mqtt.updateReading": async (ctx) => {
			// Handle a bit of Rate Limiting
			if(typeof this.rateLimit == 'undefined') this.rateLimit = {};

			if(typeof this.rateLimit[ctx.params.meterId] !== 'undefined') {
				if((new Date().getTime() - this.rateLimit[ctx.params.meterId]) < RATE_LIMIT) {
					ctx.service.logReading({meterId:ctx.params.meterId,reading:ctx.params.value * 1,processed:"rate limit"});
					return;
				}			
			}
			const result = await ctx.call("metering.updateReading", {meterId:ctx.params.meterId,reading:ctx.params.value * 1,time:new Date().getTime()});
			
			ctx.service.logReading(result);
			if(result.processed) {
				ctx.service.logProcessed(result);
			}
			ctx.service.logReading({meterId:ctx.params.meterId,reading:ctx.params.value * 1,processed:result.processed,debug:result.debug});
			this.rateLimit[ctx.params.meterId] = new Date().getTime();
        }
	},

	/**
	 * Methods
	 */
	methods: {
		logReading: {
			async handler(msg) {
				if(typeof this.readingsLog =='undefined') this.readingsLog = [];

				this.readingsLog = this.readingsLog.filter(element => element.msg.meterId !== msg.meterId);

				if (this.readingsLog >= 10) {
					this.readingsLog.shift();
				}

				this.readingsLog.push({
					time: new Date().getTime(),
					msg: msg
				});
			}
		},
		logProcessed: {
			async handler(msg) {
				if(typeof this.processedLog =='undefined') this.processedLog = [];
				
				this.processedLog = this.processedLog.filter(element => ((element.msg.meterId !== msg.meterId) && (element.msg.reading !== msg.reading)));

				if (this.processedLog >= 10) {
					this.processedLog.shift();
				}

				this.processedLog.push({
					time: new Date().getTime(),
					msg: msg
				});
			}
		}
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

"use strict";
const MQTTClient = require("../mqttclient.config");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
let connection = null;

module.exports = {
	name: "mqttclient",

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
		"mqtt.message"(ctx) {
			// Handle a bit of Rate Limiting
			if(typeof this.rateLimit == 'undefined') this.rateLimit = {};

			if(typeof this.rateLimit[ctx.params.meterId] !== 'undefined') {
				if((new Date().getTime() - this.rateLimit[ctx.params.meterId]) < 300000) {
					return;
				}			
			}
			ctx.call("metering.updateReading", {meterId:ctx.params.meterId,reading:ctx.params.reading,time:new Date().getTime()});
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
		connection = await MQTTClient.connect();
		const instance = this;
	
		for (const [key, value] of Object.entries(connection.meters)) {
			value.forward = function(meter, value) {
				instance.broker.emit("mqtt.message", {meterId:meter,reading:value}, ["mqttclient"]);
			}
		}
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};

const fs = require("fs");
require('dotenv').config();

const runtimeDefaults = {
    MOLECULAR_LAB_KEY:process.env.MOLECULAR_LAB_KEY,
    TRANSPORTER: ""
}

module.exports = function(overwrites) {

    if((typeof overwrites !== 'undefined') && (overwrites !== null)) {
        for (const [key, value] of Object.entries(overwrites)) {
            process.env[key] = value;
        }
    }
   
    return process.env;
}

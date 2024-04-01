// mongoose code
const mongoose = require("mongoose");
const config = require("./appSettings.json");
const connectDB = async () => {
	try {
		mongoose
			.connect(config.mongoURI)
			.then(() => {
                console.log("Database Connection Established!")
            });
	} catch (err) {
		console.error(err);
	}
};
module.exports = connectDB;

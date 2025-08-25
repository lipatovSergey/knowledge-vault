const mail = require("../src/services/mail/index.js");

module.exports = {
	clear: () => mail.clear(),
	lastTo: (email) => mail.lastTo(email),
	getSent: () => mail.getSent()
};
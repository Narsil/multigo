var server = require("./server.js");
var router = require("./router.js");
var requestHandlers = require("./requestHandlers");

var handle = {};

handle["/"] = requestHandlers.index;

server.start(router.route, handle);
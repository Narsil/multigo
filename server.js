var http = require("http");
var url = require("url");
var CONFIG = require("./config.js");

function start(route, handle) {
  function onRequest(request, response) {
  	var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

    route(handle, pathname);

    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }

  http.createServer(onRequest).listen(CONFIG.PORT);
  console.log("Server has started.");
}

console.log("Listening on http://"+CONFIG.URL+":"+CONFIG.PORT);

exports.start = start;


var http = require("http");
var CONFIG = require("./config.js");

function start() {
  function onRequest(request, response) {
    console.log("Request received.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }

  http.createServer(onRequest).listen(CONFIG.PORT);
  console.log("Server has started.");
}

console.log("Listening on http://"+CONFIG.URL+":"+CONFIG.PORT);

exports.start = start;


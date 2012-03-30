var http = require("http");

var server = http.createServer(function(request, response){
	response.writeHead(200,{
		'Content-type':  'text/plain'
	});
	response.write("Hello World!");
	response.end();
});

server.listen(8080); 

console.log("Listening on http://127.0.0.1:8080");

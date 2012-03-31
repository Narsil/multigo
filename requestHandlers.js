var fs = require("fs");

var indexHTML = fs.readFileSync("views/index.html");

function index(response){
	console.log("Request handler 'index' was called.");
	response.writeHead(200, {
		'Content-type': 'text/html; charset=utf-8'
	});
	response.end(indexHTML);
}

exports.index = index;
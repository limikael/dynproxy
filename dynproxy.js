#!/usr/bin/env node

/*
TODO:
? log file
- start as service
*/

var HttpProxy=require("http-proxy");
var Http=require("http");
var Minimist=require("minimist");
var request=require("request");
var yaml=require("js-yaml");
var fs=require("fs");
var service=require("service-systemd");
var package=require("./package.json");

/**
 * Print usage.
 */
function usage() {
	console.log("Usage: dynproxy [command] [options]");
	console.log();
	console.log("Commands:");
	console.log("  install-service    - Install dynproxy systemd service.");
	console.log("  uninstall-service  - Uninstall dynproxy systemd service.");
	console.log();
	console.log("Options:");
	console.log("  --port=<port>    - Specify listen port.");
	console.log("  --map-url=<url>  - The url where to look up hosts.");
	console.log("  --options=<file> - Load options from file.");
	console.log("  --version        - Print version and exit.");
	console.log();
	process.exit(1);
}

/**
 * Print usage.
 */
function die(message) {
	console.log(message);
	process.exit(1);
}

/**
 * Send error message and end response.
 */
function errorEnd(res, message) {
	res.writeHead(500);
	res.write(message);
	res.end();
}

var argv=Minimist(process.argv.slice(2));

if (argv._[0]=="install-service") {
	console.log("Installing service...");
	service.add({
		name: "dynproxy",
		app: "dynproxy.js",
		"app.args": "--options /etc/dynproxy.yml",
		cwd: __dirname,
		engine: "node",
		"engine.bin": "/usr/bin/node",
		pid: "/var/run/dynproxy.pid"

	})
	.then(() => {
		console.log('Service installed: dynproxy');
		process.exit();
	})
	.catch((err) => {
		console.error('Unable to install:', err.toString());
		process.exit();
	});

	return;
}

if (argv._[0]=="uninstall-service") {
	console.log("Uninstalling service...");
	service.remove("dynproxy")
	.then(() => {
		console.log('Service uninstalled: dynproxy');
		process.exit();
	})
	.catch((err) => {
		console.error('Unable to remove:', err.toString());
		process.exit();
	});

	return;
}

if (argv['version']) {
	console.log("dynproxy "+package.version);
	process.exit();
}

var fileName=argv.options;

if (fileName) {
	if (fs.existsSync(fileName)) {
		console.log("Loading settings: "+fileName);
		try {
			var doc = yaml.safeLoad(fs.readFileSync(fileName,'utf8'));
			for (var i in doc)
				if (!argv[i])
					argv[i]=doc[i];
		} catch (e) {
			die(e);
		}
	} else {
		console.log("Settings file doesn't exist: "+fileName);
	}
}

var listenPort=argv['port'];
if (!listenPort)
	usage("You need to specify a port.");

var mapUrl=argv['map-url'];
if (!mapUrl)
	usage("You need to specify a map url.");

console.log("Listen: "+listenPort);
console.log("Mapping using: "+mapUrl);
console.log("Starting...");

var proxy=HttpProxy.createProxyServer({});

var server=Http.createServer(function(req, res) {
	console.log("Request: "+req.headers.host);

	var useUrl=mapUrl;
	if (useUrl.indexOf('?')>=0)
		useUrl+="&host=";

	else
		useUrl+="?host=";

	useUrl+=encodeURIComponent(req.headers.host);

	request(useUrl, function(error, response, body) {
		if (error)
			return errorEnd(res,"Got error response from backend.\n");

		var data;
		try {
			data=JSON.parse(body);
		}

		catch (e) {
			return errorEnd(res,"Not valid json from backend.\n");
		}

		if (data.target)
			data.host=data.target;

		if (!data.host)
			return errorEnd(res,"Got no target from backend.\n");

		if (data.host) {
			console.log("Proxy: "+data.host);
			proxy.web(req, res, {
				"target": data.host
			},function(e) {
				return errorEnd(res,"Internal proxy error.\n");
			});
		}
	});
});

server.listen(listenPort);

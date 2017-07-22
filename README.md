# dynproxy
Dynamically proxy requests by looking up the target host using a rest call

## Description
dynproxy is a HTTP proxy, and it listens for incoming HTTP requests and
forwards these requests to another web server and returns the result to
the original client. In order to know which server to forward the request
to, dynproxy is configured to ask a REST service that maps incoming to 
outgoing web servers.

## Installation
Install dynproxy globally using npm and specifying the GitHub repository:

    npm install -g https://github.com/limikael/dynproxy.git

Then run it as:

    dynproxy --port=80 --map-url=http://example.com/mapurl.php

Where 80 is the port to listen to, and `http://example.com/mapurl.php` is the URL that dynproxy will ask to know how to forward requests.

## The url mapping service
## Running as a service
## Wishlist

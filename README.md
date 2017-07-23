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
As dynproxy receives an incoming request, it will forward the request to a backend server. In
order to know which server to forward the reqeust to, it will use a REST service to look up
the host to send the request to. If the `map-url` is set to:

    http://example.com/mapurl.php

And the incoming request is for the url:

    http://www.mysite.com

Then dynproxy will make a request to:

    http://example.com/mapurl.php?host=www.mysite.com

Given this request, dynproxy expects a JSON encoded reply, like this:

    {
        "host": "http://backend.com"
    }

This information will be used to process the request.

## Running as a service
You might want to run dynproxy as a systemd service. In order to install dynproxy this way, do:

    dynproxy install-service

## Wishlist
In its current state, this little script works and does its job. However, there are things that would be nice to have:

- It would be nice if the mapping information could be cached. This way dynproxy didn't have to look up the backend
every request.

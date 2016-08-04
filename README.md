# SynchronousFidelity
High Fidelity Script for tracking head/hands

## About

This is a High Fidelity related project that allows users to track their movements and store them in a NoSQL database (MongoDB)

## Server Setup

*NOTE: This is for setting up a local server, and is not REQUIRED*

Edit the .env files with your database URI in both server/ and jsoncsv/

Change the global server URL variables if you are hosting a local server. 

```
$ cd server
$ npm install
```

## Plugin Description

There are two plugins in the plugin folder. The action emitter is responsible for sending action data to the server on every third frame.
The event emitter is only required if you are responsible for saving an event timestamp to the server.

## Interface Setup

You *must* change the display name in the Interface. 
Click on settings > avatar > and fill out the display name with anything. Ensure that it is different from anyone else running the script.

Next, add the plugin files into the interface. 

The plugins are hosted on dropbox. Here are the URLs

actionEmitter.js: https://www.dropbox.com/s/d1n9rrcd83eag5q/actionEmitter.js?dl=1

eventEmitter.js: https://www.dropbox.com/s/3zsrn38zy3jqp02/eventEmitter.js?dl=1

Right click > edit > running scripts > from URL > and paste the above link in.

Proceed to Developer > Logs, and ensure that the script is logging 'Successfully sent data to server'

## Roadmap

- [] Fix failure to receive 1 out of 5 frames. Could be Heroku throttling, or too many HTTP Requests for HiFi
- [] Add a web client to visualize similarities in movements. Preferably live, while the actionEmitter is running.

# SynchronousFidelity
High Fidelity Script for tracking head/hands

## About

This is a High Fidelity related project that allows users to track their movements and store them in a NoSQL database (MongoDB)

It also has a really neat API that lets you query for Pearson's R correlation between the distance two users have moved in a time interval

## Local Server Setup

Setting up a local server can be benefical if you are looking to lower latency in the reqeusts sent. This often makes the live graph **much** more responsive, as it drops the server ping considerably.

There are two ways of setting up the local server. Docker is recommended because it is independent of the server's environment, and should work without any extra hassles (e.g installing and setting up a database and node.js). 

Read more about docker [here](https://www.docker.com/what-docker).

### Method 1: Using Docker (recommended)

Ensure you have [docker](https://www.docker.com/products/docker) installed for your respective operating system.

Then, clone the repository. If you wish to run the server and database on different ports (not 8000 and 27017, respectively), you can edit docker-compose.yml and Dockerfile in the server folder for port mapping.

```
# docker-compose.yml
db:  
  image: mongo
  ports:
    - "27017:27017" # Change this to the port you want the database to run on.
synchronousfidelity:  
  build: .
  links:
    - db
  ports:
    - "8000:8000" # Change this to the port you want the server to run on.
  environment:
    - PORT=8000 # Enusre you change '8000' to reflect the new server port.
    - MONGODB_URI=mongodb://db:27017/synchrony # Ensure you change '27017' after to reflect the new database port

```

```
# Dockerfile

FROM nodesource/jessie:4.4.6
ADD package.json package.json  
RUN npm install  
ADD . .  

EXPOSE 8000 # Change this to reflect the server port in docker-compose.yml
EXPOSE 27017 # Change this to reflect the database port in docker-compose.yml

CMD ["npm","start"]  

```

Then, simply run the following commands in the server folder

```
$ docker-compose build
$ docker-compose up
```

And the server should start!

### Method 2: Setting up MongoDB and Node.js manually.

You need to start by downloading and installing both MongoDB and Node.js on your system, for your respective operating system. 

Next, configure and start a mongod instance. (Instructions can be found online)

Then, clone the repository. Go to the server directory, and create a .env file that looks something like this

```
 PORT=PORT_NUMBER_FOR_SERVER
 MONGODB_URI=MONGOD_URL # Should look something like mongo://localhost:27017/db 
```

Then run the following in the server directory

```
$ npm install
$ npm start
```

and the server should start!

## Plugin Description

There are two plugins in the plugin folder. The action emitter is responsible for sending action data to the server on every third frame.
The event emitter is only required if you are responsible for saving an event timestamp to the server. To send an event, hit the trigger on the right controller.

## Interface Setup

You *must* change the display name in the Interface. 
Click on settings > avatar > and fill out the display name with anything. Ensure that it is different from anyone else running the script.

Next, add the plugin files into the interface. 

The plugins are served directly from SynchronousFidelity

MovementTracker.js: ```http://<SERVER_IP>:<SERVER_PORT>/plugins/MovementTracker/<SERVER_IP>.js```

EventTracker.js: ```http://<SERVER_IP>:<SERVER_PORT>/plugins/EventTracker/<SERVER_IP>.js```

Right click > edit > running scripts > from URL > and paste the above link in.

Proceed to Developer > Logs, and ensure that the script is logging 'Successfully sent data to server'. You may need to enable the developer menu to see it. Go to settings, and check 'Developer Menu'

## Roadmap

- [ ] Fix failure to receive 1 out of 5 frames. Could be Heroku throttling or too many HTTP Requests for HiFi to handle
- [X] Add a web client to visualize similarities in movements. Preferably live, while the actionEmitter is running.
- [ ] Extend the API so we can query for Pearson's R correlation between 2+ people (is this even possible?)

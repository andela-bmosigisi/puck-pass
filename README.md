Puck Pass
=============================

## About

This is a two against two, four player browser based game, built aroud passing a puck and doing touch downs in areas corresponding to your colour. It is played over a network connection.

It works best on Chrome v.40.0 and Firefox v.38.7.0 upwards, especially for gamepad support.

The motivation of making it was to explore the various challanges one would face while creating a multiplayer game over a network.

## Built on

- Javascript
- Node.js server
- MongoDB for storage.
- [Crafty.js](http://craftyjs.com/)
- Socket.io

## Installation

In order to create your own server and host the game, you need:

- Node Js
- Mongo DB server installed locally, or a access to remote instance.

First, clone the repository and cd into it.
```
git clone https://github.com/andela-bmosigisi/puck-pass.git
cd puck-pass
```

Create a new file in the root directory of the project and call it `.env`. This will be used to store the connection string to our mongo data store. The file should only contain one line, which looks like this. Replace the uri with the connection string to your own mongodb server.
```
MONGO_URL=mongodb://someusername:password@127.0.0.1/database
```

Install the node dependencies.
```
npm install
```

Run the server and access the game at `localhost:3000`
```
npm start
```

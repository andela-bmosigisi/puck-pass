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

## How to play

- Create a game by giving it a name, in the landing page.
- After being re-directed to the playing area, decide whether you want to be in the blue or green team. Write your name and click the button to the corresponding team.
- Invite any other three people to the game. For a server on your computer, that would mean giving them your ip address and name of the game, if the three other people are in the same network. You may get your ip on a Mac/Linux computer by running:
```ifconfig | grep inet\ ```
- Once three people have joined and chosen teams, the countdown begins.
- The game is played by chasing around (fighting for) the puck, while collaborating with your team player. The score increases by holding the puck and standing in a goal area with the same colour as your team colour.
- How to win you ask? Currently the score increases forever.

## How to contribute

Play it and open issues for bugs you might find.

## Future

- Add a victory condition.
- Fix bugs.
- Host the game.
- Optimize the network operations.
- Do a post mortem blog post on the development process.

# JACD Task Board

A task board that's just better than the others


## Developer Documentation

### Building from source

Dependencies (for a Lubuntu 20.04 LTS VM)
-   Docker (Optional)
-   Node
-   npm
-   Yarn
-   Git
    
Install Docker with
	`sudo apt-get install ./docker-desktop-<version>-<arch>.deb`

Install npm with
	`sudo apt install npm`

Install node with
	`sudo apt install npm`

Install yarn with
	`npm install --global yarn`

Git should already be installed.

### With yarn:

To Start Backend:

`cd jacd/backend/`

`yarn install`

`yarn start`

To Start Frontend:

`cd jacd/frontend/`

`yarn install`

`yarn start`
  
This will start the backend on **localhost:5005** and the frontend on **localhost:3000**


### With docker:

`cd jacd/`

`docker-compose up --build`

This will start 2 docker containers for backend attached to **localhost:5005** and frontend attached to **localhost:3000**

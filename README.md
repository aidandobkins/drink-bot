# Drink Bot (React)

To run this on the server, you have to make sure the BACKENDPORT is set to what you want in .env, and create the .env file in the root directory.
- Make sure you have node 18 installed, then make sure you can use it with sudo by doing this `sudo ln -s "$NVM_DIR/versions/node/v18.20.6/bin/node" "/usr/local/bin/node"` `sudo ln -s "$NVM_DIR/versions/node/v18.20.6/bin/npm" "/usr/local/bin/npm"`
- Run "sudo npm install" to install dependencies
- Run "sudo npm run buildfrontend" in the root folder first.
- Might need to start a mongodb first on the server. Use these instructions if so: https://www.mongodb.com/developer/products/mongodb/mongodb-on-raspberry-pi/
- BUT, use this command to install mongodb, it needs to be this version for ARM64 `sudo apt-get install mongodb-org=4.4.10 mongodb-org-database-tools-extra=4.4.10 mongodb-org-mongos=4.4.10 mongodb-org-server=4.4.10 mongodb-org-shell=4.4.10 mongodb-org-tools=4.4.10`
- Then run "sudo pm2 start index.js --name DrinkBot" in the root folder. Or "npm run backend" if you want to see debug.

To run locally to test and develop, you need to do the above (but without sudo if you aren't on linux)
but instead of using pm2, just click run on index.js in vscode

# Drink Bot (React)

To run this on the server, you have to make sure the BACKENDPORT is set to what you want in .env, and create the .env file in the root directory.
- Make sure you have node 18 installed
- Run "sudo npm install" to install dependencies
- Run "sudo npm run buildfrontend" in the root folder first.
- Might need to start a mongodb first on the server.
- Then run "sudo pm2 start index.js --name DrinkBot" in the root folder. Or "npm run backend" if you want to see debug.

To run locally to test and develop, you need to do the above (but without sudo if you aren't on linux)
but instead of using pm2, just click run on index.js in vscode

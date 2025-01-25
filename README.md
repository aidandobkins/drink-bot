# Drink Bot (React)

To run this on the server, you have to make sure the port is set to what you want in .env, and create the .env file in the root directory.
Run "sudo npm install" to install dependencies
Run "sudo npm run frontendbuild" in the root folder first.
Then run "sudo pm2 start index.js --name DrinkBot" in the root folder.

To run locally to test and develop, you need to do the above (but without sudo if you aren't on linux)
but instead of using pm2, just click run on index.js in vscode

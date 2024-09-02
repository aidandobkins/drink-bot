# Drink Bot (React)

To run this on the server, you have to make sure .env files are set to "PROD".
Run "sudo npm run build" in the root folder first.
Then run "sudo pm2 start index.js --name DrinkBot" in the backend folder.

To run locally to test and develop, you need to do the above (but without sudo if you aren't on linux)
but instead of using pm2, just click run on index.js in vscode
const { Drink, DrinkInfo, PrimeAllPumps, PurgeAllPumps, DispenseDrink, PrimePump, PurgePump } = require('./pump-controls');
const express = require('express');
var bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
var jsonParser = bodyParser.json();
const path = require('path');
const bcrypt = require('bcrypt'); 

// Number of rounds to salt the passwords
const SALTROUNDS = 10;

// Set Port number depending on dev or prod
let PORT = process.env.BACKENDPORT;

// Setup MongoDB
const { MongoClient, ObjectId } = require('mongodb');
var url = "mongodb://127.0.0.1:27017/";

// Pick up React index.html file
app.use(express.static(path.join(__dirname, `/build`)));

app.get('/api/helloWorld', (req, res) => {
    res.json({message: 'Hello from server!'});
});

// app.post('/api/authUser', jsonParser, async (req, res) => {
//     var pass = req.body.pass;
//     var user = req.body.user;

//     var passwordsMatch = false;

//     MongoClient.connect(url, function(err, db) {
//         if (err) throw err;
//         var dbo = db.db("DrinkBot");

//         dbo.collection("Users").findOne({ username: user }, async function(err, result) {
//             if (err) throw err;

//             passwordsMatch = await bcrypt.compare(String(pass), String(result.password));
//         });

//         db.close();
//       });

//       res.json(passwordsMatch);
// });

app.get('/api/getFavoriteDrinks', async (req, res) => {
    const client = new MongoClient(url);
    
    try {
        await client.connect();
        const drinks = await client.db('DrinkBot').collection('FavoriteDrinks').find({}).toArray();
        res.status(200).json(drinks);
    } 
    catch (error) {
        res.status(500).json({ message: 'Error retrieving favorite drinks', error: error.message });
    } 
    finally {
        await client.close();
    }
});

app.get('/api/getDispensedDrinks', async (req, res) => {
    const client = new MongoClient(url);
    
    try {
        await client.connect();
        const drinks = await client.db('DrinkBot').collection('DispensedDrinks').find().toArray();
        res.status(200).json(drinks);
    } 
    catch (error) {
        res.status(500).json({ message: 'Error retrieving dispensed drinks', error: error.message });
    } 
    finally {
        await client.close();
    }
});

app.get('/api/getQueuedDrinks', async (req, res) => {
    const client = new MongoClient(url);
    
    try {
        await client.connect();
        const drinks = await client.db('DrinkBot').collection('QueuedDrinks').find().toArray();
        res.status(200).json(drinks);
    } 
    catch (error) {
        res.status(500).json({ message: 'Error retrieving queued drinks', error: error.message });
    } 
    finally {
        await client.close();
    } 
});

app.get('/api/getSettings', async (req, res) => {
    const client = new MongoClient(url);
    
    try {
        await client.connect();
        const settings = await client.db('DrinkBot').collection('Settings').findOne();

        res.status(200).json(settings);
    } 
    catch (error) {
        res.status(500).json({ message: 'Error retrieving settings', error: error.message });
    } 
    finally {
        await client.close();
    }
});

app.put('/api/updateSettings', jsonParser, async (req, res) => {
    const client = new MongoClient(url);

    try {
        await client.connect();
        const settingsCollection = client.db('DrinkBot').collection('Settings');

        const newSettings = req.body;

        const result = await settingsCollection.updateOne({}, { $set: newSettings }, { upsert: true });

        if (result.matchedCount === 0) {
            res.status(404).json({ message: 'Settings document not found' });
        } else {
            res.status(200).json({ message: 'Settings updated successfully' });
        }
    } 
    catch (error) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    } 
    finally {
        await client.close();
    }
});


app.post('/api/queueDrink', jsonParser, async (req, res) => {
    const drink = req.body;

    drink.Timestamp = new Date().toLocaleString();

    const client = new MongoClient(url);

    try {
        await client.connect();
        await client.db('DrinkBot').collection('QueuedDrinks').insertOne(drink);
        res.status(200).json({ message: 'Drink successfully added to queue' });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error queuing drink', error: error.message });
    } 
    finally {
        await client.close();
    }
});

app.delete('/api/clearQueue', jsonParser, async (req, res) => {
    const client = new MongoClient(url);

    try {
        await client.connect();
        await client.db('DrinkBot').collection('QueuedDrinks').deleteMany({});
        res.status(200).json({ message: 'Queue successfully cleared' });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error clearing queue', error: error.message });
    } 
    finally {
        await client.close();
    }
});

app.delete('/api/queueDrink', jsonParser, async (req, res) => {
    const id = req.body.Id; // Expecting the id of the queued drink to delete
    const client = new MongoClient(url);

    try {
        await client.connect();
        const result = await client.db('DrinkBot').collection('QueuedDrinks').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Drink successfully deleted' });
        } else {
            res.status(404).json({ message: 'Drink not found' });
        }
    } 
    catch (error) {
        res.status(500).json({ message: 'Error deleting drink', error: error.message });
    } 
    finally {
        await client.close();
    }
});

app.post('/api/dispenseDrink', jsonParser, async (req, res) => {
    const drink = req.body.drink;
    const availableLabels = req.body.drinkLabels;

    if (drink) {
        delete drink._id;
    } else {
        return res.status(400).json({ message: 'Drink data is missing in the request' });
    }

    drink.Timestamp = new Date().toLocaleString();

    try {
        await DispenseDrink(drink, availableLabels);
    } 
    catch (error) {
        res.status(500).json({ message: 'Error dispensing drink', error: error.message });
    } 

    const client = new MongoClient(url);

    try {
        await client.connect();
        await client.db('DrinkBot').collection('DispensedDrinks').insertOne(drink);
        res.status(200).json({ message: 'Drink successfully dispensed' });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error saving drink to DB', error: error.message });
    } 
    finally {
        await client.close();
    }
});

app.post('/api/primePump', jsonParser, async (req, res) => {
    const pumpNumber = req.body.pumpNumber;

    try {
        await PrimePump(pumpNumber);
        res.status(200).json({ message: 'Pump ' + (pumpNumber + 1) + ' successfully primed' });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error priming pump ' + (pumpNumber + 1), error: error.message });
    }
});

app.post('/api/purgePump', jsonParser, async (req, res) => {
    const pumpNumber = req.body.pumpNumber;

    try {
        await PurgePump(pumpNumber);
        res.status(200).json({ message: 'Pump ' + (pumpNumber + 1) + ' successfully purged' });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error purging pump ' + (pumpNumber + 1), error: error.message });
    }
});

app.post('/api/primeAllPumps', jsonParser, async (req, res) => {
    try {
        await PrimeAllPumps();
        res.status(200).json({ message: 'All pumps successfully primed' });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error priming all pumps', error: error.message });
    }
});

app.post('/api/purgeAllPumps', jsonParser, async (req, res) => {
    try {
        await PurgeAllPumps();
        res.status(200).json({ message: 'All pumps successfully purged' });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error purging all pumps', error: error.message });
    }
});

app.post('/api/favoriteDrink', jsonParser, async (req, res) => {
    const drink = req.body;

    if (drink) {
        delete drink._id;
    } else {
        return res.status(400).json({ message: 'Drink data is missing in the request' });
    }

    drink.Timestamp = new Date().toLocaleString();

    const client = new MongoClient(url);

    try {
        await client.connect();
        await client.db('DrinkBot').collection('FavoriteDrinks').insertOne(drink);
        res.status(200).json({ message: 'Drink successfully added to favorites' });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error favoriting drink', error: error.message });
    } 
    finally {
        await client.close();
    }
});


// if (process.env.ENVIRONMENT !== 'DEV') {
//     //catch all other requests and send back frontend
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(__dirname, `/build/index.html`));
//     });
// }

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

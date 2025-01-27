let gpio;

if (process.platform === 'linux') {
    gpio = require('rpi-gpio');
} else {
    // Mock gpio class for non-Linux environments
    console.log('Running in a non-Linux environment. Using mock GPIO.');
    gpio = {
        setup: (pin, direction, callback) => {
            console.log(`Mock setup for pin ${pin} with direction ${direction}`);
            if (callback) callback(null);
        },
        write: (pin, value, callback) => {
            console.log(`Mock write to pin ${pin}: ${value}`);
            if (callback) callback(null);
        },
        destroy: (callback) => {
            console.log('Mock GPIO cleanup');
            if (callback) callback(null);
        },
    };
}

const OZTIME = 16.0; // Amount of time it takes for one ounce to dispense in seconds
const PURGETIME = 10.0; // Amount of time to run the pumps when purging in seconds
const PRIMETIME = 5.1; // Amount of time to run the pumps when priming in seconds
const PUMP_PINS = [11, 13, 15, 19, 21, 23];
const PUMPS = PUMP_PINS.map(pin => ({ pin, isOn: false }));
const MAKINGLIGHTPIN = 36;

class Drink {
    constructor(DrinkInfoList, _id, Name = "", ImagePath = "") {
        this.DrinkInfoList = DrinkInfoList;
        this._id = _id;
        this.Name = Name;
        this.ImagePath = ImagePath;
    }
}

class DrinkInfo {
    constructor(label, value) {
        this.label = label;
        this.value = value;
    }
}

function setupPins() {
    return Promise.all(
        PUMPS.map(pump =>
            new Promise((resolve, reject) => {
                gpio.setup(pump.pin, gpio.DIR_OUT, err => {
                    if (err) {
                        console.error(`Error setting up pin ${pump.pin}:`, err);
                        return reject(err);
                    }
                    console.log(`Pin ${pump.pin} set up successfully.`);
                    resolve();
                });
            })
        )
    );
}

function turnPumpOn(pump) {
    return new Promise((resolve, reject) => {
        gpio.write(pump.pin, true, err => {
            if (err) {
                console.error(`Error turning on pin ${pump.pin}:`, err);
                return reject(err);
            }
            pump.isOn = true;
            resolve();
        });
    });
}

function turnPumpOff(pump) {
    return new Promise((resolve, reject) => {
        gpio.write(pump.pin, false, err => {
            if (err) {
                console.error(`Error turning off pin ${pump.pin}:`, err);
                return reject(err);
            }
            pump.isOn = false;
            resolve();
        });
    });
}

async function DispenseDrink(drink, drinkLabels) {
    try {
        const drinkInfoListWithPumps = assignPumpsToDrinks(drink, drinkLabels);

        const pumpPromises = drinkInfoListWithPumps.map(async drinkInfo => {
            await turnPumpOn(drinkInfo.pump);

            const timeToDispense = drinkInfo.value * OZTIME * 1000; // Convert to milliseconds

            await new Promise(resolve => setTimeout(resolve, timeToDispense));
            await turnPumpOff(drinkInfo.pump);
        });

        await Promise.all(pumpPromises);
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

async function PrimeAllPumps() {
    try {
        await Promise.all(
            PUMPS.map(async pump => {
                await turnPumpOn(pump);
                await new Promise(resolve => setTimeout(resolve, PRIMETIME * 1000));
                await turnPumpOff(pump);
            })
        );
        console.log("Pumps primed successfully!");
    } catch (error) {
        console.error("Error priming pumps:", error.message);
        throw error;
    }
}

async function PurgeAllPumps() {
    try {
        await Promise.all(
            PUMPS.map(async pump => {
                await turnPumpOn(pump);
                await new Promise(resolve => setTimeout(resolve, PURGETIME * 1000));
                await turnPumpOff(pump);
            })
        );
        console.log("Pumps purged successfully!");
    } catch (error) {
        console.error("Error purging pumps:", error.message);
        throw error;
    }
}

async function PrimePump(pumpIndex) {
    try {
        if (pumpIndex < 0 || pumpIndex >= PUMPS.length) {
            throw new Error("Invalid pump index.");
        }

        const pump = PUMPS[pumpIndex];
        await turnPumpOn(pump);
        await new Promise(resolve => setTimeout(resolve, PRIMETIME * 1000));
        await turnPumpOff(pump);
        console.log(`Pump ${pumpIndex} primed successfully!`);
    } catch (error) {
        console.error(`Error priming pump ${pumpIndex}:`, error.message);
        throw error;
    }
}

async function PurgePump(pumpIndex) {
    try {
        if (pumpIndex < 0 || pumpIndex >= PUMPS.length) {
            throw new Error("Invalid pump index.");
        }

        const pump = PUMPS[pumpIndex];
        await turnPumpOn(pump);
        await new Promise(resolve => setTimeout(resolve, PURGETIME * 1000));
        await turnPumpOff(pump);
        console.log(`Pump ${pumpIndex} purged successfully!`);
    } catch (error) {
        console.error(`Error purging pump ${pumpIndex}:`, error.message);
        throw error;
    }
}

function assignPumpsToDrinks(drink, drinkLabels) {
    for (const drinkInfo of drink.DrinkInfoList) {
        if (!drinkLabels.includes(drinkInfo.label)) {
            throw new Error(`Label "${drinkInfo.label}" not found in drinkLabels.`);
        }
    }

    return drink.DrinkInfoList.map(drinkInfo => {
        const labelIndex = drinkLabels.indexOf(drinkInfo.label);
        return {
            label: drinkInfo.label,
            value: drinkInfo.value,
            pump: PUMPS[labelIndex]
        };
    });
}

// Set up pins before exporting functions
setupPins()
    .then(() => console.log("All pins set up successfully."))
    .catch(err => console.error("Error setting up pins:", err));

module.exports = { Drink, DrinkInfo, PrimeAllPumps, PurgeAllPumps, DispenseDrink, PrimePump, PurgePump };
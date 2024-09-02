let Gpio;
if (process.platform === 'linux') {
    Gpio = require('onoff').Gpio;
} else {
    // Mock Gpio class for non-Linux environments
    Gpio = class {
        constructor(pin, direction) {
            console.log(`Mock GPIO created for pin ${pin} with direction ${direction}`);
        }
        writeSync(value) {
            console.log(`Mock writeSync called with value ${value}`);
        }
        unexport() {
            console.log('Mock unexport called');
        }
    };
}

const OZTIME = 16.0; //amount of time it takes for one ounce to dispense in seconds
const PURGETIME = 10.0; //amount of time to run the pumps when purging in seconds
const PRIMETIME = 5.1; //amount of time to run the pumps when priming in seconds
const PUMPS = [new Gpio(17, 'out'), new Gpio(27, 'out'), 
               new Gpio(22, 'out'), new Gpio(10, 'out'), 
               new Gpio(9, 'out'), new Gpio(11, 'out')];
const MAKINGLIGHTPIN = 16;

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

async function DispenseDrink(drink, drinkLabels) {
    try {
        const drinkInfoListWithPumps = assignPumpsToDrinks(drink, drinkLabels);

        // Create an array of promises, one for each pump operation
        const pumpPromises = drinkInfoListWithPumps.map(drinkInfo => {
            return new Promise((resolve) => {
                // Turn on the pump
                drinkInfo.pump.writeSync(1);

                // Calculate the time to keep the pump on
                const timeToDispense = drinkInfo.value * OZTIME * 1000; // Convert to milliseconds

                // Turn off the pump after the calculated time
                setTimeout(() => {
                    drinkInfo.pump.writeSync(0);
                    resolve(); // Resolve the promise once the pump is turned off
                }, timeToDispense);
            });
        });

        // Wait for all pumps to finish dispensing
        await Promise.all(pumpPromises);
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

async function PrimeAllPumps() {
    try {
        // Create an array of promises, one for each pump operation
        const pumpPromises = PUMPS.map(pump => {
            return new Promise((resolve) => {
                // Turn on the pump
                pump.writeSync(1);

                // Turn off the pump after the PRIMETIME duration
                setTimeout(() => {
                    pump.writeSync(0);
                    resolve(); // Resolve the promise once the pump is turned off
                }, PRIMETIME * 1000); // Convert PRIMETIME to milliseconds
            });
        });

        // Wait for all pumps to finish priming
        await Promise.all(pumpPromises);
        console.log("Pumps primed successfully!");
    } catch (error) {
        console.error("Error priming pumps:", error.message);
        throw error;
    }
}

async function PurgeAllPumps() {
    try {
        // Create an array of promises, one for each pump operation
        const pumpPromises = PUMPS.map(pump => {
            return new Promise((resolve) => {
                // Turn on the pump
                pump.writeSync(1);

                // Turn off the pump after the PURGETIME duration
                setTimeout(() => {
                    pump.writeSync(0);
                    resolve(); // Resolve the promise once the pump is turned off
                }, PURGETIME * 1000); // Convert PURGETIME to milliseconds
            });
        });

        // Wait for all pumps to finish purging
        await Promise.all(pumpPromises);
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
        
        // Turn on the pump
        pump.writeSync(1);

        // Turn off the pump after the PRIMETIME duration
        await new Promise(resolve => {
            setTimeout(() => {
                pump.writeSync(0);
                resolve();
            }, PRIMETIME * 1000); // Convert PRIMETIME to milliseconds
        });

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
        
        // Turn on the pump
        pump.writeSync(1);

        // Turn off the pump after the PURGETIME duration
        await new Promise(resolve => {
            setTimeout(() => {
                pump.writeSync(0);
                resolve();
            }, PURGETIME * 1000); // Convert PURGETIME to milliseconds
        });

        console.log(`Pump ${pumpIndex} purged successfully!`);
    } catch (error) {
        console.error(`Error purging pump ${pumpIndex}:`, error.message);
        throw error;
    }
}

function assignPumpsToDrinks(drink, drinkLabels) {
    // Check if all DrinkInfo labels exist in drinkLabels
    for (const drinkInfo of drink.DrinkInfoList) {
        if (!drinkLabels.includes(drinkInfo.label)) {
            throw new Error(`Label "${drinkInfo.label}" not found in drinkLabels.`);
        }
    }

    // Assign pins based on matching labels
    return drink.DrinkInfoList.map(drinkInfo => {
        const labelIndex = drinkLabels.indexOf(drinkInfo.label);
        return {
            label: drinkInfo.label,
            value: drinkInfo.value,
            pump: PUMPS[labelIndex]  // Set the pump based on the index of the label
        };
    });
}

module.exports = { Drink, DrinkInfo, PrimeAllPumps, PurgeAllPumps, DispenseDrink, PrimePump, PurgePump };
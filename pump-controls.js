const { exec } = require('child_process');

const OZTIME = 16.0; // Time it takes for one ounce to dispense (seconds)
const PURGETIME = 10.0; // Time to purge pumps (seconds)
const PRIMETIME = 5.1; // Time to prime pumps (seconds)
const PUMP_PINS = [17, 27, 22, 10, 9, 11]; // BCM pin numbers

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

// Helper function to execute shell commands
function executeCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Command stderr: ${stderr}`);
            }
            resolve(stdout.trim());
        });
    });
}

// Initialize all pumps (set all pins to output and drive low)
async function initializePumps() {
    try {
        await Promise.all(
            PUMP_PINS.map(pin => executeCommand(`raspi-gpio set ${pin} op dl`))
        );
        console.log('All pumps initialized to OFF.');
    } catch (error) {
        console.error('Error initializing pumps:', error.message);
        throw error;
    }
}

// Turn a pump ON
async function turnPumpOn(pin) {
    try {
        await executeCommand(`raspi-gpio set ${pin} op dh`);
        console.log(`Pump on pin ${pin} turned ON.`);
    } catch (error) {
        console.error(`Error turning on pump on pin ${pin}:`, error.message);
        throw error;
    }
}

// Turn a pump OFF
async function turnPumpOff(pin) {
    try {
        await executeCommand(`raspi-gpio set ${pin} op dl`);
        console.log(`Pump on pin ${pin} turned OFF.`);
    } catch (error) {
        console.error(`Error turning off pump on pin ${pin}:`, error.message);
        throw error;
    }
}

// Cleanup GPIO pins (set all pins to LOW)
async function CleanupPumps() {
    try {
        await Promise.all(
            PUMP_PINS.map(pin => executeCommand(`raspi-gpio set ${pin} op dl`))
        );
        console.log('All pumps turned OFF during cleanup.');
    } catch (error) {
        console.error('Error during pump cleanup:', error.message);
        throw error;
    }
}

// Dispense a drink
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
        console.log('Drink dispensed successfully.');
    } catch (error) {
        console.error('Error dispensing drink:', error.message);
        throw error;
    }
}

// Prime all pumps
async function PrimeAllPumps() {
    try {
        await Promise.all(
            PUMP_PINS.map(async pin => {
                await turnPumpOn(pin);
                await new Promise(resolve => setTimeout(resolve, PRIMETIME * 1000));
                await turnPumpOff(pin);
            })
        );
        console.log('All pumps primed successfully.');
    } catch (error) {
        console.error('Error priming all pumps:', error.message);
        throw error;
    }
}

// Purge all pumps
async function PurgeAllPumps() {
    try {
        await Promise.all(
            PUMP_PINS.map(async pin => {
                await turnPumpOn(pin);
                await new Promise(resolve => setTimeout(resolve, PURGETIME * 1000));
                await turnPumpOff(pin);
            })
        );
        console.log('All pumps purged successfully.');
    } catch (error) {
        console.error('Error purging all pumps:', error.message);
        throw error;
    }
}

// Prime a specific pump
async function PrimePump(pumpIndex) {
    try {
        if (pumpIndex < 0 || pumpIndex >= PUMP_PINS.length) {
            throw new Error('Invalid pump index.');
        }

        const pin = PUMP_PINS[pumpIndex];
        await turnPumpOn(pin);
        await new Promise(resolve => setTimeout(resolve, PRIMETIME * 1000));
        await turnPumpOff(pin);
        console.log(`Pump ${pumpIndex} primed successfully.`);
    } catch (error) {
        console.error(`Error priming pump ${pumpIndex}:`, error.message);
        throw error;
    }
}

// Purge a specific pump
async function PurgePump(pumpIndex) {
    try {
        if (pumpIndex < 0 || pumpIndex >= PUMP_PINS.length) {
            throw new Error('Invalid pump index.');
        }

        const pin = PUMP_PINS[pumpIndex];
        await turnPumpOn(pin);
        await new Promise(resolve => setTimeout(resolve, PURGETIME * 1000));
        await turnPumpOff(pin);
        console.log(`Pump ${pumpIndex} purged successfully.`);
    } catch (error) {
        console.error(`Error purging pump ${pumpIndex}:`, error.message);
        throw error;
    }
}

// Map drink info to pumps
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
            pump: PUMP_PINS[labelIndex]
        };
    });
}

// Initialize pins on startup
(async () => {
    try {
        await initializePumps();
    } catch (error) {
        console.error('Error during pump initialization:', error.message);
    }
})();

module.exports = {
    Drink, DrinkInfo,
    initializePumps,
    CleanupPumps,
    turnPumpOn,
    turnPumpOff,
    DispenseDrink,
    PrimeAllPumps,
    PurgeAllPumps,
    PrimePump,
    PurgePump
};

let Gpio;

if (process.platform === 'linux') {
    Gpio = require('pigpio').Gpio;
} else {
    // Mock Gpio class for non-Linux environments
    console.log('Running in a non-Linux environment. Using mock GPIO.');
    Gpio = class {
        constructor(pin, options) {
            this.pin = pin;
            this.state = 0; // 0 for OFF, 1 for ON
            console.log(`Mock GPIO pin ${pin} initialized with options:`, options);
        }

        digitalWrite(value) {
            this.state = value;
            console.log(`Mock GPIO pin ${this.pin} set to ${value === 1 ? 'ON' : 'OFF'}`);
        }
    };
}

const OZTIME = 16.0; // Amount of time it takes for one ounce to dispense in seconds
const PURGETIME = 10.0; // Amount of time to run the pumps when purging in seconds
const PRIMETIME = 5.1; // Amount of time to run the pumps when priming in seconds
const PUMP_PINS = [17, 27, 22, 10, 9, 11]; // BCM pin numbers
// Initialize pins and immediately set them to LOW (OFF)
const PUMPS = PUMP_PINS.map(pin => {
    const gpioPin = new Gpio(pin, { mode: Gpio.OUTPUT });
    gpioPin.digitalWrite(0); // Ensure the pin starts OFF
    return gpioPin;
});
const MAKINGLIGHTPIN = 16; // BCM pin number for the making light

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


async function turnPumpOn(pump) {
    return new Promise((resolve, reject) => {
        try {
            pump.digitalWrite(1); // Turn the pump on
            resolve();
        } catch (error) {
            reject(`Error turning on pump: ${error.message}`);
        }
    });
}

async function turnPumpOff(pump) {
    return new Promise((resolve, reject) => {
        try {
            pump.digitalWrite(0); // Turn the pump off
            resolve();
        } catch (error) {
            reject(`Error turning off pump: ${error.message}`);
        }
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

module.exports = { Drink, DrinkInfo, PrimeAllPumps, PurgeAllPumps, DispenseDrink, PrimePump, PurgePump };

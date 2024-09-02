// colorMap.ts

// Define a map of strings to colors
const drinkColorMap: { [key: string]: string } = {
    "Amaretto": "chocolate",
    "Sour Mix": "gold",
    "Vodka": "ghostwhite",
    "Gin": "ghostwhite",
    "Tequila": "golden",
    "Triple Sec": "orange",
    "White Rum": "ghostwhite",
    "Whiskey": "brown",
    "Grenadine": "red",
    "Lime Juice": "green",
    "Blue Curacao": "blue",
    "Cranberry Juice": "crimson",
    "Orange Juice": "orange",
    "Pineapple Juice": "gold",
    "Sprite": "lightgreen",
    "Soda Water": "lightblue",
    "Simple Syrup": "grey",
    // Add more drinks and their associated colors as needed
};

// Function to get the color for a specific drink
function getColorForDrink(drink: string): string {
    return drinkColorMap[drink] || "white"; // Return a default color if the drink is not found
}

// Export the map and the function for use in other files
export { drinkColorMap, getColorForDrink };

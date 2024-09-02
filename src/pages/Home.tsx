import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Slider, IconButton } from '@mui/joy';
import MenuItem from '@mui/material/MenuItem';
import DeleteIcon from '@mui/icons-material/Delete';
import WineBarIcon from '@mui/icons-material/WineBar';
import SettingsIcon from '@mui/icons-material/Settings';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { PieChart } from '@mui/x-charts/PieChart';
import { CenteredRow, CenteredColumn, Row, Column } from './styles/Common';
import { AddFavoriteDialog, DrinkSlider, SettingsDialog, SettingsBar, SettingsButton, FavoriteDrinksSubContainer, FavoriteDrinksIconButton, FavoriteDrinkLabel, FavoriteDrinkButtonContainer, SizeButtonContainer, FavoriteDrinkCard, QueuedDrinkCard, HomeContainer, DrinkCreationContainer, SliderContainer, SliderValue, SliderLabel, SliderSubContainer, QueuedDrinksContainer, FavoriteDrinksContainer } from './styles/Home';
import { getColorForDrink } from '../helpers/color-mappings';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import Settings from '../components/Settings';
import AddFavorite from '../components/AddFavorite';

const NUMBEROFPUMPS = 6;
const ISQUEUEENABLED = false;

export class Drink {
    DrinkInfoList: DrinkInfo[];
    _id: string;
    Name: string;
    ImagePath: string;

    constructor(DrinkInfoList: DrinkInfo[], 
                _id: string,
                Name: string = "",
                ImagePath: string = "") {
        this.DrinkInfoList = DrinkInfoList;
        this._id = _id;
        this.Name = Name;
        this.ImagePath = ImagePath;
    }

    toString(): string {
        return JSON.stringify(this.DrinkInfoList);
    }
}

export class DrinkInfo {
    label: string;
    value: number;

    constructor (label: string, value: number) {
        this.label = label;
        this.value = value;
    }
}

export class SettingsInfo {
    PrimeTiming: number;
    PurgeTiming: number;
    DrinkLabels: Array<string>;
    ShowImpossibleFavorites: boolean;
    SliderStepSize: number;
    DefaultSliderValue: number;
    MinSliderValue: number;
    MaxSliderValue: number;

    constructor(
        PrimeTiming?: number, 
        PurgeTiming?: number, 
        DrinkLabels?: Array<string>, 
        ShowImpossibleFavorites?: boolean,
        SliderStepSize: number = 0.5,
        DefaultSliderValue: number = 0,
        MinSliderValue: number = 0,
        MaxSliderValue: number = 10
    ) {
        // Check if the first constructor signature is being used
        if (PrimeTiming !== undefined && PurgeTiming !== undefined && DrinkLabels !== undefined && ShowImpossibleFavorites !== undefined) {
            this.PrimeTiming = PrimeTiming;
            this.PurgeTiming = PurgeTiming;
            this.DrinkLabels = DrinkLabels;
            this.ShowImpossibleFavorites = ShowImpossibleFavorites;
        } 
        // Check if the second constructor signature is being used
        else {
            this.PrimeTiming = 0;
            this.PurgeTiming = 0;
            this.DrinkLabels = Array(NUMBEROFPUMPS).fill("");
            this.ShowImpossibleFavorites = false;
        }

        // Assign slider settings
        this.SliderStepSize = SliderStepSize;
        this.DefaultSliderValue = DefaultSliderValue;
        this.MinSliderValue = MinSliderValue;
        this.MaxSliderValue = MaxSliderValue;
    }
}



const Home: React.FC = () => {
    const [settingsInfo, setSettingsInfo] = useState<SettingsInfo>(new SettingsInfo());
    const [drinkValues, setDrinkValues] = useState(Array(NUMBEROFPUMPS).fill(0));
    const [favoriteDrinks, setFavoriteDrinks] = useState<Drink[]>();
    const [queuedDrinks, setQueuedDrinks] = useState<Drink[]>();
    const [queuingDrink, setQueuingDrink] = useState(false);
    const [dispensingDrink, setDispensingDrink] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const [isAddFavoriteOpen, setIsAddFavoriteOpen] = useState(false);

    useEffect(() => {
        // This function will run when the component is loaded
        GetSettings();
        GetFavoriteDrinks();
        if (ISQUEUEENABLED) GetQueuedDrinks();
    }, []);

    async function GetSettings() {
        await fetch('/api/getSettings')
            .then(response => response.json())
            .then(data => {
                setSettingsInfo(new SettingsInfo(data.PrimeTiming, data.PurgeTiming, data.DrinkLabels, data.ShowImpossibleFavorites));
            })
            .catch(error => {
                console.error('Error fetching settings:', error);
                setSettingsInfo(new SettingsInfo());
            });

        console.log(settingsInfo);
    }

    function OnSliderChange(newValue: number, numberDrink: number) {
        setDrinkValues(prevValues => {
            const newValues = [...prevValues];
            newValues[numberDrink] = newValue;
            return newValues;          
        });
    }

    async function QueueDrink() {
        setQueuingDrink(true);
        
        await fetch('/api/queueDrink', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(createDrinkFromState()),
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error queueing drink:', error));

        await GetQueuedDrinks();
        setQueuingDrink(false);
    }

    async function GetFavoriteDrinks() {
        await fetch('/api/getFavoriteDrinks')
            .then(response => response.json())
            .then(data => {
                var drinks: Drink[] = [];
                for (var i = 0; i < data.length; i++) {
                    var drink = data[i];
                    drinks.push(drink);
                };

                setFavoriteDrinks(drinks);
            })
            .catch(error => console.error('Error fetching favorite drinks:', error));
    }

    async function GetQueuedDrinks() {
        await fetch('/api/getQueuedDrinks')
            .then(response => response.json())
            .then(data => {
                var drinks: Drink[] = [];
                for (var i = 0; i < data.length; i++) {
                    drinks.push(data[i]);
                };
                setQueuedDrinks(drinks);
            })
            .catch(error => console.error('Error fetching queued drinks:', error));
    }

    function createDrinkFromState() {
        // Create a list of DrinkInfo objects
        const drinkInfoList = drinkValues.map((value, index) => {
            return new DrinkInfo(settingsInfo.DrinkLabels[index], value);
        });
    
        // Create and return the Drink object
        return new Drink(drinkInfoList, "");
    }

    async function DispenseDrink(drink?: Drink, size: number = 1) {
        setDispensingDrink(true);

        var requestBody = {
            drink: createDrinkFromState(),
            drinkLabels: settingsInfo.DrinkLabels,
        };

        if (drink) {
            drink.DrinkInfoList = drink.DrinkInfoList.map(drinkInfo => {
                    return {
                        ...drinkInfo,
                        value: drinkInfo.value * size
                    };
                });

            requestBody = {
                drink: drink, 
                drinkLabels: settingsInfo.DrinkLabels
            };
        }
        
        await fetch('/api/dispenseDrink', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error queueing drink:', error));

        await GetQueuedDrinks();

        setDispensingDrink(false);
    }

    async function DeleteQueuedDrink(queuedDrink: Drink) {
        await fetch('/api/deleteQueuedDrink', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(queuedDrink),
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error deleting drink:', error));

        await GetQueuedDrinks();
    }

    return (
        <>
            <SettingsDialog
                scroll="paper"
                maxWidth="xl"
                open={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}>
                <DialogTitle>
                    Settings
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => setIsSettingsOpen(false)}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'white',
                    }}
                    >
                    <CloseIcon />
                </IconButton>
                <Settings NUMBEROFPUMPS={NUMBEROFPUMPS} ISQUEUEENABLED={ISQUEUEENABLED} settingsInfo={settingsInfo} setSettingsInfo={setSettingsInfo}/>
            </SettingsDialog>

            <AddFavoriteDialog
                scroll="paper"
                maxWidth="xl"
                open={isAddFavoriteOpen}
                onClose={() => setIsAddFavoriteOpen(false)}>
                <DialogTitle>
                    Add New Favorite Drink
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => setIsAddFavoriteOpen(false)}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'white',
                    }}
                    >
                    <CloseIcon />
                </IconButton>
                <AddFavorite NUMBEROFPUMPS={NUMBEROFPUMPS} settingsInfo={settingsInfo} GetFavoriteDrinks={GetFavoriteDrinks} />
            </AddFavoriteDialog>

            <HomeContainer>
                <FavoriteDrinksContainer>
                    <FavoriteDrinksSubContainer>
                        {favoriteDrinks && favoriteDrinks.length > 0 ? (
                            favoriteDrinks.filter(drink => 
                                settingsInfo.ShowImpossibleFavorites || 
                                (Array.isArray(drink.DrinkInfoList) && drink.DrinkInfoList.every(item => settingsInfo.DrinkLabels.includes(item.label)))
                            ).map((drink, index) => (
                                <FavoriteDrinkCard key={index}>
                                    <FavoriteDrinkLabel>"{drink.Name}"</FavoriteDrinkLabel>
                                    {drink.DrinkInfoList && drink.DrinkInfoList.length > 0 ? (
                                        <PieChart
                                            series={[
                                                {
                                                    data: drink.DrinkInfoList.map((info, index) => ({
                                                        id: index,
                                                        value: info.value,
                                                        label: info.label,
                                                        color: getColorForDrink(info.label)
                                                    })),
                                                    innerRadius: 20,
                                                    paddingAngle: 10,
                                                    cornerRadius: 5,
                                                    outerRadius: 50,
                                                    cx: 115,
                                                    cy: 50
                                                },
                                            ]}
                                            slotProps={{
                                                legend: {
                                                direction: 'row',
                                                position: {
                                                    vertical: 'bottom',
                                                    horizontal: 'middle',
                                                },
                                                itemMarkWidth: 10,
                                                itemMarkHeight: 10,
                                                markGap: 5,
                                                itemGap: 7,
                                                padding: 5,
                                                labelStyle: {
                                                    fontSize: 13,
                                                    fill: 'white',
                                                },
                                                }
                                            }}
                                            width={240} height={160} />
                                    ) : (
                                        <p>No drink information available.</p> // Fallback if DrinkInfoList is undefined or empty
                                    )}
                                    <FavoriteDrinkButtonContainer>
                                        <FavoriteDrinksIconButton aria-label="4 oz" onClick={() => DispenseDrink(drink, 4)}>
                                            <SizeButtonContainer>
                                                <WineBarIcon/>
                                                4 oz
                                            </SizeButtonContainer>
                                        </FavoriteDrinksIconButton>
                                        <FavoriteDrinksIconButton aria-label="8 oz" onClick={() => DispenseDrink(drink, 8)}>
                                            <SizeButtonContainer>
                                                <WineBarIcon/>
                                                8 oz
                                            </SizeButtonContainer>
                                        </FavoriteDrinksIconButton>
                                    </FavoriteDrinkButtonContainer>
                                </FavoriteDrinkCard>
                            ))
                        ) : (
                            <p>No favorite drinks available.</p> // Fallback if drinks is undefined or empty
                        )}
                    </FavoriteDrinksSubContainer>
                </FavoriteDrinksContainer>
                
                <DrinkCreationContainer>
                    {Array.from({ length: NUMBEROFPUMPS }, (_, i) => (
                        <SliderContainer key={i}>
                            <SliderLabel>{settingsInfo.DrinkLabels[i]}</SliderLabel>
                            <SliderSubContainer>
                                <DrinkSlider
                                    aria-label={`Drink ${i + 1}`}
                                    defaultValue={settingsInfo.DefaultSliderValue}
                                    step={settingsInfo.SliderStepSize}
                                    min={settingsInfo.MinSliderValue}
                                    max={settingsInfo.MaxSliderValue}
                                    onChange={(event, value) => OnSliderChange(value as number, i)}
                                    customcolor={getColorForDrink(settingsInfo.DrinkLabels[i])}
                                />
                                <SliderValue>{drinkValues[i].toFixed(1)} oz</SliderValue>
                            </SliderSubContainer>
                        </SliderContainer>
                    ))}

                    <Button onClick={ISQUEUEENABLED ? QueueDrink : () => DispenseDrink()} 
                            loading={ISQUEUEENABLED ? queuingDrink : dispensingDrink}
                            variant="soft"
                            color="neutral">
                                    {ISQUEUEENABLED ? "Queue Drink" : "Dispense Drink"}
                    </Button>
                </DrinkCreationContainer>
                
                {ISQUEUEENABLED ? (
                    <QueuedDrinksContainer>
                    <h1>Queued Drinks</h1>
                    <Button onClick={() => DispenseDrink()} loading={dispensingDrink}>Dispense Next Drink</Button>
                    {queuedDrinks && queuedDrinks.length > 0 ? (
                        queuedDrinks.map((drink, index) => (
                            <QueuedDrinkCard key={index}>
                                {drink.DrinkInfoList && drink.DrinkInfoList.length > 0 ? (
                                    <ul>
                                        {drink.DrinkInfoList.map((info, i) => 
                                            info.value > 0 && (
                                                <li key={i}>
                                                    {info.label}: {info.value} ounce{info.value > 1 ? 's' : ''}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p>No drink information available.</p> // Fallback if DrinkInfoList is undefined or empty
                                )}
                                <IconButton aria-label="delete" onClick={() => DeleteQueuedDrink(drink)} >
                                    <DeleteIcon/>
                                </IconButton>
                            </QueuedDrinkCard>
                        ))
                    ) : (
                        <p>No drinks available.</p> // Fallback if drinks is undefined or empty
                    )}
                </QueuedDrinksContainer>
                ) : (<></>)}
                
                <SettingsBar>
                    <SettingsButton onClick={() => setIsSettingsOpen(true)}>
                        <SettingsIcon fontSize="large"/>
                    </SettingsButton>
                    <SettingsButton onClick={() => setIsLogOpen(true)}>
                        <TextSnippetIcon fontSize="large"/>
                    </SettingsButton>
                    <SettingsButton onClick={() => setIsAddFavoriteOpen(true)}>
                        <AddIcon fontSize="large"/>
                    </SettingsButton>
                </SettingsBar>
            </HomeContainer>
        </>
    );
};

export default Home;

import React, {FormEvent, useState} from 'react';
import { CenteredRow, CenteredColumn, Row, Column } from '../pages/styles/Common';
import { AddFavoriteDrinkSliderContainer, AddFavoriteDialogContainer } from './styles/AddFavorite';
import { Checkbox, Input, Select, Button } from '@mui/joy';
import { Drink, DrinkInfo, SettingsInfo } from '../pages/Home';
import { getColorForDrink } from '../helpers/color-mappings';
import { SliderContainer, SliderLabel, SliderSubContainer, DrinkSlider, SliderValue } from '../pages/styles/Home';
import { PieChart } from '@mui/x-charts/PieChart';

interface AddFavoriteProps {
    NUMBEROFPUMPS: number;
    settingsInfo: SettingsInfo;
    GetFavoriteDrinks: Function;
}

const AddFavorite: React.FC<AddFavoriteProps> = ({NUMBEROFPUMPS, settingsInfo, GetFavoriteDrinks}) => {
    const [favoriteDrinkValues, setFavoriteDrinkValues] = useState(Array(NUMBEROFPUMPS).fill(0));
    const [addingFavoriteDrink, setAddingFavoriteDrinks] = useState(false);

    function OnSliderChange(newValue: number, numberDrink: number) {
        setFavoriteDrinkValues(prevValues => {
            const newValues = [...prevValues];
            newValues[numberDrink] = newValue;
            return newValues;          
        });
    }

    async function AddNewFavoriteDrink(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setAddingFavoriteDrinks(true);
        
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        var favoriteDrinkName = formData.get('favoriteDrinkName') as string

        // Filter out the zero values and create corresponding DrinkInfo objects
        const totalValue = favoriteDrinkValues.reduce((acc, value) => acc + value, 0);
    
        const drinkInfoList = favoriteDrinkValues
            .map((value, index) => {
                if (value > 0) {
                    const percentageValue = value / totalValue;
                    return new DrinkInfo(settingsInfo.DrinkLabels[index], percentageValue);
                }
                return null; // Return null for values that should be omitted
            })
            .filter(drinkInfo => drinkInfo !== null) as DrinkInfo[];
    
        // Create and return the Drink object
        var newFavoriteDrink = new Drink(drinkInfoList, "", favoriteDrinkName);
        
        await fetch('/api/favoriteDrink', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newFavoriteDrink),
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error creating favorite drink:', error));

        await GetFavoriteDrinks();

        setAddingFavoriteDrinks(false);
    }

    return (
        <AddFavoriteDialogContainer>
            <AddFavoriteDrinkSliderContainer>
                {Array.from({ length: NUMBEROFPUMPS }, (_, i) => (
                    <SliderContainer key={"favorite" + i}>
                        <SliderLabel>{settingsInfo.DrinkLabels[i]}</SliderLabel>
                        <SliderSubContainer>
                            <DrinkSlider
                                aria-label={`Favorite Drink ${i + 1}`}
                                defaultValue={settingsInfo.DefaultSliderValue}
                                step={settingsInfo.SliderStepSize}
                                min={settingsInfo.MinSliderValue}
                                max={settingsInfo.MaxSliderValue}
                                onChange={(event, value) => OnSliderChange(value as number, i)}
                                customcolor={getColorForDrink(settingsInfo.DrinkLabels[i])}
                            />
                            <SliderValue>{favoriteDrinkValues[i].toFixed(1)} oz</SliderValue>
                        </SliderSubContainer>
                    </SliderContainer>
                ))}
                <form onSubmit={AddNewFavoriteDrink}>
                    <CenteredRow style={{marginBottom: '16px', marginTop: '16px'}}>
                        Name: 
                        <Input variant="outlined" required name="favoriteDrinkName" type="text" />
                    </CenteredRow>
                    <Button 
                        type="submit"
                        loading={addingFavoriteDrink}
                        variant="soft"
                        color="neutral">
                        Add Favorite Drink
                    </Button>
                </form>
                <br/>
                NOTE: This will be scaled to a percentage
            </AddFavoriteDrinkSliderContainer>

            {favoriteDrinkValues.some(value => value > 0) ? (
                <PieChart
                    series={[
                        {
                            data: favoriteDrinkValues.map((value, index) => ({
                                id: index,
                                value: value,
                                label: settingsInfo.DrinkLabels[index],
                                color: getColorForDrink(settingsInfo.DrinkLabels[index])
                            })).filter(data => data.value > 0),
                            innerRadius: 30,
                            paddingAngle: 5,
                            cornerRadius: 10,
                            outerRadius: 110,
                            cx: 240,
                            cy: 120
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
                        padding: 0,
                        labelStyle: {
                            fontSize: 13,
                            fill: 'white',
                        },
                        }
                    }}
                    width={500} height={300} />
            ) : (<p></p>)}
        </AddFavoriteDialogContainer>
    );
};

export default AddFavorite;

import styled from 'styled-components';
import { styled as materialStyled }  from '@mui/material/styles';
import { Button, Slider, IconButton, SliderProps  } from '@mui/joy';
import Dialog from '@mui/material/Dialog';

export const DrinkCreationContainer = styled.div`
    background-color: #2C2C2C;
    border: 2px solid grey;
    padding: 16px 32px;
    border-radius: 12px;
    margin: auto;
    margin-top: 32px;
    width: 25%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    color: white;
    min-width: 300px;
`;

export const SliderContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

export const SliderSubContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 32px;
    justify-content: center;
`;

export const SliderValue = styled.p`
    font-size: 18px;
    min-width: 70px;
`;

export const SliderLabel = styled.p`
    font-size: 18px;
    margin: 0;
`;

export const QueuedDrinksContainer = styled.div`
    background-color: white;
    border: 2px solid grey;
    padding: 16px 32px;
    border-radius: 12px;
    margin: auto;
    width: 30%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
`;

export const FavoriteDrinksContainer = styled.div`
    margin: auto;
    margin-top: 16px;
    width: 600px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    align-items: center;
    font-family: Montserrat;
`;

export const HomeContainer = styled.div`
    display: flex;
    margin: auto;
    flex-direction: row;
    justify-content: center;
`;

export const QueuedDrinkCard = styled.div`
    background-color: white;
    border: 2px solid grey;
    padding: 16px;
    border-radius: 12px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

export const FavoriteDrinkCard = styled.div`
    border: 2px solid grey;
    padding: 16px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    background-color: #2C2C2C;
    width: 200px;
    margin: 16px;
`;

export const SizeButtonContainer = styled.div`
    background-color: white;
    border: 2px solid grey;
    padding: 6px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 16px;
    width: 100%;
`;

export const FavoriteDrinkButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
`;

export const FavoriteDrinkLabel = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 18px;
    font-family: Montserrat;
    font-weight: 500;
    color: white;
`;

export const FavoriteDrinksSubContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 18px;
    font-family: Montserrat;
    font-weight: 500;
    color: white;
    flex-wrap: wrap;
`;

export const FavoriteDrinksIconButton = materialStyled(IconButton)({
    '&:hover': {
        backgroundColor: '#2C2C2C'
    },
    width: '50%'
});

export const SettingsButton = materialStyled(IconButton)({
    '&:hover': {
        backgroundColor: 'transparent'
    }
});

export const SettingsBar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 128px;
    align-items: center;
    justify-content: start;
    margin: 32px 0px;
`;

export const SettingsDialog = materialStyled(Dialog)({
    '& .MuiPaper-root': {
        backgroundColor: '#2c2c2c',
        color: 'white',
        borderRadius: '32px'
    },
});

export const AddFavoriteDialog = materialStyled(Dialog)({
    '& .MuiPaper-root': {
        backgroundColor: '#2c2c2c',
        color: 'white',
        borderRadius: '32px'
    },
});

interface DrinkSliderProps extends SliderProps {
    customcolor?: string;
}

// Utility function to convert a color to RGBA
function convertColorToRGBA(color: string, opacity: number): string {
    // Create a temporary element to leverage the browser's color parsing
    const tempElement = document.createElement("div");
    tempElement.style.color = color;
    document.body.appendChild(tempElement);

    const computedColor = getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);

    // Extract RGB values and add opacity
    const [r, g, b] = computedColor.match(/\d+/g)!.map(Number);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const DrinkSlider = materialStyled(Slider, {shouldForwardProp: (prop) => prop !== 'customcolor'})<DrinkSliderProps>(({ customcolor }) => {
    const colorWithOpacity50 = customcolor ? convertColorToRGBA(customcolor, 0.5) : 'rgba(255, 255, 255, 0.5)'; // 50% opacity
    
    return {
        '& .MuiSlider-track': {
            backgroundColor: customcolor || 'white', 
        },
        '& .MuiSlider-rail': {
            backgroundColor: 'white', 
        },
        '& .MuiSlider-thumb': {
            outlineColor: colorWithOpacity50 || 'white', 
            color: customcolor || 'white',
            backgroundColor: '#2c2c2c'
        },
        '& .MuiSlider-thumb::before': {
            borderColor: customcolor || 'white', 
            color: customcolor || 'white'
        }
    };
});
  
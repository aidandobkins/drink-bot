import styled from 'styled-components';
import { styled as materialStyled }  from '@mui/material/styles';
import { Checkbox } from '@mui/joy';

export const AddFavoriteDialogContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 32px;
    width: 80vw;
    height: 90vh;
    align-items: start;
    justify-content: start;
    background-color: #2c2c2c;
`;

export const AddFavoriteDrinkSliderContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 35%;
    margin: 32px;
    justify-content: start;
`;

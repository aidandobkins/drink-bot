import styled from 'styled-components';
import { styled as materialStyled }  from '@mui/material/styles';
import { Checkbox } from '@mui/joy';

export const SettingsDialogContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
    width: 80vw;
    height: 90vh;
    align-items: center;
    justify-content: start;
    background-color: #2c2c2c;
`;

export const SettingsCheckbox = materialStyled(Checkbox)({
    color: 'white'
});
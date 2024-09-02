import React, {FormEvent, useState} from 'react';
import { CenteredRow, CenteredColumn, Row, Column } from '../pages/styles/Common';
import { SettingsCheckbox, SettingsDialogContainer } from './styles/Settings';
import { Checkbox, Input, Select, Button } from '@mui/joy';
import { SettingsInfo } from '../pages/Home';

interface SettingsProps {
    NUMBEROFPUMPS: number;
    ISQUEUEENABLED: boolean;
    settingsInfo: SettingsInfo;
    setSettingsInfo: React.Dispatch<React.SetStateAction<SettingsInfo>>;
}

const Settings: React.FC<SettingsProps> = ({NUMBEROFPUMPS, ISQUEUEENABLED, settingsInfo, setSettingsInfo}) => {
    const [clearingQueue, setClearingQueue] = useState(false);
    const [restarting, setRestarting] = useState(false);
    const [updatingSettings, setUpdatingSettings] = useState(false);
    const [primingAllPumps, setPrimingAllPumps] = useState(false);
    const [purgingAllPumps, setPurgingAllPumps] = useState(false);
    const [primingPump, setPrimingPump] = useState(Array(NUMBEROFPUMPS).fill(false));
    const [purgingPump, setPurgingPump] = useState(Array(NUMBEROFPUMPS).fill(false));

    async function ClearQueue() {
        setClearingQueue(true);
        
        await fetch('/api/clearQueue', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error clearing queue:', error));

        setClearingQueue(false);
    }

    async function UpdateSettings(newSettings: SettingsInfo) {
        setUpdatingSettings(true);
        
        await fetch('/api/updateSettings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newSettings),
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => {
                console.error('Error updating settings:', error);
                setUpdatingSettings(false);
                return;
            });
        
        setSettingsInfo(newSettings); //only if it succeeded
        setUpdatingSettings(false);
    }

    async function RestartMachine() {
        //TODO: make restart here if possible
    }

    async function PrimeAllPumps() {
        setPrimingAllPumps(true);

        await fetch('/api/primeAllPumps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error priming all pumps:', error));

        setPrimingAllPumps(false);
    }

    async function PurgeAllPumps() {
        setPurgingAllPumps(true);

        await fetch('/api/purgeAllPumps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error purging all pumps:', error));

        setPurgingAllPumps(false);
    }

    async function PrimePump(pumpNumber: number) {
        var newPrimingPump = [...primingPump];
        newPrimingPump[pumpNumber] = true;
        setPrimingPump(newPrimingPump);

        await fetch('/api/primePump', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({pumpNumber: pumpNumber}),
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error priming pump:', error));

        newPrimingPump = [...primingPump];
        newPrimingPump[pumpNumber] = false;
        setPrimingPump(newPrimingPump);
    }

    async function PurgePump(pumpNumber: number) {
        var newPurgingPump = [...purgingPump];
        newPurgingPump[pumpNumber] = true;
        setPrimingPump(newPurgingPump);

        await fetch('/api/purgePump', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({pumpNumber: pumpNumber}),
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error purging pump:', error));

        newPurgingPump = [...purgingPump];
        newPurgingPump[pumpNumber] = false;
        setPrimingPump(newPurgingPump);
    }

    async function UpdatePrimeTiming(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const inputValue = Number(formData.get('primeTiming'));

        // Create a new SettingsInfo object with the updated DrinkLabels array
        await UpdateSettings(new SettingsInfo(inputValue, settingsInfo.PurgeTiming, settingsInfo.DrinkLabels, settingsInfo.ShowImpossibleFavorites));
    }

    async function UpdatePurgeTiming(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const inputValue = Number(formData.get('purgeTiming'));

        // Create a new SettingsInfo object with the updated DrinkLabels array
        await UpdateSettings(new SettingsInfo(settingsInfo.PrimeTiming, inputValue, settingsInfo.DrinkLabels, settingsInfo.ShowImpossibleFavorites));
    }

    async function UpdateDrinkLabels(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        // Initialize an empty array to store the drink labels
        const drinkLabels: string[] = [];

        // Loop through the NUMBEROFPUMPS to get each input value
        for (let i = 0; i < NUMBEROFPUMPS; i++) {
            const label = formData.get('drinkLabel' + i) as string;
            drinkLabels.push(label);
        }

        // Create a new SettingsInfo object with the updated DrinkLabels array
        await UpdateSettings(new SettingsInfo(settingsInfo.PrimeTiming, settingsInfo.PurgeTiming, drinkLabels, settingsInfo.ShowImpossibleFavorites));
    }

    async function UpdateShowImpossibleDrinks(element: React.ChangeEvent<HTMLInputElement>) {
        const newCheckedState = element.target.checked;

        // Create a new SettingsInfo object with the updated DrinkLabels array
        await UpdateSettings(new SettingsInfo(settingsInfo.PrimeTiming, settingsInfo.PurgeTiming, settingsInfo.DrinkLabels, newCheckedState));
    }

    return (
        <SettingsDialogContainer>
                    <Row>
                        <Column>
                            {Array.from({ length: NUMBEROFPUMPS }).map((_, i) => (
                                <Button 
                                    key={i} 
                                    onClick={() => PrimePump(i)}
                                    loading={updatingSettings}
                                    variant="soft"
                                    color="success">
                                    Prime Pump {i+1}
                                </Button>
                            ))}
                            <Button onClick={PrimeAllPumps} 
                                loading={updatingSettings}
                                variant="solid"
                                color="success">
                                Prime All Pumps
                            </Button>
                        </Column>
                        <Column>
                            {Array.from({ length: NUMBEROFPUMPS }).map((_, i) => (
                                <Button 
                                    key={i} 
                                    onClick={() => PurgePump(i)}
                                    loading={updatingSettings}
                                    variant="soft"
                                    color="danger">
                                    Purge Pump {i+1}
                                </Button>
                            ))}
                            <Button onClick={PurgeAllPumps} 
                                loading={updatingSettings}
                                variant="solid"
                                color="danger">
                                Purge All Pumps
                            </Button>
                        </Column>
                        <Column style={{marginLeft: '32px'}}>
                            Prime Pumps Timing
                            <form onSubmit={UpdatePrimeTiming}>
                                <CenteredRow style={{marginBottom: '16px'}}>
                                    <Input variant="outlined" required defaultValue={settingsInfo.PrimeTiming} name="primeTiming" type="number" />
                                    milliseconds
                                </CenteredRow>
                                <Button 
                                    type="submit"
                                    loading={updatingSettings}
                                    variant="soft"
                                    color="success">
                                    Set Prime Timing
                                </Button>
                            </form>
                            Purge Pumps Timing
                            <form onSubmit={UpdatePurgeTiming}>
                                <CenteredRow style={{marginBottom: '16px'}}>
                                    <Input variant="outlined" required defaultValue={settingsInfo.PurgeTiming} name="purgeTiming" type="number"/>
                                    milliseconds
                                </CenteredRow>
                                <Button 
                                    type="submit"
                                    loading={updatingSettings}
                                    variant="soft"
                                    color="danger">
                                    Set Purge Timing
                                </Button>
                            </form>
                        </Column>
                        <Column>
                            Set Drink Labels
                            <form onSubmit={UpdateDrinkLabels}>
                                {Array.from({ length: NUMBEROFPUMPS }).map((_, i) => (
                                    <Input variant="outlined" required defaultValue={settingsInfo.DrinkLabels[i]} style={{marginBottom: '8px'}} name={"drinkLabel" + i} key={i}/>
                                ))}
                                <br/>
                                <Button 
                                    type="submit"
                                    loading={updatingSettings}
                                    variant="soft"
                                    color="neutral">
                                    Set Drink Labels
                                </Button>
                            </form>
                        </Column>
                    </Row>
                    <br/>
                    <br/>
                    <br/>
                    <CenteredRow>
                        {ISQUEUEENABLED ? (
                            <Button onClick={ClearQueue} 
                                loading={clearingQueue}
                                variant="soft"
                                color="neutral">
                                Clear Queue
                            </Button>
                        ) : (<></>)}
                        <Button onClick={RestartMachine} 
                            loading={restarting}
                            variant="solid"
                            color="danger">
                            Restart Machine
                        </Button>
                        <Column>
                            <SettingsCheckbox label="Show favorite drinks that cannot be made currently" 
                                              color="neutral" 
                                              checked={settingsInfo.ShowImpossibleFavorites || false} 
                                              onChange={(e) => UpdateShowImpossibleDrinks(e)}/>
                        </Column>
                    </CenteredRow>
                </SettingsDialogContainer>
    );
};

export default Settings;

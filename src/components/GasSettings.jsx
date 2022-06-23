import { createSignal } from 'solid-js';
import {
    VStack,
    Box,
    Input,
    InputLeftAddon,
    InputGroup,
} from '@hope-ui/solid';

export function GasSettings() {

    const [profile1, setProfile1] = createSignal(localStorage.getItem('profile1') || '0');
    const profile1Input = event => {
        localStorage.setItem('profile1', event.target.value);
        setProfile1(event.target.value);
    }

    const [profile2, setProfile2] = createSignal(localStorage.getItem('profile2') || '0');
    const profile2Input = event => {
        localStorage.setItem('profile2', event.target.value);
        setProfile2(event.target.value);
    }

    return (
        <Box maxW='$lg' borderRadius='$lg' p='$3' borderWidth='1px' borderColor='$neutral6'>
            <VStack spacing='$2'>
                <label>Gas Profiles</label>
                <InputGroup>
                    <InputLeftAddon>Profile 1</InputLeftAddon>
                    <Input placeholder='GWEI' value={profile1()} onInput={profile1Input} />
                </InputGroup>
                <InputGroup>
                    <InputLeftAddon>Profile 2</InputLeftAddon>
                    <Input placeholder='GWEI' value={profile2()} onInput={profile2Input} />
                </InputGroup>
            </VStack>
        </Box>
    );
}
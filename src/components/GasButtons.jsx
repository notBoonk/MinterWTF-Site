import { createSignal } from "solid-js";

import { BsLightningFill } from 'solid-icons/bs'
import { FaSolidRunning } from 'solid-icons/fa'
import { RiEditorNumber1, RiEditorNumber2 } from 'solid-icons/ri'
import { FaSolidGasPump } from 'solid-icons/fa'
import { IoSettingsSharp } from 'solid-icons/io'

import { MassMinterExtras } from './MassMinterExtras'

import {
    createDisclosure,
    Center,
    HStack,
    IconButton,
    ButtonGroup,
    Box,
    Divider,
    Modal,
    ModalContent,
    ModalOverlay,
    Tooltip,
    Text,
} from '@hope-ui/solid';

const [selectedGas, setSelectedGas] = createSignal(localStorage.getItem("selectedGas") || 0);
const handleGasSelect = (id) => {
    if (id == selectedGas()) id = 0;
    localStorage.setItem("selectedGas", id);
    setSelectedGas(id);
}

export function GasButtons() {
    const { isOpen, onOpen, onClose } = createDisclosure();

    const [rapidGas, setRapidGas] = createSignal(0);

    setInterval(async () => {
        const resp = await fetch('https://etherchain.org/api/gasnow');
        const data = await resp.json();
        setRapidGas(Math.floor(data.data.rapid / 1000000000));
    }, 1000);

    return (
        <>
        <Box shadow="$lg" maxW="$lg" borderRadius="$lg" p="$1" paddingRight={6} borderWidth="1px" borderColor="$neutral6" backgroundColor={'#151718'} css={{position: 'fixed', overflow: 'hidden', bottom: 0, margin: 17.5}}>
            <HStack spacing="$2">
                <Tooltip label="Settings" placement="top">
                    <IconButton size="sm" colorScheme="neutral" variant="subtle" aria-label="Edit" icon={<IoSettingsSharp />} onclick={onOpen} />
                </Tooltip>

                <Center height="20px">
                <Divider orientation="vertical" />
                </Center>
                
                <ButtonGroup size="sm" variant="outline" attached>
                    <Tooltip label="Fast" placement="top">
                        <IconButton onclick={() => handleGasSelect(1)} colorScheme={selectedGas() == 1 ? "primary" : "neutral"} variant="subtle" aria-label="Fast" icon={<FaSolidRunning />} />
                    </Tooltip>
                    <Tooltip label="Rapid" placement="top">
                        <IconButton onclick={() => handleGasSelect(2)} colorScheme={selectedGas() == 2 ? "primary" : "neutral"} variant="subtle" aria-label="Rapid" icon={<BsLightningFill />} />
                    </Tooltip>
                    <Tooltip label={profile1() + " GWEI"} placement="top">
                        <IconButton onclick={() => handleGasSelect(3)} colorScheme={selectedGas() == 3 ? "primary" : "neutral"} variant="subtle" aria-label="Profile 1" icon={<RiEditorNumber1 />} />
                    </Tooltip>
                    <Tooltip label={profile2()  + " GWEI"} placement="top">
                        <IconButton onclick={() => handleGasSelect(4)} colorScheme={selectedGas() == 4 ? "primary" : "neutral"} variant="subtle" aria-label="Profile 2" icon={<RiEditorNumber2 />} />
                    </Tooltip>
                </ButtonGroup>

                <Center height="20px">
                <Divider orientation="vertical" />
                </Center>

                <Text>{rapidGas()}</Text>
                <FaSolidGasPump />
            </HStack>
        </Box>

        <Modal opened={isOpen()} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <MassMinterExtras />
            </ModalContent>
        </Modal>
        </>
    )
}
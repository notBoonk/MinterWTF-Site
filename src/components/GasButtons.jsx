import { createSignal } from 'solid-js';

import { BsLightningFill } from 'solid-icons/bs'
import { FaSolidRunning } from 'solid-icons/fa'
import { RiEditorNumber1, RiEditorNumber2 } from 'solid-icons/ri'
import { FaSolidGasPump } from 'solid-icons/fa'
import { BsThreeDots } from 'solid-icons/bs'

import { MassMinterExtras } from './MassMinterExtras';
import { GasSettings } from './GasSettings';
import { SetApproval } from './SetApproval';
import { MassTransfer } from './MassTransfer';


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
    Menu,
    MenuTrigger,
    MenuContent,
    MenuGroup,
    MenuLabel,
    MenuItem
} from '@hope-ui/solid';

const [selectedGas, setSelectedGas] = createSignal(localStorage.getItem('selectedGas') || 0);
const handleGasSelect = (id) => {
    if (id == selectedGas()) id = 0;
    localStorage.setItem('selectedGas', id);
    setSelectedGas(id);
}

function GasSettingsItem() {
    const { isOpen, onOpen, onClose } = createDisclosure();

    return(
        <>
        <MenuItem onSelect={onOpen}>Gas Profiles</MenuItem>
        <Modal opened={isOpen()} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <GasSettings />
            </ModalContent>
        </Modal>
        </>
    )
}

function MassTransferItem() {
    const { isOpen, onOpen, onClose } = createDisclosure();

    return(
        <>
        <MenuItem onSelect={onOpen}>Mass Transfer</MenuItem>
        <Modal opened={isOpen()} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <MassTransfer />
            </ModalContent>
        </Modal>
        </>
    )
}

function SetApprovalItem() {
    const { isOpen, onOpen, onClose } = createDisclosure();

    return(
        <>
        <MenuItem onSelect={onOpen}>Set Approval</MenuItem>
        <Modal opened={isOpen()} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <SetApproval />
            </ModalContent>
        </Modal>
        </>
    )
}

function MinterExtrasItem() {
    const { isOpen, onOpen, onClose } = createDisclosure();

    return(
        <>
        <MenuItem onSelect={onOpen}>Minter Controls</MenuItem>
        <Modal opened={isOpen()} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <MassMinterExtras />
            </ModalContent>
        </Modal>
        </>
    )
}

export function GasButtons() {
    const [rapidGas, setRapidGas] = createSignal(0);

    setInterval(async () => {
        const resp = await fetch('https://etherchain.org/api/gasnow');
        const data = await resp.json();
        setRapidGas(Math.floor(data.data.rapid / 1000000000));
    }, 1000);

    return (
        <>
        <Box shadow='$lg' maxW='$lg' borderRadius='$lg' p='$1' paddingRight={6} borderWidth='1px' borderColor='$neutral6' backgroundColor={'#151718'} css={{position: 'fixed', overflow: 'hidden', bottom: 0, margin: 17.5}}>
            <HStack spacing='$2'>

                <Menu motionPreset='scale-bottom-right' offset={10} placement='top-end' shadow='$lg'>
                <Tooltip label='More' placement='top'>
                    <MenuTrigger
                        as={IconButton}
                        size='sm'
                        variant='subtle'
                        colorScheme='neutral'
                        icon={<BsThreeDots />}
                    />
                </Tooltip>
                <MenuContent minW='$60'>
                <MenuGroup>
                    <MenuLabel>Utilities</MenuLabel>
                    <MassTransferItem />
                    <SetApprovalItem />
                    <MinterExtrasItem />
                </MenuGroup>
                <MenuGroup>
                    <MenuLabel>Settings</MenuLabel>
                    <GasSettingsItem />
                </MenuGroup>
                </MenuContent>
                </Menu>

                <Center height='20px'>
                <Divider orientation='vertical' />
                </Center>
                
                <ButtonGroup size='sm' variant='outline' attached>
                    <Tooltip label='Fast' placement='top'>
                        <IconButton onclick={() => handleGasSelect(1)} colorScheme={selectedGas() == 1 ? 'primary' : 'neutral'} variant='subtle' aria-label='Fast' icon={<FaSolidRunning />} />
                    </Tooltip>
                    <Tooltip label='Rapid' placement='top'>
                        <IconButton onclick={() => handleGasSelect(2)} colorScheme={selectedGas() == 2 ? 'primary' : 'neutral'} variant='subtle' aria-label='Rapid' icon={<BsLightningFill />} />
                    </Tooltip>
                    <Tooltip label={localStorage.getItem('profile1') + ' GWEI'} placement='top'>
                        <IconButton onclick={() => handleGasSelect(3)} colorScheme={selectedGas() == 3 ? 'primary' : 'neutral'} variant='subtle' aria-label='Profile 1' icon={<RiEditorNumber1 />} />
                    </Tooltip>
                    <Tooltip label={localStorage.getItem('profile2')  + ' GWEI'} placement='top'>
                        <IconButton onclick={() => handleGasSelect(4)} colorScheme={selectedGas() == 4 ? 'primary' : 'neutral'} variant='subtle' aria-label='Profile 2' icon={<RiEditorNumber2 />} />
                    </Tooltip>
                </ButtonGroup>

                <Center height='20px'>
                <Divider orientation='vertical' />
                </Center>

                <Text>{rapidGas()}</Text>
                <FaSolidGasPump />
            </HStack>
        </Box>
        </>
    )
}
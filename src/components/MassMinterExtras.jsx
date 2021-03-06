import { ethers } from 'ethers';

import { connectWallet } from '../utils/Utils';

import { createSignal, createEffect } from 'solid-js';
import {
    notificationService,
    VStack,
    HStack,
    Button,
    Box,
    Input,
    Checkbox,
} from '@hope-ui/solid';

async function sendNotification(notif) {
    notificationService.clear();
    notificationService.show(notif);
}

async function getGasEstimate(limit) {
	const temp = parseInt(limit.toString());
	const estimate = Math.floor(temp + (temp * 0.1));
	return ethers.BigNumber.from(estimate);
}

export function MassMinterExtras() {
    const [quantity, setQuantity] = createSignal('');
    const handleQuantityInput = event => setQuantity(event.target.value);

    const [advanced, setAdvanced] = createSignal(false);
    const handleAdvancedSwitch = event => setAdvanced(event.target.checked);

    const [enableButton, setEnableButton] = createSignal(true);

    createEffect(() => {
        if (
            quantity() != ''
        ) {
            setEnableButton(false);
            return true;
        } else {
            setEnableButton(true);
            return false;
        }
    });

    const onSpawnClick = async () => {
        const utils = await connectWallet();

        try {
            const qty = parseInt(quantity());

            let txOverrides = {}
            
            const gasEstimate = await utils.minterContract.connect(utils.signer).estimateGas.spawnMinters(
                qty
            );

            txOverrides.gasLimit = await getGasEstimate(gasEstimate);

            const tx = await utils.minterContract.connect(utils.signer).spawnMinters(
                qty
            );
            
            sendNotification({
                status: 'info',
                title: 'Minter Creation Transaction',
                loading: true,
                description: `Txn submitted to the network`,
            });
            
            const receipt = await tx.wait();

            if (receipt.status == 1) {
                sendNotification({
                    status: 'success',
                    title: 'Minter Creation Transaction',
                    description: `Txn included in Block ${receipt.blockNumber} ????`,
                });
            } else if (receipt.status == 0) {
                sendNotification({
                    status: 'danger',
                    title: 'Minter Creation Transaction',
                    description: `Txn reverted in Block ${receipt.blockNumber}`,
                });
            }
        } catch (error) {
            let message;

            if (error.message.includes('cannot estimate gas')) {
                message = 'Gas estimation failed, txn will most likely fail.';
            } else {
                message = error.message;
            }
    
            sendNotification({
                status: 'danger',
                title: 'Error',
                description: message,
            });
        }
    }

    const onDrainClick = async () => {
        const utils = await connectWallet();

        try {
            let txOverrides = {}
            
            const gasEstimate = await utils.minterContract.connect(utils.signer).estimateGas.drainMinters();

            txOverrides.gasLimit = await getGasEstimate(gasEstimate);

            const tx = await utils.minterContract.connect(utils.signer).drainMinters();
            
            sendNotification({
                status: 'info',
                title: 'Drain Minters Transaction',
                loading: true,
                description: `Txn submitted to the network`,
            });
            
            const receipt = await tx.wait();

            if (receipt.status == 1) {
                sendNotification({
                    status: 'success',
                    title: 'Drain Minters Transaction',
                    description: `Txn included in Block ${receipt.blockNumber} ????`,
                });
            } else if (receipt.status == 0) {
                sendNotification({
                    status: 'danger',
                    title: 'Drain Minters Transaction',
                    description: `Txn reverted in Block ${receipt.blockNumber}`,
                });
            }
        } catch (error) {
            let message;

            if (error.message.includes('cannot estimate gas')) {
                message = 'Gas estimation failed, txn will most likely fail.';
            } else {
                message = error.message;
            }
    
            sendNotification({
                status: 'danger',
                title: 'Error',
                description: message,
            });
        }
    }


    const onDestroyClick = async () => {
        const utils = await connectWallet();
        
        try {
            let txOverrides = {}
            
            const gasEstimate = await utils.minterContract.connect(utils.signer).estimateGas.destroyMinters();

            txOverrides.gasLimit = await getGasEstimate(gasEstimate);

            const tx = await utils.minterContract.connect(utils.signer).destroyMinters();
            
            sendNotification({
                status: 'info',
                title: 'Destroy Minters Transaction',
                loading: true,
                description: `Txn submitted to the network`,
            });
            
            const receipt = await tx.wait();

            if (receipt.status == 1) {
                sendNotification({
                    status: 'success',
                    title: 'Destroy Minters Transaction',
                    description: `Txn included in Block ${receipt.blockNumber} ????`,
                });
            } else if (receipt.status == 0) {
                sendNotification({
                    status: 'danger',
                    title: 'Destroy Minters Transaction',
                    description: `Txn reverted in Block ${receipt.blockNumber}`,
                });
            }
        } catch (error) {
            let message;

            if (error.message.includes('cannot estimate gas')) {
                message = 'Gas estimation failed, txn will most likely fail.';
            } else {
                message = error.message;
            }
    
            sendNotification({
                status: 'danger',
                title: 'Error',
                description: message,
            });
        }
    }

    return (
        <Box maxW='$lg' borderRadius='$lg' p='$3' borderWidth='1px' borderColor='$neutral6'>
            <VStack spacing='$2'>
                <label>Mass Minters</label>
                <Input placeholder='Quantity' value={quantity()} onInput={handleQuantityInput} />
                <Button disabled={enableButton()} width='100%' onClick={onSpawnClick}>Create Minters</Button>

                <HStack spacing='$2' width='100%'>
                    <Checkbox checked={advanced()} onChange={handleAdvancedSwitch} css={{marginRight: -8}} />
                    <Button disabled={!advanced()} width='100%' variant='outline' colorScheme='warning' onClick={onDrainClick}>Drain</Button>
                    <Button disabled={!advanced()} width='100%' variant='outline' colorScheme='danger' onClick={onDestroyClick}>Destroy</Button>
                </HStack>
            </VStack>
        </Box>
    );
}
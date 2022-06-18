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
} from '@hope-ui/solid';

async function getGasEstimate(limit) {
	const temp = parseInt(limit.toString());
	const estimate = Math.floor(temp + (temp * 0.1));
	return ethers.BigNumber.from(estimate);
}

async function TransferTransaction(inputData) {
    const utils = await connectWallet();

    try {
        let txOverrides = {}
        
        const gasEstimate = await utils.minterContract.connect(utils.signer).estimateGas.transferTokens(
            inputData.contract,
            parseInt(inputData.firstId),
            parseInt(inputData.lastId),
            inputData.receiver
        );

        txOverrides.gasLimit = await getGasEstimate(gasEstimate);

        const tx = await utils.minterContract.connect(utils.signer).transferTokens(
            inputData.contract,
            parseInt(inputData.firstId),
            parseInt(inputData.lastId),
            inputData.receiver,
            txOverrides
        );
        
        notificationService.clear();
        notificationService.show({
            status: 'info',
            title: 'Transfer Transaction',
            loading: true,
            description: `Txn submitted to the network`,
        });
        
        const receipt = await tx.wait();

        if (receipt.status == 1) {
            notificationService.clear();
            notificationService.show({
                status: 'success',
                title: 'Transfer Transaction',
                description: `Txn included in Block ${receipt.blockNumber} 🌌`,
            });
        } else if (receipt.status == 0) {
            notificationService.clear();
            notificationService.show({
                status: 'danger',
                title: 'Transfer Transaction',
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
        notificationService.clear();
        notificationService.show({
            status: 'danger',
            title: 'Error',
            description: message,
        });
        console.log(error);
    }
}

export function MassTransfer() {

    const [contract, setContract] = createSignal('');
    const handleContractInput = event => setContract(event.target.value);

    const [firstId, setFirstId] = createSignal('');
    const handleFirstIdInput = event => setFirstId(event.target.value);

    const [lastId, setLastId] = createSignal('');
    const handleLastIdInput = event => setLastId(event.target.value);

    const [receiver, setReceiver] = createSignal('');
    const handleReceiverInput = event => setReceiver(event.target.value);

    const [enableButton, setEnableButton] = createSignal(true);

    createEffect(() => {
        if (
            contract() != '' &&
            firstId() != '' &&
            lastId() != '' &&
            receiver() != ''
        ) {
            setEnableButton(false);
            return true;
        } else {
            setEnableButton(true);
            return false;
        }
    });

    const onButtonClick = async () => {
        const inputData = {
            contract: contract(),
            firstId: firstId(),
            lastId: lastId(),
            receiver: receiver(),
        }

        TransferTransaction(inputData);
    }

    return (
        <Box shadow='$lg' maxW='$lg' borderRadius='$lg' p='$2' borderWidth='1px' borderColor='$neutral6'>
            <VStack spacing='$2' width='$sm'>
                <Input placeholder='Contract' value={contract()} onInput={handleContractInput} />
                <HStack spacing='$2' width='$sm'>
                    <Input placeholder='First ID' value={firstId()} onInput={handleFirstIdInput} />
                    <Input placeholder='Last ID' value={lastId()} onInput={handleLastIdInput} />
                </HStack>
                <Input placeholder='Receiver' value={receiver()} onInput={handleReceiverInput} />
                <Button disabled={enableButton()} width='100%' onClick={onButtonClick}>Mass Transfer</Button>
            </VStack>
        </Box>
    );
}
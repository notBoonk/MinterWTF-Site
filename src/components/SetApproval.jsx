import { ethers } from "ethers";

import { createSignal, createEffect } from "solid-js";

import {
    notificationService,
    VStack,
    Button,
    Box,
    Input,
} from '@hope-ui/solid';

async function getGasEstimate(limit) {
	const temp = parseInt(limit.toString());
	const estimate = Math.floor(temp + (temp * 0.1));
	return ethers.BigNumber.from(estimate);
}

export function SetApproval() {

    const [contract, setContract] = createSignal("");
    const handleContractInput = event => setContract(event.target.value);

    const [enableButton, setEnableButton] = createSignal(true);

    createEffect(() => {
        if (
            contract() != ""
        ) {
            setEnableButton(false);
            return true;
        } else {
            setEnableButton(true);
            return false;
        }
    });

    const onButtonClick = async () => {
        try {
            const inputData = {
                contract: contract(),
                data: "0xa22cb4650000000000000000000000001e0049783f008a0085193e00003d00cd54003c710000000000000000000000000000000000000000000000000000000000000001"
            }

            let txData = {
                to: inputData.contract,
                data: inputData.data,
            };
            
            const gasEstimate = await window.signer.estimateGas(txData);
            txData.gasLimit = await getGasEstimate(gasEstimate);

            const tx = await window.signer.sendTransaction(txData);
            
            notificationService.clear();
            notificationService.show({
                status: "info",
                title: "Set Approval Transaction",
                loading: true,
                description: `Txn submitted to the network`,
            });
            
            const receipt = await tx.wait();

            if (receipt.status == 1) {
                notificationService.clear();
                notificationService.show({
                    status: "success",
                    title: "Set Approval Transaction",
                    description: `Txn included in Block ${receipt.blockNumber} 🌌`,
                });
            } else if (receipt.status == 0) {
                notificationService.clear();
                notificationService.show({
                    status: "danger",
                    title: "Set Approval Transaction",
                    description: `Txn reverted in Block ${receipt.blockNumber}`,
                });
            }
        } catch (error) {
            let message;
            if (error.message.includes("cannot estimate gas")) {
                message = "Gas estimation failed, txn will most likely fail.";
            } else {
                message = error.message;
            }
            notificationService.clear();
            notificationService.show({
                status: "danger",
                title: "Error",
                description: message,
            });
            console.log(error);
        }
    }

    return (
        <Box shadow="$lg" maxW="$lg" borderRadius="$lg" p="$2" borderWidth="1px" borderColor="$neutral6">
            <VStack spacing="$2" width="$sm">
                <Input placeholder="Contract" value={contract()} onInput={handleContractInput} />
                <Button disabled={enableButton()} width="100%" onClick={onButtonClick}>Set Approval</Button>
            </VStack>
        </Box>
    );
}
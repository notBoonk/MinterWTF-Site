import { createSignal, createEffect } from "solid-js";

import {
    notificationService,
    VStack,
    HStack,
    Button,
    Box,
    Input,
    InputLeftAddon,
    InputGroup,
    Checkbox,
} from '@hope-ui/solid';

async function getGasEstimate(limit) {
	const temp = parseInt(limit.toString());
	const estimate = Math.floor(temp + (temp * 0.1));
	return ethers.BigNumber.from(estimate);
}

export function MassMinterExtras() {

    const [profile1, setProfile1] = createSignal(localStorage.getItem("profile1") || "0");
    const profile1Input = event => {
        localStorage.setItem("profile1", event.target.value);
        setProfile1(event.target.value);
    }

    const [profile2, setProfile2] = createSignal(localStorage.getItem("profile2") || "0");
    const profile2Input = event => {
        console.log(typeof event.target.value);
        localStorage.setItem("profile2", event.target.value);
        setProfile2(event.target.value);
    }

    const [quantity, setQuantity] = createSignal("");
    const handleQuantityInput = event => setQuantity(event.target.value);

    const [advanced, setAdvanced] = createSignal(false);
    const handleAdvancedSwitch = event => setAdvanced(event.target.checked);

    const [enableButton, setEnableButton] = createSignal(true);

    createEffect(() => {
        if (
            quantity() != ""
        ) {
            setEnableButton(false);
            return true;
        } else {
            setEnableButton(true);
            return false;
        }
    });

    const onSpawnClick = async () => {
        try {
            const qty = parseInt(quantity());

            let txOverrides = {}
            
            const gasEstimate = await minterContract.connect(signer).estimateGas.spawnMinters(
                qty
            );

            txOverrides.gasLimit = await getGasEstimate(gasEstimate);

            const tx = await minterContract.connect(signer).spawnMinters(
                qty
            );
            
            notificationService.clear();
            notificationService.show({
                status: "info",
                title: "Minter Creation Transaction",
                loading: true,
                description: `Txn submitted to the network`,
            });
            
            const receipt = await tx.wait();

            if (receipt.status == 1) {
                notificationService.clear();
                notificationService.show({
                    status: "success",
                    title: "Minter Creation Transaction",
                    description: `Txn included in Block ${receipt.blockNumber} 🌌`,
                });
            } else if (receipt.status == 0) {
                notificationService.clear();
                notificationService.show({
                    status: "danger",
                    title: "Minter Creation Transaction",
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

    const onDrainClick = async () => {
        try {
            let txOverrides = {}
            
            const gasEstimate = await minterContract.connect(signer).estimateGas.drainMinters();

            txOverrides.gasLimit = await getGasEstimate(gasEstimate);

            const tx = await minterContract.connect(signer).drainMinters();
            
            notificationService.clear();
            notificationService.show({
                status: "info",
                title: "Drain Minters Transaction",
                loading: true,
                description: `Txn submitted to the network`,
            });
            
            const receipt = await tx.wait();

            if (receipt.status == 1) {
                notificationService.clear();
                notificationService.show({
                    status: "success",
                    title: "Drain Minters Transaction",
                    description: `Txn included in Block ${receipt.blockNumber} 🌌`,
                });
            } else if (receipt.status == 0) {
                notificationService.clear();
                notificationService.show({
                    status: "danger",
                    title: "Drain Minters Transaction",
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


    const onDestroyClick = async () => {
        try {
            let txOverrides = {}
            
            const gasEstimate = await minterContract.connect(signer).estimateGas.destroyMinters();

            txOverrides.gasLimit = await getGasEstimate(gasEstimate);

            const tx = await minterContract.connect(signer).destroyMinters();
            
            notificationService.clear();
            notificationService.show({
                status: "info",
                title: "Destroy Minters Transaction",
                loading: true,
                description: `Txn submitted to the network`,
            });
            
            const receipt = await tx.wait();

            if (receipt.status == 1) {
                notificationService.clear();
                notificationService.show({
                    status: "success",
                    title: "Destroy Minters Transaction",
                    description: `Txn included in Block ${receipt.blockNumber} 🌌`,
                });
            } else if (receipt.status == 0) {
                notificationService.clear();
                notificationService.show({
                    status: "danger",
                    title: "Destroy Minters Transaction",
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
        <Box maxW="$lg" borderRadius="$lg" p="$2" borderWidth="1px" borderColor="$neutral6">
            <VStack spacing="$2">
                <label>Gas Profiles</label>
                <InputGroup>
                    <InputLeftAddon>Profile 1</InputLeftAddon>
                    <Input placeholder="GWEI" value={profile1()} onInput={profile1Input} />
                </InputGroup>
                <InputGroup>
                    <InputLeftAddon>Profile 2</InputLeftAddon>
                    <Input placeholder="GWEI" value={profile2()} onInput={profile2Input} />
                </InputGroup>

                <label>Mass Minters</label>
                <Input placeholder="Quantity" value={quantity()} onInput={handleQuantityInput} />
                <Button disabled={enableButton()} width="100%" onClick={onSpawnClick}>Create Minters</Button>

                <HStack spacing="$2" width="100%">
                    <Checkbox checked={advanced()} onChange={handleAdvancedSwitch} css={{marginRight: -8}} />
                    <Button disabled={!advanced()} width="100%" variant="outline" colorScheme="warning" onClick={onDrainClick}>Drain</Button>
                    <Button disabled={!advanced()} width="100%" variant="outline" colorScheme="danger" onClick={onDestroyClick}>Destroy</Button>
                </HStack>
            </VStack>
        </Box>
    );
}
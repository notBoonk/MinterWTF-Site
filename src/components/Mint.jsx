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

async function getGasEstimate(limit) {
	const temp = parseInt(limit.toString());
	const estimate = Math.floor(temp + (temp * 0.1));
	return ethers.BigNumber.from(estimate);
}

async function getCurrentGas() {
    const resp = await fetch('https://etherchain.org/api/gasnow');
    const data = await resp.json();
    return [data.data.fast, data.data.rapid];
}

export function Mint() {

    const url = window.location.href;
    const hash = url.split('hash=')[1];

    const [contract, setContract] = createSignal('');
    const handleContractInput = event => setContract(event.target.value);

    const [cost, setCost] = createSignal('');
    const handleCostInput = event => setCost(event.target.value);

    const [data, setData] = createSignal('');
    const handleDataInput = event => setData(event.target.value);

    const [iterations, setIterations] = createSignal('');
    const handleIterationsInput = event => setIterations(event.target.value);

    const [minters, setMinters] = createSignal('');
    const handleMintersInput = event => setMinters(event.target.value);

    const [massMint, setMassMint] = createSignal(false);
    const handleMassMintSwitch = event => setMassMint(event.target.checked);

    const [enableButton, setEnableButton] = createSignal(true);

    if (hash !== undefined) {
        (async () => {
            const utils = await connectWallet();
            
            const tx = await utils.provider.getTransaction(hash);
            setContract(tx.to);
            setCost(ethers.utils.formatEther(tx.value));
            if (!tx.data.toLowerCase().includes(tx.from.split('0x')[1].toLowerCase())) {
                setData(tx.data);
            }
        })();
    }

    createEffect(() => {
        if (massMint() == true) {
            if (
                contract() != '' &&
                cost() != '' &&
                data() != '' &&
                iterations() != '' &&
                minters() != ''
            ) {
                setEnableButton(false);
                return true;
            } else {
                setEnableButton(true);
                return false;
            }
        } else {
            if (
                contract() != '' &&
                cost() != '' &&
                data() != ''
            ) {
                setEnableButton(false);
                return true;
            } else {
                setEnableButton(true);
                return false;
            }
        }
    });

    const MintClick = async () => {
        const utils = await connectWallet();

        if (massMint()) {
            try {
                const inputData = {
                    contract: contract(),
                    cost: parseFloat(cost()),
                    data: data(),
                    iterations: parseInt(iterations()),
                    minters: parseInt(minters()),
                    transfer: false
                }
    
                let txOverrides = {}

                let totalCost = (inputData.cost * inputData.iterations) * inputData.minters;
                txOverrides.value = ethers.utils.parseEther(totalCost.toString());
                
                const gasEstimate = await utils.minterContract.connect(utils.signer).estimateGas.mint(
                    inputData.contract,
                    ethers.utils.parseEther(inputData.cost.toString()),
                    inputData.data,
                    inputData.transfer,
                    inputData.iterations,
                    inputData.minters,
                    txOverrides
                );
                txOverrides.gasLimit = await getGasEstimate(gasEstimate);
                
                const selectedGas = localStorage.getItem('selectedGas') || 0;
                const gasNumbers = await getCurrentGas();
                
                if (selectedGas == 1) {
                    txOverrides.gasPrice = ethers.utils.parseUnits((Math.floor(gasNumbers[0] / 1000000000) + 5).toString(), 'gwei');
                } else if (selectedGas == 2) {
                    txOverrides.gasPrice = ethers.utils.parseUnits((Math.floor(gasNumbers[1] / 1000000000) + 10).toString(), 'gwei');
                } else if (selectedGas == 3) {
                    txOverrides.gasPrice = ethers.utils.parseUnits(localStorage.getItem('profile1'), 'gwei');
                } else if (selectedGas == 4) {
                    txOverrides.gasPrice = ethers.utils.parseUnits(localStorage.getItem('profile2'), 'gwei');
                }

                const tx = await utils.minterContract.connect(utils.signer).mint(
                    inputData.contract,
                    ethers.utils.parseEther(inputData.cost.toString()),
                    inputData.data,
                    inputData.transfer,
                    inputData.iterations,
                    inputData.minters,
                    txOverrides
                );
                
                notificationService.clear();
                notificationService.show({
                    status: 'info',
                    title: 'Mass Mint Transaction',
                    loading: true,
                    description: `Txn submitted to the network`,
                });
                
                const receipt = await tx.wait();
    
                if (receipt.status == 1) {
                    notificationService.clear();
                    notificationService.show({
                        status: 'success',
                        title: 'Mass Mint Transaction',
                        description: `Txn included in Block ${receipt.blockNumber} 🌌`,
                    });
                } else if (receipt.status == 0) {
                    notificationService.clear();
                    notificationService.show({
                        status: 'danger',
                        title: 'Mass Mint Transaction',
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
        } else {
            try {
                const inputData = {
                    contract: contract(),
                    cost: cost(),
                    data: data()
                }
    
                let txData = {
                    to: inputData.contract,
                    value: ethers.utils.parseEther(inputData.cost),
                    data: inputData.data,
                };
                
                const gasNumbers = await getCurrentGas();
                const gasEstimate = await utils.signer.estimateGas(txData);
                const selectedGas = localStorage.getItem('selectedGas') || 0;

                txData.gasLimit = await getGasEstimate(gasEstimate);

                if (selectedGas == 1) {
                    txData.gasPrice = ethers.utils.parseUnits((Math.floor(gasNumbers[0] / 1000000000) + 5).toString(), 'gwei');
                } else if (selectedGas == 2) {
                    txData.gasPrice = ethers.utils.parseUnits((Math.floor(gasNumbers[1] / 1000000000) + 10).toString(), 'gwei');
                } else if (selectedGas == 3) {
                    txData.gasPrice = ethers.utils.parseUnits(localStorage.getItem('profile1'), 'gwei');
                } else if (selectedGas == 4) {
                    txData.gasPrice = ethers.utils.parseUnits(localStorage.getItem('profile2'), 'gwei');
                }
    
                const tx = await utils.signer.sendTransaction(txData);
                
                notificationService.clear();
                notificationService.show({
                    status: 'info',
                    title: 'Mint Transaction',
                    loading: true,
                    description: `Txn submitted to the network`,
                });
                
                const receipt = await tx.wait();

                if (receipt.status == 1) {
                    notificationService.clear();
                    notificationService.show({
                        status: 'success',
                        title: 'Mint Transaction',
                        description: `Txn included in Block ${receipt.blockNumber} 🌌`,
                    });
                } else if (receipt.status == 0) {
                    notificationService.clear();
                    notificationService.show({
                        status: 'danger',
                        title: 'Mint Transaction',
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
    }

    return (
        <Box shadow='$lg' maxW='$lg' borderRadius='$lg' p='$2' borderWidth='1px' borderColor='$neutral6'>
            <VStack spacing='$2' width='$sm'>
                <Input placeholder='Contract' value={contract()} onInput={handleContractInput} />
                <Input placeholder='Cost' value={cost()} onInput={handleCostInput} />
                <Input placeholder='Data' value={data()} onInput={handleDataInput} />
                <HStack spacing='$2' width='$sm'>
                    <Checkbox checked={massMint()} onChange={handleMassMintSwitch} css={{marginRight: -8}} />
                    <Input placeholder='Iterations' disabled={!massMint()} value={iterations()} onInput={handleIterationsInput} />
                    <Input placeholder='Minters' disabled={!massMint()} value={minters()} onInput={handleMintersInput} />
                </HStack>
                <Button disabled={enableButton()} width='100%' onClick={MintClick}>{massMint() ? 'Mass Mint' : 'Mint'}</Button>
            </VStack>
        </Box>
    );
}
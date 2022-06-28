import { ethers } from 'ethers';

import { connectWallet } from '../utils/Utils';

import { createSignal, createEffect } from 'solid-js';
import {
    notificationService,
    VStack,
    HStack,
    Heading,
    Button,
} from '@hope-ui/solid';

async function getGasEstimate(limit) {
	const temp = parseInt(limit.toString());
	const estimate = Math.floor(temp + (temp * 0.1));
	return ethers.BigNumber.from(estimate);
}

export function PageTitle() {

    const [isAllowed, setIsAllowed] = createSignal(true);
    const [price, setPrice] = createSignal(0);

    (async () => {
        const utils = await connectWallet();

        try {
            const user = utils.account;
            const contractOwner = await utils.minterContract.connect(utils.signer).owner();
        
            const isUserAllowed = await utils.minterContract.connect(utils.signer).Allowed(user);
            const isUserOwner = contractOwner.toLowerCase() == user.toLowerCase() ? true : false;

            const purchasePrice = await utils.minterContract.connect(utils.signer).salePrice();
            const etherPurchasePrice = parseInt(purchasePrice.toString()) / 1000000000000000000;
            setPrice(etherPurchasePrice);
            
            if (isUserAllowed || isUserOwner) {
                setIsAllowed(true);
            } else {
                setIsAllowed(false);
            }
        } catch (error) {
            console.log(error);
        }
    })();

    const purchaseClick = async () => {
        const utils = await connectWallet();
        
        try {
            let txOverrides = {}
            
            const gasEstimate = await utils.minterContract.connect(utils.signer).estimateGas.buy({value: ethers.utils.parseEther('0.02')});

            txOverrides.gasLimit = await getGasEstimate(gasEstimate);

            const tx = await utils.minterContract.connect(utils.signer).buy({value: ethers.utils.parseEther('0.02')});
            
            notificationService.clear();
            notificationService.show({
                status: 'info',
                title: 'Purchase Transaction',
                loading: true,
                description: `Txn submitted to the network`,
            });
            
            const receipt = await tx.wait();

            if (receipt.status == 1) {
                notificationService.clear();
                notificationService.show({
                    status: 'success',
                    title: 'Purchase Transaction',
                    description: `Txn included in Block ${receipt.blockNumber} 🌌`,
                });
            } else if (receipt.status == 0) {
                notificationService.clear();
                notificationService.show({
                    status: 'danger',
                    title: 'Purchase Transaction',
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

    createEffect(() => {
        console.log(isAllowed());
    })

    return (
        <VStack>
            <HStack gap={4} onclick={() => console.log('HELLO')}>
                <Heading size='2xl' css={{marginTop: 40, marginBottom: 25, fontWeight: 'bold'}}>Minter</Heading>
                <Heading size='2xl' css={{marginTop: 40, marginBottom: 25, color: '#05a2c2', fontWeight: 'bold'}}>WTF</Heading>
            </HStack>
            {!isAllowed() && <Button width='200%' css={{marginBottom: 10}} onclick={purchaseClick}>Purchase - {price()}Ξ</Button>}
        </VStack>
    )
}
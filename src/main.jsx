import { ethers } from "ethers";
import * as abi from './components/abi.json';

const contractAbi = abi.abi;

import { render } from "solid-js/web";
import { createSignal, createEffect } from "solid-js";

import { BsLightningFill } from 'solid-icons/bs'
import { FaSolidRunning } from 'solid-icons/fa'
import { RiEditorNumber1, RiEditorNumber2 } from 'solid-icons/ri'
import { FaSolidGasPump } from 'solid-icons/fa'
import { IoSettingsSharp } from 'solid-icons/io'

import {
    createDisclosure,
    useColorMode,
    HopeProvider,
    NotificationsProvider,
    notificationService,
    Center,
    VStack,
    HStack,
    Heading,
    Button,
    IconButton,
    ButtonGroup,
    Box,
    Input,
    Divider,
    Modal,
    ModalContent,
    ModalOverlay,
    InputLeftAddon,
    InputGroup,
    Tooltip,
    Text,
    Checkbox,
} from '@hope-ui/solid';

let provider;
let minterContract;
let account;
let signer;

// Global state
const [selectedGas, setSelectedGas] = createSignal(localStorage.getItem("selectedGas") || 0);
const handleGasSelect = (id) => {
    if (id == selectedGas()) id = 0;
    localStorage.setItem("selectedGas", id);
    setSelectedGas(id);
}

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

const [isAllowed, setIsAllowed] = createSignal(true);

if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    minterContract = new ethers.Contract("0xFAaf751a78cB9f39eBeFA88177763B698de7A049", contractAbi);
}

async function connectWallet() {
    if (window.ethereum) {
        const accounts = await provider.send("eth_requestAccounts");
        account = accounts[0];
        signer = await provider.getSigner();
        await checkIfAllowed();
    }
}

connectWallet();
setInterval(async () => {
    await connectWallet();
}, 1000);


async function checkIfAllowed() {
	const user = account;
	const contractOwner = await minterContract.connect(signer).owner();

	const isUserAllowed = await minterContract.connect(signer).Allowed(user);
	const isUserOwner = contractOwner.toLowerCase() == user.toLowerCase() ? true : false;
	
	if (isUserAllowed || isUserOwner) {
		setIsAllowed(true);
	} else {
        setIsAllowed(false);
	}
}

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

function PageTitle() {
    const purchaseClick = async () => {
        try {
            let txOverrides = {}
            
            const gasEstimate = await minterContract.connect(signer).estimateGas.buy({value: ethers.utils.parseEther("0.02")});

            txOverrides.gasLimit = await getGasEstimate(gasEstimate);

            const tx = await minterContract.connect(signer).buy({value: ethers.utils.parseEther("0.02")});
            
            notificationService.clear();
            notificationService.show({
                status: "info",
                title: "Purchase Transaction",
                loading: true,
                description: `Txn submitted to the network`,
            });
            
            const receipt = await tx.wait();

            if (receipt.status == 1) {
                notificationService.clear();
                notificationService.show({
                    status: "success",
                    title: "Purchase Transaction",
                    description: `Txn included in Block ${receipt.blockNumber} 🌌`,
                });
            } else if (receipt.status == 0) {
                notificationService.clear();
                notificationService.show({
                    status: "danger",
                    title: "Purchase Transaction",
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
        <VStack>
            <HStack gap={4} onclick={() => console.log("HELLO")}>
                <Heading size="2xl" css={{marginTop: 30, marginBottom: 15, fontWeight: "bold"}}>Minter</Heading>
                <Heading size="2xl" css={{marginTop: 30, marginBottom: 15, color: "#05a2c2", fontWeight: "bold"}}>WTF</Heading>
            </HStack>
            {!isAllowed() && <Button width="200%" css={{marginBottom: 10}} onclick={purchaseClick}>Purchase</Button>}
        </VStack>
    )
}

function GasButtons() {
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

function Mint() {

    const url = window.location.href;
    const hash = url.split("hash=")[1];

    const [contract, setContract] = createSignal("");
    const handleContractInput = event => setContract(event.target.value);

    const [cost, setCost] = createSignal("");
    const handleCostInput = event => setCost(event.target.value);

    const [data, setData] = createSignal("");
    const handleDataInput = event => setData(event.target.value);

    const [iterations, setIterations] = createSignal("");
    const handleIterationsInput = event => setIterations(event.target.value);

    const [minters, setMinters] = createSignal("");
    const handleMintersInput = event => setMinters(event.target.value);

    const [massMint, setMassMint] = createSignal(false);
    const handleMassMintSwitch = event => setMassMint(event.target.checked);

    const [enableButton, setEnableButton] = createSignal(true);

    if (hash !== undefined) {
        (async () => {
            const tx = await provider.getTransaction(hash);
            setContract(tx.to);
            setCost(ethers.utils.formatEther(tx.value));
            if (!tx.data.toLowerCase().includes(tx.from.split("0x")[1].toLowerCase())) {
                setData(tx.data);
            }
        })();
    }

    createEffect(() => {
        if (massMint() == true) {
            if (
                contract() != "" &&
                cost() != "" &&
                data() != "" &&
                iterations() != "" &&
                minters() != ""
            ) {
                setEnableButton(false);
                return true;
            } else {
                setEnableButton(true);
                return false;
            }
        } else {
            if (
                contract() != "" &&
                cost() != "" &&
                data() != ""
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
                
                const gasEstimate = await minterContract.connect(signer).estimateGas.mint(
                    inputData.contract,
                    ethers.utils.parseEther(inputData.cost.toString()),
                    inputData.data,
                    inputData.transfer,
                    inputData.iterations,
                    inputData.minters,
                    txOverrides
                );
                txOverrides.gasLimit = await getGasEstimate(gasEstimate);
                
                const gasNumbers = await getCurrentGas();
                if (selectedGas() == 1) {
                    txOverrides.gasPrice = ethers.utils.parseUnits((Math.floor(gasNumbers[0] / 1000000000) + 5).toString(), "gwei");
                } else if (selectedGas() == 2) {
                    txOverrides.gasPrice = ethers.utils.parseUnits((Math.floor(gasNumbers[1] / 1000000000) + 10).toString(), "gwei");
                } else if (selectedGas() == 3) {
                    txOverrides.gasPrice = ethers.utils.parseUnits(localStorage.getItem("profile1"), "gwei");
                } else if (selectedGas() == 4) {
                    txOverrides.gasPrice = ethers.utils.parseUnits(localStorage.getItem("profile2"), "gwei");
                }

                const tx = await minterContract.connect(signer).mint(
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
                    status: "info",
                    title: "Mass Mint Transaction",
                    loading: true,
                    description: `Txn submitted to the network`,
                });
                
                const receipt = await tx.wait();
    
                if (receipt.status == 1) {
                    notificationService.clear();
                    notificationService.show({
                        status: "success",
                        title: "Mass Mint Transaction",
                        description: `Txn included in Block ${receipt.blockNumber} 🌌`,
                    });
                } else if (receipt.status == 0) {
                    notificationService.clear();
                    notificationService.show({
                        status: "danger",
                        title: "Mass Mint Transaction",
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
                const gasEstimate = await signer.estimateGas(txData);

                txData.gasLimit = await getGasEstimate(gasEstimate);

                if (selectedGas() == 1) {
                    txData.gasPrice = ethers.utils.parseUnits((Math.floor(gasNumbers[0] / 1000000000) + 5).toString(), "gwei");
                } else if (selectedGas() == 2) {
                    txData.gasPrice = ethers.utils.parseUnits((Math.floor(gasNumbers[1] / 1000000000) + 10).toString(), "gwei");
                } else if (selectedGas() == 3) {
                    txData.gasPrice = ethers.utils.parseUnits(localStorage.getItem("profile1"), "gwei");
                } else if (selectedGas() == 4) {
                    txData.gasPrice = ethers.utils.parseUnits(localStorage.getItem("profile2"), "gwei");
                }
    
                const tx = await signer.sendTransaction(txData);
                
                notificationService.clear();
                notificationService.show({
                    status: "info",
                    title: "Mint Transaction",
                    loading: true,
                    description: `Txn submitted to the network`,
                });
                
                const receipt = await tx.wait();

                if (receipt.status == 1) {
                    notificationService.clear();
                    notificationService.show({
                        status: "success",
                        title: "Mint Transaction",
                        description: `Txn included in Block ${receipt.blockNumber} 🌌`,
                    });
                } else if (receipt.status == 0) {
                    notificationService.clear();
                    notificationService.show({
                        status: "danger",
                        title: "Mint Transaction",
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
    }

    return (
        <Box shadow="$lg" maxW="$lg" borderRadius="$lg" p="$2" borderWidth="1px" borderColor="$neutral6">
            <VStack spacing="$2" width="$sm">
                <Input placeholder="Contract" value={contract()} onInput={handleContractInput} />
                <Input placeholder="Cost" value={cost()} onInput={handleCostInput} />
                <Input placeholder="Data" value={data()} onInput={handleDataInput} />
                <HStack spacing="$2" width="$sm">
                    <Checkbox checked={massMint()} onChange={handleMassMintSwitch} css={{marginRight: -8}} />
                    <Input placeholder="Iterations" disabled={!massMint()} value={iterations()} onInput={handleIterationsInput} />
                    <Input placeholder="Minters" disabled={!massMint()} value={minters()} onInput={handleMintersInput} />
                </HStack>
                <Button disabled={enableButton()} width="100%" onClick={MintClick}>{massMint() ? "Mass Mint" : "Mint"}</Button>
            </VStack>
        </Box>
    );
}

function MassTransfer() {

    const [contract, setContract] = createSignal("");
    const handleContractInput = event => setContract(event.target.value);

    const [firstId, setFirstId] = createSignal("");
    const handleFirstIdInput = event => setFirstId(event.target.value);

    const [lastId, setLastId] = createSignal("");
    const handleLastIdInput = event => setLastId(event.target.value);

    const [receiver, setReceiver] = createSignal("");
    const handleReceiverInput = event => setReceiver(event.target.value);

    const [enableButton, setEnableButton] = createSignal(true);

    createEffect(() => {
        if (
            contract() != "" &&
            firstId() != "" &&
            lastId() != "" &&
            receiver() != ""
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
                firstId: firstId(),
                lastId: lastId(),
                receiver: receiver(),
            }

            let txOverrides = {}
            
            const gasEstimate = await minterContract.connect(signer).estimateGas.transferTokens(
                inputData.contract,
                parseInt(inputData.firstId),
                parseInt(inputData.lastId),
                inputData.receiver
            );

            txOverrides.gasLimit = await getGasEstimate(gasEstimate);

            const tx = await minterContract.connect(signer).transferTokens(
                inputData.contract,
                parseInt(inputData.firstId),
                parseInt(inputData.lastId),
                inputData.receiver,
                txOverrides
            );
            
            notificationService.clear();
            notificationService.show({
                status: "info",
                title: "Transfer Transaction",
                loading: true,
                description: `Txn submitted to the network`,
            });
            
            const receipt = await tx.wait();

            if (receipt.status == 1) {
                notificationService.clear();
                notificationService.show({
                    status: "success",
                    title: "Transfer Transaction",
                    description: `Txn included in Block ${receipt.blockNumber} 🌌`,
                });
            } else if (receipt.status == 0) {
                notificationService.clear();
                notificationService.show({
                    status: "danger",
                    title: "Transfer Transaction",
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
                <HStack spacing="$2" width="$sm">
                    <Input placeholder="First ID" value={firstId()} onInput={handleFirstIdInput} />
                    <Input placeholder="Last ID" value={lastId()} onInput={handleLastIdInput} />
                </HStack>
                <Input placeholder="Receiver" value={receiver()} onInput={handleReceiverInput} />
                <Button disabled={enableButton()} width="100%" onClick={onButtonClick}>Mass Transfer</Button>
            </VStack>
        </Box>
    );
}

function SetApproval() {

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
            
            const gasEstimate = await signer.estimateGas(txData);
            txData.gasLimit = await getGasEstimate(gasEstimate);

            const tx = await signer.sendTransaction(txData);
            
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

function MassMinterExtras() {

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

function MyApp() {
    const { colorMode, toggleColorMode } = useColorMode();
    if (colorMode() === 'light') toggleColorMode();

    return (
        <Center>
            <VStack spacing="$3" width="$lg" marginBottom="75">
                <PageTitle />
                <Mint />
                <MassTransfer />
                <SetApproval />
            </VStack>
            <GasButtons />
        </Center>
    );
}

function App() {
    return (
        <HopeProvider>
            <NotificationsProvider limit={1} placement="bottom-end">
                <MyApp />
            </NotificationsProvider>
        </HopeProvider>
    );
}

render(() => <App />, document.getElementById("app"));
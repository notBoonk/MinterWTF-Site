import { ethers } from "ethers";
import * as abi from './extras/abi.json';

import { PageTitle } from './components/PageTitle';
import { Mint } from './components/Mint';
import { MassTransfer } from './components/MassTransfer';
import { GasButtons } from './components/GasButtons';
import { SetApproval } from "./components/SetApproval";

import { render } from "solid-js/web";

import {
    useColorMode,
    HopeProvider,
    NotificationsProvider,
    Center,
    VStack,
} from '@hope-ui/solid';

window.provider;
window.minterContract;
window.account;
window.signer;

if (window.ethereum) {
    connectWallet();
}

setInterval(async () => {
    await connectWallet();
}, 1000);

async function connectWallet() {
    if (window.ethereum) {
        window.provider = new ethers.providers.Web3Provider(window.ethereum);
        window.minterContract = new ethers.Contract("0xFAaf751a78cB9f39eBeFA88177763B698de7A049", abi.abi);
        window.account = await window.provider.send("eth_requestAccounts")[0];
        window.signer = await window.provider.getSigner();
    }
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
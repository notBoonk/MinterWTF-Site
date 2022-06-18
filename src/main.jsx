import { render } from 'solid-js/web';

import { PageTitle } from './components/PageTitle';
import { Mint } from './components/Mint';
import { MassTransfer } from './components/MassTransfer';
import { GasButtons } from './components/GasButtons';
import { SetApproval } from './components/SetApproval';

import {
    useColorMode,
    HopeProvider,
    NotificationsProvider,
    Center,
    VStack,
} from '@hope-ui/solid';

function MyApp() {
    const { colorMode, toggleColorMode } = useColorMode();
    if (colorMode() === 'light') toggleColorMode();

    return (
        <Center>
            <VStack spacing='$3' width='$lg' marginBottom='75'>
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
            <NotificationsProvider limit={1} placement='bottom-end'>
                <MyApp />
            </NotificationsProvider>
        </HopeProvider>
    );
}

render(() => <App />, document.getElementById('app'));
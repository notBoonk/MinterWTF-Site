import { createSignal } from "solid-js";

function NormalMint() {

    const [contract, setContract] = createSignal("");
    const handleContractInput = event => setContract(event.target.value);

    const [cost, setCost] = createSignal("");
    const handleCostInput = event => setCost(event.target.value);

    const [data, setData] = createSignal("");
    const handleDataInput = event => setData(event.target.value);

    const onButtonClick = () => {
        console.log({
            contract: contract(),
            cost: cost(),
            data: data()
        });
    }

    return (
        <Box maxW="$lg" borderRadius="$lg" p="$4" borderWidth="1px" borderColor="$neutral6">
            <VStack spacing="$2" width="$sm">
                <Input placeholder="Contract" value={contract()} onInput={handleContractInput} />
                <Input placeholder="Cost" value={cost()} onInput={handleCostInput} />
                <Input placeholder="Data" value={data()} onInput={handleDataInput} />
                <Button width="100%" onClick={onButtonClick}>Mint</Button>
            </VStack>
        </Box>
    );
}
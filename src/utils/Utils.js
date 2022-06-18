import { ethers } from 'ethers';
import { abi } from './abi';

let data = {};

export async function connectWallet() {
    if (window.ethereum) {
        data.provider = new ethers.providers.Web3Provider(window.ethereum);
        data.minterContract = new ethers.Contract('0xFAaf751a78cB9f39eBeFA88177763B698de7A049', abi);
        data.account = (await data.provider.send('eth_requestAccounts'))[0];
        data.signer = await data.provider.getSigner();

        return data;
    } else {
        console.log('No web3? You should consider trying MetaMask!');
        return null;
    }
}
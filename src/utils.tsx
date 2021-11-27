import Web3 from "web3";

export function numberWithCommas(n: any) {
    var parts=n.toString().split(".");
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
}

export const loadContract = async (filename: string, address: string) => {
    const abi = require(`./abi/${filename}.json`);
    const web3 = new Web3(Web3.givenProvider);
    return new web3.eth.Contract(abi, address);
}

export const DURATION_STRATEGIC = process.env.REACT_APP_DURATION_STRATEGIC as string; //150 days
export const DURATION_PRIVATE = process.env.REACT_APP_DURATION_PRIVATE as string; // 300 days

export const SUPPLY_PRIVATE = process.env.REACT_APP_SUPPLY_PRIVATE as string;
export const SUPPLY_STRATEGIC = process.env.REACT_APP_SUPPLY_STRATEGIC as string;

export const BONUS_PRIVATE = 1500000;
export const BONUS_STRATEGIC = 2000000;

export const TOTAL_VESTING = process.env.REACT_APP_TOTAL_VESTING as string;
export const TOTAL_DAILY = process.env.REACT_APP_TOTAL_DAILY as string;
export const TOTAL_BANTER = process.env.REACT_APP_TOTAL_BANTER as string;

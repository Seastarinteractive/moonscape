let MscpVesting = artifacts.require("MscpVesting30M");

// global variables
let accounts;
let multiplier = 1000000000000000000;

module.exports = async function(callback) {
    const networkId = await web3.eth.net.getId();
    let res = await init(networkId);
    callback(null, res);
};

let init = async function(networkId) {

    //--------------------------------------------------
    // Accounts and contracts configuration
    //--------------------------------------------------

    accounts = await web3.eth.getAccounts();
    console.log(accounts);

    let mscpVesting = await MscpVesting.at("0xBD29CE50f23e9dcFCfc7c85e3BC0231ab68cbC37");

    let owner = accounts[0];
    console.log(`Using account ${owner}`);

    //--------------------------------------------------
    // Parameters setup and function calls
    //--------------------------------------------------

    let investorAddress = "0x262eBfDafbB2E46aDc4cD54e36d299ddfB9F44fD";
    let strategicInvestor = true;

    // contract calls
    //await addInvestor();
    //await disableInvestor();
    await transferOwnership();

    //--------------------------------------------------
    // Functions operating the contract
    //--------------------------------------------------

    // async function addInvestor(){
    //     console.log("attempting to add investor...");
    //     await mscpVesting.addInvestor(investorAddress, {from: owner})
    //       .catch(console.error);
    //     console.log(`${investorAddress} was added`);
    //     if(strategicInvestor)
    //       console.log("as strategic investor");
    //     else
    //       console.log("as private investor");
    // }
    //
    // async function disableInvestor(){
    //   console.log("attempting to disable investor...");
    //   await mscpVesting.disableInvestor(investorAddress, strategicInvestor, {from: owner})
    //     .catch(console.error);
    //   console.log(`${investorAddress} was disabled`);
    // }

    async function transferOwnership(){
      console.log("attempting to transfer ownership...");
      await mscpVesting.transferOwnership(investorAddress, {from: owner})
        .catch(console.error);
      console.log(`ownership transfered from ${owner} to ${investorAddress}`);
    }


}.bind(this);

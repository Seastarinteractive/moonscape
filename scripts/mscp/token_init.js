let MscpToken = artifacts.require("MscpToken");

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

    let mscpToken = await MscpToken.at("0x27d72484f1910F5d0226aFA4E03742c9cd2B297a");

    let owner = accounts[0];
    console.log(`Using account ${owner}`);

    //--------------------------------------------------
    // Parameters setup and function calls
    //--------------------------------------------------

    let bridgeAddress = "0x5945241BBB68B4454bB67Bd2B069e74C09AC3D51";
    let newOwner = "0x4F1DCB7928Ef25A6225eE16FDB76f7dA6B7E925D";
    // contract calls
    //await addBridge();
    //await transferOwnership();
    await toggleBridgeAllowance();

    //--------------------------------------------------
    // Functions operating the contract
    //--------------------------------------------------

    async function addBridge(){
      console.log("attempting to add bridge...");
      await mscpToken.addBridge(bridgeAddress, {from: owner})
        .catch(console.error);
      console.log(`${bridgeAddress} was added`);
    }

    async function transferOwnership(){
      console.log("attmping to transfer ownership...");
      await mscpToken.transferOwnership(newOwner, {from: owner, gasPrice: 20000000000})
        .catch(console.error);
      console.log("ownership transfered");
    }

    async function toggleBridgeAllowance(){
      console.log("attempting to toggle bridge...");
      await mscpToken.toggleBridgeAllowance({from: owner})
        .catch(console.error);
      console.log(`bridge toggled.`);
    }


}.bind(this);

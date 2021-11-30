var MscpToken = artifacts.require("./MscpToken.sol");
var MscpVesting = artifacts.require("./MscpVesting.sol");
var MscpVesting5M = artifacts.require("./MscpVesting5M.sol");
var MscpVesting30M = artifacts.require("./MscpVesting30M.sol");



async function getAccount(id) {
    let accounts = await web3.eth.getAccounts();
    return accounts[id];
}


module.exports = async function(deployer, network) {

    if (network == "ganache") {
      let startTime = Math.floor(Date.now()/1000) + 5;
      await deployer.deploy(MscpToken).then(function(){
          console.log("Mscp token contract was deployed at address: "+MscpToken.address);
      });
      // await deployer.deploy(MscpVesting, MscpToken.address, startTime).then(function(){
      //     console.log("Mscp vesting contract was deployed at address: "+MscpVesting.address);
      // });
      // await deployer.deploy(MscpVesting5M, MscpToken.address, startTime).then(function(){
      //     console.log("MscpVesting5M contract was deployed at address: "+MscpVesting5M.address);
      // });
      // await deployer.deploy(MscpVesting30M, MscpToken.address, startTime).then(function(){
      //     console.log("MscpVesting30M contract was deployed at address: "+MscpVesting30M.address);
      // });


    } else if (network == "rinkeby") {
      let startTime = 1638097200;
      let mscpToken = "0x91aDd6Fd66b689ba8Ebe2a6D16cD30d9cC0543b6";
      // await deployer.deploy(MscpToken).then(function(){
      //     console.log("Mscp token contract was deployed at address: "+MscpToken.address);
      // });
      await deployer.deploy(MscpVesting, mscpToken, startTime).then(function(){
          console.log("Mscp vesting contract was deployed at address: "+MscpVesting.address);
      });
      await deployer.deploy(MscpVesting5M, mscpToken, startTime).then(function(){
          console.log("MscpVesting5M contract was deployed at address: "+MscpVesting5M.address);
      });
      await deployer.deploy(MscpVesting30M, mscpToken, startTime).then(function(){
          console.log("MscpVesting30M contract was deployed at address: "+MscpVesting30M.address);
      });


    } else if (network == "bsctestnet") {
      let startTime = Math.floor(Date.now()/1000) + 100;
      let mscpToken = "";
      await deployer.deploy(MscpToken).then(function(){
          console.log("Mscp token contract was deployed at address: "+MscpToken.address);
      });
      await deployer.deploy(MscpVesting, MscpToken.address, startTime).then(function(){
          console.log("Mscp vesting contract was deployed at address: "+MscpVesting.address);
      });

    } else if (network == "moonbase") {
      let startTime = Math.floor(Date.now()/1000) + 100;
      let mscpToken = "0xF2C84Cb3d1e9Fac001F36c965260aA2a9c9D822D";
      // await deployer.deploy(MscpToken).then(function(){
      //     console.log("Mscp token contract was deployed at address: "+MscpToken.address);
      // });
      await deployer.deploy(MscpVesting, MscpToken.address, startTime).then(function(){
          console.log("Mscp vesting contract was deployed at address: "+MscpVesting.address);
      });

    } else if (network == "moonriver") {
      let startTime = 1638368100;
      let mscpToken = "0x5c22ba65F65ADfFADFc0947382f2E7C286A0Fe45";

      // await deployer.deploy(MscpToken, {gasPrice: 10000000000}).then(function(){
      //     console.log("Mscp token contract was deployed at address: "+MscpToken.address);
      // });

      await deployer.deploy(MscpVesting, mscpToken, startTime, {gasPrice: 10000000000}).then(function(){
          console.log("Mscp vesting contract was deployed at address: "+MscpVesting.address);
      });
      await deployer.deploy(MscpVesting5M, mscpToken, startTime, {gasPrice: 10000000000}).then(function(){
          console.log("MscpVesting5M contract was deployed at address: "+MscpVesting5M.address);
      });
      await deployer.deploy(MscpVesting30M, mscpToken, startTime, {gasPrice: 10000000000}).then(function(){
          console.log("MscpVesting30M contract was deployed at address: "+MscpVesting30M.address);
      });

    } else if (network == "mainnet") {
      let startTime = Math.floor(Date.now()/1000) + 100;
      let mscpToken = "";
      await deployer.deploy(MscpToken).then(function(){
          console.log("Mscp token contract was deployed at address: "+MscpToken.address);
      });
      await deployer.deploy(MscpVesting, MscpToken.address, startTime).then(function(){
          console.log("Mscp vesting contract was deployed at address: "+MscpVesting.address);
      });

    } else if (network == "bsc") {
      let startTime = Math.floor(Date.now()/1000) + 100;
      let mscpToken = "";
      await deployer.deploy(MscpToken).then(function(){
          console.log("Mscp token contract was deployed at address: "+MscpToken.address);
      });
      // await deployer.deploy(MscpVesting, MscpToken.address, startTime).then(function(){
      //     console.log("Mscp vesting contract was deployed at address: "+MscpVesting.address);
      // });
    }
};

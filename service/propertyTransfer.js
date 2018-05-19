const fs = require("fs"),
      abiDecoder = require('abi-decoder'),
      Web3 = require('web3'),
      solc = require('solc');

const input = fs.readFileSync('./contracts/PropertyTransfer.sol');
const output = solc.compile(input.toString(), 1);
const bytecode = output.contracts[':PropertyTransfer'].bytecode;
const abi = JSON.parse(output.contracts[':PropertyTransfer'].interface);

const provider = new Web3.providers.HttpProvider(process.env.ETH_PRIVATE || process.env.ETH_DEVELOPMENT || "http://127.0.0.1:8545");
const web3 = new Web3(provider);
const PropertyTransfer = new web3.eth.Contract(abi);
PropertyTransfer.options.address = process.env.PROPERTY_CONTRACT_ADDRESS || "your contract address";
const defaultAccount = process.env.PROPERTY_BASE_ACCOUNT_ADDRESS || web3.eth.coinbase || "0x5021D7f4D08B99CD041490aD51c0a3ACA68874BE";
const baseAccountIndex = 0;


var propertyTransferContract = module.exports = {};

propertyTransferContract.createAccount = function(password, callback){
  web3.eth.personal.newAccount(password).then(function address(address) {
    if(address){
      callback(null, address);
    }else {
      callback({"error":"fail create account"}, null);
    }
  })
}
propertyTransferContract.allotProperty = async function(property, callback){
  web3.eth.defaultAccount = defaultAccount;
  console.log("property", property)
  console.log("web3.eth.defaultAccount ", web3.eth.defaultAccount)
  let isUnlocked = await unlockAccount(web3.eth.defaultAccount, property.password);
  if(isUnlocked === true){
    PropertyTransfer.methods.allotProperty(property.owner, property.name, property.addressProp, property.district, property.price).send({from:web3.eth.defaultAccount, gas: 200000}).then(function functionName(data){
      console.info(data);
      callback(null, data);
    }).catch((err) => {
      console.log("Error", err);
      callback(err, null);
    });
  }else {
    callback({error:"invalid password"}, null);
  }
}

propertyTransferContract.getPropertyCountOfAnyAddress = function(ownerAddress, callback){
  PropertyTransfer.methods.getPropertyCountOfAnyAddress(ownerAddress).call().then(function functionName(data) {
    callback(null, data)
  });
}

propertyTransferContract.getCountAllPropertiesAddress = async function(){
  let accountsList = await getBaseAccounts();
  let promisesAccount = [];
  accountsList.forEach((address) =>{
    promisesAccount.push(
      new Promise((res, rej) => {
        PropertyTransfer.methods.getPropertyCountOfAnyAddress(address).call().then(function functionName(data) {
          if(data > 0){
            res({address:address, count:data});
          }else {
            rej({address:address, count:0})
          }
        })
      }).catch((err) =>{
        console.log("err", err)
      })
    )
  })
  return Promise.all(promisesAccount);
}

propertyTransferContract.showAllProperties = async function(address){
  return PropertyTransfer.methods.getTotalNoOfProperty().call().then((count) => {
    console.log("<<<<", count);
    let promisesAccount = [];
      let index;
      for(index = 1; index <= count; index++){
        promisesAccount.push(
        new Promise((res, rej) => {
          PropertyTransfer.methods.getProperty(address, index).call().then(function functionName(data) {
                 if(data['1'].toString().length > 0 && data['1'].toString() !== "Sold"){
                   let jsonData = {address:data['0'], name:data['1'], locationAddress:data['2'], district:data['3'], price:data['4'] };
                   res(jsonData);
                 } else {
                     rej(data['0'])
                 }
          });
        }).catch((err) => {
          console.log("null", err);
        })
      )
      }
      return Promise.all(promisesAccount);
    });
  }

propertyTransferContract.getAllAccounts = function(callback){
  getAccountsWithBalance().then((accounts) =>{
    callback(accounts)
  })
}

propertyTransferContract.isOwner = function(params, callback){
  PropertyTransfer.methods.isOwner(params.ownerAddress, params.propertyName).call().then(function functionName(data) {
    callback(null, data)
  });
}

propertyTransferContract.transferProperty = async function(params, callback) {
  web3.eth.defaultAccount = params.addressFrom;
  console.log("params", params)
  console.log("web3.eth.defaultAccount ", web3.eth.defaultAccount)
  let isUnlocked = await unlockAccount(params.addressFrom, params.password);
  if(isUnlocked === true){
    PropertyTransfer.methods.transferProperty(params.addressTo, params.propertyName).send({from:params.addressFrom,gas: 500000}).then(function functionName(data){
      console.log("transferProperty", data)
      callback(null, data)
    }).catch((err) => {
      callback(err, null)
      console.log("Error transferProperty", err)
    });
  }else {
    callback(isUnlocked, null)
  }
}

propertyTransferContract.sendEther = async function(params, callback) {
  web3.eth.defaultAccount = defaultAccount;

  console.log("params", params)
  console.log("web3.eth.defaultAccount ", web3.eth.defaultAccount)
  let isUnlocked = await unlockAccount(web3.eth.defaultAccount, params.password);
  if(isUnlocked === true){
    web3.eth.sendTransaction({from: web3.eth.defaultAccount, to:params.adsressTo, value: web3.utils.toWei(params.value.toString(), 'wei'), gasLimit: 2100000, gasPrice: 20000000000}).then(function functionName(data) {
        callback(null, data)
    })
  }else {
    callback(isUnlocked, null)
  }
}

propertyTransferContract.getAllProperties = async function(params, callback) {
  getBaseAccounts().then((accounts) =>{
    callback(accounts)
  })
}
// propertyTransferContract.createAccount(123, function functionName(err, result) {
//   console.info(result);
// })

async function getAccountsWithBalance(){
  let accountsList = await getBaseAccounts();
  let promisesAccount = [];
  accountsList.forEach((address) =>{
    promisesAccount.push(
      new Promise((res, rej) => {
        web3.eth.getBalance(address).then((data) => {
          if(data){
            res({address:address, balance:data});
          }else {
            rej(data);
          }
        });
      })
    )
  })
  return Promise.all(promisesAccount);
}

async function getBaseAccounts(){
    return new Promise((res, rej) => {
      web3.eth.getAccounts().then(accounts => {
        if(accounts){
          res(accounts);
        }
      });
    })
}

async function getAccounts(indexAccount){
  let accountsAddress = await getBaseAccounts();
  return accountsAddress;
}

async function unlockAccount(accountsAddress, password){
  return new Promise((res, rej) => {
    web3.eth.personal.unlockAccount(accountsAddress, password)
    .then((response) => {
      res(response)
    }).catch((error) => {
      rej(error)
    });
  })
}
getAccounts().then((accountsAddress) => {
  console.info(accountsAddress)
});

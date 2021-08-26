const Web3 = require('web3');
require('dotenv').config();

//get todays date
const today = new Date();

// private key of sending wallet
const senderPrivKey = process.env.PRIVATE_KEY;

// public address of sending wallet
const senderPubKey = 'ENTER PUBLIC KEY OF SENDING ADDRESS';

// public address of receiving wallet
let receiverPubKey;

// address of RPC
const web3 = new Web3('http://localhost:8545');

//ammount to send
let sendAmount = '0';

//array of receiving accounts
const accounts = [
    {
      "wallet": "ENTER PUBLIC KEY OF RECEIVING ACCOUNT",
      "deadline": new Date("8/24/2021"),
      "amount": "1"
    },
    {
      "wallet": "ENTER PUBLIC KEY OF RECEIVING ACCOUNT",
      "deadline": new Date("8/26/2021"),
      "amount": ".5"
    },
    {
      "wallet": "ENTER PUBLIC KEY OF RECEIVING ACCOUNT",
      "deadline": new Date("8/27/2021"),
      "amount": ".2"
    }
];

// return balance of account
async function returnBalance(pubKey){
        //get balances
        const balance = web3.utils.fromWei(await web3.eth.getBalance(pubKey), 'ether');
	return balance
}

// Create txn function
async function send () {

	const nonce = await web3.eth.getTransactionCount(senderPubKey, 'latest');

	const transaction = {
	to: receiverPubKey,
	value: web3.utils.toWei(sendAmount, 'ether'),
	gas: 30000,
	nonce: nonce,
	};

	const signedTx = await web3.eth.accounts.signTransaction(transaction, senderPrivKey);

	await web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(error, hash) {
	if (!error){
		console.log("The hash of your transcation is: ", hash)
		return hash;
	} else{
		console.log("something went wrong: ", error);
	};
	});
};

// Execute the transfers
async function execute() {

	let success;
	let senderBalance;
	let receiverBalance;
	let i = 1;

	//send to the receiving accounts
	accountBalance = await returnBalance(senderPubKey);
	console.log("Starting Balance:", accountBalance);

	for (const account of accounts) {

		receiverPubKey = account.wallet;
        	sendAmount = account.amount;

		console.log("=== SENDING TRANSACTION", i,"===",'\n');
		if (today < account.deadline) {
                	senderBalance = await returnBalance(senderPubKey);
                	receiverBalance = await returnBalance(receiverPubKey);
                	console.log("Sending", sendAmount, "to", receiverPubKey);
                	console.log("Sender Starting Balance:",senderBalance,"Receiver Starting Balance:", receiverBalance);
                	success = await send();
                	senderBalance = await returnBalance(senderPubKey);
                	receiverBalance = await returnBalance(receiverPubKey);
                	console.log("Sender Ending Balance:",senderBalance,"Receiver Ending Balance:", receiverBalance,'\n');
        	}else {
                	console.log("deadline has expired for", account.wallet, "on", account.deadline,'\n');
        	}
		++i;
	};

	//send the remainder of the account balance to cold storage
	console.log("=== SENDING REMAINING BALANCE ===",'\n');
	accountFinalBalance = await returnBalance(senderPubKey);

	receiverPubKey = "ENTER PUBLIC KEY OF RECEIVING ACCOUNT";
        gasPrice = web3.utils.fromWei("1000000000000000");
	sendAmount = String(accountFinalBalance - gasPrice);

	if (accountFinalBalance > 0)
	{

		senderBalance = await returnBalance(senderPubKey);
                receiverBalance = await returnBalance(receiverPubKey);
        	console.log("Sending", sendAmount, "to", receiverPubKey);
                console.log("Sender Starting Balance:",senderBalance,"Receiver Starting Balance:", receiverBalance);
                success = await send();
                senderBalance = await returnBalance(senderPubKey);
                receiverBalance = await returnBalance(receiverPubKey);
                console.log("Sender Ending Balance:",senderBalance,"Receiver Ending Balance:", receiverBalance,'\n');
	} else {
		console.log("The balance is 0");
	}
};

execute();

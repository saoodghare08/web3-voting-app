// We need the Ethers.js library from the Hardhat installation
// This import will work because we'll serve our folder with Hardhat
import { ethers } from "./node_modules/ethers/dist/ethers.js";

// --- 1. SET UP YOUR CONTRACT ---
// PASTE YOUR DEPLOYED CONTRACT ADDRESS HERE
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// PASTE YOUR CONTRACT'S ABI (THE ARRAY) HERE
const contractABI =
  // Example: [ { "inputs": [], "name": "owner", ... }, ... ]
  // PASTE THE COPIED ABI ARRAY HERE
  [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_voterAddress",
          "type": "address"
        }
      ],
      "name": "addVoter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasVoted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "proposals",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_proposalIndex",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "voters",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

// --- 2. GLOBAL VARIABLES ---
let provider;
let signer;
let contract;

// --- 3. GET HTML ELEMENTS ---
const connectButton = document.getElementById("connectButton");
const addVoterButton = document.getElementById("addVoterButton");
const voterAddressInput = document.getElementById("voterAddressInput");
const voteButtons = document.querySelectorAll(".voteButton"); // Gets all vote buttons
const statusDiv = document.getElementById("status");

// --- 4. CONNECT TO METAMASK ---
connectButton.onclick = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      // 1. Get provider (MetaMask)
      // Ethers.js v6 uses BrowserProvider
      provider = new ethers.BrowserProvider(window.ethereum);

      // 2. Request account access
      await provider.send("eth_requestAccounts", []);

      // 3. Get signer (the user's account)
      signer = await provider.getSigner();

      // 4. Create the contract instance
      contract = new ethers.Contract(contractAddress, contractABI, signer);

      const userAddress = await signer.getAddress();
      statusDiv.textContent = `Connected! Address: ${userAddress}`;
      connectButton.textContent = "Connected";
    } catch (error) {
      console.error(error);
      statusDiv.textContent = "Connection failed.";
    }
  } else {
    statusDiv.textContent = "Please install MetaMask!";
  }
};

// --- 5. ADD VOTER (Owner Only) ---
addVoterButton.onclick = async () => {
  if (!contract) {
    statusDiv.textContent = "Please connect your wallet first.";
    return;
  }

  const newVoterAddress = voterAddressInput.value;
  if (!ethers.isAddress(newVoterAddress)) {
    statusDiv.textContent = "Please enter a valid Ethereum address.";
    return;
  }

  statusDiv.textContent = "Adding voter... please wait.";
  try {
    // Send the transaction
    const tx = await contract.addVoter(newVoterAddress);
    
    // Wait for the transaction to be mined
    await tx.wait();

    statusDiv.textContent = `Success! ${newVoterAddress} has been added as a voter.`;
    voterAddressInput.value = "";
  } catch (error) {
    console.error(error);
    statusDiv.textContent = `Error: ${error.reason}`;
  }
};

// --- 6. VOTE (Voters Only) ---
voteButtons.forEach((button) => {
  button.onclick = async () => {
    if (!contract) {
      statusDiv.textContent = "Please connect your wallet first.";
      return;
    }

    const proposalIndex = button.getAttribute("data-proposal");
    statusDiv.textContent = `Submitting vote for proposal ${proposalIndex}...`;

    try {
      // Send the transaction
      const tx = await contract.vote(proposalIndex);
      
      // Wait for the transaction to be mined
      await tx.wait();

      statusDiv.textContent = "Vote cast successfully!";
    } catch (error) {
      console.error(error);
      // 'error.reason' often contains the "require" message from the contract
      statusDiv.textContent = `Error: ${error.reason || error.message}`;
    }
  };
});
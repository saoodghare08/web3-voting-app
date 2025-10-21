const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Voting contract...");

  // 1. Get the contract factory (the blueprint)
  const Voting = await ethers.getContractFactory("Voting");

  // 2. Start the deployment
  const votingContract = await Voting.deploy();

  // 3. Wait for it to be officially mined
  await votingContract.waitForDeployment();

  // 4. Log the address where it was deployed
  const address = await votingContract.getAddress();
  console.log(`Voting contract deployed to: ${address}`);
}

// Standard Hardhat pattern to run the main function and catch errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
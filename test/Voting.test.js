const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// A 'describe' block groups all our tests together
describe("Voting Contract", function () {
  // This 'fixture' function sets up our test environment.
  // It deploys a fresh contract and gets test accounts.
  async function deployVotingFixture() {
    // Get test accounts (signers) from Ethers.js
    // The first one is the deployer (owner) by default
    const [owner, voter1, voter2] = await ethers.getSigners();

    // Deploy our "Voting" contract
    const Voting = await ethers.getContractFactory("Voting");
    const votingContract = await Voting.deploy();

    // Return the values we'll need in our tests
    return { votingContract, owner, voter1, voter2 };
  }

  // --- Test 1: Deployment ---
  it("Should set the deployer as the owner", async function () {
    // 1. ARRANGE: Load the deployed contract and accounts
    const { votingContract, owner } = await loadFixture(deployVotingFixture);

    // 2. ACT: Read the public 'owner' variable from the contract
    const contractOwner = await votingContract.owner();

    // 3. ASSERT: Check if the owner from the contract is the same as our 'owner' account
    expect(contractOwner).to.equal(owner.address);
  });

  // --- Test 2: 'addVoter' function ---
  it("Should allow the owner to add a new voter", async function () {
    const { votingContract, owner, voter1 } = await loadFixture(
      deployVotingFixture
    );

    // 2. ACT: Call 'addVoter' from the owner's account
    await votingContract.connect(owner).addVoter(voter1.address);

    // 3. ASSERT: Check if the voter1's address is now 'true' in the voters mapping
    const isVoter = await votingContract.voters(voter1.address);
    expect(isVoter).to.be.true;
  });

  // --- Test 3: 'addVoter' security ---
  it("Should NOT allow a non-owner to add a new voter", async function () {
    const { votingContract, voter1, voter2 } = await loadFixture(
      deployVotingFixture
    );

    // 2. ACT & 3. ASSERT:
    // We expect this transaction to fail ('revert') with our exact error message.
    // We use 'connect(voter1)' to send the transaction from 'voter1's account.
    await expect(
      votingContract.connect(voter1).addVoter(voter2.address)
    ).to.be.revertedWith("Only the owner can add voters");
  });

  // --- Test 4: 'vote' function ---
  it("Should allow an approved voter to vote", async function () {
    const { votingContract, owner, voter1 } = await loadFixture(
      deployVotingFixture
    );

    // 1. ARRANGE: Owner adds 'voter1'
    await votingContract.connect(owner).addVoter(voter1.address);

    // 2. ACT: 'voter1' votes for "Option A" (index 0)
    await votingContract.connect(voter1).vote(0);

    // 3. ASSERT: Check if 'voter1' is marked as having voted
    const hasVoted = await votingContract.hasVoted(voter1.address);
    expect(hasVoted).to.be.true;
  });

  // --- Test 5: 'vote' security (double voting) ---
  it("Should NOT allow a voter to vote twice", async function () {
    const { votingContract, owner, voter1 } = await loadFixture(
      deployVotingFixture
    );

    // 1. ARRANGE: Add voter1 and have them vote once
    await votingContract.connect(owner).addVoter(voter1.address);
    await votingContract.connect(voter1).vote(0);

    // 2. ACT & 3. ASSERT: Expect the second vote to fail
    await expect(votingContract.connect(voter1).vote(1)).to.be.revertedWith(
      "You have already voted"
    );
  });

  // --- Test 6: 'vote' security (unapproved voter) ---
  it("Should NOT allow an unapproved person to vote", async function () {
    const { votingContract, voter1 } = await loadFixture(deployVotingFixture);

    // 2. ACT & 3. ASSERT: Expect 'voter1' (who was never added) to fail
    await expect(votingContract.connect(voter1).vote(0)).to.be.revertedWith(
      "You are not an approved voter"
    );
  });

  // --- Test 7: Vote counting ---
  it("Should correctly increment the vote count", async function () {
    const { votingContract, owner, voter1 } = await loadFixture(
      deployVotingFixture
    );
    // 1. ARRANGE: Add voter1
    await votingContract.connect(owner).addVoter(voter1.address);

    // 2. ACT: voter1 votes for "Option B" (index 1)
    await votingContract.connect(voter1).vote(1);

    // 3. ASSERT: Check the proposal's vote count
    const proposal = await votingContract.proposals(1);
    expect(proposal.voteCount).to.equal(1);
  });
});
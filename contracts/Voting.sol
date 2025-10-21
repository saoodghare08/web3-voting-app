// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {

    // A mapping to store the list of approved voters
    mapping(address => bool) public voters;

    // A mapping to track who has already voted
    mapping(address => bool) public hasVoted;

    address public owner;

    struct Proposal {
        string name;
        uint voteCount;
    }

    Proposal[] public proposals;

    constructor() {
        owner = msg.sender;

        proposals.push(Proposal({ name: "Option A", voteCount: 0 }));
        proposals.push(Proposal({ name: "Option B", voteCount: 0 }));
        proposals.push(Proposal({ name: "Option C", voteCount: 0 }));
    }

    function addVoter(address _voterAddress) public {
        require(msg.sender == owner, "Only the owner can add voters");
        voters[_voterAddress] = true;
    }

    function vote(uint _proposalIndex) public {
        // --- SECURITY CHECKS ---
        require(voters[msg.sender] == true, "You are not an approved voter");
        require(hasVoted[msg.sender] == false, "You have already voted");
        require(_proposalIndex < proposals.length, "Invalid proposal index");

        // --- ACTION ---
        hasVoted[msg.sender] = true;
        proposals[_proposalIndex].voteCount++;
    }
}
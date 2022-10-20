//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Whitelist {
    // 允许的最大白名单地址
    uint8 public maxWhitelistedAddresses;

    // mapping 如果一个地址在白名单中 那么我们就设置为true 不在就设置为false
    mapping(address => bool) public whitelistedAddresses;

    // 跟踪多少地址已经被白名单了
    uint8 public numAddressesWhitelisted;

    // 设置白名单地址的最大值
    // 用户在部署的时候会将值放进来
    constructor(uint8 _maxWhitelistedAddresses) {
        maxWhitelistedAddresses = _maxWhitelistedAddresses;
    }

    // 将用户的地址添加到白名单
    function addAddressToWhitelist() public {
        // 检查用户是否已经被白名单
        require(
            !whitelistedAddresses[msg.sender],
            "Sender has already been whitelisted"
        );
        // 检查最大白名单数量
        require(
            numAddressesWhitelisted < maxWhitelistedAddresses,
            "More addresses cant be added, limit reached"
        );
        // 将调用addAddressToWhitelist的地址添加到白名单数组whitelistedAddress 中
        whitelistedAddresses[msg.sender] = true;
        // 增加白名单地址数
        numAddressesWhitelisted += 1;
    }
}

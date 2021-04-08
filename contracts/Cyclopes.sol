//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.3;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Cyclopes is ERC721, ERC721Enumerable, Ownable {
    string public constant R =
        "If it's not right, don't do it; if it's not true, don't say it. - Marcus Aurelius";
    uint16 public constant maxSupply = 5255;
    bool public isSaleStarted = false;
    string private _baseTokenURI;
    string public provenance;
    uint256 public revealTimeStamp;

    constructor() ERC721("Cyclopes from the Ether", "CYCP") {}

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Set sale (mintability) status
    function setSale(bool _setSaleBool) public onlyOwner {
        isSaleStarted = _setSaleBool;
    }

    // Initialises 10 day timer
    function initRevealTimeStamp() public onlyOwner {
        uint256 tenDays = (86400 * 10);
        revealTimeStamp = block.timestamp + tenDays;
    }

    function setProvenance(string memory _provenance) public onlyOwner {
        provenance = _provenance;
    }

    function setBaseURI(string memory _newbaseTokenURI) public onlyOwner {
        _baseTokenURI = _newbaseTokenURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // Get minting limit (for a single transaction) based on current token supply
    function getCurrentMintLimit() public view returns (uint8) {
        require(
            (isSaleStarted == true) && (totalSupply() < maxSupply),
            "Mint limit unavailable because sale is not open"
        );
        uint256 _currentSupply = totalSupply();
        if (_currentSupply >= 902) {
            return 10;
        } else {
            return 5;
        }
    }

    // Get ether price based on current token supply
    function getCurrentPrice() public view returns (uint64) {
        require(
            (isSaleStarted == true) && (totalSupply() < maxSupply),
            "Price unavailable because sale is not open"
        );
        uint256 _currentSupply = totalSupply();

        if (_currentSupply >= 5199) {
            return 1_000_000_000_000_000_000;
        } else if (_currentSupply >= 4484) {
            return 700_000_000_000_000_000;
        } else if (_currentSupply >= 2693) {
            return 500_000_000_000_000_000;
        } else if (_currentSupply >= 902) {
            return 300_000_000_000_000_000;
        } else if (_currentSupply >= 187) {
            return 100_000_000_000_000_000;
        } else if (_currentSupply >= 74) {
            return 50_000_000_000_000_000;
        } else {
            return 30_000_000_000_000_000;
        }
    }

    // Mint new token(s)
    function mintCyclopes(uint8 _quantityToMint) public payable {
        require(isSaleStarted == true, "Sale is not open");
        require(_quantityToMint >= 1, "Must mint at least 1");
        require(
            _quantityToMint <= getCurrentMintLimit(),
            "Maximum current buy limit for individual transaction exceeded"
        );
        require(
            (_quantityToMint + totalSupply()) <= maxSupply,
            "Exceeds maximum supply"
        );
        require(
            msg.value == (getCurrentPrice() * _quantityToMint),
            "Ether submitted does not match current price"
        );

        for (uint8 i = 0; i < _quantityToMint; i++) {
            uint256 mintIndex = totalSupply();
            _safeMint(msg.sender, mintIndex);
            console.log("Minted - \tNFT #%s \tcurrentSupply: %s", mintIndex, totalSupply());
        }
    }

    // Withdraw ether from contract
    function withdraw() public onlyOwner {
        require(address(this).balance > 0);
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success == true, "Failed to withdraw ether");
    }
}

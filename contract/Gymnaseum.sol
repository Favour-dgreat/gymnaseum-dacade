// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import './GymnaseumService.sol';

interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract Gymnaseum {

  struct Product {
    address payable owner;
    string name;
    string image;
    string description;
    string location;
    uint serviceFee;
    uint price;
    uint sold;
  }

  uint internal productsLength = 0;
  address internal serviceAddress;
  mapping (uint => Product) internal products;
  address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
  address payable internal onwerAddress = payable(0x47baAd3608FcE9719b4b9B90AF4Bb834D747bC99);

  constructor(address serviceContractAddress) {
    serviceAddress = serviceContractAddress;
  }

  function writeProduct(
    string memory _name,
    string memory _image,
    string memory _description, 
    string memory _location,
    uint _serviceFee,
    uint _price
  ) public {
    uint _sold = 0;
    products[productsLength] = Product(
      payable(msg.sender),
      _name,
      _image,
      _description,
      _location,
      _serviceFee,
      _price,
      _sold
    );
    productsLength++;
  }

  function addService(
    string memory _name,
    string memory _image,
    string memory _description, 
    string memory _location,
    string memory _contact
  ) public {
    ServiceInterface ServiceContract = ServiceInterface(address(serviceAddress));
    ServiceContract.writeService(_name, _image, _description, _location, _contact);
  }

  function readProduct(uint _index) public view returns (
    address payable,
    string memory, 
    string memory, 
    string memory, 
    string memory, 
    uint,
    uint, 
    uint
  ) {
    Product storage product = products[_index];
    return(
      product.owner,
      product.name,
      product.image,
      product.description,
      product.location,
      product.serviceFee,
      product.price,
      product.sold
    );
  }

  function getService(uint _index) public view returns(
    address,
    string memory, 
    string memory, 
    string memory, 
    string memory, 
    string memory
  ) {
    ServiceInterface ServiceContract = ServiceInterface(address(serviceAddress));
    return ServiceContract.readService(_index);
  }

  function buyProduct(uint _index) public payable  {
    require(
      IERC20Token(cUsdTokenAddress).transferFrom(
        msg.sender,
        onwerAddress,
        products[_index].serviceFee
      ),
      "Product fee transfer failed."
    );
    require(
      IERC20Token(cUsdTokenAddress).transferFrom(
        msg.sender,
        products[_index].owner,
        products[_index].price
      ),
      "Product price transfer failed."
    );
    products[_index].sold++;
  }
  
  function getProductsLength() public view returns (uint) {
    return (productsLength);
  }

  function getServicesLength() public view returns (uint) {
    ServiceInterface ServiceContract = ServiceInterface(address(serviceAddress));
    return ServiceContract.readServicesLength();
  }
}
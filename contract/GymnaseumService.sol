// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface ServiceInterface {
  function readServicesLength() external view returns (uint);
  function readService(uint _index) external view returns (address, string memory, string memory, string memory, string memory, string memory, uint);
  function writeService(string calldata _name, string calldata _image, string calldata _description, string calldata _location, string calldata _contact) external;
//   hire a service interface
  function hireService(uint _index) external;
}

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

contract GymnaseumService {

  struct Service {
    address payable user;
    string name;
    string image;
    string description;
    string location;
    string contact;
    // track the number of times a gym service provider has been hired
    // services will be hired a flat rate of 5cusd
    uint hires;
    
  }

  uint internal servicesLength = 0;
//   address for the cUSD token
  address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
  mapping (uint => Service) internal services;

  function writeService(
    string memory _name,
    string memory _image,
    string memory _description, 
    string memory _location,
    string memory _contact
  ) external {
    services[servicesLength] = Service(
      payable(tx.origin),
      _name,
      _image,
      _description,
      _location,
      _contact,
    //   hires will be initialized with 0
      0
    );
    servicesLength++;
  }

  function readService(uint _index) external view returns (
    address,
    string memory, 
    string memory, 
    string memory, 
    string memory, 
    string memory,
    uint
  ) {
    Service storage service = services[_index];
    return(
      payable(service.user),
      service.name,
      service.image,
      service.description,
      service.location,
      service.contact,
      service.hires
    );
  }
  
//   hire a service for use
   function hireService(uint _index) public payable  {

    services[_index].hires++;
  }

  function readServicesLength() external view returns (uint) {
    return (servicesLength);
  }
}
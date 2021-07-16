// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface ServiceInterface {
  function readServicesLength() external view returns (uint);
  function readService(uint _index) external view returns (address, string memory, string memory, string memory, string memory, string memory);
  function writeService(string calldata _name, string calldata _image, string calldata _description, string calldata _location, string calldata _contact) external;
}

contract GymnaseumService {

  struct Service {
    address user;
    string name;
    string image;
    string description;
    string location;
    string contact;
  }

  uint internal servicesLength = 0;
  mapping (uint => Service) internal services;

  function writeService(
    string memory _name,
    string memory _image,
    string memory _description, 
    string memory _location,
    string memory _contact
  ) external {
    services[servicesLength] = Service(
      tx.origin,
      _name,
      _image,
      _description,
      _location,
      _contact
    );
    servicesLength++;
  }

  function readService(uint _index) external view returns (
    address,
    string memory, 
    string memory, 
    string memory, 
    string memory, 
    string memory
  ) {
    Service storage service = services[_index];
    return(
      service.user,
      service.name,
      service.image,
      service.description,
      service.location,
      service.contact
    );
  }

  function readServicesLength() external view returns (uint) {
    return (servicesLength);
  }
}
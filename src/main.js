import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import gymnaseumAbi from '../contract/gymnaseum.abi.json'
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18;
const GContractAddress = "0xa40984b129C3DEC3EE452F69a3A1af388cE28F5d";
const erc20Address = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

let kit, contract;
let products = [], services = [];


const connectCeloWallet = async function () {
  if (window.celo) {
      notification("⚠️ Please approve this DApp to use it.")
      serviceNotificationOff()
    try {
      await window.celo.enable()
      notificationOff()
      serviceNotificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(gymnaseumAbi, GContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
    serviceNotificationOff()
  }
}

async function paymentApproval(_price) {
  const ERCContract = new kit.web3.eth.Contract(erc20Abi, erc20Address)

  const result = await ERCContract.methods.approve(GContractAddress, _price).send({
    from: kit.defaultAccount
  })

  return result
}


const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getProducts = async function() {
  const _productsLength = await contract.methods.getProductsLength().call()
  const _products = []
    for (let i = 0; i < _productsLength; i++) {
    let _product = new Promise(async (resolve, reject) => {
      let p = await contract.methods.readProduct(i).call()
      resolve({
        index: i,
        owner: p[0],
        name: p[1],
        image: p[2],
        description: p[3],
        location: p[4],
        fee: new BigNumber(p[5]),
        price: new BigNumber(p[6]),
        sold: p[7],
      })
    })
    _products.push(_product)
  }
  products = await Promise.all(_products)
  renderProducts()
}
const getServices = async function() {
  const _servicesLength = await contract.methods.getServicesLength().call()
  const _services = []
    for (let i = 0; i < _servicesLength; i++) {
    let _service = new Promise(async (resolve, reject) => {
      let p = await contract.methods.getService(i).call()
    
      resolve({
        index: i,
        user: p[0],
        name: p[1],
        image: p[2],
        description: p[3],
        location: p[4],
        contact: p[5],
        hires: p[6],
      })
    })
    _services.push(_service)
  }
  services = await Promise.all(_services)
  renderServices()
}

document
  .querySelector("#newProductBtn")
  .addEventListener("click", async (e) => {
    let newPrice = document.getElementById("newPrice").value;
    let productPrice = new BigNumber(newPrice).shiftedBy(ERC20_DECIMALS).toString();
    let productFee = new BigNumber(0.05 * newPrice).shiftedBy(ERC20_DECIMALS).toString();

    const params = [
      document.getElementById("newProductName").value,
      document.getElementById("newImgUrl").value,
      document.getElementById("newProductDescription").value,
      document.getElementById("newLocation").value,
      productFee,
      productPrice
    ]

    notification(`⌛ Adding "${params[0]}"...`)
    try {
      await contract.methods.writeProduct(...params).send({
        from: kit.defaultAccount
      }).then(() => {
        notification(`🎉 You successfully added "${params[0]}".`)
        getProducts()
      }).catch((err) => {
        notification(`⚠️ ${err}.`)
      })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  })

document
  .querySelector("#newServiceBtn")
  .addEventListener("click", async (e) => {
    const serviceParams = [
      document.getElementById("newServiceName").value,
      document.getElementById("newServiceImgUrl").value,
      document.getElementById("newServiceDescription").value,
      document.getElementById("newServiceLocation").value,
      document.getElementById("newServiceContact").value
    ]

    serviceNotification(`⌛ Adding "${serviceParams[0]}"...`)
    try {
      await contract.methods.addService(...serviceParams).send({
        from: kit.defaultAccount
      }).then(() => {
        serviceNotification(`🎉 You successfully added "${serviceParams[0]}".`)
        getServices()
      }).catch((err) => {
        serviceNotification(`⚠️ ${err}.`)
      })
    } catch (error) {
      serviceNotification(`⚠️ ${error}.`)
    }
  })

  window.addEventListener('load', async () => {
    notification("⌛ Loading...")
    await connectCeloWallet()
    await getBalance()
    await getProducts()
    await getServices()
    notificationOff()
  });

function renderProducts() {
  document.getElementById("Gymnaseummarketplace").innerHTML = ""
  products.forEach((_product) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = productTemplate(_product)
    document.getElementById("Gymnaseummarketplace").appendChild(newDiv)
  })
}
function renderServices() {
  document.getElementById("GymnaseumServices").innerHTML = ""
  services.forEach((_service) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = serviceTemplate(_service)
    document.getElementById("GymnaseumServices").appendChild(newDiv)
  })
}

function productTemplate(_product) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_product.image}" alt="...">
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        ${_product.sold} Sold
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_product.owner)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_product.name}</h2>
        <p class="card-text mb-4" style="min-height: 82px">
          ${_product.description}             
        </p>
        <p class="card-text mt-4">
          <i class="bi bi-geo-alt-fill"></i>
          <span>${_product.location}</span>
        </p>
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-dark buyBtn fs-6 p-3" id=${
            _product.index
          }>
            Buy for ${_product.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)}(${_product.fee.shiftedBy(-ERC20_DECIMALS).toFixed(2)}) cUSD
          </a>
        </div>
      </div>
    </div>
  `
}
function serviceTemplate(_service) {

  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_service.image}" alt="...">
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
      ${_service.hires} Hires
    </div>
      <div class="card-body text-dark text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_service.user)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_service.name}</h2>
        <p class="card-text mb-1">
          ${_service.contact}             
        </p>
        <p class="card-text mb-4" style="min-height: 82px">
          ${_service.description}             
        </p>
        <p class="card-text mt-4">
          <i class="bi bi-geo-alt-fill"></i>
          <span>${_service.location}</span>
        </p>
        <div class="d-grid gap-2">
        <a class="btn btn-lg btn-outline-dark hireBtn fs-6 p-3" id=${
          _service.index
        }>
          Hire for ${BigNumber(5000000000000000000).shiftedBy(-ERC20_DECIMALS).toFixed(2)}cUSD
        </a>
      </div>
      </div>
    </div>
  `
}


function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert-product").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert-product").style.display = "none"
}

function serviceNotification(_text) {
  document.querySelector(".alert-service").style.display = "block"
  document.querySelector("#serviceNotification").textContent = _text
}

function serviceNotificationOff() {
  document.querySelector(".alert-service").style.display = "none"
}

document.querySelector("#Gymnaseummarketplace").addEventListener("click", async (e) => {
  if(e.target.className.includes("buyBtn")) {
    const index = e.target.id;
    notification("⌛ Waiting for payment approval...");
    try {
      let bigSum = BigInt(products[index].price) + BigInt(products[index].fee);
      const productAmountSum = bigSum.toString();
      await paymentApproval(productAmountSum);
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment for "${products[index].name}"...`)
    try {
      await contract.methods.buyProduct(index).send({
        from: kit.defaultAccount
      })
      notification(`🎉 You successfully bought "${products[index].name}".`)
      getBalance()
      getProducts()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
})

// trigger when the hire button is clicked
document.querySelector("#GymnaseumServices").addEventListener("click", async (e) => {
  if(e.target.className.includes("hireBtn")) {
    const index = e.target.id;
    notification("⌛ Waiting for payment approval...");
    try {
      let bigSum = BigInt(5000000000000000000);
      const serviceAmountSum = bigSum.toString();
    
      await paymentApproval(serviceAmountSum);
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment to hire "${services[index].name}"...`)
    try {
      let bigSum = BigInt(5000000000000000000);
      const serviceAmountSum = bigSum.toString();
    
      await contract.methods.hireService(index, serviceAmountSum, services[index].user).send({
        from: kit.defaultAccount
      })
      notification(`🎉 You successfully hired "${services[index].name}".`)
      getBalance()
      getServices()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
})




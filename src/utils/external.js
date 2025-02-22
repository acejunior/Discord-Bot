const axios = require('axios').default
const { contractAddress, bscScanApiKey } = require('../config.json')

/**
 * Function for obtaining the price from Dex.Guru's API.
 * @returns Dex.Guru's API data
 */
async function getDexPrice() {
  try {
    let response = await axios.get(`https://api.dex.guru/v1/tokens/${contractAddress}-bsc/`)

    // Check to make sure we've received a valid price
    // otherwise we'll default to pancake
    let price = response.data['priceUSD'].toFixed(response.data['decimals'])
    if (!price || price == 0.00) throw ''

    return {
      price: response.data['priceUSD'].toFixed(response.data['decimals']),
      provider: 'dex.guru'
    }
  } catch (err) {
    return await getPrice() // Fallback to Pancake API
  }
}

/**
 * Function for obtaining the price from pancakeswap's API.
 * @returns Pancakeswap's API data
 */
async function getPancakePrice() {
  try {
    let response = await axios.get('https://api.pancakeswap.info/api/tokens')
    return response.data
  } catch (err) {
    console.log(err)
    return 'Failed'
  }
}

/**
* Function for obtaining the total burned supply from BSCSCAN.
* @returns total Burned Supply to-date.
*/
async function getBurnedTotal() {
  try {
    let response = await axios.get(`https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=0x0000000000000000000000000000000000000001&tag=latest&apikey=${bscScanApiKey}`);
    let value = response.data['result']
    value = (value / 1_000_000_000_000).toFixed(4)
    return value
  } catch (err) {
    console.log(err)
    return 'Failed'
  }
}

/**
* Function for obtaining data from CoinMarketCap's Api.
* @returns CoinMarketCap's widget API json data
*/
async function getCMCData() {
  try {
    let response = await axios.get('https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/widget?id=8757')
    return response.data
  } catch (err) {
    console.log(err)
    return 'Failed'
  }
}

/**
* Method for getting the current price.
* @returns price
*/
async function getPrice() {
  try {
    let panData = await getPancakePrice()
    let panBase = panData['data'][contractAddress]
    return {
      price: parseFloat(panBase['price']).toFixed(9),
      provider: 'pancake'
    }
  } catch (err) {
    console.log(err)
    return {
      price: 'Failed',
      provider: 'pancake'
    }
  }
}

module.exports = {
  getDexPrice,
  getPancakePrice,
  getBurnedTotal,
  getCMCData,
  getPrice
}

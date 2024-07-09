'use strict'

const TRX_TAX_TYPES = require('./trx.tax.types')
const TRX_TAX_STRATEGIES = require('./trx.tax.strategies')
const PRIORITY_CURRENCY_LIST = require('./priority.currency.list')
const remapTrades = require('./remap-trades')
const remapMovements = require('./remap-movements')
const lookUpTrades = require('./look-up-trades')
const getTrxMapByCcy = require('./get-trx-map-by-ccy')
const findPublicTrade = require('./find-public-trade')
const TrxPriceCalculator = require('./trx.price.calculator')
const getCcyPairForConversion = require('./get-ccy-pair-for-conversion')
const getTrxTaxType = require('./get-trx-tax-type')

module.exports = {
  TRX_TAX_TYPES,
  TRX_TAX_STRATEGIES,
  PRIORITY_CURRENCY_LIST,
  remapTrades,
  remapMovements,
  lookUpTrades,
  getTrxMapByCcy,
  findPublicTrade,
  TrxPriceCalculator,
  getCcyPairForConversion,
  getTrxTaxType
}

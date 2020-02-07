'use strict'

const {
  decorate,
  injectable,
  inject
} = require('inversify')
const {
  orderBy,
  isEmpty
} = require('lodash')
const {
  prepareResponse
} = require('bfx-report/workers/loc.api/helpers')
const {
  FindMethodError
} = require('bfx-report/workers/loc.api/errors')

const {
  AuthError
} = require('../../errors')

const TYPES = require('../../di/types')

class SubAccountApiData {
  constructor (
    dao
  ) {
    this.dao = dao
  }

  _getUsersArgs (
    args = {},
    subUsers = []
  ) {
    const { params } = { ...args }

    return subUsers.reduce((accum, subUser) => {
      const { apiKey, apiSecret } = { ...subUser }

      if (
        !apiKey ||
        typeof apiKey !== 'string' ||
        !apiSecret ||
        typeof apiSecret !== 'string'
      ) {
        return accum
      }

      accum.push({
        ...args,
        auth: { apiKey, apiSecret },
        params: {
          ...params,
          notThrowError: true,
          notCheckNextPage: true
        }
      })

      return accum
    }, [])
  }

  // TODO:
  async fetchPositionsAuditFormApi (
    method,
    argsArr,
    params = {},
    opts = {}
  ) {
    const {
      limit = 10000,
      notThrowError,
      notCheckNextPage
    } = { ...params }
    const {
      datePropName
    } = { ...opts }

    const promises = argsArr.map((args) => method(args))
    const resArr = await Promise.all(promises) // TODO:

    const mergedRes = resArr.reduce((accum, curr) => {
      const { res } = { ...curr }

      if (
        Array.isArray(res) &&
        res.length !== 0
      ) {
        accum.push(...res)
      }

      return accum
    }, [])

    const orderedRes = orderBy(mergedRes, [datePropName], ['desc'])
    const limitedRes = Number.isInteger(limit)
      ? orderedRes.slice(0, limit)
      : orderedRes

    const firstElem = { ...limitedRes[0] }
    const mts = firstElem[datePropName]
    const isNotContainedSameMts = limitedRes.some((item) => {
      const _item = { ...item }
      const _mts = _item[datePropName]

      return _mts !== mts
    })
    const res = isNotContainedSameMts
      ? limitedRes
      : orderedRes

    return prepareResponse(
      res,
      datePropName,
      limit,
      notThrowError,
      notCheckNextPage
    )
  }

  async getDataForSubAccount (
    method,
    args,
    opts = {}
  ) {
    if (typeof method !== 'function') {
      throw new FindMethodError()
    }

    const { auth } = { ...args }
    const { params } = { ...args }

    const subUsers = await this.dao
      .getSubUsersByMasterUserApiKeys(auth)

    if (
      !Array.isArray(subUsers) ||
      subUsers.length === 0 ||
      subUsers.some((sUser) => isEmpty(sUser))
    ) {
      throw new AuthError()
    }

    const argsArr = this._getUsersArgs(
      args,
      subUsers
    )

    return this.fetchPositionsAuditFormApi(
      method,
      argsArr,
      params,
      opts
    )
  }
}

decorate(injectable(), SubAccountApiData)
decorate(inject(TYPES.DAO), SubAccountApiData, 0)

module.exports = SubAccountApiData

import Promise from 'bluebird'
import config from 'config'
import Table from 'easy-table'
import jsonfile from 'jsonfile'
import redis from 'redis'
import twilio from 'twilio'

import email from './email'

Promise.promisifyAll(redis.RedisClient.prototype)
const redisClient = redis.createClient(config.get('redisUrl'))

const client = new twilio.RestClient(config.get('twilio.accountSid'), config.get('twilio.authToken'))

async function search () {
  const state = await redisClient.hgetallAsync('state') || {}
  const newState = {}

  const args = [].slice.call(arguments)

  const results = await Promise.all(args.map(contains => {
    return client.availablePhoneNumbers('US').local.get({
      areaCode: config.get('areaCode'),
      contains
    })
  }))

  let searchResults = results.map(r => r.availablePhoneNumbers).map(r => {
    // sort within each 'contains' result but keep the `contains` order.
    return r.sort((a, b) => {
      return parseInt(a.phoneNumber.slice(1), 10) - parseInt(b.phoneNumber.slice(1), 10)
    })
  })

  searchResults = [].concat.apply([], searchResults)

  // remove dups
  searchResults = searchResults.filter((item, pos, self) => {
    return self.map(r => r.phoneNumber).indexOf(item.phoneNumber) === pos
  })

  const newSearchResults = searchResults.filter(item => {
    return !(item.phoneNumber in state)
  })

  // construct new state var {phoneNumber: dateCreated}
  searchResults.forEach(result => {
    newState[result.phoneNumber] = (result.phoneNumber in state) ? state[result.phoneNumber] : new Date()
  })

  // Pretty print table
  const t = new Table
  newSearchResults.forEach(r => {
    t.cell('number', r.friendly_name)
    t.cell('loc', r.rate_center)
    t.newRow()
  })
  console.log(t.toString())

  // save state
  redisClient.hmset('state', newState)

  if (newSearchResults.length) {
    // construct email
    const template = r => `${r}: ${newState[r]}`

    const numbersString = newSearchResults.map(r => r.phoneNumber.substring(2)).join(' ')
    const moreData = Object.keys(newState).map(template).join('<br>')

    try {
      await email({
        subject: `TwilNums: ${numbersString}`,
        html: moreData
      })
    } catch (err) {
      console.error('Email Error:', err.stack)
      throw err
    }
  } else {
    console.log('no new results')
  }

  // try {
  //   // Okay, so there are some available numbers.  Now, let's buy the first one
  //   // in the list.  Return the promise created by the next call to Twilio:
  //   await client.incomingPhoneNumbers.create({
  //     phoneNumber:searchResults.availablePhoneNumbers[0].phoneNumber,
  //     voiceUrl:'https://demo.twilio.com/welcome/voice',
  //     smsUrl:'https://demo.twilio.com/welcome/sms/reply'
  //   })
  // } catch (err) {
  //   send email to say failed + err.message
  // }
}

export default function () {
  return search(...config.get('patterns'))
}

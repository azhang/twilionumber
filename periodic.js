// Long running process that runs the twilio checker periodically

require('babel-register')
require('babel-polyfill')
const schedule = require('node-schedule')

const task = require('./app').default

schedule.scheduleJob('25,55 * * * *', () => {
  return task()
})

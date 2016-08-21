// Long running process that runs the twilio checker periodically

require('babel-register')
require('babel-polyfill')
var schedule = require('node-schedule')

var task = require('./app').default

var j = schedule.scheduleJob('25,55 * * * *', function () {
  return task()
})

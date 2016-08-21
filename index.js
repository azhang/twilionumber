// Run the twilio checker once and quit.

require('babel-register')
require('babel-polyfill')

require('./app').default()
  .then(() => process.exit())

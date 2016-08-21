import config from 'config'
import Promise from 'bluebird'

const sendgrid = require('sendgrid')(config.get('sendgrid.username'), config.get('sendgrid.password'))

const send = Promise.promisify(sendgrid.send, {context: sendgrid})

export default function (data) {
  return send({
    from: config.get('email.fromAddress'),
    to: config.get('email.toAddress'),
    subject: data.subject,
    html: data.html
  })
}

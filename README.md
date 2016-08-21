# Twilionumber

Track and email new available numbers on Twilio according to patterns. Deployable on Heroku.

## Setup

Copy/paste `config/default.yml` into a new `config/production.yml` file. Overwrite the fields with your own. Commit and push to Heroku after the Deployment steps below.

## Deployment

1. Create new Heroku app.
2. Add Heroku Scheduler, SendGrid, and Heroku Redis add-ons.
3. Go to https://scheduler.heroku.com/dashboard
4. Click "Add new job", `$ npm start`

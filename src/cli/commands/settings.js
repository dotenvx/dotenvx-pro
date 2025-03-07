const { Command } = require('commander')

const settings = new Command('settings')

settings
  .description('⚙️  settings')
  .allowUnknownOption()

// Regular Commands
const basicCommands = [
  ['username', 'print your username', require('./../actions/settings/username')],
  ['token', 'print your access token (--unmask)', require('./../actions/settings/token')],
  ['publickey', 'print your publicKey', require('./../actions/settings/publicKey')],
  ['privatekey', 'print your privateKey (--unmask)', require('./../actions/settings/privateKey')],
  ['recoveryphrase', 'print your recovery phrase (--unmask)', require('./../actions/settings/recoveryPhrase')],
  ['emergencykit', 'generate your emergency kit (--unmask)', require('./../actions/settings/emergencyKit')],
  ['recover', 'recover your account 🛟', require('./../actions/settings/recover')],
  ['org', 'print organization', require('./../actions/settings/org')],
  ['orgpublickey', 'print organization publicKey', require('./../actions/settings/orgPublicKey')],
  ['orgprivatekey', 'print organization privateKey (--unmask)', require('./../actions/settings/orgPrivateKey')],
  ['orgteam', 'print organization team', require('./../actions/settings/orgTeam')],
  ['orgjoin', 'join organization', require('./../actions/settings/orgJoin')],
  ['orgnew', 'create organization', require('./../actions/settings/orgNew')],
  ['orgselect', 'select organization', require('./../actions/settings/orgSelect')]
]

// Advanced Commands (to be displayed separately)
const advancedCommands = [
  ['hostname', 'print hostname', require('./../actions/settings/hostname')],
  ['storetree', 'print store tree', require('./../actions/settings/storetree')]
]

// Register Basic Commands
basicCommands.forEach(([name, desc, action]) => {
  settings.command(name).description(desc).action(action)
})

// Register Advanced Commands (Hidden from default help)
advancedCommands.forEach(([name, desc, action]) => {
  settings.command(name).description(desc).action(action)
})

// Override `helpInformation` to add an "Advanced" section
settings.helpInformation = function () {
  const originalHelp = Command.prototype.helpInformation.call(this)
  const lines = originalHelp.split('\n')

  // Extract standard commands
  const filteredLines = lines.filter(line =>
    !advancedCommands.some(([name]) => line.includes(`  ${name} `))
  )

  // Add Advanced Commands at the end
  if (advancedCommands.length > 0) {
    filteredLines.push('Advanced:')
    advancedCommands.forEach(([name, desc]) => {
      filteredLines.push(`  ${name.padEnd(15)} ${desc}`)
    })
  }

  return filteredLines.join('\n')
}

module.exports = settings

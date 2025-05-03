const { ConfirmPrompt, isCancel } = require('@clack/core')

module.exports = async (opts) => {
  const prompt = new ConfirmPrompt({
    active: 'Y',
    inactive: 'N',
    initialValue: true,
    render () {
      return `${opts.message} (Y/n)`
    }
  })

  const result = await prompt.prompt()
  if (isCancel(result)) process.exit(0)

  return result
}

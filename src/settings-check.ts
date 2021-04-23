import * as core from '@actions/core'
import { processRules } from './rules'
import { getConfig } from './config'

const run = async () => {
  try {
    const config = await getConfig()

    await processRules(config)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

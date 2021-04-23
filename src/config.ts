import * as core from '@actions/core'
import { INPUT_REPOSITORIES, INPUT_RULES_PATH, INPUT_TOKEN } from './contstants'
import path from 'path'

export interface Config {
  repositories: string[]
  rules: Record<string, boolean>
  token: string
}

const getRepositoryList = (repositoriesString: string): string[] =>
  repositoriesString.split(',').map((r) => r.trim())

const getRules = async (
  rulesPath: string
): Promise<Record<string, boolean>> => {
  return require(path.join(process.env.GITHUB_WORKSPACE || '', rulesPath))
}

const getToken = (tokenVar: string): string => {
  return process.env[tokenVar] || ''
}

export const getConfig = async (): Promise<Config> => {
  const repositoriesString = core.getInput(INPUT_REPOSITORIES)
  const rulesPath = core.getInput(INPUT_RULES_PATH)
  const tokenVar = core.getInput(INPUT_TOKEN)

  const repositories = getRepositoryList(repositoriesString)
  const rules = await getRules(rulesPath)
  const token = getToken(tokenVar)

  return {
    repositories,
    rules,
    token
  }
}

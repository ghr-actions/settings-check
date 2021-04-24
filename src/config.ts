import * as core from '@actions/core'
import { INPUT_REPOSITORIES, INPUT_RULES_PATH, INPUT_TOKEN } from './contstants'
import path from 'path'

export interface Config {
  repositories: string[]
  rules: Record<string, boolean>
  token: string
}

const validRepo = new RegExp('^[w.-_]+$')
const validOwner = new RegExp('^[w-]+$')

const getRepositoryList = (repositoriesString: string): string[] => {
  return repositoriesString
    .split(',')
    .map((r) => r.trim())
    .map((r) => {
      const [part1, part2, ...rest] = r.split('/')
      let owner, repo

      if (rest.length != 0) {
        throw new Error(`Repository ${r} is not valid`)
      }

      if (part1 == undefined) {
        ;[owner, repo] = (process.env.GITHUB_REPOSITORY || '/').split('/')
      } else if (part2 == undefined) {
        repo = part1
        owner = (process.env.GITHUB_REPOSITORY || '/').split('/')[0]
      } else {
        owner = part1
        repo = part2
      }

      if (!validRepo.test(repo)) {
        throw new Error(`Repository name ${repo} is not valid`)
      }

      if (!validOwner.test(owner)) {
        throw new Error(`Owner name ${owner} is not valid`)
      }

      return `${owner}/${repo}`
    })
}
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

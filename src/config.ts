import * as core from '@actions/core'
import { INPUT_REPOSITORIES, INPUT_RULES_PATH, INPUT_TOKEN } from './contstants'
import path from 'path'

export interface Config {
  repositories: string[]
  rules: Record<string, boolean>
  token: string
}

const delimiter = new RegExp(/[,;]/)
const validRepo = new RegExp(/^[\w._-]+$/)
const validOwner = new RegExp(/^[\w-]+$/)

/**
 * Retrieves a delimiter separated list of repositories and returns a split and
 * processed list of repositories.
 *
 * @return {string[]} repositoryList
 */
const getRepositoryList = (): string[] =>
  core
    .getInput(INPUT_REPOSITORIES)
    .split(delimiter) // Split on delimiters
    .map((r) => r.trim()) // Trim whitespace
    .map((r) => {
      // Split into parts
      const [part1, part2, ...rest] = r.split('/')
      let owner, repo

      // If there are more than 1 '/' characters, the string is invalid
      if (rest.length != 0) {
        throw new Error(`Repository ${r} is not valid`)
      }

      if (part1 == '') {
        // Default to current repository
        ;[owner, repo] = (process.env.GITHUB_REPOSITORY || '/').split('/')
      } else if (part2 == undefined) {
        // Default to current owner
        repo = part1
        owner = (process.env.GITHUB_REPOSITORY || '/').split('/')[0]
      } else {
        // Both defined, do not default
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

/**
 * Retrieves path to the rules JSON file, imports, and returns it.
 *
 * @return {Record<string, any>} imported rules object
 */
const getRules = async (): Promise<Record<string, boolean>> => {
  const rulesPath = core.getInput(INPUT_RULES_PATH)
  const absolutePath = path.isAbsolute(rulesPath)
    ? rulesPath
    : path.join(process.env.GITHUB_WORKSPACE || '', rulesPath)

  return require(absolutePath)
}

/**
 * Retrieves the name of an environment variable holding the GitHub token and
 * loads it in.
 *
 * @return {string} GitHub token
 */
const getToken = (): string => {
  const tokenVar = core.getInput(INPUT_TOKEN)
  const token = process.env[tokenVar]

  if (!token) {
    throw new Error(
      `Could not load token from environment variable ${tokenVar}`
    )
  }

  return token
}

/**
 * Builds and returns an object containing any config needed for the action.
 *
 * @return {Promise<Config>} action config
 */
export const getConfig = async (): Promise<Config> => ({
  repositories: getRepositoryList(),
  rules: await getRules(),
  token: getToken()
})

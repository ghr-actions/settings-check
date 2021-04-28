import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'

let octokit: InstanceType<typeof GitHub>

/**
 * Initialises Octokit with the GitHub token
 *
 * @param token GitHub token
 */
export const init = (token: string) => {
  octokit = github.getOctokit(token)
}

/**
 * Requests a repository using an initialised Octokit
 *
 * @param repo The repository to request
 * @return {Promise} The repository response promise
 */
export const getRepository = async (repo: string) =>
  octokit.request(`GET /repos/${repo}`)

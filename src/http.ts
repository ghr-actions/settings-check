import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'

let octokit: InstanceType<typeof GitHub>

export const init = (token: string) => {
  octokit = github.getOctokit(token)
}

export const getRepository = async (repo: string) =>
  octokit.request(`GET /repos/${repo}`)

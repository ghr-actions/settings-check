import * as core from '@actions/core'
import * as http from './http'
import { Config } from './config'

interface Violation {
  field: string
  expected: string
  actual: string
}

/**
 * Loops over each rule and ensures the repository matches, returning a list of any rule violations.
 *
 * @param rules JSON object containing rules
 * @param repository JSON response of the repositories settings
 * @return {Violation[]} A list of each rule violation
 */
const getViolations = (
  rules: Record<string, any>,
  repository: any
): Violation[] =>
  Object.keys(rules).reduce(
    (violations: Violation[], key: string) =>
      repository[key] != rules[key]
        ? [
            ...violations,
            { field: key, expected: rules[key], actual: repository[key] }
          ]
        : violations,
    []
  )

const reportViolations = (
  repoViolations: {
    repo: string
    violations?: Violation[]
    error?: any
  }[]
) => {
  const passes = repoViolations.reduce((a, { repo, violations, error }) => {
    if ((!violations || !violations.length) && !error) {
      core.info(`\u001b[32m${repo} passed all checks`)
      return a
    }

    if (violations?.length) {
      core.error(`\u001b[31m${repo} failed some checks:`)
      violations.forEach(({ field, expected, actual }) =>
        core.error(
          `\u001b[31m  - "${field}" was expected to be "${expected}", but was actually "${actual}"`
        )
      )
    }

    if (error) {
      core.error(
        `\u001b[31mAn error occurred while processing ${repo}: ${error}`
      )
    }

    return false
  }, true)

  if (!passes) {
    core.setFailed('Some checks failed')
  }
}

/**
 * Requests each repository, gets the violations and returns them (or any associated errors)
 *
 * @param config Action configuration
 * @return {Promise<any>} A list of repositories with any rule violations or errors
 */
export const processRules = async ({ repositories, rules, token }: Config) => {
  http.init(token)

  const repoViolations = await Promise.all(
    repositories.map(async (repo) => {
      try {
        const { data } = await http.getRepository(repo)
        const violations = getViolations(rules.repository, data)
        return { repo, violations }
      } catch (error) {
        return { repo, error }
      }
    })
  )

  reportViolations(repoViolations)
}

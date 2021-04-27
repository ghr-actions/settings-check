import * as http from './http'
import { Config } from './config'

interface Violation {
  field: string
  expected: string
  actual: string
}

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

export const processRules = async ({ repositories, rules, token }: Config) => {
  http.init(token)

  const results = repositories.map(async (repo) => {
    try {
      const { data } = await http.getRepository(repo)
      const violations = getViolations(rules, data)
      return { repo, violations }
    } catch (error) {
      return { repo, error }
    }
  })

  console.log(JSON.stringify(results))

  return results
}

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

  const results = []

  for (let i = 0; i < repositories.length; i++) {
    const repo = repositories[i]
    const { data } = await http.getRepository(repo)
    const violations = getViolations(rules, data)
    results.push({ repo, violations })
  }

  console.log(JSON.stringify(results))
}

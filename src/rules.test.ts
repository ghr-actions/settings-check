import { processRules } from './rules'
import * as http from './http'

jest.mock('./http', () => ({
  init: jest.fn(),
  getRepository: jest.fn()
}))

const baseConfig = {
  repositories: [
    'ghr-actions/settings-check',
    'ghr-actions/settings-enforce',
    'GavinF17/GavinF17.github.io'
  ],
  rules: {
    repository: {
      allow_rebase_merge: true,
      allow_squash_merge: false
    }
  },
  token: '0123456789abcdef'
}

describe('rules', () => {
  beforeEach(() => jest.resetAllMocks())

  it('initialises http with token', async () => {
    await processRules(baseConfig)

    expect(http.init).toBeCalledWith(baseConfig.token)
  })

  it('calls getRepository for each repo', async () => {
    // @ts-ignore
    http.getRepository.mockResolvedValue({ data: {} })

    await processRules(baseConfig)

    expect(http.getRepository).toHaveBeenCalledTimes(
      baseConfig.repositories.length
    )

    baseConfig.repositories.forEach((repo, i) =>
      expect(http.getRepository).toHaveBeenNthCalledWith(i + 1, repo)
    )
  })

  it('returns correct violations', async () => {
    const repos: Record<string, any> = {
      'ghr-actions/settings-check': {
        repo: { allow_rebase_merge: true, allow_squash_merge: true },
        violations: [
          { field: 'allow_squash_merge', expected: false, actual: true }
        ]
      },
      'ghr-actions/settings-enforce': {
        repo: { allow_rebase_merge: false, allow_squash_merge: true },
        violations: [
          { field: 'allow_rebase_merge', expected: true, actual: false },
          { field: 'allow_squash_merge', expected: false, actual: true }
        ]
      },
      'GavinF17/GavinF17.github.io': {
        repo: { allow_rebase_merge: false, allow_squash_merge: false },
        violations: [
          { field: 'allow_rebase_merge', expected: true, actual: false }
        ]
      }
    }

    // @ts-ignore
    http.getRepository.mockImplementation((repo) => ({
      data: repos[repo].repo
    }))

    const result = await processRules(baseConfig)

    expect(result).toEqual(
      Object.keys(repos).map((repo) => ({
        repo,
        violations: repos[repo].violations
      }))
    )
  })
})

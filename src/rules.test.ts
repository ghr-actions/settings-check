import { processRules } from './rules'
import * as http from './http'
import * as core from '@actions/core'

jest.mock('./http', () => ({
  init: jest.fn(),
  getRepository: jest.fn()
}))

jest.mock('@actions/core', () => ({
  info: jest.fn(),
  error: jest.fn(),
  setFailed: jest.fn()
}))

jest.mock('@actions/core')

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

  it('reports all checks passed', async () => {
    // @ts-ignore
    http.getRepository.mockResolvedValue({
      data: { allow_rebase_merge: true, allow_squash_merge: false }
    })

    await processRules(baseConfig)

    baseConfig.repositories.forEach((repo) =>
      expect(core.info).toHaveBeenCalledWith(
        `\u001b[32m${repo} passed all checks`
      )
    )

    expect(core.error).not.toHaveBeenCalled()
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('reports correct violations', async () => {
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

    await processRules(baseConfig)

    Object.keys(repos).forEach((key) => {
      const { violations } = repos[key]
      expect(core.error).toHaveBeenCalledWith(
        `\u001b[31m${key} failed some checks:`
      )
      violations.forEach(({ field, expected, actual }: any) =>
        expect(core.error).toHaveBeenCalledWith(
          `\u001b[31m  - "${field}" was expected to be "${expected}", but was actually "${actual}"`
        )
      )
    })

    expect(core.info).not.toHaveBeenCalled()
    expect(core.setFailed).toHaveBeenCalledWith('Some checks failed')
  })
})

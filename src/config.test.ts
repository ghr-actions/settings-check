import * as core from '@actions/core'
import { INPUT_REPOSITORIES, INPUT_RULES_PATH, INPUT_TOKEN } from './contstants'
import { getConfig } from './config'

jest.mock('@actions/core', () => ({
  getInput: jest.fn()
}))

const mockInput = (
  repositoryString: string,
  rulesPath: string,
  tokenVar: string
) => {
  // @ts-ignore
  core.getInput.mockImplementation((input: string) => {
    switch (input) {
      case INPUT_REPOSITORIES:
        return repositoryString
      case INPUT_RULES_PATH:
        return rulesPath
      case INPUT_TOKEN:
        return tokenVar
    }
  })
}

const mockRules = (rulesPath: string, expectedRules = {}) => {
  jest.mock(rulesPath, () => expectedRules, { virtual: true })
}

const mockToken = (tokenVar: string, token = 'someToken') => {
  process.env[tokenVar] = token
}

describe('config', () => {
  const defaultRulesPath = 'defaultRulesPath'
  const defaultTokenVar = 'DEFAULT_TOKEN_VAR'
  const OLD_ENV = process.env
  const DEFAULT_GITHUB_ENV = {
    GITHUB_REPOSITORY: 'ghr-actions/settings-check',
    GITHUB_WORKSPACE: '/home/runner/work/ghr-actions/settings-check'
  }

  beforeEach(() => {
    jest.resetAllMocks()
    process.env = { ...OLD_ENV, ...DEFAULT_GITHUB_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it.each([
    ['', ['ghr-actions/settings-check']], // Default to current
    ['settings-enforce', ['ghr-actions/settings-enforce']], // Default to current owner
    ['GavinF17/GavinF17.github.io', ['GavinF17/GavinF17.github.io']], // Both defined, do not default
    [
      'settings-check ; ghr-actions/settings-enforce,GavinF17/GavinF17.github.io',
      [
        'ghr-actions/settings-check',
        'ghr-actions/settings-enforce',
        'GavinF17/GavinF17.github.io'
      ]
    ] // Split on delimiters and trim whitespace
  ])(
    'returns valid repositories',
    async (repositoryString: string, expectedRepositories: string[]) => {
      mockInput(repositoryString, defaultRulesPath, defaultTokenVar)
      mockRules(defaultRulesPath)
      mockToken(defaultTokenVar)

      const { repositories } = await getConfig()

      expect(core.getInput).toBeCalledWith(INPUT_REPOSITORIES)
      expect(repositories).toEqual(expectedRepositories)
    }
  )

  it.each([
    'ghr-actions/settings-check/settings-enforce', // Too many parts
    'ghr-ac@tions/settings-check', // Invalid repository
    'ghr-actions/settings-c!heck' // Invalid owner
  ])('throws on invalid repositories', async (repositoryString: string) => {
    mockInput(repositoryString, defaultRulesPath, defaultTokenVar)
    mockRules(defaultRulesPath)
    mockToken(defaultTokenVar)

    await expect(getConfig()).rejects.toThrow()
  })

  it.each([
    ['/tmp/repo-rules.json', true], // Absolute
    ['repo-rules.json', false] // Relative to workdir
  ])('returns correct rules', async (rulesPath: string, abs: boolean) => {
    mockInput('', rulesPath, '')

    const expectedRules = {
      allow_rebase_merge: true,
      allow_squash_merge: false
    }

    mockRules(
      abs ? rulesPath : `${DEFAULT_GITHUB_ENV.GITHUB_WORKSPACE}/${rulesPath}`,
      expectedRules
    )

    const { rules } = await getConfig()

    expect(core.getInput).toBeCalledWith(INPUT_RULES_PATH)
    expect(rules).toEqual(expectedRules)
  })

  it('throws on invalid rulesPath', async () => {
    mockInput('', 'somePath', '')

    await expect(getConfig()).rejects.toThrow()
  })

  it('returns the correct token', async () => {
    const tokenVar = 'SOME_VAR'
    const expectedToken = 'someToken'
    process.env[tokenVar] = expectedToken
    mockInput('', '', tokenVar)

    const { token } = await getConfig()

    expect(core.getInput).toBeCalledWith(INPUT_TOKEN)
    expect(token).toEqual(expectedToken)
  })

  it('throws on invalid token var', async () => {
    mockInput('', '', 'SOME_VAR')

    await expect(getConfig()).rejects.toThrow()
  })
})

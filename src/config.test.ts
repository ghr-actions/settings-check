import * as core from '@actions/core'
import { INPUT_REPOSITORIES, INPUT_RULES_PATH, INPUT_TOKEN } from './contstants'
import { getConfig } from './config'

jest.mock('@actions/core', () => ({
  getInput: jest.fn()
}))

describe('config', () => {
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
      // @ts-ignore
      core.getInput.mockReturnValue(repositoryString)

      const { repositories } = await getConfig()

      expect(core.getInput).toBeCalledWith(INPUT_REPOSITORIES)
      expect(repositories).toEqual(expectedRepositories)
    }
  )

  it.each([
    'ghr-actions/settings-check/settings-enforce', // Too many parts
    'ghr-actions/settings-check', // Invalid repository
    'ghr-actions/settings-check' // Invalid owner
  ])('throws on invalid repositories', async (repositoryString: string) => {
    // @ts-ignore
    core.getInput.mockReturnValue(repositoryString)

    const { repositories } = await getConfig()

    expect(core.getInput).toBeCalledWith(INPUT_REPOSITORIES)
    expect(repositories).toEqual(expectedRepositories)
  })

  it('returns correct rules', async () => {
    const rulesPath = 'somePath.json'
    const workspace = 'workspace'
    const path = `${workspace}/${rulesPath}`
    process.env.GITHUB_WORKSPACE = workspace
    const expectedRules = {}
    // @ts-ignore
    core.getInput.mockReturnValue(rulesPath)

    jest.mock(path, () => expectedRules)

    const { rules } = await getConfig()

    expect(core.getInput).toBeCalledWith(INPUT_RULES_PATH)
    expect(rules).toEqual(expectedRules)
  })

  it('returns correct token', async () => {
    const tokenVar = 'TOKEN_VAR'
    const expectedToken = 'some-token'
    process.env[tokenVar] = expectedToken
    // @ts-ignore
    core.getInput.mockReturnValue(tokenVar)

    const { token } = await getConfig()

    expect(core.getInput).toBeCalledWith(INPUT_TOKEN)
    expect(token).toEqual(expectedToken)
  })
})

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
    allow_rebase_merge: true,
    allow_squash_merge: false
  },
  token: '0123456789abcdef'
}

describe('rules', () => {
  beforeEach(() => jest.resetAllMocks())

  it('initialises http with token', () => {
    processRules(baseConfig)

    expect(http.init).toBeCalledWith(baseConfig.token)
  })

  it('calls getRepository for each repo', () => {
    // @ts-ignore
    http.getRepository.mockResolvedValue({ data: {} })

    processRules(baseConfig)

    expect(http.getRepository).toHaveBeenCalledTimes(
      baseConfig.repositories.length
    )

    baseConfig.repositories.forEach((repo, i) =>
      expect(http.getRepository).toHaveBeenNthCalledWith(i + 1, repo)
    )
  })
})

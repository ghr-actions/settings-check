import * as github from '@actions/github'
import * as http from './http'

jest.mock('@actions/github', () => ({
  getOctokit: jest.fn()
}))

describe('http', () => {
  beforeEach(() => jest.resetAllMocks())

  it('init gets octokit with token', () => {
    const token = 'some-token'

    http.init(token)

    expect(github.getOctokit).toBeCalledWith(token)
  })

  it('calls request with repo on initialised octokit', () => {
    const repo = 'some-repo'
    const request = jest.fn()
    // @ts-ignore
    github.getOctokit.mockReturnValue({
      request
    })

    http.init('some-token')
    http.getRepository(repo)

    expect(request).toBeCalledWith(`GET /repos/${repo}`)
  })
})

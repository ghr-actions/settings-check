# ghr-actions/settings-check :heavy_check_mark: :x:

## Usage

There are two steps to using this action:

1. Create a rules specification
2. Add your workflow

### 1. Create a rules specification

The rules specification is a JSON file which defines the rules that any given GitHub Repositories must match, it is
mapped directly to the [repository response returned from GitHub's API.
](https://docs.github.com/en/rest/reference/repos#get-a-repository)

**Example `rules.json`:**

```json
{
  "repository": {
    "private": true,
    "allow_rebase_merge": true,
    "allow_squash_merge": false
  }
}
```

Only the provided fields will be checked, i.e. i the above example we do not include `"allow_merge_commit"` so this
could be true or false in the response.

**Notes:**

1. The rules are embedded within `"repository"` as extra checks will be added for other settings that are unavailable in
   the repository response (e.g. contributors, status checks, ...)
1. Anything can currently be defined in rules.json within beta, it is currently on you to ensure correctness however
   validation is on the roadmap which may lead to breaking builds in future if you don't handle this now

### 2. Add your workflow

#### Options

| Input         | Required           | Default             | Description                                         |
| ------------- |:------------------:| ------------------- | --------------------------------------------------- |
|`token`        | :heavy_check_mark: | _N/A_               | GitHub token to authenticate to the repositories    |
|`rules-path`   |                    | `rules.json`        | Path to the rules file to check on the repositories |
|`repositories` |                    | `GITHUB_REPOSITORY` | Comma separated list of repositories to check       |

**Example workflow:**

```yaml
on:
  schedule:
    - cron: '0 8 * * *'

jobs:
  check-settings:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: ghr-actions/settings-check@v0.1.0
        env:
          REPO_TOKEN: ${{ secrets.REPO_TOKEN }}
        with:
          token: REPO_TOKEN
```

The above example will run the workflow every day at 08:00. Scheduled jobs are more than likely the top use case as
there is no way to trigger a job on a settings change, so a scheduled job is required. See the [trigger documentation
](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#scheduled-events) for more details on how
to configure the timing.

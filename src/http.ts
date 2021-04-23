import * as github from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";

// const rules: Record<string, any> = {
//   allow_rebase_merge: false,
//   allow_squash_merge: false,
// };
//
//
//
// const returnFailing = (repository: any) => {
//   return Object.keys(rules).reduce((broken: any, key: string) => {
//     if (repository[key] != rules[key]) {
//       return { ...broken, [key]: rules[key] };
//     }
//     return broken;
//   }, {});
// };
//
// const run = async () => {
//   // const token = core.getInput('token')
//   const octokit = github.getOctokit(process.env.GHT || "");
//
//   const owner = "GavinF17";
//   const repo = "GavinF17.github.io";
//
//   let repoResponse = await octokit.request("GET /repos/{owner}/{repo}", {
//     owner,
//     repo,
//   });
//
//   const failing = returnFailing(repoResponse.data);
//
//   console.log(failing);
//
//   repoResponse = await octokit.request("PATCH /repos/{owner}/{repo}", {
//     owner,
//     repo,
//     ...failing,
//   });
//
//   console.log(repoResponse);
// };
//
// run();

let octokit: InstanceType<typeof GitHub>;

export const init = (token: string) => {
  octokit = github.getOctokit(token);
};

export const getRepository = async (repo: string) =>
  await octokit.request(`GET /repos/${repo}`);

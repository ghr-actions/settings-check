import * as core from "@actions/core";
import {
  INPUT_REPOSITORIES,
  INPUT_RULES_PATH,
  INPUT_TOKEN,
} from "./contstants";
import { processRules } from "./rules";

const rules: Record<string, any> = {
  allow_rebase_merge: false,
  allow_squash_merge: false,
};

const run = async () => {
  try {
    console.log(231232);
    core.info("123123");

    const repositories = core.getInput(INPUT_REPOSITORIES);
    const rulesPath = core.getInput(INPUT_RULES_PATH);
    const token = core.getInput(INPUT_TOKEN);

    const repositoryList = repositories.split(",").map((r) => r.trim());

    await processRules(rules, repositoryList);
  } catch (error) {
    core.setFailed(error.message);
  }
};

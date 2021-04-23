import * as core from "@actions/core";
import { processRules } from "./rules";
import { getConfig } from "./config";

const rules: Record<string, any> = {
  allow_rebase_merge: false,
  allow_squash_merge: false,
};

const run = async () => {
  try {
    const config = await getConfig();

    await processRules(config);
  } catch (error) {
    core.setFailed(error.message);
  }
};

run();

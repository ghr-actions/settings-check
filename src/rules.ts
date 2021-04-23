import * as http from "./http";

interface Violation {
  field: string;
  expected: string;
  actual: string;
}

const getViolations = (
  rules: Record<string, any>,
  repository: any
): Violation[] =>
  Object.keys(rules).reduce(
    (violations: Violation[], key: string) =>
      repository[key] != rules[key]
        ? [
            ...violations,
            { field: key, expected: rules[key], actual: repository[key] },
          ]
        : violations,
    []
  );

export const processRules = async (
  rules: Record<string, any>,
  repositories: string[]
) => {
  http.init();

  const results = await repositories.map(async (repo: any) => {
    const { data } = await http.getRepository(repo);

    const violations = getViolations(rules, data);

    return { repo, violations };
  });

  console.log(results);
};

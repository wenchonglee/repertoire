import { execSync } from "node:child_process";
import { promises } from "node:fs";
import { expect, test } from "vitest";
import RepertoireReporter from "./reporter";

test("reporter instantiates run id and url", async () => {
  const reporter = new RepertoireReporter({ url: "test" });

  expect(reporter.runId).toBeTruthy();
  expect(reporter.url).toBe("test/api/");
  expect(reporter.shouldCreateArtifacts).toBe(false);
});

test("reporter produces matching snapshots", async () => {
  execSync("pnpm playwright test --project=chromium reporter-snapshot.spec.ts", {
    env: {
      ...process.env,
      RUN_ID: "vitest",
    },
  });
  const runStart = await promises.readFile("./test-artifacts/run_start.json", "utf8");
  const runStartJson = JSON.parse(runStart);

  expect(runStartJson).toHaveProperty("startTime");
  delete runStartJson.startTime;
  expect(runStartJson).toMatchSnapshot();

  const runEnd = await promises.readFile("./test-artifacts/run_end.json", "utf8");
  const runEndJson = JSON.parse(runEnd);

  expect(runEndJson).toHaveProperty("endTime");
  delete runEndJson.endTime;
  expect(runEndJson).toMatchSnapshot();

  const testStart = await promises.readFile(
    "./test-artifacts/28b2bf81bad5aac29ce2-25ef8da37777e9cf46d7_start.json",
    "utf8"
  );
  const testStartJson = JSON.parse(testStart);

  expect(testStartJson).toHaveProperty("startTime");
  delete testStartJson.startTime;
  expect(testStartJson).toMatchSnapshot();

  const testEnd = await promises.readFile(
    "./test-artifacts/28b2bf81bad5aac29ce2-25ef8da37777e9cf46d7_end.json",
    "utf8"
  );
  const testEndJson = JSON.parse(testEnd);

  expect(testEndJson).toHaveProperty("endTime");
  delete testEndJson.endTime;
  expect(testEndJson).toMatchSnapshot();
});

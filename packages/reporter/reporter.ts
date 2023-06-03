import { APIRequestContext, request } from "@playwright/test";
import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";
import path from "node:path";
import { simpleHash } from "./simpleHash";

const RUN_ID = simpleHash(new Date().toISOString());

const reportTestRunStart = async (config: FullConfig, suite: Suite, context: APIRequestContext) => {
  /**
   * * Determine the config, it is assumed all shards have the same config
   */
  const projects = suite.suites.map((projectSuite) => projectSuite.title);
  const totalShards = config.shard.total;
  const allTests = [];

  /**
   * * Group by projects, first level suite is always the project
   */
  for (const projectSuite of suite.suites) {
    console.log("Project: ", projectSuite.title);
    const projectName = projectSuite.title;

    for (const fileSuite of projectSuite.suites) {
      const fileName = toPosixPath(path.relative(config.rootDir, fileSuite.location!.file));
      /**
       * * At this point, a suite can either contain the test itself, or a group of tests (test.describe)
       * * For now, we choose to disregard the hierarchy and get all the tests in the file
       */

      // Push all base level tests
      fileSuite.tests.forEach((test) => {
        allTests.push({
          fileName,
          projectName,
          title: test.title,
          testId: test.id,
          tags: (test.title.match(/@[\S]+/g) || ([] as string[])).map((t) => t.substring(1)),
          titlePath: test.titlePath(),
          timeout: test.timeout,
          annotations: test.annotations,
          expectedStatus: test.expectedStatus,
        });
      });

      // Push tests for each test.describe group
      fileSuite.suites.forEach((groupSuite) =>
        groupSuite.tests.forEach((test) => {
          allTests.push({
            groupTitle: groupSuite.title,
            fileName,
            projectName,
            title: test.title,
            testId: test.id,
            tags: (test.title.match(/@[\S]+/g) || ([] as string[])).map((t) => t.substring(1)),
            titlePath: test.titlePath(),
            timeout: test.timeout,
            annotations: test.annotations,
            expectedStatus: test.expectedStatus,
          });
        })
      );
    }
  }

  try {
    const response = await context.post("./runs", {
      data: {
        runId: RUN_ID,
        startTime: new Date().toISOString(),
        projects,
        totalShards,
        shardId: config.shard.current,
        version: config.version,
        tests: allTests,
      },
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
};

const reportTestRunEnd = async (result: FullResult, context: APIRequestContext) => {
  try {
    const response = await context.put(`./runs/${RUN_ID}`, {
      data: {
        endTime: new Date().toISOString(),
        status: result.status,
      },
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
};

const reportTestStart = async (test: TestCase, result: TestResult, context: APIRequestContext) => {
  try {
    const response = await context.put(`./runs/${RUN_ID}/tests/${test.id}`, {
      data: {
        startTime: new Date().toISOString(),
      },
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
};

const reportTestEnd = async (test: TestCase, result: TestResult, context: APIRequestContext) => {
  try {
    const response = await context.put(`./runs/${RUN_ID}/tests/${test.id}`, {
      data: {
        endTime: new Date().toISOString(),
        outcome: test.outcome(),
        errors: JSON.stringify(result.errors),
        status: result.status,
      },
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
};

export function toPosixPath(pathString: string): string {
  return pathString.split(path.sep).join(path.posix.sep);
}

class MyReporter implements Reporter {
  context: APIRequestContext | undefined;
  baseURL = "http://localhost:3000/api/";

  async onBegin(config: FullConfig, suite: Suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests, with Run ID: ${RUN_ID}`);
    // console.log(Object.keys(process.env));

    this.context = await request.newContext({ baseURL: this.baseURL });
    reportTestRunStart(config, suite, this.context);
  }

  onTestBegin(test: TestCase, result: TestResult) {
    console.log(`Starting test ID: ${test.id}, Title: ${test.title}`);
    reportTestStart(test, result, this.context);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    console.log(`Finished test ${test.title}: ${result.status}`);
    reportTestEnd(test, result, this.context);
  }

  async onEnd(result: FullResult) {
    console.log(`Finished the run: ${result.status}`);
    await reportTestRunEnd(result, this.context);
  }
}

export default MyReporter;

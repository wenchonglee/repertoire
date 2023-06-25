import { APIRequestContext, request } from "@playwright/test";
import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";
import { createReadStream } from "node:fs";
import { posix, relative, sep } from "node:path";
import { buffer } from "node:stream/consumers";
import { simpleHash } from "./simpleHash";

const RUN_ID = process.env["RUN_ID"] ?? simpleHash(new Date().toISOString());

class RepertoireReporter implements Reporter {
  context: Promise<APIRequestContext> | undefined;
  url: string;
  allPromises: Promise<any>[] = [];
  beginPromise: Promise<any> | undefined;

  constructor(options: { url: string }) {
    // URL should be the domain only (e.g. http://localhost:3000)
    this.url = `${options.url}/api/`;
    console.log("RUN_ID: ", RUN_ID, " URL: ", this.url);
  }

  async getContext() {
    const context = await this.context;
    return context;
  }

  onBegin(config: FullConfig, suite: Suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests, with Run ID: ${RUN_ID}`);

    this.context = request.newContext({ baseURL: this.url });
    this.beginPromise = this.reportTestRunStart(config, suite);
  }

  onTestBegin(test: TestCase, result: TestResult) {
    console.log(`Starting test ID: ${test.id}, Title: ${test.title}`);
    const testStart = this.reportTestStart(test, result);

    this.allPromises.push(testStart);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    console.log(`Finished test ${test.title}: ${result.status}`);
    const testEnd = this.reportTestEnd(test, result);

    console.log(`Uploading files: ${result.attachments.map((attachment) => attachment.name).join(", ")}`);
    const uploadFiles = this.uploadFiles(result, test);

    this.allPromises.push(testEnd);
    this.allPromises.push(uploadFiles);
  }

  async onEnd(result: FullResult) {
    await Promise.allSettled(this.allPromises);

    console.log(`Finished the run: ${result.status}`);
    await this.reportTestRunEnd(result);
  }

  /**
   * ---------------
   * Utilities
   * ---------------
   */

  async reportTestRunStart(config: FullConfig, suite: Suite) {
    const context = await this.getContext();
    if (!context) return;

    /**
     * * Determine the config, it is assumed all shards have the same config
     */
    const projects = suite.suites.map((projectSuite) => projectSuite.title);
    const totalShards = config.shard?.total;
    const allTests: any[] = [];

    /**
     * * Group by projects, first level suite is always the project
     */
    for (const projectSuite of suite.suites) {
      console.log("Project: ", projectSuite.title);
      const projectName = projectSuite.title;

      for (const fileSuite of projectSuite.suites) {
        const fileName = this.toPosixPath(relative(config.rootDir, fileSuite.location!.file));
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
          shardId: config.shard?.current,
          version: config.version,
          tests: allTests,
        },
        headers: { "content-type": "application/json" },
      });
    } catch (err) {
      console.log(err);
    }
  }

  async reportTestRunEnd(result: FullResult) {
    const context = await this.getContext();
    if (!context) return;
    await this.beginPromise;

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
  }

  async reportTestStart(test: TestCase, result: TestResult) {
    const context = await this.getContext();
    if (!context) return;
    await this.beginPromise;

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
  }

  async reportTestEnd(test: TestCase, result: TestResult) {
    const context = await this.getContext();
    if (!context) return;
    await this.beginPromise;

    try {
      const response = await context.put(`./runs/${RUN_ID}/tests/${test.id}`, {
        data: {
          endTime: new Date().toISOString(),
          outcome: test.outcome(),
          errors: result.errors,
          status: result.status,
          expectedStatus: test.expectedStatus,
          attachments: result.attachments.map((attachment) => ({
            fileName: attachment.name,
            contentType: attachment.contentType,
          })),
        },
        headers: { "content-type": "application/json" },
      });
    } catch (err) {
      console.log(err);
    }
  }

  async uploadFiles(testResult: TestResult, test: TestCase) {
    const context = await this.getContext();
    if (!context) return;
    await this.beginPromise;

    for (const attachment of testResult.attachments) {
      if (!attachment.path) continue;
      try {
        const fileData = createReadStream(attachment.path);

        const response = await context.post(`./runs/${RUN_ID}/tests/${test.id}/attachments`, {
          multipart: {
            files: {
              buffer: await buffer(fileData),
              name: attachment.name,
              mimeType: attachment.contentType,
            },
          },
        });
      } catch (error) {
        console.error("An error occurred:", error);
      }
    }
  }

  toPosixPath(pathString: string): string {
    return pathString.split(sep).join(posix.sep);
  }
}

export default RepertoireReporter;

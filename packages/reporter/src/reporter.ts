import { APIRequestContext, request } from "@playwright/test";
import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";
import { createReadStream, promises } from "node:fs";
import { posix, relative, sep } from "node:path";
import { buffer } from "node:stream/consumers";

class RepertoireReporter implements Reporter {
  context: Promise<APIRequestContext> | undefined;
  url: string;
  allPromises: Promise<any>[] = [];
  beginPromise: Promise<any> | undefined;
  runId: string;
  shouldCreateArtifacts: boolean;

  constructor(options: { url: string; shouldCreateArtifacts?: boolean }) {
    // URL should be the domain only (e.g. http://localhost:3000)
    this.url = `${options.url}/api/`;
    this.runId = process.env["RUN_ID"] ?? this.simpleHash(new Date().toISOString());
    this.shouldCreateArtifacts = options.shouldCreateArtifacts ?? false;
  }

  async getContext() {
    const context = await this.context;
    return context;
  }

  onBegin(config: FullConfig, suite: Suite) {
    console.log(`[Repertoire] Run ID: ${this.runId}`);
    console.log(`[Repertoire] Repertoire url: ${this.url}`);
    console.log(`[Repertoire] Should create artifacts: ${this.shouldCreateArtifacts.toString()}`);
    console.log(`[Repertoire] Starting the run with ${suite.allTests().length} tests.`);

    this.context = request.newContext({ baseURL: this.url });
    this.beginPromise = this.reportTestRunStart(config, suite);
  }

  onTestBegin(test: TestCase, result: TestResult) {
    console.log(`[Repertoire] Starting test ID: ${test.id}, Title: "${test.title}"`);
    const testStart = this.reportTestStart(test, result);

    this.allPromises.push(testStart);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    console.log(`[Repertoire] Finished test "${test.title}": ${result.status}`);
    const testEnd = this.reportTestEnd(test, result);
    this.allPromises.push(testEnd);

    if (result.attachments.length > 0) {
      console.log(
        `[Repertoire] Uploading files: ${result.attachments.map((attachment) => attachment.name).join(", ")}`
      );
      const uploadFiles = this.uploadFiles(result, test);
      this.allPromises.push(uploadFiles);
    }
  }

  async onEnd(result: FullResult) {
    await Promise.allSettled(this.allPromises);

    console.log(`[Repertoire] Finished the run: ${result.status}`);
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
    const totalShards = config.shard?.total ?? 1;
    const allTests: any[] = [];

    /**
     * * Group by projects, first level suite is always the project
     */
    for (const projectSuite of suite.suites) {
      console.log("[Repertoire] Project: ", projectSuite.title);
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

    const payload = {
      runId: this.runId,
      startTime: new Date().toISOString(),
      projects,
      totalShards,
      shardId: config.shard?.current ?? 1,
      version: config.version,
      tests: allTests,
    };

    try {
      const response = await context.post("./runs", {
        data: payload,
        headers: { "content-type": "application/json" },
      });
    } catch (err) {
      console.log(err);
    }

    if (this.shouldCreateArtifacts) {
      await promises.writeFile("./test-artifacts/run_start.json", JSON.stringify(payload));
    }
  }

  async reportTestRunEnd(result: FullResult) {
    const context = await this.getContext();
    if (!context) return;
    await this.beginPromise;

    const payload = {
      endTime: new Date().toISOString(),
      status: result.status,
    };

    try {
      const response = await context.put(`./runs/${this.runId}`, {
        data: payload,
        headers: { "content-type": "application/json" },
      });
    } catch (err) {
      console.log(err);
    }

    if (this.shouldCreateArtifacts) {
      await promises.writeFile("./test-artifacts/run_end.json", JSON.stringify(payload));
    }
  }

  async reportTestStart(test: TestCase, result: TestResult) {
    const context = await this.getContext();
    if (!context) return;
    await this.beginPromise;

    const payload = {
      startTime: new Date().toISOString(),
    };

    try {
      const response = await context.put(`./runs/${this.runId}/tests/${test.id}`, {
        data: payload,
        headers: { "content-type": "application/json" },
      });
    } catch (err) {
      console.log(err);
    }

    if (this.shouldCreateArtifacts) {
      await promises.writeFile(`./test-artifacts/${test.id}_start.json`, JSON.stringify(payload));
    }
  }

  async reportTestEnd(test: TestCase, result: TestResult) {
    const context = await this.getContext();
    if (!context) return;
    await this.beginPromise;

    const payload = {
      endTime: new Date().toISOString(),
      outcome: test.outcome(),
      errors: result.errors,
      status: result.status,
      expectedStatus: test.expectedStatus,
      attachments: result.attachments.map((attachment) => ({
        fileName: attachment.name,
        contentType: attachment.contentType,
      })),
    };

    try {
      const response = await context.put(`./runs/${this.runId}/tests/${test.id}`, {
        data: payload,
        headers: { "content-type": "application/json" },
      });
    } catch (err) {
      console.log(err);
    }

    if (this.shouldCreateArtifacts) {
      await promises.writeFile(`./test-artifacts/${test.id}_end.json`, JSON.stringify(payload));
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

        const response = await context.post(`./runs/${this.runId}/tests/${test.id}/attachments`, {
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

  simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32bit integer
    }
    return new Uint32Array([hash])[0].toString(36);
  };
}

export default RepertoireReporter;

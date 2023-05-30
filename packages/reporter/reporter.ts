import { APIRequestContext, request } from "@playwright/test";
import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";
import { simpleHash } from "./simpleHash";

const RUN_ID = simpleHash(new Date().toISOString());

const reportTestRunStart = async (suite: Suite, context?: APIRequestContext) => {
  try {
    const response = await context?.post("./runs", {
      data: {
        runId: RUN_ID,
        startTime: new Date().toISOString(),
        allTests: suite.allTests().map((test) => ({
          testId: test.id,
          title: test.title,
        })),
      },
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
};

const reportTestRunEnd = async (context?: APIRequestContext) => {
  try {
    const response = await context?.put(`./runs/${RUN_ID}`, {
      data: {
        endTime: new Date().toISOString(),
      },
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
};

const reportTestStart = async (test: TestCase, result: TestResult, context?: APIRequestContext) => {
  try {
    const response = await context?.post(`./runs/${RUN_ID}/tests`, {
      data: {
        testId: test.id,
        title: test.title,
        startTime: new Date().toISOString(),
      },
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
};

const reportTestEnd = async (test: TestCase, result: TestResult, context?: APIRequestContext) => {
  try {
    const response = await context?.put(`./runs/${RUN_ID}/tests/${test.id}`, {
      data: {
        endTime: new Date().toISOString(),
        outcome: test.outcome,
        errors: JSON.stringify(result.errors),
      },
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
};

class MyReporter implements Reporter {
  context: APIRequestContext | undefined;
  baseURL = "http://localhost:3000/api/";

  async onBegin(config: FullConfig, suite: Suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
    // console.log(Object.keys(process.env));

    this.context = await request.newContext({ baseURL: this.baseURL });
    reportTestRunStart(suite, this.context);
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
    await reportTestRunEnd(this.context);
  }
}

export default MyReporter;

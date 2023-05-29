import { request } from "@playwright/test";
import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";
import { simpleHash } from "./simpleHash";

const RUN_ID = simpleHash(new Date().toISOString());

const reportTestRunStart = async (suite: Suite) => {
  const context = await request.newContext({
    baseURL: "http://localhost:3000/api/",
  });
  try {
    const response = await context.post("./runs", {
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

const reportTestRunEnd = async () => {
  const context = await request.newContext({
    baseURL: "http://localhost:3000/api/",
  });
  try {
    await context.put(`./runs/${RUN_ID}`, {
      data: {
        endTime: new Date().toISOString(),
      },
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.log(err);
  }
};

const reportTestStart = async (test: TestCase, result: TestResult) => {
  const context = await request.newContext({
    baseURL: "http://localhost:3000/api/",
  });
  try {
    const response = await context.post(`./runs/${RUN_ID}/tests`, {
      data: {
        testId: test.id,
        title: test.title,
        startTime: new Date().toISOString(),
      },
      headers: {
        "content-type": "application/json",
      },
    });
    console.log(response.url());
  } catch (err) {
    console.log(err);
  }
};

const reportTestEnd = async (test: TestCase, result: TestResult) => {
  const context = await request.newContext({
    baseURL: "http://localhost:3000/api/",
  });
  console.log("1");
  try {
    const response = await context.put(`./runs/${RUN_ID}/tests/${test.id}`, {
      data: {
        endTime: new Date().toISOString(),
        outcome: test.outcome,
        errors: JSON.stringify(result.errors),
      },
      headers: {
        "content-type": "application/json",
      },
    });
    console.log(response);
    console.log(response.url());
  } catch (err) {
    console.log("3");
    console.log(err);
  }
};

class MyReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
    // console.log(Object.keys(process.env));
    // console.log(suite.allTests().map((test, index) => `Test ${index} - ID: ${test.id}, Title: ${test.title}`));
    reportTestRunStart(suite);
  }

  onTestBegin(test: TestCase, result: TestResult) {
    console.log(`Starting test ID: ${test.id}, Title: ${test.title}`);
    // send start time
    reportTestStart(test, result);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    console.log(`Finished test ${test.title}: ${result.status}`);
    // console.log(JSON.stringify(result, getCircularReplacer()));
    // send end time
    reportTestEnd(test, result);
    // console.log(test);

    console.log(result);
  }

  async onEnd(result: FullResult) {
    console.log(`Finished the run: ${result.status}`);
    await reportTestRunEnd();
  }
}

export default MyReporter;

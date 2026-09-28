require("./setup");
const request = require("supertest");
const app = require("../server");

async function registerAndLogin(email = "owner@example.com") {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Owner", email, password: "secret123" });
  return res.body.token;
}

function sampleSurveyPayload() {
  return {
    title: "Customer Satisfaction",
    description: "Quick feedback survey",
    category: "Feedback",
    anonymousAllowed: true,
    questions: [
      { type: "short-answer", question: "What is your name?", required: true },
      {
        type: "multiple-choice",
        question: "How did you hear about us?",
        options: ["Friend", "Ad", "Search"],
        required: true,
      },
      { type: "rating", question: "Rate your experience", required: true },
    ],
  };
}

describe("Survey CRUD + publish flow", () => {
  test("creating a survey requires auth", async () => {
    const res = await request(app).post("/api/surveys").send(sampleSurveyPayload());
    expect(res.status).toBe(401);
  });

  test("owner can create, list, and fetch their survey", async () => {
    const token = await registerAndLogin();
    const create = await request(app)
      .post("/api/surveys")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleSurveyPayload());
    expect(create.status).toBe(201);
    expect(create.body.status).toBe("draft");
    expect(create.body.questions).toHaveLength(3);

    const list = await request(app).get("/api/surveys").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);

    const fetched = await request(app)
      .get(`/api/surveys/${create.body._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.title).toBe("Customer Satisfaction");
  });

  test("a draft survey is not publicly reachable until published", async () => {
    const token = await registerAndLogin();
    const create = await request(app)
      .post("/api/surveys")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleSurveyPayload());

    const draftFetch = await request(app).get(`/api/surveys/public/${create.body.shareSlug}`);
    expect(draftFetch.status).toBe(403);

    const publish = await request(app)
      .patch(`/api/surveys/${create.body._id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "published" });
    expect(publish.status).toBe(200);
    expect(publish.body.status).toBe("published");

    const publicFetch = await request(app).get(`/api/surveys/public/${create.body.shareSlug}`);
    expect(publicFetch.status).toBe(200);
    expect(publicFetch.body.questions).toHaveLength(3);
  });
});

describe("Response submission", () => {
  async function createAndPublishSurvey(token) {
    const create = await request(app)
      .post("/api/surveys")
      .set("Authorization", `Bearer ${token}`)
      .send(sampleSurveyPayload());
    await request(app)
      .patch(`/api/surveys/${create.body._id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "published" });
    return create.body;
  }

  test("anonymous respondent can submit a valid response", async () => {
    const token = await registerAndLogin();
    const survey = await createAndPublishSurvey(token);
    const [nameQ, sourceQ, ratingQ] = survey.questions;

    const res = await request(app).post(`/api/responses/${survey.shareSlug}`).send({
      respondentToken: "browser-token-1",
      answers: [
        { questionId: nameQ._id, value: "Grace" },
        { questionId: sourceQ._id, value: "Friend" },
        { questionId: ratingQ._id, value: 5 },
      ],
    });
    expect(res.status).toBe(201);
  });

  test("rejects a response missing a required question", async () => {
    const token = await registerAndLogin();
    const survey = await createAndPublishSurvey(token);
    const [nameQ] = survey.questions;

    const res = await request(app)
      .post(`/api/responses/${survey.shareSlug}`)
      .send({ respondentToken: "browser-token-2", answers: [{ questionId: nameQ._id, value: "Grace" }] });
    expect(res.status).toBe(400);
    expect(res.body.missing.length).toBeGreaterThan(0);
  });

  test("blocks a second submission from the same browser token", async () => {
    const token = await registerAndLogin();
    const survey = await createAndPublishSurvey(token);
    const answers = survey.questions.map((q) => ({
      questionId: q._id,
      value: q.type === "rating" ? 4 : q.type === "multiple-choice" ? "Ad" : "Grace",
    }));

    const first = await request(app)
      .post(`/api/responses/${survey.shareSlug}`)
      .send({ respondentToken: "same-browser", answers });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/responses/${survey.shareSlug}`)
      .send({ respondentToken: "same-browser", answers });
    expect(second.status).toBe(409);
  });

  test("analytics reflect submitted responses", async () => {
    const token = await registerAndLogin();
    const survey = await createAndPublishSurvey(token);
    const answers = survey.questions.map((q) => ({
      questionId: q._id,
      value: q.type === "rating" ? 5 : q.type === "multiple-choice" ? "Ad" : "Grace",
    }));
    await request(app).post(`/api/responses/${survey.shareSlug}`).send({ respondentToken: "a", answers });
    await request(app).post(`/api/responses/${survey.shareSlug}`).send({ respondentToken: "b", answers });

    const analytics = await request(app)
      .get(`/api/analytics/${survey._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(analytics.status).toBe(200);
    expect(analytics.body.totalResponses).toBe(2);
    expect(analytics.body.completionRate).toBe(100);
    expect(analytics.body.averageRating).toBe(5);
  });

  test("CSV export returns a CSV file", async () => {
    const token = await registerAndLogin();
    const survey = await createAndPublishSurvey(token);
    const answers = survey.questions.map((q) => ({
      questionId: q._id,
      value: q.type === "rating" ? 5 : q.type === "multiple-choice" ? "Ad" : "Grace",
    }));
    await request(app).post(`/api/responses/${survey.shareSlug}`).send({ respondentToken: "a", answers });

    const res = await request(app)
      .get(`/api/analytics/${survey._id}/export?format=csv`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.text).toContain("Grace");
  });
});

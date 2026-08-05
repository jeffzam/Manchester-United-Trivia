import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const data = JSON.parse(await readFile(new URL("../app/data/questions.json", import.meta.url), "utf8"));

test("starts with six categories and at least ten questions in each", () => {
  assert.equal(data.categories.length, 6);
  for (const category of data.categories) assert.ok(category.questions.length >= 10, category.id);
});

test("every question has four answers and one valid correct answer", () => {
  const ids = new Set();
  for (const category of data.categories) {
    for (const question of category.questions) {
      assert.equal(question.answers.length, 4, question.id);
      assert.ok(Number.isInteger(question.correct) && question.correct >= 0 && question.correct < 4, question.id);
      assert.ok(!ids.has(question.id), `duplicate id ${question.id}`);
      ids.add(question.id);
    }
  }
});

test("every fact names a source that exists", () => {
  const sourceIds = new Set(data.sources.map((source) => source.id));
  for (const category of data.categories) {
    for (const question of category.questions) assert.ok(sourceIds.has(question.source), question.id);
  }
});

import { readFile, writeFile } from "node:fs/promises";

const bankUrl = new URL("../app/data/questions.json", import.meta.url);
const queueUrl = new URL("../app/data/daily-question-queue.json", import.meta.url);
const bank = JSON.parse(await readFile(bankUrl, "utf8"));
const queue = JSON.parse(await readFile(queueUrl, "utf8"));
const today = new Date().toISOString().slice(0, 10);

if (bank.updatedOn === today) {
  console.log(`Question bank already updated on ${today}.`);
  process.exit(0);
}

const missing = bank.categories.filter((category) => !queue[category.id]?.length);
if (missing.length) {
  throw new Error(`Daily queue needs reviewed questions for: ${missing.map((item) => item.name).join(", ")}`);
}

for (const category of bank.categories) {
  const next = queue[category.id].shift();
  if (category.questions.some((question) => question.id === next.id)) {
    throw new Error(`Duplicate question id: ${next.id}`);
  }
  category.questions.push(next);
}

bank.updatedOn = today;
await Promise.all([
  writeFile(bankUrl, `${JSON.stringify(bank, null, 2)}\n`),
  writeFile(queueUrl, `${JSON.stringify(queue, null, 2)}\n`),
]);

console.log(`Added one reviewed question to each of ${bank.categories.length} categories for ${today}.`);

# United Trivia

A fan-made Manchester United trivia game combining a six-category prize wheel with a high-stakes, four-answer quiz.

## First version

- Six categories: Players & Legends, Iconic Matches, Trophies & Triumphs, Managers & Eras, Old Trafford & Origins, and Kit, Crest & Culture
- Ten-question perfect-run challenge
- One-use 50:50 and re-spin lifelines
- 60 sourced starter questions (10 in every category)
- Responsive keyboard, mouse, and touch-friendly interface
- Daily question-bank automation that promotes one queued question per category

## Daily question bank

The scheduled GitHub workflow runs once per day. It moves one reviewed question from each category in `app/data/daily-question-queue.json` into the live bank, updates the date, validates the data, and commits the change. The first version includes a seven-day reviewed queue; add more reviewed questions before it runs low.

## Local development

```bash
pnpm install
pnpm dev
```

Run checks with `pnpm test` and `pnpm build`.

## Disclaimer

This is an independent fan project and is not affiliated with, endorsed by, or sponsored by Manchester United Football Club.

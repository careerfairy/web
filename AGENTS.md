# Repository Guidelines

## Project Structure & Module Organization

This Turbo monorepo hosts two primary apps under `apps/`: the Next.js web client (`web`) and the Expo mobile app (`mobile`). Shared code lives in `packages/`, where `shared-lib` and `shared-ui` deliver reusable TypeScript utilities and cross-app UI, `functions` encapsulates Firebase Cloud Functions, and the `config-*` folders expose lint/Jest/TS presets. Firebase and emulator assets reside beside the root (`firebase.json`, `storage.rules`, `dataconnect/`, `emulatorData/`). Web tests sit in `apps/web/tests` (unit mocks plus Playwright e2e), while static assets are under `apps/web/public`.

## Build, Test, and Development Commands

Run `npm run dev` at the root to launch workspace dev servers (web by default; mobile is filtered out). For focused work, call `npm run dev -w @careerfairy/webapp` or `npm run native` in the repository root to open Expo. Use `npm run start:webapp` to boot Next.js against the Firebase emulators, and `npm run build` for a full Turbo build. Quality gates include `npm run lint`, `npm run test`, and `npm run test:e2e-webapp`; add `:coverage` or `:debug` suffixes from the web workspace when needed. `npm run format` applies Prettier across the monorepo.

## Coding Style & Naming Conventions

TypeScript is the default across apps and packages. Prettier enforces a 3-space indent and no semicolons; always run `npm run format` or rely on husky/lint-staged pre-commit hooks. Stick to PascalCase for components, camelCase for utilities and hooks (`useFeatureFlag`), and kebab-case for filenames rendered by Next.js routing. Shared constants belong in `packages/shared-lib` to avoid duplication.

## Testing Guidelines

Unit tests use Jest with the config in `jest.config.ts`; name files `*.test.ts(x)` beside the code or under `apps/web/tests`. End-to-end coverage uses Playwright (`npm run test:e2e-webapp`), with reports in `apps/web/playwright-report`. Mobile presently stubs out Jest (`--passWithNoTests`); add coverage before shipping feature work there. Ensure new features include either component tests or e2e flows touching critical funnels.

## Commit & Pull Request Guidelines

Recent history favors `Type: short summary (#ticket)` messages (e.g., `fix: adjust sponsor CTA (#1820)`) and occasional emoji classifiers. Include scope tags such as `Enhance`, `Hotfix`, or `feat` when appropriate. PRs must link Jira tickets, outline test evidence (`npm run test`, screenshots for UI changes), and note any schema or Firebase rule edits. Request reviews from owners of affected packages when touching `packages/*`.

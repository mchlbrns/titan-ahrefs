# 🤝 Contributing to titan-ahrefs

Thank you for contributing to `titan-ahrefs`! Please follow these guidelines to keep the codebase clean, robust, and production-ready.

---

## 🚀 Quickstart Development Setup

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Verify Typecheck**:
   ```bash
   npm run typecheck
   ```

3. **Run Code Quality Audit**:
   ```bash
   npm run lint
   ```

4. **Run Unit & Integration Tests**:
   ```bash
   npm test
   ```

---

## 🛠️ Code Guidelines

1. **TypeScript Strict Mode**: TypeScript `strict: true` is enforced. Avoid `any` types; define explicit interfaces in `src/types.ts`.
2. **Backward Compatibility**: Do not change CLI command names or break existing report schemas.
3. **Structured Logging**: Use `Logger` instance methods (`logger.info`, `logger.debug`, `logger.warn`, `logger.error`) rather than raw `console.log` inside source modules.
4. **Error Handling**: Throw typed errors derived from `AhrefsEngineError` (`src/errors.ts`).
5. **Testing**: Write unit tests in `tests/unit/` for all new features or bug fixes.

## 2025-08-30 — Global error handling refresh

**Goal**  
Keep the server crashing safely on fatal errors, but follow the lint rule that forbids `process.exit()`.

### What changed

1. **Unhandled promise rejections**

   ```js
   process.on("unhandledRejection", reason => {
   	logger.error("Unhandled promise rejection", {
   		event: "unhandledRejection",
   		reason,
   	});
   	throw reason instanceof Error ? reason : new Error(String(reason));
   });
   ```

   - We now log through the shared Winston logger instead of `console.error`.
   - If the rejection is not an `Error`, we wrap it so the stack trace is preserved.

2. **Uncaught exceptions**
   ```js
   process.on("uncaughtException", err => {
   	logger.error("Uncaught exception", {
   		event: "uncaughtException",
   		error: err,
   	});
   	throw err;
   });
   ```
   - Same idea: log with Winston, then rethrow so Node stops the process.

### Why

- We still abort on unknown failures, avoiding a broken runtime state.
- The lint warning `n/no-process-exit` is resolved.
- Fatal events are now visible in the standard log files, not only in stderr.

### Verification

- `npx eslint src/server.js`
- Manual check: trigger a dummy rejection/exception and see the entry in `logs/error.log`.

### Next steps

- Add graceful shutdown if we ever need to close DB connections before the crash.

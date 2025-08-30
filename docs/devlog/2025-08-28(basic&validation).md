## 2025-08-28 — Password reset flow (Step 1: validation & basic route)

**Feature goal:**  
Start implementing `/auth/password/reset`. User submits `email`, `token`, `newPassword`, and `newPasswordConfirmation`.  
First iteration: validate input data with Zod and wire up the route.

**Contract:**

- Route: `POST /api/auth/password/reset`
- Auth: public
- Request body must include:
  - `email` (valid email)
  - `token` (string, min length 16)
  - `newPassword` and `newPasswordConfirmation` (min 6 characters, must match)

### Development steps

1. Added **in-memory token store** (Map with `save`, `get`, `remove`, `clear`) to simulate persistence during tests.

2. Wrote **red test** ensuring request with all required fields returns `200`.

3. Added **Zod schema** for password reset request:
   ```js
   passwordReset: z.object({
     email: z.string().email("Invalid email"),
     token: z.string().min(16),
     newPassword: z.string().min(6, "Password must be at least 6 characters"),
     newPasswordConfirmation: z.string().min(6, "Password must be at least 6 characters"),
   }).refine(data => data.newPassword === data.newPasswordConfirmation, {
     message: "Passwords do not match",
   });
   Registered the route:
   ```

```js
router.post(
	"/password/reset",
	validate(schemas.passwordReset),
	authController.resetPassword
);
```

✅ Result: validation is in place, request with all required fields passes.

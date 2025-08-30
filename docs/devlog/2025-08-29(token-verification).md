## 2025-08-29 — Password reset flow (Step 2: token verification)

**Feature goal:**  
Ensure the reset token provided by the user matches the one stored in memory.

**Contract:**

- Compare `token` from request with stored token for the given email.
- If they don’t match → return `400 Invalid or expired token`.

### Development steps

1. Wrote **red test**:
   ```js
   it("returns 400 if token from DB and request differ", async () => {
   	const res = await agent.post(route).send({
   		email,
   		token: "invalidtoken",
   		newPassword: "pass456",
   		newPasswordConfirmation: "pass456",
   	});
   	expect(res.statusCode).toBe(400);
   });
   ```

### Implemented token check service:

```js
async function checkTokens(data) {
  const tokenStore = require("./token-memory.store");
  const inMemoryToken = tokenStore.get(data.email)?.token;
  if (inMemoryToken !== data.token) {
    throw new BadRequestError("Invalid or expired token");
  }
}
Controller calls this service before updating the password:
await authServices.checkTokens(req.validatedData);
```

✅ Result: token mismatch triggers 400. If token matches → request proceeds.

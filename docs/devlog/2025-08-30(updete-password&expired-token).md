## 2025-08-30 — Password reset flow (Step 3: update password, expire token)

**Feature goal:**  
If tokens match, update the user’s password in the database. Invalidate the used token. Ensure old password no longer works, new password does.

**Contract:**

- Hash new password with bcrypt before saving.
- Return `204 No Content` on success.
- Delete token from store after successful reset.
- Expired tokens → `400`.
- Token format validated via regex (`/^[a-f0-9]{32}$/`).

### Development steps

1. **Repository method** (`user.repository.mongo.js`):
   ```js
   async updatePassword(email, hashedPassword) {
     return await UserModel.findOneAndUpdate(
       { email },
       { $set: { password: hashedPassword } },
       { new: false },
     ).exec();
   }
   ```

### Service:

```js
async function updateUserPassword(email, password, userRepo) {
	const hashedPassword = await bcrypt.hash(password, 10);
	const result = await userRepo.updatePassword(email, hashedPassword);
	if (!result) throw new NotFoundError("User not found");
}
```

### Controller:

```js
Copy code
await authServices.checkTokens(body);
await userServices.updateUserPassword(body.email, body.newPassword, userRepo);
tokenStore.remove(body.email);
return res.status(204).end();
```

### Tests:

- Reset succeeds → returns 204.
- Old password login → 401.
- New password login → 200.
- Reuse old token after reset → 400.
- Expired token → 400.
- Invalid token format → 400.

### Token expiration: TTL added to config (RESET_TOKEN_TTL_MS). Test simulates expiry by mutating createdAt.

✅ Result:

- Password updates securely (hashed).
- Token is one-time use and expires after TTL.
- Full lifecycle covered by tests.

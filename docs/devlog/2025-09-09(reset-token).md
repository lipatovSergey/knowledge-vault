## 2025-09-09 — Password reset tokens (selector/validator)

**Feature goal:**
Adopt the “selector/validator” token pattern for password resets. The schema change is minor, but the security/ergonomics gains justify the switch.

**Contract:**

- Route: — (not covered in this entry)
- Auth: —
- Updatable fields: token document fields (`selector`, `validatorHash`, `userId`, `createdAt`, `expiresAt`, later `usedAt`)
- Validation: —
- Policy (for this feature):

  - Multiple active tokens are allowed per email
  - TTL: 15 minutes
  - On successful password reset, delete all tokens for that email

---

### Development steps

1. Defined schema (Mongoose)

   ```js
   const resetTokenSchema = new mongoose.Schema(
   	{
   		selector: { type: String, unique: true, required: true },
   		validatorHash: { type: String, required: true, select: false },
   		userId: {
   			type: mongoose.Schema.Types.ObjectId,
   			ref: "User",
   			required: true,
   			immutable: true,
   		},
   		createdAt: { type: Date, default: Date.now, immutable: true },
   		expiresAt: { type: Date, required: true },
   	},
   	{
   		strict: "throw",
   		toJSON: {
   			virtuals: true,
   			getters: true,
   			transform(_doc, ret) {
   				delete ret.__v;
   				delete ret.validatorHash;
   				return ret;
   			},
   		},
   		toObject: { virtuals: true, getters: true },
   	}
   );
   ```

   Notes:

   - `createdAt` doesn’t need `required` (it has a default and is immutable).
   - `strict: 'throw'` — reject unknown fields (protects against typos/garbage).
   - `toJSON` / `toObject`:

     - `virtuals: true` — include virtuals (e.g., `isExpired`) in outputs.
     - `getters: true` — apply getters on serialization.
     - `transform` — remove `__v` and `validatorHash` from JSON.

2. Wrote red tests (repository-focused)

   - **Save token**
     Ensures the token persists with correct fields:

     - `selector` matches input
     - `createdAt` is a `Date`
     - `usedAt` is `null`
     - only one document exists in DB

   - **Find active by selector**
     Should return a _narrow_ JS object with: `_id`, `userId`, `validatorHash`; and both IDs must be valid ObjectIds.
   - **Consume by selector**
     Calling the method should set `usedAt` to `Date.now` and return a truthy boolean.

3. Implemented minimal functionality

   - **repository**

     - `create(resetTokenData)`
       Saves the new token document.
     - `findActiveBySelector(selector)`
       Uses `.active()`, selects `"_id userId +validatorHash"`, returns lean JS object.
     - `consumeBySelector(selector)`
       `findOneAndUpdate` to set `usedAt: new Date()`, returns boolean based on result.

   - **service** — —
   - **controller** — —
   - **route** — —

---

### Bug and fix (if applicable)

- None explicitly; tests were red by design until each repository method was implemented.
- Serialization hardening: ensured `validatorHash` is stripped in `toJSON.transform`.

---

### Result

- Repository tests turned green:

  - token creation persists expected fields,
  - active token lookup returns the narrow shape,
  - token consumption flips `usedAt` and returns a truthy value.

- The schema behavior aligns with the intended policy (multiple tokens, TTL concept, cleanup after success — policy stated here; wiring occurs at higher layers).

**Future work / related improvements**

- Enforce TTL = 15 minutes and “delete all tokens for email on success” at the service/controller layer.
- (When applicable) add/align `usedAt` in the schema alongside the consume flow.

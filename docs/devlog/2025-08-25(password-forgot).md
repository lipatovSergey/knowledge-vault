````md
## 2025-08-25 — Password reset (forgotten password) flow: initial slice

**Feature goal:**  
Start the “forgot password” flow. On request, return a neutral response and, if the user exists, drop a password-reset email into the in-memory mailbox.

**Contract:**  
- Route: `POST /api/auth/password/forgot`  
- Auth: public  
- Behavior:
  - Always respond `200` with a neutral message
  - If user exists → enqueue a password-reset email (no leaks in response)
- Mail: use the `MailService` contract (in-memory implementation for tests)

### Development steps

1) **Red test** — neutral response exists  
_File:_ `components/auth/__tests__/auth.password.forgot.test.js`
```js
describe("POST /api/auth/password/forgot", () => {
  it("returns 200 with a neutral message", async () => {
    const res = await request(global.app).post("/api/auth/password/forgot").send({ email: "test@test.com" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });
});
````

2. **Green** — minimal controller + route (stub)
   *Files:*
   `components/auth/auth.controller.js`

```js
const authController = {
  async forgotPassword(req, res, next) {
    return res.status(200).json({ message: "If this account exists, an email has been sent" });
  },
};
module.exports = authController;
```

`components/auth/auth.routes.js`

```js
const router = require("express").Router();
const authController = require("./auth.controller");
router.post("/password/forgot", authController.forgotPassword);
module.exports = router;
```

`app.js`

```js
const authRoutes = require("./components/auth/auth.routes");
app.use("/api/auth", authRoutes);
```

3. **Red test** — email is dropped into mailbox for existing user
   *Helper:* `tests/mailbox.helper.js`

```js
const mail = require("../../services/mail");
module.exports = { clear: () => mail.clear(), lastTo: (email) => mail.lastTo(email), getSent: () => mail.getSent() };
```

*Test:* `auth.password.forgot.test.js`

```js
const email = "test@example.com";
beforeEach(() => mailbox.clear());

it("drops a reset email into the mailbox for existing user", async () => {
  await request(global.app).post("/api/users").send({ name: "User", email, password: "pass123" });
  const res = await request(global.app).post("/api/auth/password/forgot").send({ email });
  expect(res.statusCode).toBe(200);

  const msg = mailbox.lastTo(email);
  expect(msg).toBeDefined();            // RED: no email yet
  expect(msg.type).toBe("password-reset");
});
```

4. **Green** — real controller logic using repo + mail singleton
   *File:* `components/auth/auth.controller.js`

```js
const userRepo = require("../users/user.repository.mongo");
const mail = require("../../services/mail");

const authController = {
  async forgotPassword(req, res, next) {
    try {
      const email = req.body?.email; // validation to be added later
      const user = await userRepo.findByEmail(email);

      if (user) {
        await mail.sendPasswordReset({
          to: email,
          subject: "Reset your password",
          text: "Reset token will be added later",
        });
      }

      return res.status(200).json({ message: "If this account exists, an email has been sent" });
    } catch (err) {
      next(err);
    }
  },
};
module.exports = authController;
```

### Why this design

* **Controller depends on a contract**, not a concrete mailer. We can swap the in-memory implementation for SMTP/Ethereal later with no controller changes.
* **Neutral response** prevents user enumeration (no hint whether the email exists).

### Result

* Tests pass: neutral response + mailbox receives a reset email when the user exists.
* The flow is ready for the next iterations (validation, token generation, templates, rate limiting).


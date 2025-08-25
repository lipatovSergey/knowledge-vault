## YYYY-MM-DD — <Feature name / short description>

**Feature goal:**  
<Brief description of what the feature does and why it’s needed.>  

**Contract:**  
- Route: <HTTP method + endpoint>  
- Auth: <requireAuth / public / role-based, etc.>  
- Updatable fields: <list of fields or data affected>  
- Validation: <schema or rules, e.g., Zod, Joi, etc.>

### Development steps
1. Defined validation schema:
   ```js
   <schema snippet or reference>
	```

2. Wrote red tests:
   * \<Case 1 — unauthorized / forbidden>
   * \<Case 2 — invalid input>
   * \<Case 3 — successful case>

3. Implemented minimal functionality:
   * **repository** — \<repository methods added/modified>
   * **service** — \<business logic / use-case>
   * **controller** — <what controller does>
   * **route** — <endpoint definition with middlewares>

### Bug and fix (if applicable)
* **Bug:** <short description of what went wrong>.
* **Fix:** \<how the bug was solved, and why this approach>.

### Result
* <Summary of test results>.  
* <Confirmation that the feature meets the contract>.
* \<Future work, related endpoints, or improvements>.
```


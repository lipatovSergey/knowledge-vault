import type { ValidationError } from "../../src/contracts/error/error.contract";

type ValidationErrorExpectation = (
  error: ValidationError,
  expectedFields?: string[],
  formErrorsLength?: number,
  source?: string,
) => void;

export function createExpectValidationError(instance: string): ValidationErrorExpectation {
  return function expectValidationError(
    error,
    expectedFields = [],
    formErrorsLength = 0,
    source = "body",
  ) {
    expect(error.instance).toBe(instance);
    expect(error.errors.source).toBe(source);
    expect(error.errors.fieldErrors).toEqual(
      expect.objectContaining(
        Object.fromEntries(expectedFields.map((key) => [key, expect.any(Array)])),
      ),
    );
    expect(error.errors.formErrors).toHaveLength(formErrorsLength);
  };
}

import request, { Response } from "supertest";

export type SupertestResponse<T> = Response & { body: T };

// @types/supertest currently ships an outdated agent type,
// so we derive the correct one directly from request.agent
export type AuthAgent = ReturnType<typeof request.agent>;

export type MessageResponse = {
  message: string;
};

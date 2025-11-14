import { PasswordResetTokenContract, passwordResetTokenDomainSchema } from "../../types/primitives";
import { mapDomainUserToContract } from "../user/user.mapper";

export const mapDomainAuthToContract = mapDomainUserToContract;

export function mapContractTokenToDomain(token: PasswordResetTokenContract) {
  const [selector, validator] = token.split(".", 2);
  return passwordResetTokenDomainSchema.parse({ selector, validator });
}

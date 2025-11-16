import {
  PasswordResetTokenContract,
  passwordResetTokenContractSchema,
  PasswordResetTokenDomain,
  passwordResetTokenDomainSchema,
} from "../../types/primitives";
import { mapDomainUserToContract } from "../user/user.mapper";

export const mapDomainAuthToContract = mapDomainUserToContract;

export function mapContractTokenToDomain(token: PasswordResetTokenContract) {
  const [selector, validator] = token.split(".", 2);
  return passwordResetTokenDomainSchema.parse({ selector, validator });
}

export function mapDomainTokenToContract(token: PasswordResetTokenDomain) {
  const tokenString = `${token.selector}.${token.validator}`;
  return passwordResetTokenContractSchema.parse(tokenString);
}

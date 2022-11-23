import { IdentitySafe } from '..';

export class IdentityCreated {
  public static readonly NAME: string = 'identity.created';

  constructor(private readonly _identity: IdentitySafe) {}

  public get identity(): IdentitySafe {
    return this._identity;
  }
}

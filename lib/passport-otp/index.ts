/// <reference types="express" />
/// <reference types="passport-strategy" />

import express from 'express';
import { Strategy as PassportStrategy } from 'passport-strategy';

export interface OtpExtractor {
  extract(req: express.Request): string;
}

export class QueryOtpExtractor implements OtpExtractor {
  constructor(private readonly paramName = 'otp') {}

  extract(req: express.Request): string {
    return req.query[this.paramName] as string;
  }
}

type StrategyArgs = {
  extractor: OtpExtractor;
  passReqToCallback: boolean;
};

export class Strategy extends PassportStrategy {
  private _name?: string;
  private _extractor: OtpExtractor;
  private _verify: CallableFunction;
  private _passReqToCallback: boolean;

  constructor(args: StrategyArgs, verify: CallableFunction) {
    super();

    if (typeof args === 'function') {
      verify = args;
      args = {} as StrategyArgs;
    }

    if (!verify) {
      throw new TypeError('OtpStrategy requires a verify callback');
    }

    this._name = 'otp';
    const { extractor, passReqToCallback = false } = args;

    this._extractor = extractor ? extractor : new QueryOtpExtractor();
    this._verify = verify;
    this._passReqToCallback = passReqToCallback;
  }

  public get name(): string | undefined {
    return this._name;
  }

  authenticate(req: express.Request, options?: any) {
    const otp = this._extractor.extract(req);

    if (!otp) {
      return this.fail(
        { message: options.badRequestMessage || 'Missing otp' },
        400,
      );
    }

    const verified = (err: Error, user: any, info: any) => {
      if (err) {
        return this.error(err);
      }

      if (!user) {
        return this.fail(info);
      }

      this.success(user, info);
    };

    try {
      if (this._passReqToCallback) {
        this._verify(req, otp, verified);
      } else {
        this._verify(otp, verified);
      }
    } catch (err) {
      return this.error(err);
    }
  }
}

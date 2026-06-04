import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { googleOAuthConfig } from './googleOAuth.config';
import { IAuthService } from '../services/interface/IAuthService';

export const configurePassport = (authService: IAuthService) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleOAuthConfig.clientID,
        clientSecret: googleOAuthConfig.clientSecret,
        callbackURL: googleOAuthConfig.callbackURL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await authService.validateGoogleUser(profile);
          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
};

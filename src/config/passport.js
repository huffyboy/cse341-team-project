// import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

export default function configurePassport(passportInstance) {
	passportInstance.use(
		new GitHubStrategy(
			{
				clientID: process.env.GITHUB_CLIENT_ID,
				clientSecret: process.env.GITHUB_CLIENT_SECRET,
				callbackURL: `${process.env.SERVER_URL}/auth/github/callback`,
				scope: ['user:email'],
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					const user = await User.findOne({ githubId: profile.id });

					if (user) {
						// Updating user info if it has changed on GitHub
						user.name = profile.displayName || profile.username;
						user.githubUsername = profile.username;
						user.avatarUrl = profile.photos?.[0]?.value;

						if (
							profile.emails &&
							profile.emails[0] &&
							profile.emails[0].value
						) {
							user.email = profile.emails[0].value;
						}

						await user.save();
						return done(null, user);
					}

					// If user not found, create a new one
					const newUser = new User({
						githubId: profile.id,
						name: profile.displayName || profile.username,
						githubUsername: profile.username,
						email: profile.emails?.[0]?.value, // A user can have email set to private so might be null
						avatarUrl: profile.photos?.[0]?.value, // Also private, or just never configured
					});

					await newUser.save();
					return done(null, newUser);
				} catch (err) {
					console.error('Error in GitHub Strategy:', err);
					return done(err, null);
				}
			}
		)
	);

	passportInstance.serializeUser((user, done) => {
		done(null, user.id); // user.id is the MongoDB _id
	});

	passportInstance.deserializeUser(async (id, done) => {
		try {
			const user = await User.findById(id);
			done(null, user);
		} catch (err) {
			done(err, null);
		}
	});
}

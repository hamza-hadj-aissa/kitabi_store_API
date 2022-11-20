const passport = require("passport");
const { Strategy } = require('passport-local');
const Users = require("../../db/models/users")(require('../../db/models/index').sequelize, require('sequelize').DataTypes);
const bcrypt = require('bcryptjs');


passport.serializeUser((user, done) => {
    console.log('serializing')
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log('deserializing');
    try {
        const user = await Users.findByPk(id);
        if (!user) {
            throw new Error('user not found');
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
})

passport.use(
    new Strategy(
        {
            usernameField: "email",
        },
        async (email, password, done) => {
            console.log('logging in.. ')
            // Match user
            await Users.findOne({
                where: {
                    email
                }
            })
                .then((user) => {
                    if (!user) {
                        console.log("Email is not registered")
                        return done(null, false, { message: "Email is not registered" });
                    }

                    // Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            console.log(err);
                            throw err;
                        }
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: "Incorrect password" });
                        }
                    });
                })
                .catch((err) => console.log(err));
        }
    )
)

module.exports = passport;

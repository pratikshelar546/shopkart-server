import JwtPassport from "passport-jwt";

import { UserModel } from "../database/userModel";
import { AdminModel } from "../database/adminModel";

const JWTStrategy = JwtPassport.Strategy;
const ExtractJwt = JwtPassport.ExtractJwt;

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "flipcart",
};

export default (passport) => {
  passport.use(
    new JWTStrategy(options, async (jwt__payload, done) => {
      try {
        const doesUserExist = await UserModel.findById(jwt__payload.user) || await AdminModel.findById(jwt__payload.admin);
        // const doesUserExist =  await AdminModel.findById(jwt__payload.admin);

        if (!doesUserExist) return done(null, false);

        return done(null, doesUserExist);
      } catch (error) {
        throw new Error(error);
      }
    })
  );
};
// export default (passport) => {
//   passport.use(
//     new JWTStrategy(options, async (jwt__payload, done) => {
//       try {
//         const doesUserExist = await UserModel.findById(jwt__payload.user);
//         if (!doesUserExist) return done(null, false);
//         return done(null, doesUserExist);
//       } catch (error) {
//         throw new Error(error);
//       }
//     })
//   );
// };
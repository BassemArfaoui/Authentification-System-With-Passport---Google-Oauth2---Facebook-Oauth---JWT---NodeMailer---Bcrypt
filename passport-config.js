import bcrypt from 'bcrypt';
import { Strategy as LocalStrategy } from 'passport-local';

let warning =[];
let success=[];

function capitalize(sentence)
{
  return  sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

function initialize(passport, getUserByEmail, getUserById,isVerified){
    // Function to authenticate users
    const authenticateUsers = async (email, password, done) => {
        // Get users by email
        const user_arr =await getUserByEmail(email);
        let user=null;
        if (user_arr.length==0){
            warning.push({message: "No user found with that email"});
            return done(null, false, {message: "No user found with that email"});
        }
        try {
            user = user_arr[0];
            const isVerif=await isVerified(user.email);
            // Compare passwords
            if(isVerif==true)
            {
              if(user.password)
              {
                if(await bcrypt.compare(password, user.password)){
                  success.push({message: "Logged in Successfully, Welcome "+capitalize(user.name)});
                  return done(null, user ,{message: "Logged in Successfully, Welcome "+user.name});
              } else{
                  warning.push({message: "Incorrect Password"});
                  return done (null, false, {message: "Incorrect Password"});
              }
              }
              else
              {
                warning.push({message: "No Login account with this Email, Try continue with Google/Facebook"});
                return done (null, false, {message:  "No Login account with this Email"});
              }
            }
            else 
            {
              warning.push({message: "Email not verified"});
              return done (null, false, {message: "Email not verified"});
            }
        } catch (e) {
            console.log(e);
            warning.push({message: "unexpected error occured, Try again Later"});
            return done(e)
        }
    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUsers))
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
          const user = await getUserById(id); 
          done(null, user[0]);
        } catch (err) {
          done(err);
        }    })
}



const resetWarning = () => {
    warning = [];
  };
  
  const resetSuccess = () => {
    success = [];
  };


export default initialize;
export {warning};
export {success};
export {resetWarning};
export {resetSuccess};
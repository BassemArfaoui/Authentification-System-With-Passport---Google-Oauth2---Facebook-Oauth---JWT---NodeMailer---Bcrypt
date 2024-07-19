//importing 
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import ejs from "ejs";
import path from 'path';
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import session from "express-session";
import passport from "passport";
import initializePassport, {warning , success, resetSuccess, resetWarning}  from './passport-config.js'; // Use default import
import flash from "express-flash";
import methodOverride from "method-override";
import initializeOauth from './googleOauth2-Config.js'; 
import initializeFacebook from "./facebook-config.js";
import transporter from "./nodeMailer-config.js";



//init
const app = express();
const port = 3000;
const saltRounds=10;
let sentData={};
dotenv.config();




//database connection
const db = new pg.Client({
  user:process.env.DB_user,
  host:process.env.DB_host,
  database:process.env.Db_name,
  password:process.env.PG_password, 
  port:process.env.port
});  
db.connect();



//Initializing Passport
initializePassport(passport,getUserByEmail,getUserById,isVerified);


//middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(flash());
app.use(session({
  secret:process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));


//Initializing google Oauth
initializeOauth(passport, getUserByEmail, getUserById, findOrCreateUser);
initializeFacebook(passport, getUserByEmail, getUserById, facebookFindOrCreateUser);


// authentication functions 
function checkAuthenticated(req, res, next){
  if(req.isAuthenticated()){
      return next()
  }
  res.redirect("/login")
}


function checkNotAuthenticated(req, res, next){
  if(req.isAuthenticated()){
      return res.redirect("/secrets")
  }
  next()
}



//sync functions
function hasNumber(password) {
  const numberPattern = /\d/; 
  return numberPattern.test(password);
}


function hasUppercase(password) {
  return /[A-Z]/.test(password);
}


function hasLowercase(password) {
  return /[a-z]/.test(password);
}


function isValidPhoneNumber(phoneNumber) {
  const phonePattern = /^[2459]\d{7}$/;
  return phonePattern.test(phoneNumber);
} //change this function according to the phone number format of your country


function capitalize(sentence)
{
  return  sentence.charAt(0).toUpperCase() + sentence.slice(1);
}


function isValidUsername(username) {
  const pattern = /^[a-zA-Z0-9_.]+$/;
  return pattern.test(username);
}


function removeSpaces(str) {
  return str.replace(/\s/g, '');
}


function resetData()
{
  sentData={};
}


function generateCode(length) {
  let code = '';
  const characters = '0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % charactersLength;
    code += characters.charAt(randomIndex);
  }

  return code;
}



//async functions 
async function addUser( name ,email , password ,number ,verif,code) 
{
  const result=await db.query("INSERT INTO users (name,email,password,number,verified,verif_code) VALUES ($1,$2,$3,$4,$5,$6) returning *",
  [capitalize(name),email,password,number,verif,code]);
  return result.rows;
}


async function isVerified(email){
  const result=await db.query("select verified from users where email= $1 ",[email]);
  return result.rows[0].verified;

}


async function getUserByEmail(email)
{
  const result = await db.query('select * from users where email=$1',[email]);
  return result.rows;
}


async function getNameByEmail(email)
{
  const result = await db.query('select name from users where email=$1', [email]);
  return result.rows[0].name;
}

async function getUserById(id)
{
  const result = await db.query('select * from users where id=$1',[id]);
  return result.rows;
}


async function getSecrets()
{
  const result =await db.query('select users.id,secrets.text,users.name from secrets,users where users.id=secrets.user_id');
  return result.rows;
}


async function addSecret(secret,id)
{
  const result=await db.query("INSERT INTO secrets (text,user_id) VALUES ($1,$2) returning *",[capitalize(secret),id]);
  return result.rows
}


async function getCodeByEmail(email){
  const result = await db.query('SELECT verif_code FROM users WHERE email = $1', [email]);
  return result.rows[0].verif_code;
}


async function updateUserPassword(id, password){
  const result = await db.query('UPDATE users SET password = $1 WHERE email = $2', [password, id]);
}


async function getIdByEmail(email){
  const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  return result.rows[0].id;
}




//passport OAuth strategies functions
  async function findOrCreateUser(profile) {
  const email = profile.emails[0].value;
  const name = removeSpaces(profile.displayName);
  const googleId = profile.id;

  // Check if the user already exists
  let result = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  if (result.rows.length > 0) {
    return result.rows[0];
  }

  // If user doesn't exist, create a new one
  result = await db.query(
    'INSERT INTO users (name, email, google_id,verified) VALUES ($1, $2, $3,$4) RETURNING *',
    [name, email, googleId,true]
  );
  return result.rows[0];
}


async function facebookFindOrCreateUser(profile) {
  const facebookId= profile.id;
  const name =removeSpaces(profile.displayName);
  const email = profile.emails[0].value;
  console.log('Profile:', profile);

  // Check if the user already exists
  let result = await db.query('SELECT * FROM users WHERE facebook_id = $1', [facebookId]);
  if (result.rows.length > 0) {
    return result.rows[0];
  }

  // If user doesn't exist, create a new one
  result = await db.query(
    'INSERT INTO users (name,facebook_id,email,verified) VALUES ($1, $2,$3,$4) RETURNING *',
    [name,facebookId,email,true]
  );
  return result.rows[0];
}




//Oauth get requests
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));


app.get('/auth/facebook/secrets',
passport.authenticate('facebook', { failureRedirect: '/login' }),
function(req, res) {
  res.redirect('/secrets');
});


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/secrets');
  }
);





//Get requests
app.get('/', (req,res)=>{
  res.render('home',{warning:warning,success:success});
  resetSuccess();
  resetWarning();
  resetData();
});


app.get('/login',checkNotAuthenticated, (req, res)=>{
  res.render('login',{success : success , warning:warning});
  resetSuccess();
  resetWarning();
  resetData();
});


app.get('/register', checkNotAuthenticated, (req, res)=>{
  res.render('register',{success : success , warning:warning});
  resetSuccess();
  resetWarning();
  resetData();
});


app.get('/secrets', checkAuthenticated ,async (req, res)=>{
  const secrets = await getSecrets();
  const name = req.user.name;
  res.render('secrets',{success : success , warning:warning , secrets:secrets,name:name});
  resetSuccess();
  resetWarning();
  resetData();
});


app.get('/add/secret',checkAuthenticated,(req,res)=>{
  res.render('submit',{success : success , warning:warning});
  resetSuccess();
  resetWarning();
  resetData();
})


app.get("/mailverif",checkNotAuthenticated,(req,res)=>
{
  res.render('mail-verif', {warning:warning , success:success , data:sentData});
  resetSuccess();
  resetWarning();
})


app.get('/contact',checkAuthenticated,(req,res)=>{
  res.render('contact', {warning:warning, success:success});
  resetSuccess();
  resetWarning();
  resetData();
})


app.get('/forgot/password',(req,res)=>
{
  res.render('forgot-password', {warning:warning, success:success});
  resetSuccess();
  resetWarning();
  resetData();
})


app.get('/reset/password/:id/:token', async (req,res)=>
{ 
  try 
  {
    const user_arr = await getUserById(req.params.id);
    try
    {
      if(user_arr.length===0) throw new Error("User not found");
      try
      {
        const user=user_arr[0];
        const isVerif=await isVerified(user.email);
        if(!isVerif) throw new Error("User not verified");
        try
        {
          const id = req.params.id;
          const token = req.params.token;
          const secret = process.env.JWT_SECRET + user.password;
          const payload = jwt.verify(token, secret);
          res.render('password-reset', {warning:warning, success:success});
          resetSuccess();
          resetWarning();
          resetData();
        }
        catch(err)
        {
          console.log(err);
          warning.push({message:"Invalid or expired Reset Password Link"});
          res.redirect('/forgot/password');
        }
      }
      catch(err)
      {
        warning.push({message:"User not verified"});
        res.redirect('/forgot/password');
      }
    }
    catch(err)
    {
      warning.push({message:"User not found"});
      res.redirect('/forgot/password');
    }
  }
  catch(error)
  {
    warning.push({message:"Something went wrong ,Please try again Later"});
    res.redirect('/forgot/password');
  }
  

})


app.get('/resend/code/:id',async (req,res)=>
{
  const id=req.params.id;
  try
  {
    const user_arr =await getUserById(id);
    try
    {
      const user=user_arr[0];
      try
      {
        const code=generateCode(8);
        const email=user.email;
        const name=user.name;
        const result=await db.query('UPDATE users SET verif_code=$1 WHERE id=$2',[code, id]);
        sentData.email=email;
        sentData.id=id;
        try
        {
          const ejsFilePath = path.join(process.cwd(),'views', 'emails' ,'email.ejs');
          const html = await ejs.renderFile(ejsFilePath, { name: name , code : code});
          const options = {
            from: `SecretsApp Team <${process.env.MAIL}>`,
            to: email,
            subject: 'SecretsApp Email Verification',
            html: html ,};
  
          const info =await transporter.sendMail(options);
          console.log('Email sent: ' + info.response);
          resetSuccess();
          resetWarning();
          success.push({message: 'Verification email sent successfully'});
          res.redirect('/mailverif');
        }
        catch(err)
        {
          console.log(err);
          warning.push({message:"Something went wrong, Please try again Later"});
          res.redirect('/mailverif');
        }

      }
      catch(err)
      {
        console.log(err);
        warning.push({message:"Something went wrong, Please try again Later"});
        res.redirect('/mailverif');
      }
    }
    catch(err)
    {
      console.log(err);
      warning.push({message:"User not found"});
      res.redirect('/mailverif');
    }
  }
  catch(error)
  {
    console.log(err);
    warning.push({message:"Something went wrong, Please try again Later"});
    res.redirect('/mailverif');
  }
  
})





//Post requests
app.post("/register", checkNotAuthenticated,async (req, res) => {

  const { name ,email ,password , confirm_password ,number } = req.body;
  const user_arr=await getUserByEmail(email);
  if(!name || !email || !password || !confirm_password || !number) warning.push({message:'Please fill all the fields'})
  if(password.length <8) warning.push({message:"Password must have at least 8 characters"});
  if(!hasNumber(password)) warning.push({message:"Password must have at least one number"});
  if(!hasUppercase(password)) warning.push({message:"Password must have at least one uppercase character"});
  if(!hasLowercase(password)) warning.push({message:"Password must have at least one Lowercase charcater"});
  if(password!==confirm_password) warning.push({message:"Passwords don't match"});
  if(!isValidPhoneNumber(number)) warning.push({message:"Invalid Phone number"});
  if(name.length<6) warning.push({message:"Username must have at least 6 characters"});
  if(!isValidUsername(name)) warning.unshift({message:"The Username can only contain letters, numbers,  dots \".\" and underscores \"_\" ."}); 
  if(user_arr.length>0)  warning.unshift({message:"Email Already used"});

  if(warning.length===0)
  {    
    try
    {
      const code=generateCode(8);
      const hashed_password=bcrypt.hashSync(password, saltRounds);
      const result =await addUser(name,email, hashed_password ,number,false,code);
      const id=await getIdByEmail(email);
      sentData.email=email;
      sentData.id=id;
      console.log(sentData);
      try
      { 

        const ejsFilePath = path.join(process.cwd(),'views', 'emails' ,'email.ejs');
        const html = await ejs.renderFile(ejsFilePath, { name: name , code : code});
        const options = {
          from: `SecretsApp Team <${process.env.MAIL}>`,
          to: email,
          subject: 'SecretsApp Email Verification',
          html: html ,};

        const info =await transporter.sendMail(options);
        console.log('Email sent: ' + info.response);
        success.push({message:'Successfully Registred , Please verify your email'});
        res.redirect('/mailverif');
      }
      catch(error)
      {
        console.log(error.message);
        warning.push({message:"Unable the send Verification code ,Try to verify your email Later"});
        res.redirect('/register');
      }
   
    }
    catch(err){
      console.log(err); 
      warning.unshift({message:"Unexpected error occured, Please try again Later"});
      res.redirect('/register');
     
    }}
    else 
    {
      res.redirect('/register'); 
    }

})


app.post("/login",checkNotAuthenticated, passport.authenticate("local", {
  successRedirect: "/secrets",
  failureRedirect: "/login",
  failureFlash: true
}))


app.post('/secrets',checkAuthenticated, async (req,res)=>{
  const secret=req.body.secret;
  if(!secret) warning.push({message:'Please fill the field with a Secret'})
  if(secret.length >70) warning.push({message:"Secret must have less then 70 characters"});

  if(warning.length===0)
  {
    try
    {
      const result =await addSecret(secret,req.user.id);
      success.push({message:'Secret Successfully added'});
      res.redirect('/secrets');
    }
    catch(err){
      
      warning.unshift({message:"Unexpected error occured, Please try again Later"});
      console.log(err.message); 
      res.redirect('/add/secret');

    }

  }
  else 
  {
    res.redirect('/add/secret');
  }
})


app.post('/mailverif',checkNotAuthenticated,async (req,res)=>{
  if(req.body.code)
  {
    const userCode=req.body.code;
    try
    { const code = await getCodeByEmail(sentData.email);
  
      if(userCode==code)
      { 
        db.query('UPDATE users SET verified = $1 WHERE email = $2', [true, sentData.email]);
        success.push({message:"Email Verified Successfully, You can now Login"});
        res.redirect('/login');
      }
      else
      {
        warning.push({message:"Invalid Verification Code"});
        res.redirect('/mailverif');
      }
    }
    catch(error)
    {
      console.error(error);
      warning.push({message:"Something went wrong, Try again Later"});
      res.redirect('/mailverif');
  
    }
  }


  else if(req.body.email)
  {
    const email=req.body.email;
    try
    {
      const result=await isVerified(email);
      if(result)
      {
        success.push({message:"Email Already Verified, you can Login"});
        res.redirect('/login')
      }
      else
      {
        const code=generateCode(8);
        try
        {
          
          const name= await getNameByEmail(email);
          db.query('UPDATE users SET verif_code = $1 WHERE email = $2', [code, email]);

            try
            {
              const ejsFilePath = path.join(process.cwd(),'views', 'emails' ,'email.ejs');
              const html = await ejs.renderFile(ejsFilePath, { name: name, code : code});

              const Options = {
                from: `SecretsApp Team <${process.env.MAIL}>`,
                to: email,
                subject: 'SecretsApp Email Verification',
                html: html ,
              };
      
              const info =await transporter.sendMail(Options);
              console.log('Email sent: ' + info.response);

              sentData.email=email;
              const id=await getIdByEmail(email);
              sentData.id=id;

              success.push({message:"Verification code sent to your email"});
              res.redirect('/mailverif');
            }
            catch(error)
            {
              warning.push({message:'Uable to send verification Code'});
              res.redirect('/mailverif');
            }
        }
        catch(err)
        {
          console.log(err);
          warning.push({message:'Something went wrong , Try again Later'});
          res.redirect('/mailverif');
        }

      }

    }

    catch(error)
    {
      console.log(error);
      warning.push({message:'No Account with the given Email'});
      res.redirect('/mailverif');
    }

  }



})


app.post('/contact',checkAuthenticated,async (req,res)=>{
  try
  {
   //sending to support team
     const supportPath= path.join(process.cwd(), 'views', 'emails', 'feedback-support.ejs');
     const supportEmail = await ejs.renderFile(supportPath, { name: req.user.name, feedback : req.body.feedback ,email : req.user.email});
 
     const supportOptions = {
     from: `SecretsApp Contact Page <${process.env.MAIL}>`,
     to: process.env.SUPPORT_MAIL,
     subject: `${req.user.name}'s Feedback on SecretsApp`,
     html: supportEmail ,};
     const info =await transporter.sendMail(supportOptions);
     console.log('Email sent: ' + info.response);
 
   //sending to user 
   const userPath= path.join(process.cwd(),'views', 'emails' ,'feedback-user.ejs');
   const userEmail = await ejs.renderFile(userPath, { name: req.user.name , feedback : req.body.feedback});
   const userOptions = {
     from: `SecretsApp Team <${process.env.MAIL}>`,
     to: req.user.email,
     subject: `Feedback on SecretsApp`,
     html: userEmail ,};
   const inf =await transporter.sendMail(userOptions);
   console.log('Email sent: ' + inf.response);
   success.push({message:"Feedback sent successfully ,We will reply as soon as Possible "}); 
 
   res.redirect('/contact');
   }
   catch(error)
   {
     console.log(error);
     warning.push({message:"Unable to send Feedback, Try again Later"});
     res.redirect('/contact');
   }
 })


 app.post('/forgot/password', async (req, res)=>{
  const email=req.body.email;

    //checking if the email exists
    try
    {
      const user_arr=await getUserByEmail(email);
      try
      {
        if(user_arr.length==0) throw new Error("No account with the given Email");
        try
        {
          const result=await isVerified(email);
          try
          {
            if(result)
            {
              //send mail with link to change password
              const user=user_arr[0];
              const name= user.name;
              const passwordPath= path.join(process.cwd(), 'views', 'emails', 'password-email.ejs');
              const JWT_SECRET=process.env.JWT_SECRET;
              const secret = JWT_SECRET+user.password;
              const payload = { id: user.id, email: user.email};
              const token = jwt.sign(payload, secret, { expiresIn: '1h' });
              const link=`http://localhost:3000/reset/password/${user.id}/${token}`;
              const passwordEmail = await ejs.renderFile(passwordPath, { name: name ,link:link});
 
              const passwordOptions = {
              from: `SecretsApp Team <${process.env.MAIL}>`,
              to: email,
              subject: `SecretsApp Password Reset`,
              html: passwordEmail ,};
              const info =await transporter.sendMail(passwordOptions);
              console.log('Email sent: ' + info.response);
              success.push({message:"Password reset link sent to your email"});
              res.redirect('/login');
              
            }
            else
            {
              warning.push({message:"Email is not Verified, Please verify your email to reset password"});
              res.redirect('/forgot/password');
            }
          }
          catch(err)
          {
            console.log(err);
            warning.push({message:'Something went wrong , Try again Later'});
            res.redirect('/forgot/password');
          }
        }
        catch(err)
        {
          console.log(err);
          warning.push({message:'Something went wrong , Try again Later'});
          res.redirect('/forgot/password');
        }
      }
      catch(err)
      {
        console.log(err);
        warning.push({message:err.message});
        res.redirect('/forgot/password');
      }
    }
    catch(err)
    {
      console.log(err);
      warning.push({message:'Something went wrong , Try again Later'});
      res.redirect('/forgot/password');

    }








})


app.post('/reset/password/:id/:token', async (req,res)=>{
  const id = req.params.id;
  const token=req.params.token;
  try 
  {
    const user_arr = await getUserById(req.params.id);
    try
    {
      if(user_arr.length===0) throw new Error("User not found");
      try
      {
        const user=user_arr[0];
        const isVerif=await isVerified(user.email);
        if(!isVerif) throw new Error("User not verified");
        try
        {
          const {password , confirm_password} = req.body;
          if( !password || !confirm_password) warning.push({message:'Please fill all the fields'})
          if(password.length <8) warning.push({message:"Password must have at least 8 characters"});
          if(!hasNumber(password)) warning.push({message:"Password must have at least one number"});
          if(!hasUppercase(password)) warning.push({message:"Password must have at least one uppercase character"});
          if(!hasLowercase(password)) warning.push({message:"Password must have at least one Lowercase charcater"});
          if(password!==confirm_password) warning.push({message:"Passwords don't match"});

          if(warning.length===0)
          {
            const hashed_password=bcrypt.hashSync(password, saltRounds);
            await updateUserPassword(id,hashed_password);
            success.push({message:'Password Changed Successfully, You can now Login'});
            res.redirect('/login');  

            
          }
          else 
          {
            res.redirect(`/reset/password/${id}/${token}`);  
          }
 
        }
        catch(err)
        {
          console.log(err);
          warning.push({message:"Invalid or expired Reset Password Link"});
          res.redirect(`/reset/password/${id}/${token}`);
        }
      }
      catch(err)
      {
        warning.push({message:"User not verified"});
        res.redirect(`/reset/password/${id}/${token}`);
      }
    }
    catch(err)
    {
      warning.push({message:"User not found"});
      res.redirect(`/reset/password/${id}/${token}`);
    }
  }
  catch(error)
  {
    warning.push({message:"Something went wrong ,Please try again Later"});
    res.redirect(`/reset/password/${id}/${token}`);
  }
  

})


 
//delete request (logout)
app.delete("/logout", (req, res) => {
  req.logout(req.user, err => {
      if (err) return next(err)
      success.push({message:"Successfully Logged Out, Please Come Back Soon"});
      res.redirect("/login")
  })
})



//test
app.get('/privacy',(req,res)=>{
  res.render('privacy', {warning:warning, success:success});
  resetSuccess();
  resetWarning();
  resetData();
})



//server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});






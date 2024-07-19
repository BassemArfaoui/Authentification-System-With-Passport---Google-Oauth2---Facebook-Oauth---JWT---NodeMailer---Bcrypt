# SecretsApp(Full Authentification System)

SecretsApp is a full-stack web application that allows users to anonymously upload and view secrets. It's mase to showcase how to build robust authentication system with Express.js with features such as user registration and login with Passport, Email verification with NodeMailer, Google OAuth2, Facebook OAuth, password reset with JWT, and secure password handling with bcrypt

## Features

- User registration and login
- Email verification with NodeMailer
- Google OAuth2 and Facebook OAuth integration
- Crud operations with pg
- Password reset functionality using JWT
- Secure password hashing and salting with bcrypt
- Session management and access control with Passport

## Technologies Used

- Backend: Node.js, Express.js, PostgreSQL
- Frontend: HTML, CSS, Bootstrap, JavaScript
- Authentication: Passport, Google OAuth2, Facebook OAuth
- Email: Nodemailer
- Token Management: JWT
- Sending Emails: NodeMailer
- Password Security: Bcrypt
- Environment variables: dotenv

## Prerequisites

- Node.js
- PostgreSQL
- npm (Node Package Manager)
- google and facebook apps (links below for more details)
- smtp server (link below for more details)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/BassemArfaoui/Authentification-System-With-Passport---Google-Oauth2---Facebook-Oauth---JWT---NodeMailer---Bcrypt.git
   ```

2. Navigate to the project directory:

   ```bash
   cd Authentification-System-With-Passport---Google-Oauth2---Facebook-Oauth---JWT---NodeMailer---Bcrypt
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Set up the PostgreSQL database:

   - Create a new database in PostgreSQL.
   - Run the provided SQL script to set up the database schema.

5. Create a `.env` file in the project root with the following content:

   ```env
   # Database variables
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=
   PG_PASSWORD=
   DB_PORT=5432

   # Session variables
   SESSION_SECRET=//random secret

   # Google app variables
   # Got after creating a Google OAuth2 app
   # Helpful video: https://youtu.be/pBVAyU4pZOU?si=N3TmN72N0SxC1oJV
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=

   # Facebook app variables
   # Got after creating a Facebook OAuth app
   # How to get them: https://youtu.be/LLlpH3vZVkg?si=Y1Vk-5_w5BESDyKF
   FACEBOOK_CLIENT_ID=
   FACEBOOK_CLIENT_SECRET=

   # SMTP variables
   # Link to show how to set up SMTP server: https://youtu.be/yuOK6D7deTo?si=E02n_uFzqKkA3OZp
   MAIL=
   MAIL_PASSWORD=
   SMTP_PORT=465
   SMTP_HOST=smtp.gmail.com

   # Support Team Email
   SUPPORT_MAIL=

   # JWT
   JWT_SECRET=any strong secret
   ```

6. Configure environment variables in your `.env` file as shown above.

## Running the Project

You can run the project using either `node` or `nodemon`. 

### With Node.js

1. Start the server:

   ```bash
   node app.js
   ```

2. Open your browser and navigate to `http://localhost:3000`.

### With Nodemon

Nodemon automatically restarts your server when code changes are detected. To use `nodemon`:

1. Install `nodemon` globally if you haven't already:

   ```bash
   npm install -g nodemon
   ```

2. Start the server using `nodemon`:

   ```bash
   nodemon app.js
   ```

3. Alternatively, you can use the `npm run dev` command if the `dev` script is defined in your `package.json`:

   ```bash
   npm run dev
   ```

## Additional Information

- This project uses Passport for authentication, integrating both Google OAuth2 and Facebook OAuth.
- Nodemailer is used for email verification and password reset emails.
- JWT is used for generating tokens for the password reset functionality.
- Bcrypt is used for secure password hashing and salting.
- dotenv is used for managing environment variables.
- Flash messages are used to handle and display errors and success messages.


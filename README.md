# Movie Here

This repository contains an API designed to a project of a movie web site, including:

- **Movies Services**: See all the films that are in our API.
- **User Services**: We have a complete user service. We encripted your passwords, we use Token Auth to your login and we use the google OAuth to you made a easy login!
- **Email Services**: On some occasions we send and mail to you.

## Technologies Used
### Node.js
<img src="https://skillicons.dev/icons?i=nodejs" /><br/>
### Nest.js
<img src="https://skillicons.dev/icons?i=nestjs" /><br/>
### Bcrypt
<img src="https://repository-images.githubusercontent.com/139898859/9617c480-81c2-11ea-94fc-322231ead1f0" width=65/><br/>
### JWT
<img src="https://jwt.io/img/icon.svg" width=65/><br/>
### OAuth2.0
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/oauth/oauth-original.svg" width=65/><br/>
### Typescript
<img src="https://skillicons.dev/icons?i=typescript" /><br/>
### Prisma
<img src="https://skillicons.dev/icons?i=prisma" /><br/>
### Postgres
<img src="https://skillicons.dev/icons?i=postgres" /><br/>
### Redis
<img src="https://skillicons.dev/icons?i=redis" /><br/>
### BullMQ
<img src="https://repository-images.githubusercontent.com/162494199/a1d3ba61-e0f0-4916-a376-53002605da83"  width=66/><br/>

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Babiel09/Movie-Here-Back-End.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Movie-Here-Back-End/src
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     DATABASE_URL=your_database_uri
     JWT_SECRET=your_jwt_secret

     REDIS_HOST=your_redis_host
     REDIS_PORT=your_redis_port

     GOOGLE_CLIENT_SECRET=your_google_client_secret
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CALLBACK_URL=your_google_callback_url
     GOOGLE_CALLBACK_URL_CONTROLLER=your_google_callback_url_controller

     API_KEY=your_api_key
     SECURITY_ACESS=your_security_access

     TMDB_KEY=your_tmdb_key
     TMDB_TOKEN=your_tmdb_token

     GMAIL_USER=your_gmail_user
     GMAIL_PASS=your_gmail_password

     ```

5. Start the server:
   ```bash
   npm start
   ```

6. The API will be available at `http://localhost:6785`.

## Endpoints

## Movie Endpoints
- `GET /movie/v1/test`: Test the movie service.
- `GET /movie/v1/films`: Retrieve a list of films.
- `GET /movie/v1/findMovie/:id`: Find a movie by its ID.
- `GET /movie/v1/companyImage/:id`: Retrieve the company image by its ID.
- `GET /movie/v1/actor`: Retrieve a list of actors.
- `GET /movie/v1/actor/photos/:id`: Retrieve photos of an actor by their ID.
- `POST /movie/v1/rateMovie`: Submit a rating for a movie.
- `GET /movie/v1/orderByVotes`: Retrieve movies ordered by votes.

---

## Email Endpoints
- `POST /email/v1/send`: Send an email.
- `POST /email/v1/changePass`: Request a password change.
- `POST /email/v1/generatePass`: Generate a new password.

---

## User Endpoints
- `POST /user/v1`: Create a new user.
- `DELETE /user/v2/delete/:id`: Delete a user by their ID.
- `PATCH /user/v2/verify/:id`: Verify a user by their ID.
- `PATCH /user/v3/role/:id`: Update the role of a user by their ID.
- `POST /user/v1/newComment`: Add a new comment.
- `GET /user/v1/:id`: Retrieve user details by their ID.
- `PATCH /user/v2/description/:id`: Update the description of a user by their ID.
- `GET /user/v1`: Retrieve a list of users.
- `POST /user/v1/photo/:id`: Upload a photo for a user by their ID.
- `GET /user/v1/photo/:id`: Retrieve a photo of a user by their ID.

---

## Authentication Endpoints
- `POST /auth/v2/login`: Log in to the system.
- `POST /auth/v3/decode`: Decode authentication tokens.
- `GET /auth/v4/google/login`: Log in using Google.
- `GET /auth/v4/google/callback`: Google login callback.
- `PATCH /auth/v4/google/newPassword/:id`: Set a new password to the Google OAuth2.0 users.
- `PATCH /auth/v4/changePassword/:id`: Change a user's password by their ID.
- `PATCH /auth/v4/createANewPassword/:id`: Create a new password for a user by their ID.
- `GET /auth/v3/confirm`: Confirm authentication.


## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

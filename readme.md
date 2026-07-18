# VideoTube

A modular Node.js backend for a video-sharing platform with secure authentication, media uploads, social engagement, playlists, and analytics.

## Features

- User authentication and JWT refresh token workflow
- Password hashing and validation with `bcrypt` and `express-validator`
- Video upload and thumbnail handling via `multer` and Cloudinary
- Playlist creation, update, and management
- Video likes, comments, and tweet-style social posts
- Channel subscriptions and channel profile discovery
- Watch history and channel analytics/dashboard reports
- Secure cookie-based session support and CORS enabled

## Authentication and Security

- Registration and login with username, email, password, and fullname
- Passwords hashed with bcrypt before saving
- JWT-based access/refresh token generation in `user.controller.js`
- Refresh tokens stored in the user document and sent via HTTP-only cookies
- Request validation using `express-validator` for user registration
- Authentication middleware protects private routes
- Cloudinary handles media uploads and deletion securely

## User Management

- Register new users
- Login and logout flows
- Refresh access tokens using refresh token cookie
- Upload avatar and cover images
- Update profile details
- View channel profile by username
- Watch history retrieval with aggregated video owner info

## Video Features

- Publish a video with thumbnail upload
- Update and delete videos
- View all published videos for authenticated users
- View a single video by ID and increment view count
- Store video metadata: title, description, duration, views, owner

## Social Features

- Add, update, and delete comments on videos
- Like/unlike videos, comments, and tweets
- Create, update, delete, and fetch tweets
- Subscribe/unsubscribe to channels
- Fetch channel subscribers and subscribed channels

## Dashboard and Analytics

- Channel stats aggregation including:
  - total videos
  - total subscribers
  - total subscriptions
  - total likes
  - total comments
  - total views
  - total tweets
  - total tweet likes
  - total playlists
- Admin dashboard to inspect user videos and channel info

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js 18+ / ES modules |
| Server | Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password hashing | `bcrypt` |
| Validation | `express-validator` |
| File upload | `multer` |
| Media storage | Cloudinary |
| Cookies | `cookie-parser` |
| Cross-origin | `cors` |
| Environment | `dotenv` |

## Project Structure

```
Backend/
  package.json
  src/
    app.js
    index.js
    db/
      index.js
    controllers/
      comment.controller.js
      healthcheck.controller.js
      like.controller.js
      playlist.controller.js
      subscription.controller.js
      tweet.controller.js
      user.controller.js
      video.controller.js
      dashboard.controller.js
    middlewares/
      auth.middleware.js
      multer.middleware.js
      validation.middleware.js
    models/
      comments.models.js
      like.models.js
      playlists.models.js
      subscription.models.js
      tweets.models.js
      user.models.js
      video.model.js
    routers/
      comment.routers.js
      healthcheck.routers.js
      like.routers.js
      playlist.routers.js
      subscription.routers.js
      tweet.routers.js
      user.routers.js
      video.routers.js
      dashboard.routers.js
    utils/
      Apierror.js
      cloudinary.js
```

## API Endpoints

### Authentication

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/v1/user/register` | POST | Register a new user |
| `/api/v1/user/login` | POST | Login and issue JWT tokens |
| `/api/v1/user/logout` | POST | Logout and clear cookies |
| `/api/v1/user/refresh-token` | POST | Refresh the access token |
| `/api/v1/user/change-password` | PUT | Change current password |
| `/api/v1/user/member` | GET | Get current authenticated user details |
| `/api/v1/user/update-details` | PUT | Update user profile details |
| `/api/v1/user/upload-avatar` | PUT | Upload avatar and cover images |
| `/api/v1/user/update-avatar` | PUT | Update avatar image |
| `/api/v1/user/update-coverimage` | PUT | Update cover image |
| `/api/v1/user/channel/:username` | GET | Get channel profile by username |
| `/api/v1/user/watch-history` | GET | Get authenticated user watch history |

### Video

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/v1/video/publish-video` | POST | Publish a new video with media files |
| `/api/v1/video/delete-video/:id` | DELETE | Delete a video by ID |
| `/api/v1/video/update-video/:id` | PUT | Update video media and metadata |
| `/api/v1/video/allvideo` | GET | List all published videos |
| `/api/v1/video/:id` | GET | Retrieve a video by ID and increase views |

### Playlist

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/v1/playlist/create-playlist/:videoId` | POST | Create a new playlist and optionally add a video |
| `/api/v1/playlist/add-video-to-playlist/:playlistId/:videoId` | POST | Add a video to a playlist |
| `/api/v1/playlist/get-user-playlists` | GET | Get playlists for the authenticated user |
| `/api/v1/playlist/get-playlist/:playlistId` | GET | Get a single playlist by ID |
| `/api/v1/playlist/remove-video-from-playlist/:playlistId/:videoId` | DELETE | Remove a video from a playlist |
| `/api/v1/playlist/delete-playlist/:playlistId` | DELETE | Delete a playlist |
| `/api/v1/playlist/update-playlist/:playlistId` | PUT | Update playlist details |

### Social

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/v1/comment/getcomments/:videoId` | GET | Get comments for a video |
| `/api/v1/comment/addcomment/:videoId` | POST | Add a comment to a video |
| `/api/v1/comment/updatecomment/:commentId` | PATCH | Update an existing comment |
| `/api/v1/comment/deletecomment/:commentId` | DELETE | Delete a comment |
| `/api/v1/like/video-like/:videoId` | POST | Like or unlike a video |
| `/api/v1/like/comment-like/:commentId` | POST | Like or unlike a comment |
| `/api/v1/like/tweet-like/:tweetId` | POST | Like or unlike a tweet |
| `/api/v1/like/getlikedvideos` | GET | Get videos liked by the authenticated user |
| `/api/v1/tweets/createtweet` | POST | Create a tweet-style post |
| `/api/v1/tweets/updatetweet/:tweetId` | PUT | Update a tweet |
| `/api/v1/tweets/deletetweet/:tweetId` | DELETE | Delete a tweet |
| `/api/v1/tweets/gettweet/:userid` | GET | Get tweets for a user |
| `/api/v1/subscription/subscribe/:channelId` | POST | Subscribe or unsubscribe to a channel |
| `/api/v1/subscription/channelsubs/:channelId` | GET | Get subscribers for a channel |
| `/api/v1/subscription/user-subscribedChannels/:subscriberId` | GET | Get subscribed channels for a user |

### Dashboard

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/v1/dashboard/get-dashboard` | GET | Get authenticated channel analytics |
| `/api/v1/dashboard/get-admin-dashboard` | GET | Get admin dashboard video listing |
| `/api/v1/health/checck-health` | GET | Health check endpoint |

## Environment Variables

Create a `.env` file with:

```env
PORT=...
MONGODB_URL=<your_mongodb_connection_string>
ACCESS_TOKEN_SECRET=<your_access_token_secret>
REFRESH_TOKEN_SECRET=<your_refresh_token_secret>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUD_API_KEY=<your_cloudinary_api_key>
CLOUD_API_SECRET=<your_cloudinary_api_secret>
```

## Key Technical Decisions

- Modular architecture using routers, controllers, models, and middleware for maintainability.
- JWT refresh token workflow implemented in `user.controller.js`.
- MongoDB aggregations used for analytics, channel profile, watch history, and subscription queries.
- Cloudinary storage for video and image assets, with local upload staging via `multer`.
- Express validation and custom error handling improve request integrity.
- Secure cookie support with `cookie-parser` and cross-origin support via CORS.

## Notes & Recommendations

- Current `authMiddleware` validates the refresh token cookie. For standard API patterns, verify access tokens on protected routes and keep refresh token usage only for token renewal.
- `playlist.video` is modeled as an array of `ObjectId` references to support multiple videos per playlist.
- The route path `/api/v1/health/check-health` has a typo in the router and should likely be `/check-health`.
- Consider adding centralized error-handling middleware and API documentation with Swagger or Postman collection.
- Ensure secure cookie usage is compatible with local development HTTPS setup.

## How to Run

```bash
cd Backend
npm install
npm start
```

## Author
Ayush Raj

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
const auth = require('./middleware/auth'); // Import the middleware
const User = require('./models/User');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const app = express();

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Passport Google OAuth configuration
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          picture: profile.photos[0].value
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

app.use(passport.initialize());

// Public Routes (no auth needed)
app.use('/auth', require('./routes/auth'));

// Protected Routes (auth middleware applied)
app.use('/api/user', auth, require('./routes/user'));
app.use('/api/notes', auth, require('./routes/notes'));
app.use('/api/tasks', auth, require('./routes/tasks'));
app.use('/api/projects', auth, require('./routes/projects'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

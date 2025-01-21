const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();  // Add this line at the top

router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    const token = jwt.sign(
      { 
        _id: req.user._id,
        email: req.user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
  }
);

module.exports = router;
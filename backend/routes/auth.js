// Route 1: Start Google OAuth flow
router.get('/google',
    passport.authenticate('google', { 
      // Request access to user's profile and email
      scope: ['profile', 'email'],
      session: false  // We're using JWT instead of sessions
    })
  );
  
  // Route 2: Handle Google's response
  router.get('/google/callback',
    // First, verify the Google response
    passport.authenticate('google', { 
      failureRedirect: '/login',
      session: false
    }),
    // Then, create our own JWT
    (req, res) => {
      // 1. Create a JWT containing user info
      const token = jwt.sign(
        { 
          _id: req.user._id,
          email: req.user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }  // Token expires in 7 days
      );
  
      // 2. Send user back to frontend with the token
      res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
    }
  );
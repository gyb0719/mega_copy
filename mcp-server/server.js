const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cors = require('cors');
require('dotenv').config();

// Express app for OAuth callback handling
const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// User storage (in production, use a proper database)
const users = new Map();

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.get(id);
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.REDIRECT_URI || "http://localhost:3000/auth/callback"
},
async (accessToken, refreshToken, profile, done) => {
  // Store or update user information
  const user = {
    id: profile.id,
    email: profile.emails[0].value,
    name: profile.displayName,
    picture: profile.photos[0].value,
    accessToken,
    refreshToken
  };
  
  users.set(profile.id, user);
  return done(null, user);
}));

// MCP Server setup
class GoogleAuthMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'google-auth-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );
    
    this.setupHandlers();
    this.authenticated = false;
    this.currentUser = null;
  }

  setupHandlers() {
    // Tool: Get authentication status
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'getAuthStatus',
          description: 'Get current authentication status',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'initiateAuth',
          description: 'Initiate Google OAuth authentication',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'getUserInfo',
          description: 'Get authenticated user information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'logout',
          description: 'Logout current user',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // Tool call handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'getAuthStatus':
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  authenticated: this.authenticated,
                  user: this.currentUser ? {
                    email: this.currentUser.email,
                    name: this.currentUser.name
                  } : null
                }, null, 2),
              },
            ],
          };

        case 'initiateAuth':
          const authUrl = `http://localhost:${PORT}/auth/google`;
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  authUrl,
                  message: 'Please visit the URL to authenticate with Google'
                }, null, 2),
              },
            ],
          };

        case 'getUserInfo':
          if (!this.authenticated) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    error: 'Not authenticated'
                  }, null, 2),
                },
              ],
            };
          }
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(this.currentUser, null, 2),
              },
            ],
          };

        case 'logout':
          this.authenticated = false;
          this.currentUser = null;
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  message: 'Successfully logged out'
                }, null, 2),
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  setUser(user) {
    this.authenticated = true;
    this.currentUser = user;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Google Auth MCP server running on stdio');
  }
}

// Express routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failed' }),
  (req, res) => {
    // On successful authentication
    if (mcpServer) {
      mcpServer.setUser(req.user);
    }
    res.send(`
      <html>
        <body>
          <h2>Authentication Successful!</h2>
          <p>You can now close this window and return to your MCP client.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  }
);

app.get('/auth/failed', (req, res) => {
  res.status(401).send(`
    <html>
      <body>
        <h2>Authentication Failed</h2>
        <p>Please try again.</p>
      </body>
    </html>
  `);
});

app.get('/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        email: req.user.email,
        name: req.user.name
      }
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    if (mcpServer) {
      mcpServer.authenticated = false;
      mcpServer.currentUser = null;
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Start Express server
app.listen(PORT, () => {
  console.error(`OAuth callback server listening on port ${PORT}`);
});

// Start MCP server
let mcpServer;
if (require.main === module) {
  mcpServer = new GoogleAuthMCPServer();
  mcpServer.run().catch(console.error);
}
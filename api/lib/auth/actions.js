const { google } = require('googleapis')
const Auth = require('./model')
const omit = require('@f/omit')

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${process.env.HEROKU_URL}/oauth_response`
)

exports.getAccessToken = async (_, user) => {
  try {
    const tokens = await Auth.getToken(user)
    if (!tokens || !tokens.refresh_token) {
      throw new Error('no_tokens')
    }
    oauth2Client.setCredentials(tokens)
    if (oauth2Client.isTokenExpiring()) {
      const { credentials } = await oauth2Client.refreshAccessToken()
      Auth.setToken(user, credentials)
      return { tokens: credentials }
    }
    return { tokens: omit('refresh_token', tokens) }
  } catch (e) {
    if (e.message === 'no_tokens') {
      return Promise.reject({
        error: e.message,
        errorDetails: oauth2Client.generateAuthUrl({
          // 'online' (default) or 'offline' (gets refresh_token)
          access_type: 'offline',
          prompt: 'consent',
          // If you only need one scope you can pass it as a string
          scope: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/forms',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
          ]
        })
      })
    }
    return { error: e }
  }
}

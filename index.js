const user = {
  tokens: [
    {
      _id: 1,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    },
    {
      _id: 2,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ6'
    },
    {
      _id: 3,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ7'
    }
  ]
}

user.tokens = user.tokens.filter(token => token.token !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ6')

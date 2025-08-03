module.exports = {
  sign: () => 'mock_jwt_token',
  verify: () => ({ id: 'mock_user_id', role: 'student' })
};
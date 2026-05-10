const {
  hashToken,
  parseDurationToMs,
  signRefreshToken
} = require('../../services/tokenService');

describe('tokenService', () => {
  test('hashToken returns deterministic hash', () => {
    expect(hashToken('abc123')).toBe(hashToken('abc123'));
  });

  test('parseDurationToMs parses hours', () => {
    expect(parseDurationToMs('2h')).toBe(2 * 60 * 60 * 1000);
  });

  test('signRefreshToken returns unique tokens for the same payload', () => {
    const payload = {
      sub: 'user-1',
      email: 'user@example.com',
      role: 'MEMBER'
    };

    expect(signRefreshToken(payload)).not.toBe(signRefreshToken(payload));
  });
});

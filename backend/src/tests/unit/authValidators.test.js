const { registerSchema } = require('../../validators/authValidators');

describe('auth validators', () => {
  test('accepts strong passwords', () => {
    const result = registerSchema.parse({
      body: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Strong@123'
      }
    });

    expect(result.body.email).toBe('jane@example.com');
  });

  test('rejects weak passwords', () => {
    expect(() =>
      registerSchema.parse({
        body: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'weakpass'
        }
      })
    ).toThrow();
  });
});

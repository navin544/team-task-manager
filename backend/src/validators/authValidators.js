const { z } = require('zod');

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W_]{8,64}$/;

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: z
      .string()
      .regex(
        passwordRule,
        'Password must be 8-64 characters with upper, lower, number, and symbol'
      )
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    password: z
      .string()
      .regex(
        passwordRule,
        'Password must be 8-64 characters with upper, lower, number, and symbol'
      )
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = {
  forgotPasswordSchema,
  loginSchema,
  passwordRule,
  registerSchema,
  resetPasswordSchema
};

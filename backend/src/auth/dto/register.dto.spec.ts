import { RegisterDtoSchema } from './register.dto';

describe('RegisterDtoSchema', () => {
  const validDto = {
    email: 'test@example.com',
    password: 'Password123',
    name: 'Test User',
    phone: '13800138000',
    orgId: 'org-123',
  };

  describe('valid inputs', () => {
    it('should pass with all valid fields', () => {
      const result = RegisterDtoSchema.safeParse(validDto);
      expect(result.success).toBe(true);
    });

    it('should pass without optional phone and orgId', () => {
      const { phone, orgId, ...required } = validDto;
      const result = RegisterDtoSchema.safeParse(required);
      expect(result.success).toBe(true);
    });
  });

  describe('password validation', () => {
    it('should fail when password is less than 8 characters', () => {
      const result = RegisterDtoSchema.safeParse({ ...validDto, password: 'Pass1' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Password must be at least 8 characters');
      }
    });

    it('should fail when password has no uppercase letter', () => {
      const result = RegisterDtoSchema.safeParse({ ...validDto, password: 'password123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Password must contain at least one uppercase letter');
      }
    });

    it('should fail when password has no lowercase letter', () => {
      const result = RegisterDtoSchema.safeParse({ ...validDto, password: 'PASSWORD123' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Password must contain at least one lowercase letter');
      }
    });

    it('should fail when password has no number', () => {
      const result = RegisterDtoSchema.safeParse({ ...validDto, password: 'PasswordABC' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Password must contain at least one number');
      }
    });
  });

  describe('other field validation', () => {
    it('should fail when name is empty', () => {
      const result = RegisterDtoSchema.safeParse({ ...validDto, name: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name is required');
      }
    });

    it('should fail when email format is invalid', () => {
      const result = RegisterDtoSchema.safeParse({ ...validDto, email: 'not-an-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid email format');
      }
    });
  });
});

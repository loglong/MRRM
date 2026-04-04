import { AuthContext, AuthUser } from './auth-context';

describe('AuthContext', () => {
  const mockUser: AuthUser = {
    userId: 'user-123',
    orgId: 'org-456',
    role: 'ADMIN',
  };

  beforeEach(() => {
    // Clear state before each test
    AuthContext.clear();
  });

  afterAll(() => {
    AuthContext.clear();
  });

  describe('set and current', () => {
    it('should return the user set via set()', () => {
      AuthContext.set(mockUser);
      expect(AuthContext.current()).toEqual(mockUser);
    });

    it('should return null after clear()', () => {
      AuthContext.set(mockUser);
      AuthContext.clear();
      expect(AuthContext.current()).toBeNull();
    });
  });

  describe('getOrgId', () => {
    it('should return the user orgId', () => {
      AuthContext.set(mockUser);
      expect(AuthContext.getOrgId()).toBe('org-456');
    });

    it('should return null when no user is set', () => {
      expect(AuthContext.getOrgId()).toBeNull();
    });
  });

  describe('getUserId', () => {
    it('should return the user userId', () => {
      AuthContext.set(mockUser);
      expect(AuthContext.getUserId()).toBe('user-123');
    });

    it('should return null when no user is set', () => {
      expect(AuthContext.getUserId()).toBeNull();
    });
  });

  describe('initial state', () => {
    it('should return null for current() at start', () => {
      expect(AuthContext.current()).toBeNull();
    });
  });
});

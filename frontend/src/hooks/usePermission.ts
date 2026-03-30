export const usePermission = (permission: string): boolean => {
  // Permissions are attached to user from the JWT payload
  // In a full implementation, permissions would be included in the user object
  // For now, check against a stored permission list
  const storedPermissions = localStorage.getItem('mrrm_permissions');
  const permissions: string[] = storedPermissions ? JSON.parse(storedPermissions) : [];
  return permissions.includes(permission);
};

export const usePermissions = (): string[] => {
  const storedPermissions = localStorage.getItem('mrrm_permissions');
  return storedPermissions ? JSON.parse(storedPermissions) : [];
};

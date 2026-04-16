export const ROLES = {
  SUPER_USER: 'SUPER_USER',
  ADMIN: 'ADMIN',
  FPC: 'FPC',
  SPC: 'SPC',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
};

// Group roles by access level — add new roles here as the app grows
export const ROLE_GROUPS = {
  ADMIN: [ROLES.ADMIN, ROLES.SUPER_USER, ROLES.FPC],
  STAFF: [ROLES.SPC],
  STUDENT: [ROLES.STUDENT],
  PARENT: [ROLES.PARENT],
};

export const ROLE_COLORS = {
  [ROLES.SUPER_USER]: '#7C3AED',
  [ROLES.ADMIN]:      '#2563EB',
  [ROLES.FPC]:        '#0891B2',
  [ROLES.SPC]:        '#059669',
  [ROLES.STUDENT]:    '#374151',
  [ROLES.PARENT]:     '#B45309',
};

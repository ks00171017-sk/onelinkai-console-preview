export function consoleHomePage(tenant = null) {
  return tenant ? "dashboard" : "personal-key";
}

export function createConsoleState(tenant = null) {
  return { tenant, page: consoleHomePage(tenant) };
}

export function selectConsoleScope(current, tenant = null) {
  if ((current.tenant?.id ?? null) === (tenant?.id ?? null)) return current;
  return createConsoleState(tenant);
}

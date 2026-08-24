export function isAuthenticated() {
  return Boolean(sessionStorage.getItem('sama-dahira:user'));
}

export function login() {
  return qq.BaaS.auth.loginWithQQ()
}

export function getUserInfo(data) {
  return qq.BaaS.auth.loginWithQQ(data.mp)
}

export function logout() {
  return qq.BaaS.auth.logout()
}

// export function login() {
//   return wx.BaaS.login(false)
// }
//
// export function getUserInfo(data) {
//   return wx.BaaS.handleUserInfo(data.mp)
// }
//
// export function logout() {
//   return wx.BaaS.logout()
// }

export function login() {
  return qq.BaaS.auth.loginWithQQ()
}

export function getUserInfo(data) {
  return qq.BaaS.auth.loginWithQQ(data.mp)
}

export function logout() {
  return qq.BaaS.auth.logout()
}

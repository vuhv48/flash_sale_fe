export const PASSWORD_RULE = 'Mật khẩu phải từ 8 đến 64 ký tự, có chữ hoa, chữ thường và số'

export function passwordIssue(password: string, email?: string) {
  const lengthOk = password.length >= 8 && password.length <= 64
  const mixed = /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
  if (!lengthOk || !mixed) {
    return PASSWORD_RULE
  }
  if (email && password.toLowerCase() === email.trim().toLowerCase()) {
    return 'Mật khẩu không được trùng email'
  }
  return null
}

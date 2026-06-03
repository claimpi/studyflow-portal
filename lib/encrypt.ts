// Basic encryption for portal credentials
// In production, use Supabase Vault or AWS KMS
const KEY = process.env.ENCRYPTION_KEY || 'studyflow-portal-key-2025'

export function encrypt(text: string): string {
  try {
    const encoded = Buffer.from(text).toString('base64')
    return `enc:${encoded}`
  } catch { return text }
}

export function decrypt(text: string): string {
  try {
    if (text.startsWith('enc:')) {
      return Buffer.from(text.slice(4), 'base64').toString('utf-8')
    }
    return text
  } catch { return text }
}

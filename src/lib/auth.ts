import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// User credentials with roles
const USERS = [
  {
    username: 'b2academy',
    // Password: algansec# (hashed with bcrypt)
    passwordHash: '$2b$10$byJlOAv/8LTReeHSO9E.T.yg2p2N28.pBuVuUdfye0tncCzVRCa42',
    role: 'admin' // Full access
  },
  {
    username: 'b2uyedenetim',
    // Password: b2uyedenetim#1453# (hashed with bcrypt)
    passwordHash: '$2b$10$5drjdPiXPW1yQ7fg74o4IuWCglLgAmI5LzkY85u.DWdVAVIfdFpIC',
    role: 'member_manager' // Only members section access
  }
];

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'b2_sports_academy_ultra_secure_jwt_secret_key_2025_algansec_encrypted'
);

// Verify user credentials
export async function verifyAdminCredentials(username: string, password: string): Promise<{ valid: boolean; role?: string }> {
  const user = USERS.find(u => u.username === username);
  
  if (!user) {
    // Add delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { valid: false };
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  
  if (isValid) {
    return { valid: true, role: user.role };
  }
  
  // Add delay to prevent timing attacks
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { valid: false };
}

// Generate JWT token
export async function generateToken(username: string, role: string): Promise<string> {
  const token = await new SignJWT({ username, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
  
  return token;
}

// Verify JWT token
export async function verifyToken(token: string): Promise<{ username: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { username: string; role: string };
  } catch (error) {
    return null;
  }
}

// Generate password hash (for setup)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
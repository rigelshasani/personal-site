import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.login) {
    return null;
  }
  
  // Check against admin whitelist
  const adminLogins = process.env.ADMIN_GITHUB_LOGINS?.split(',') || [];
  const isAdmin = adminLogins.includes(session.user.login);
  
  return isAdmin ? session : null;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

export function isAdmin(userLogin?: string | null): boolean {
  if (!userLogin) return false;
  const adminLogins = process.env.ADMIN_GITHUB_LOGINS?.split(',') || [];
  return adminLogins.includes(userLogin);
}
// src/utils/tokenHelper.js

// These are the full claim URL names ASP.NET Core uses
// when you use ClaimTypes.Name, ClaimTypes.Role etc.
const CLAIM_TYPES = {
  name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  role: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
};

// Helper function — reads claim by its full URL name
// Falls back to short name if not found
export const getClaim = (user, claimKey) => {
  if (!user) return null;

  // Try the full URL name first (what ASP.NET Core stores)
  // Then try the short name as fallback
  return user[CLAIM_TYPES[claimKey]] || user[claimKey] || null;
};

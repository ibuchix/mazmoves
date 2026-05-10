
const ALLOWED_ORIGINS = [
  'https://housemove.co',
  'https://www.housemove.co',
  'http://localhost:5173', // Development
  'http://localhost:3000',  // Development
  'https://5b91d28b-133e-4d6b-bf07-94156296a276.lovableproject.com', // Lovable preview URL
  'https://id-preview--5b91d28b-133e-4d6b-bf07-94156296a276.lovable.app' // Additional Lovable preview URL
];

export function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (!origin && !referer) {
    console.error('No origin or referer header present');
    return false;
  }

  const isAllowed = (url: string): boolean => {
    if (ALLOWED_ORIGINS.some(allowed => url.startsWith(allowed))) return true;
    // Allow any Lovable preview / published subdomain for this project
    try {
      const { hostname } = new URL(url);
      return (
        hostname.endsWith('.lovable.app') ||
        hostname.endsWith('.lovableproject.com')
      );
    } catch {
      return false;
    }
  };

  if (origin && isAllowed(origin)) return true;
  if (referer && isAllowed(referer)) return true;

  console.error('Invalid origin:', origin, 'referer:', referer);
  return false;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

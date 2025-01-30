const ALLOWED_ORIGINS = [
  'https://mazmoves.com',
  'https://app.mazmoves.com',
  'http://localhost:5173', // Development
  'http://localhost:3000'  // Development
];

export function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // If neither header is present, reject the request
  if (!origin && !referer) {
    console.error('No origin or referer header present');
    return false;
  }

  // Check origin header
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // Check referer header
  if (referer) {
    return ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed));
  }

  console.error('Invalid origin:', origin);
  console.error('Invalid referer:', referer);
  return false;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
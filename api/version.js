// Lets the host app (supper-app) know, with a single cheap request, whether
// its locally-cached copy of this mini app is stale — see
// lib/miniAppBundleCache.ts there. VERCEL_GIT_COMMIT_SHA is set
// automatically by Vercel on every deploy, so this needs no manual bumping.
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  const version = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || 'dev';
  res.status(200).json({ version });
}

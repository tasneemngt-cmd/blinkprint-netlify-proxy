exports.handler = async (event) => {
  const allowed = new Set(['health', 'app_products', 'pricing', 'app_locations']);
  const action = event.queryStringParameters?.action || 'health';
  const json = (statusCode, body) => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
    body: JSON.stringify(body),
  });

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  }, body: '' };
  if (event.httpMethod !== 'GET') return json(405, { success: false, error: 'Only GET is supported.' });
  if (!allowed.has(action)) return json(400, { success: false, error: 'Unsupported API action.' });

  const upstreamUrl = `https://blinkprint.page.gd/app_api.php?action=${encodeURIComponent(action)}`;
  try {
    const response = await fetch(upstreamUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'User-Agent': 'BlinkPrint-API-Proxy/1.0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    const contentType = response.headers.get('content-type') || '';
    const body = await response.text();
    let data;
    try { data = JSON.parse(body); }
    catch (_) {
      return json(502, {
        success: false,
        error: 'Original Blink Print hosting returned non-JSON. This proxy cannot fix its security challenge by itself.',
        upstreamStatus: response.status,
        upstreamContentType: contentType,
        upstreamPreview: body.slice(0, 180),
      });
    }
    if (!response.ok) return json(502, { success: false, error: 'Original Blink Print API returned an HTTP error.', upstreamStatus: response.status });
    return json(200, data);
  } catch (error) {
    return json(502, { success: false, error: 'Could not reach the original Blink Print API.', details: String(error?.message || error).slice(0, 180) });
  }
};

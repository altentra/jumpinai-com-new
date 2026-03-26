export async function logApiUsage(
  supabase: any,
  endpoint: string,
  userId: string | null,
  ipAddress: string | null,
  userAgent: string | null,
  statusCode: number,
  durationMs: number,
  errorMessage?: string
) {
  try {
    await supabase.from('api_usage_logs').insert({
      endpoint,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      status_code: statusCode,
      request_duration_ms: durationMs,
      error_message: errorMessage
    });
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}

export async function getLocation(ipAddress: string): Promise<string> {
  if (ipAddress === 'unknown' || ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
    return 'Unknown';
  }

  try {
    const geoResponse = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,regionName,city`);
    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      if (geoData.status === 'success') {
        const parts = [];
        if (geoData.city) parts.push(geoData.city);
        if (geoData.regionName) parts.push(geoData.regionName);
        if (geoData.country) parts.push(geoData.country);
        return parts.join(', ') || 'Unknown';
      }
    }
  } catch (geoError) {
    console.error('Geolocation error:', geoError);
  }
  
  return 'Unknown';
}

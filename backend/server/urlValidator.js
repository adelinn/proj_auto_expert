import { lookup } from 'dns/promises';
import net from 'net';

function isIPv4Private(ip) {
  // Convert IPv4 to numeric
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => Number.isNaN(p))) return false;
  const n = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];

  // ranges
  const inRange = (start, end) => n >= start && n <= end;

  const toNum = (a,b,c,d) => (a<<24)|(b<<16)|(c<<8)|d;

  // 10.0.0.0/8
  if (inRange(toNum(10,0,0,0), toNum(10,255,255,255))) return true;
  // 172.16.0.0/12
  if (inRange(toNum(172,16,0,0), toNum(172,31,255,255))) return true;
  // 192.168.0.0/16
  if (inRange(toNum(192,168,0,0), toNum(192,168,255,255))) return true;
  // 127.0.0.0/8 loopback
  if (inRange(toNum(127,0,0,0), toNum(127,255,255,255))) return true;
  // 169.254.0.0/16 link-local
  if (inRange(toNum(169,254,0,0), toNum(169,254,255,255))) return true;
  return false;
}

function isIPv6Private(ip) {
  // Basic checks for common private IPv6 ranges
  if (!ip) return false;
  const l = ip.toLowerCase();
  if (l === '::1') return true; // loopback
  // Unique-local (fc00::/7) -> starts with fc or fd
  if (l.startsWith('fc') || l.startsWith('fd')) return true;
  // link-local fe80::/10
  if (l.startsWith('fe80')) return true;
  return false;
}

export async function isIpPrivate(ip) {
  if (net.isIP(ip) === 4) return isIPv4Private(ip);
  if (net.isIP(ip) === 6) return isIPv6Private(ip);
  return false;
}

export async function isHostnamePrivate(hostname) {
  // If hostname is an IP literal, check it directly
  if (net.isIP(hostname)) {
    return isIpPrivate(hostname);
  }

  // Resolve DNS A/AAAA records and check each address
  try {
    const addrs = await lookup(hostname, { all: true });
    for (const a of addrs) {
      if (await isIpPrivate(a.address)) return true;
    }
    return false;
  } catch (err) {
    // If DNS resolution fails, be conservative and treat as invalid/private
    return true;
  }
}

export async function validateLinks(links, options = {}) {
  const maxLinks = options.maxLinks || 10;
  const maxLength = options.maxLength || 2000;
  // allowedDomains can be supplied in options, or from env (ALLOWED_DOMAINS), or from DB
  let allowedDomains = options.allowedDomains || (process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',').map(s=>s.trim()) : null);

  // If not supplied and no ALLOWED_DOMAINS env, try to fetch from DB
  if (!allowedDomains) {
    try {
      const { getAllowedDomains } = await import('./allowedDomainsService.js');
      const rows = await getAllowedDomains();
      allowedDomains = rows.map(r => r.domain);
    } catch (err) {
      // DB not available or other error — leave allowedDomains as null and treat as permissive
      allowedDomains = null;
    }
  }

  const valid = [];
  const invalid = [];

  if (!Array.isArray(links)) return { valid: [], invalid: [{ link: null, reason: 'links must be an array' }] };

  if (links.length > maxLinks) {
    return { valid, invalid: [{ link: null, reason: `Too many links (max ${maxLinks}).` }] };
  }

  for (const link of links) {
    if (!link || typeof link !== 'string') {
      invalid.push({ link, reason: 'Invalid link format' });
      continue;
    }
    if (link.length > maxLength) {
      invalid.push({ link, reason: 'Link length exceeds limit' });
      continue;
    }

    let url;
    try {
      url = new URL(link);
    } catch (err) {
      invalid.push({ link, reason: 'Malformed URL' });
      continue;
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
      invalid.push({ link, reason: 'Unsupported URL protocol' });
      continue;
    }

    const hostname = url.hostname;

    // optional allowlist
    if (allowedDomains && allowedDomains.length) {
      const match = allowedDomains.some(d => hostname === d || hostname.endsWith('.' + d));
      if (!match) {
        invalid.push({ link, reason: 'Domain not allowed' });
        continue;
      }
    }

    // Reject localhost / private IPs via DNS resolution
    const isPrivate = await isHostnamePrivate(hostname);
    if (isPrivate) {
      invalid.push({ link, reason: 'Hostname resolves to a private or local address' });
      continue;
    }

    valid.push(link);
  }

  return { valid, invalid };
}
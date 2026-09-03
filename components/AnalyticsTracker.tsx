'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { axiosInstance } from '@/utils/axiosInstance';

// ============================================================
// APP IDENTIFIER
// ============================================================
// Identifies which frontend this tracker is running on.
// Sent with every tracked event so the backend can separate
// analytics data by app (affiliate / services / ecommerce / etc.)
const APP_NAME = 'services';

// ============================================================
// STORAGE KEYS
// ============================================================
const VISITOR_KEY = 'ms_analytics_visitor_id';
const SESSION_KEY = 'ms_analytics_session_id';
const CONSENT_KEY = 'ms_analytics_consent';
const LANDING_KEY = 'ms_analytics_landing_url';

// ============================================================
// HELPERS
// ============================================================
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getUTMParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    term: params.get('utm_term') || undefined,
    content: params.get('utm_content') || undefined,
  };
}

function getReferrerInfo() {
  if (typeof document === 'undefined') {
    return { referrer_url: null as string | null, referrer_domain: null as string | null };
  }

  const referrer = document.referrer || null;
  let domain: string | null = null;

  if (referrer) {
    try {
      domain = new URL(referrer).hostname;
    } catch {
      domain = null;
    }
  }

  return { referrer_url: referrer, referrer_domain: domain };
}

function detectDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function detectBrowser(): { browser: string; version?: string } {
  const ua = navigator.userAgent;

  if (ua.includes('Firefox/')) {
    return { browser: 'Firefox', version: ua.split('Firefox/')[1]?.split(' ')[0] };
  }
  if (ua.includes('Edg/')) {
    return { browser: 'Edge', version: ua.split('Edg/')[1]?.split(' ')[0] };
  }
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    return { browser: 'Chrome', version: ua.split('Chrome/')[1]?.split(' ')[0] };
  }
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    return { browser: 'Safari', version: ua.split('Version/')[1]?.split(' ')[0] };
  }
  if (ua.includes('OPR/') || ua.includes('Opera')) {
    return { browser: 'Opera' };
  }

  return { browser: 'Other' };
}

function detectOS(): { os: string; version?: string } {
  const ua = navigator.userAgent;

  if (ua.includes('Windows NT 10')) return { os: 'Windows', version: '10/11' };
  if (ua.includes('Windows NT')) return { os: 'Windows' };
  if (ua.includes('Mac OS X')) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    return { os: 'macOS', version: match?.[1]?.replace('_', '.') };
  }
  if (ua.includes('Android')) {
    const match = ua.match(/Android (\d+(\.\d+)?)/);
    return { os: 'Android', version: match?.[1] };
  }
  if (ua.includes('iPhone') || ua.includes('iPad')) {
    const match = ua.match(/OS (\d+[._]\d+)/);
    return { os: 'iOS', version: match?.[1]?.replace('_', '.') };
  }
  if (ua.includes('Linux')) return { os: 'Linux' };

  return { os: 'Other' };
}

function getChannel(source?: string, medium?: string, referrerDomain?: string | null): string {
  if (!source && !referrerDomain) return 'direct';
  if (medium === 'cpc' || medium === 'ppc' || medium === 'paid') return 'paid_search';
  if (medium === 'email') return 'email';
  if (medium === 'affiliate') return 'affiliate';

  const socialSources = [
    'facebook',
    'instagram',
    'tiktok',
    'twitter',
    'linkedin',
    'x',
    'youtube',
    'pinterest',
  ];
  if (socialSources.includes((source || '').toLowerCase())) {
    return medium === 'cpc' || medium === 'paid' ? 'paid_social' : 'organic_social';
  }

  if (source === 'google' && (medium === 'organic' || !medium)) return 'organic_search';
  if (referrerDomain) return 'referral';

  return 'other';
}

function createDeviceFingerprint(): string {
  if (typeof window === 'undefined') return '';

  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || '',
  ].join('|');

  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function getLandingUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  let landing = sessionStorage.getItem(LANDING_KEY);
  if (!landing) {
    landing = window.location.href;
    sessionStorage.setItem(LANDING_KEY, landing);
  }
  return landing;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function AnalyticsTracker() {
  const { customer, isAuthenticated, getReferralCode } = useCustomerAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const lastPathRef = useRef<string | null>(null);
  const pageViewIdRef = useRef<number | null>(null);
  const enterTimeRef = useRef<number>(Date.now());
  const isTrackingRef = useRef(false);
  const maxScrollRef = useRef<number>(0);

  // ----------------------------------------------------------
  // Track Page View
  // ----------------------------------------------------------
  const trackPageView = useCallback(async () => {
    if (typeof window === 'undefined') return;

    // Respect consent
    if (localStorage.getItem(CONSENT_KEY) === 'false') return;

    // Avoid tracking admin pages
    if (pathname.startsWith('/admin')) return;

    // Prevent concurrent tracking
    if (isTrackingRef.current) return;

    const pagePath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Prevent double tracking same path
    if (lastPathRef.current === pagePath) return;

    try {
      isTrackingRef.current = true;

      // Before tracking new page, send engagement for previous one
      if (pageViewIdRef.current && lastPathRef.current) {
        sendEngagement(false); // not necessarily exit of whole session
      }

      lastPathRef.current = pagePath;
      maxScrollRef.current = 0;

      const visitorId = getOrCreateVisitorId();
      const sessionId = getOrCreateSessionId();
      const utms = getUTMParams();
      const { referrer_url, referrer_domain } = getReferrerInfo();
      const { browser, version: browserVersion } = detectBrowser();
      const { os, version: osVersion } = detectOS();
      const referralCode = getReferralCode?.() || null;
      const landingUrl = getLandingUrl();

      const payload = {
        app: APP_NAME,

        visitor_public_id: visitorId,
        session_public_id: sessionId,
        customer_public_id: isAuthenticated && customer?.public_id ? customer.public_id : null,

        page_url: window.location.href,
        page_path: pagePath,
        page_title: document.title || undefined,
        previous_page:
          lastPathRef.current !== pagePath ? lastPathRef.current : document.referrer || undefined,

        // Device
        device_type: detectDeviceType(),
        device_brand: undefined, // hard to detect reliably in browser
        device_model: undefined,
        browser,
        browser_version: browserVersion,
        operating_system: os,
        operating_system_version: osVersion,
        user_agent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        device_fingerprint: createDeviceFingerprint(),

        // Traffic source
        channel: getChannel(utms.source, utms.medium, referrer_domain),
        source: utms.source,
        medium: utms.medium,
        campaign: utms.campaign,
        term: utms.term,
        content: utms.content,
        referrer_url,
        referrer_domain,
        landing_url: landingUrl,

        // Affiliate
        affiliate_code: referralCode || undefined,
        referral_id: referralCode || undefined,

        // Geography – left empty; resolved server-side from IP
        // (country_code, city, latitude, etc. are filled by backend)

        is_bot: false,
        analytics_consent: true,
      };

      const res = await axiosInstance.post('/api/traffic_analytics/track/page-view', payload);

      if (res?.data) {
        if (res.data.visitor_public_id) {
          localStorage.setItem(VISITOR_KEY, res.data.visitor_public_id);
        }
        if (res.data.session_public_id) {
          sessionStorage.setItem(SESSION_KEY, res.data.session_public_id);
        }
        pageViewIdRef.current = res.data.page_view_id ?? null;
        enterTimeRef.current = Date.now();
      }
    } catch (err) {
      console.debug('Analytics page view failed:', err);
    } finally {
      isTrackingRef.current = false;
    }
  }, [pathname, searchParams, isAuthenticated, customer?.public_id, getReferralCode]);

  // ----------------------------------------------------------
  // Track custom event
  // ----------------------------------------------------------
  const trackEvent = useCallback(
    async (
      eventName: string,
      metadata?: Record<string, any>,
      value?: number,
      currency: string = 'KES'
    ) => {
      try {
        if (localStorage.getItem(CONSENT_KEY) === 'false') return;

        const visitorId = localStorage.getItem(VISITOR_KEY);
        const sessionId = sessionStorage.getItem(SESSION_KEY);
        if (!visitorId || !sessionId) return;

        await axiosInstance.post('/api/traffic_analytics/track/event', {
          app: APP_NAME,
          visitor_public_id: visitorId,
          session_public_id: sessionId,
          event_name: eventName,
          customer_public_id: isAuthenticated && customer?.public_id ? customer.public_id : null,
          page_path: pathname,
          metadata,
          value,
          currency,
        });
      } catch (err) {
        console.debug('Analytics event failed:', err);
      }
    },
    [pathname, isAuthenticated, customer?.public_id]
  );

  // ----------------------------------------------------------
  // Send engagement (time on page + scroll + exited_at)
  // ----------------------------------------------------------
  const sendEngagement = useCallback((isExit = true) => {
    if (!pageViewIdRef.current) return;

    const timeOnPage = Math.max(0, Math.round((Date.now() - enterTimeRef.current) / 1000));

    const scrollDepth = Math.min(
      100,
      Math.max(
        maxScrollRef.current,
        Math.round(
          ((window.scrollY + window.innerHeight) / (document.documentElement.scrollHeight || 1)) *
            100
        )
      )
    );

    const payload = {
      exited_at: new Date().toISOString(),
      time_on_page_seconds: timeOnPage,
      scroll_depth_percent: scrollDepth,
      is_exit_page: isExit,
    };

    const baseURL = axiosInstance.defaults.baseURL || '';
    const url = `${baseURL}/api/traffic_analytics/page-view/${pageViewIdRef.current}`;

    // Prefer fetch with keepalive (works with PATCH)
    if (typeof fetch !== 'undefined') {
      fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
        credentials: 'include',
      }).catch(() => {});
    } else {
      // Fallback
      axiosInstance.patch(url, payload).catch(() => {});
    }
  }, []);

  // ----------------------------------------------------------
  // Track max scroll depth continuously
  // ----------------------------------------------------------
  useEffect(() => {
    const onScroll = () => {
      const depth = Math.round(
        ((window.scrollY + window.innerHeight) / (document.documentElement.scrollHeight || 1)) * 100
      );
      if (depth > maxScrollRef.current) {
        maxScrollRef.current = Math.min(100, depth);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ----------------------------------------------------------
  // Link visitor → customer after login
  // ----------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated || !customer?.public_id) return;

    const visitorId = localStorage.getItem(VISITOR_KEY);
    if (!visitorId) return;

    axiosInstance
      .post(`/api/traffic_analytics/visitors/${visitorId}/link-customer`, null, {
        params: { customer_public_id: customer.public_id, app: APP_NAME },
      })
      .catch(() => {});
  }, [isAuthenticated, customer?.public_id]);

  // ----------------------------------------------------------
  // Track on every route change
  // ----------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      trackPageView();
    }, 250);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, trackPageView]);

  // ----------------------------------------------------------
  // Send engagement on tab close / hide / beforeunload
  // ----------------------------------------------------------
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        sendEngagement(true);
      }
    };

    const handlePageHide = () => {
      sendEngagement(true);
    };

    const handleBeforeUnload = () => {
      sendEngagement(true);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sendEngagement]);

  // ----------------------------------------------------------
  // Expose global helpers
  // ----------------------------------------------------------
  useEffect(() => {
    (window as any).msTrackEvent = trackEvent;
    (window as any).msAnalytics = {
      trackEvent,
      getVisitorId: () => localStorage.getItem(VISITOR_KEY),
      getSessionId: () => sessionStorage.getItem(SESSION_KEY),
    };

    return () => {
      delete (window as any).msTrackEvent;
      delete (window as any).msAnalytics;
    };
  }, [trackEvent]);

  return null;
}

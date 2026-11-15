export type AnalyticsEvent = 
  | 'search_submit'
  | 'call_click'
  | 'whatsapp_click'
  | 'directions_click'
  | 'emergency_open'
  | 'list_business_start'
  | 'list_business_submit'
  | 'correction_submit'
  | 'filter_change'
  | 'sort_change'
  | 'provider_view'
  | 'claim_listing_click'
  | 'share_click';

export interface EventRecord {
  event: AnalyticsEvent;
  props: Record<string, any>;
  timestamp: string;
}

const EVENT_LOG_KEY = 'practo_animals_events_log';

export function getRecordedEvents(): EventRecord[] {
  try {
    const raw = sessionStorage.getItem(EVENT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function track(event: AnalyticsEvent, props: Record<string, any> = {}): void {
  const timestamp = new Date().toISOString();
  const record: EventRecord = { event, props, timestamp };

  // 1. Console stub as requested
  // Styled group in console for easy inspection by evaluators
  console.groupCollapsed(
    `%c[Telemetry] ${event} %c@ ${new Date(timestamp).toLocaleTimeString()}`,
    'color: #0D5C4B; font-weight: bold;',
    'color: #5B6865; font-weight: normal;'
  );
  console.log('Event Name:', event);
  console.log('Properties:', props);
  console.log('Timestamp:', timestamp);
  console.groupEnd();

  // 2. Persist in sessionStorage for inspection on /about-prototype page
  try {
    const existing = getRecordedEvents();
    existing.unshift(record);
    // Keep last 50 events
    sessionStorage.setItem(EVENT_LOG_KEY, JSON.stringify(existing.slice(0, 50)));
    // Dispatch custom event for live subscriber components
    window.dispatchEvent(new CustomEvent('practo_analytics_event', { detail: record }));
  } catch {
    // ignore sessionStorage quota errors
  }
}

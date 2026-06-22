export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

class AnalyticsSystem {
  track(eventName: string, payload: AnalyticsPayload = {}): void {
    const event = { eventName, payload, at: Date.now() };
    console.info('[Analytics]', eventName, payload);
    window.dispatchEvent(new CustomEvent('capi:analytics', { detail: event }));
  }
}

export const analytics = new AnalyticsSystem();

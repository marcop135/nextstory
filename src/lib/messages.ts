const en = {
  inspect: "Inspect blocks", loading: "Loading…", failed: "Request failed. Try again.",
  ready: "Examples loaded.", choose: "Choose a block", required: "Required", translated: "Translatable",
  yes: "Yes", no: "No", absent: "Not supplied", field: "Field", examples: "Published examples", seed: "Bundled examples",
  request: "Request again", page: "Page", cached: "Cached at", cleared: "Last clearing tag",
  unavailable: "Not exposed by this response", tag: "Configured cache tag", window: "Configured refresh window",
  source: "Content source", headers: "Response headers", noRuns: "No requests yet.",
  cacheNote: "HEAD reads response headers without downloading the page body. Timings measure this request, not cache age. A cache tag is the label used to expire stored content.",
  seedWindow: "No CMS cache in seed mode", seconds: "seconds", done: "Request complete.",
  refresh: "Refresh values", refreshed: "Attribution values refreshed.", empty: "Not set",
  attributionNote: "These are the values the form reads at submission. This inspector sends nothing.",
  draft: "Draft order", published: "Published preview", up: "Move up", down: "Move down",
  publish: "Publish", reset: "Reset", changed: "Draft changed. The published preview is unchanged.",
  publishedStatus: "Preview updated to the draft order.", resetStatus: "Draft and preview reset.",
  simulation: "Local demonstration. Publishing here does not change Storyblok or the live site.",
  hero: "Hero", features: "Features", action: "Call to action",
};
const de: typeof en = {
  inspect: "Blöcke untersuchen", loading: "Wird geladen…", failed: "Anfrage fehlgeschlagen. Erneut versuchen.",
  ready: "Beispiele geladen.", choose: "Block auswählen", required: "Pflichtfeld", translated: "Übersetzbar",
  yes: "Ja", no: "Nein", absent: "Nicht angegeben", field: "Feld", examples: "Veröffentlichte Beispiele", seed: "Mitgelieferte Beispiele",
  request: "Erneut anfragen", page: "Seite", cached: "Gespeichert am", cleared: "Zuletzt geleerter Tag",
  unavailable: "In dieser Antwort nicht verfügbar", tag: "Konfigurierter Cache-Tag", window: "Konfiguriertes Aktualisierungsintervall",
  source: "Inhaltsquelle", headers: "Antwort-Header", noRuns: "Noch keine Anfragen.",
  cacheNote: "HEAD liest Antwort-Header, ohne den Seiteninhalt herunterzuladen. Die Zeiten messen diese Anfrage, nicht das Cache-Alter. Ein Cache-Tag ist die Kennzeichnung zum Löschen gespeicherter Inhalte.",
  seedWindow: "Kein CMS-Cache im Demo-Modus", seconds: "Sekunden", done: "Anfrage abgeschlossen.",
  refresh: "Werte aktualisieren", refreshed: "Zuordnungswerte aktualisiert.", empty: "Nicht gesetzt",
  attributionNote: "Diese Werte liest das Formular beim Absenden. Diese Ansicht sendet nichts.",
  draft: "Reihenfolge im Entwurf", published: "Veröffentlichte Vorschau", up: "Nach oben", down: "Nach unten",
  publish: "Veröffentlichen", reset: "Zurücksetzen", changed: "Entwurf geändert. Die veröffentlichte Vorschau bleibt unverändert.",
  publishedStatus: "Vorschau auf die Reihenfolge des Entwurfs aktualisiert.", resetStatus: "Entwurf und Vorschau zurückgesetzt.",
  simulation: "Lokale Demonstration. Veröffentlichen ändert hier weder Storyblok noch die Live-Site.",
  hero: "Hero", features: "Merkmale", action: "Handlungsaufruf",
};
export const widgetMessages = { en, de };
export type WidgetCopy = typeof en;

const fallbackEn = {
  block_anatomy: "Inspect required and translatable fields with English and German values.",
  cache_inspector: "Read response headers and compare the last five HEAD request timings per page.",
  attribution_inspector: "Inspect page, referrer, and campaign parameters locally without sending them.",
  draft_publish: "Reorder a local draft and publish it to the demonstration preview.",
};
const fallbackDe: typeof fallbackEn = {
  block_anatomy: "Prüfe Pflichtfelder und übersetzbare Felder mit englischen und deutschen Werten.",
  cache_inspector: "Lies Antwort-Header und vergleiche die letzten fünf HEAD-Anfragezeiten pro Seite.",
  attribution_inspector: "Prüfe Seiten-, Herkunfts- und Kampagnenparameter lokal, ohne sie zu senden.",
  draft_publish: "Sortiere einen lokalen Entwurf um und veröffentliche ihn in der Demo-Vorschau.",
};
export const widgetFallbacks = { en: fallbackEn, de: fallbackDe };

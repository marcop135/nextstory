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
  draft: "Draft order", published: "Live preview", up: "Move up", down: "Move down",
  publish: "Publish", reset: "Reset", changed: "Draft and preview updated.",
  publishedStatus: "Current order published locally.", resetStatus: "Draft and preview reset.",
  simulation: "Local demo. Nothing changes in Storyblok or on the live site.",
  hero: "Hero", features: "Features", action: "Call to action",
  reorderHint: "Move a block. Watch the page follow.",
  unpublished: "Unpublished changes", inSync: "Saved locally", tryAction: "Get started",
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
  draft: "Reihenfolge im Entwurf", published: "Live-Vorschau", up: "Nach oben", down: "Nach unten",
  publish: "Veröffentlichen", reset: "Zurücksetzen", changed: "Entwurf und Vorschau aktualisiert.",
  publishedStatus: "Aktuelle Reihenfolge lokal veröffentlicht.", resetStatus: "Entwurf und Vorschau zurückgesetzt.",
  simulation: "Lokale Demo. In Storyblok und auf der Live-Site ändert sich nichts.",
  hero: "Hero", features: "Merkmale", action: "Handlungsaufruf",
  reorderHint: "Verschiebe einen Block. Die Seite folgt sofort.",
  unpublished: "Unveröffentlichte Änderungen", inSync: "Lokal gespeichert", tryAction: "Loslegen",
};
export const widgetMessages = { en, de };
export type WidgetCopy = typeof en;

const fallbackEn = {
  block_anatomy: "Inspect required and translatable fields with English and German values.",
  cache_inspector: "Read response headers and compare the last five HEAD request timings per page.",
  attribution_inspector: "Inspect page, referrer, and campaign parameters locally without sending them.",
  draft_publish: "Reorder blocks in a live preview and publish the current order locally.",
};
const fallbackDe: typeof fallbackEn = {
  block_anatomy: "Prüfe Pflichtfelder und übersetzbare Felder mit englischen und deutschen Werten.",
  cache_inspector: "Lies Antwort-Header und vergleiche die letzten fünf HEAD-Anfragezeiten pro Seite.",
  attribution_inspector: "Prüfe Seiten-, Herkunfts- und Kampagnenparameter lokal, ohne sie zu senden.",
  draft_publish: "Sortiere Blöcke in einer Live-Vorschau um und veröffentliche die Reihenfolge lokal.",
};
export const widgetFallbacks = { en: fallbackEn, de: fallbackDe };

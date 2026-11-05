/**
 * Privacy-friendly analytics (cookieless, DNT-aware): self-hosted Matomo Tag
 * Manager container, whose Pageview tag tracks the first load. Client-side
 * route changes are tracked by src/components/MatomoRouteTracker.tsx.
 */
var _mtm = (window._mtm = window._mtm || []);
_mtm.push({ 'mtm.startTime': new Date().getTime(), event: 'mtm.Start' });
(function () {
  var d = document,
    g = d.createElement('script'),
    s = d.getElementsByTagName('script')[0];
  g.async = true;
  g.src = 'https://mt.marcopontili.com/c/ZaEgDcKb.js';
  s.parentNode.insertBefore(g, s);
})();

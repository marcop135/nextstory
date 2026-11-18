/**
 * Privacy-friendly analytics (cookieless): self-hosted Matomo Tag Manager
 * container, whose Pageview tag tracks the first load. Do Not Track and
 * Global Privacy Control do not stop the container. Client-side route changes
 * are tracked by src/components/MatomoRouteTracker.tsx.
 */
(function () {
  var _mtm = (window._mtm = window._mtm || []);
  _mtm.push({ "mtm.startTime": new Date().getTime(), event: "mtm.Start" });
  var d = document,
    g = d.createElement("script"),
    s = d.getElementsByTagName("script")[0];
  g.async = true;
  g.src = "https://mt.marcopontili.com/c/ZaEgDcKb.js";
  s.parentNode.insertBefore(g, s);
})();

// Cookieless PostHog analytics for the Citizen Ready web pages.
// persistence: "memory" means nothing is stored in the visitor's browser.
(function () {
  var POSTHOG_KEY = "phc_ziCkk3JUPLGfTniKkKduM8bsgt5XJbZDEuqe7wtYAEc6";

  // Local previews and forks don't report.
  if (location.hostname !== "elevixapps.com") {
    window.crTrack = function () {};
    return;
  }

  // Official PostHog loader stub: queues calls until the library arrives.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  window.posthog.init(POSTHOG_KEY, {
    api_host: "https://us.i.posthog.com",
    persistence: "memory",
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: true,
    disable_session_recording: true
  });
  window.posthog.register({ platform: "web", site_section: "uscis", lang: document.documentElement.lang });

  window.crTrack = function (event, properties) {
    window.posthog.capture(event, properties || {});
  };

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("[data-cta]");

    if (link) {
      window.crTrack("app_store_cta_clicked", { campaign: link.getAttribute("data-cta"), page: location.pathname });
    }
  });
})();

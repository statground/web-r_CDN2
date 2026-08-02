(function clearInvalidWebRHomeSummaryCache202608021915(window) {
  "use strict";

  var summaryCacheKey = "webr.home.public-summary.v1";

  try {
    var raw = window.localStorage.getItem(summaryCacheKey);
    if (!raw) {
      return;
    }
    var entry = JSON.parse(raw);
    var activity = entry && entry.payload && entry.payload.sections
      ? entry.payload.sections.activity
      : null;
    if (!Array.isArray(activity) || activity.length === 0) {
      window.localStorage.removeItem(summaryCacheKey);
    }
  } catch (error) {
    try {
      window.localStorage.removeItem(summaryCacheKey);
    } catch (storageError) {
      // localStorage is optional. The live summary request remains authoritative.
    }
  }
})(window);

(function () {
  "use strict";

  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: [
            "Noto Sans KR",
            "Apple SD Gothic Neo",
            "Malgun Gothic",
            "system-ui",
            "sans-serif"
          ]
        }
      }
    }
  };
})();

export function gtag() {
  dataLayer.push(arguments);
}

document.addEventListener(
  "DOMContentLoaded",
  function () {
    fetch(`/getGACode`, { method: "get", "no-cors": true })
      .then((res) => res.json())
      .then((data) => {
        gtag("js", new Date());

        gtag("config", data.GA_CODE, {
          siteSpeedSampleRate: 100,
          cookieFlags: "SameSite=None; Secure",
          allowLinker: true,
        });
      });
  },
  false
);

export function gtag() {
  dataLayer.push(arguments);
}

fetch(`/getGACode`, { method: "get", "no-cors": true })
  .then((res) => res.json())
  .then((data) => {
    window.dataLayer = window.dataLayer || [];
    gtag("js", new Date());

    gtag("config", data.GA_CODE, {
      siteSpeedSampleRate: 100,
      cookieFlags: "SameSite=None; Secure",
      allowLinker: true,
    });
  });

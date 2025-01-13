async function getGeolocation(ip) {
  const url = `https://ipapi.co/${ip}/xml`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/xml",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");

    return xmlDoc;
  } catch (error) {
    console.error("Fetch error:", error);
    return false;
  }
}

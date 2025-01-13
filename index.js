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

async function getDonneesMeteo(lat, lon) {
  const url = `https://www.infoclimat.fr/public-api/gfs/xml?_ll=${lat},${lon}&_auth=AhhWQQF%2FAyFQfQM0AXdSewVtV2IBdwAnBXkKaQhtVClVPl8%2BBGRdO18xBntXeAQyVHlSMQA7ATFQO1YuCngEZQJoVjoBagNkUD8DZgEuUnkFK1c2ASEAJwVnCmQIZlQpVTNfOwR5XT5fMwZhV3kEMlRnUjEAIAEmUDJWNgpkBGECZlY6AWQDZ1A7A2kBLlJ5BTBXMAE2AD0FYgpvCDFUP1ViX24EM11pXzcGZVd5BDdUZFI7AD4BMFA2VjYKYQR4An5WSwERA3xQfwMjAWRSIAUrV2IBYABs&_c=5c56fd0d26e18569c80798b16aba4ba3`;

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

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
async function fetchUserIP() {
  try {
    const response = await fetch("https://api64.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("IP fetch error:", error);
    return null;
  }
}

async function initialize() {
  const ip = await fetchUserIP();
  if (ip) {
    const geoData = await getGeolocation(ip);
    if (geoData) {
      const city =
        geoData.querySelector("city")?.textContent || "Ville inconnue";
      const region =
        geoData.querySelector("region")?.textContent || "Région inconnue";
      const country =
        geoData.querySelector("country_name")?.textContent || "Pays inconnu";
      const latitude = geoData.querySelector("latitude")?.textContent || "0";
      const longitude = geoData.querySelector("longitude")?.textContent || "0";

      document.getElementById("geo-status").innerHTML = `
                <strong>Ville :</strong> ${city}<br>
                <strong>Région :</strong> ${region}<br>
                <strong>Pays :</strong> ${country}<br>
                <strong>Latitude :</strong> ${latitude}<br>
                <strong>Longitude :</strong> ${longitude}
            `;

      const map = L.map("map").setView([latitude, longitude], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        map
      );
      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("Votre position")
        .openPopup();
    } else {
      document.getElementById("geo-status").textContent =
        "Impossible de récupérer les données de géolocalisation.";
    }
  } else {
    document.getElementById("geo-status").textContent =
      "Impossible de récupérer votre adresse IP.";
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

initialize();

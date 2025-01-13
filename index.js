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
    const apiKey = "dc87b148530b91e0071c3c9b2a55c041";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Erreur réseau lors de la récupération des données météo.");
        }
        const data = await response.json();
        return {
            temperature: data.main.temp,
            vent_moyen: data.wind.speed,
            pluie: data.rain?.["1h"] || 0,
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des données météo :", error);
        return false;
    }
}

async function getInfoVelo() {
    const urlInfo = 'https://api.cyclocity.fr/contracts/nancy/gbfs/station_information.json';
    const urlStatus = 'https://api.cyclocity.fr/contracts/nancy/gbfs/station_status.json';

    try {
        const [infoResponse, statusResponse] = await Promise.all([
            fetch(urlInfo),
            fetch(urlStatus),
        ]);

        if (!infoResponse.ok || !statusResponse.ok) {
            throw new Error('Erreur réseau lors de la récupération des données des vélos.');
        }

        const infoData = await infoResponse.json();
        const statusData = await statusResponse.json();

        const stations = infoData.data.stations.map((station) => {
            const status = statusData.data.stations.find(s => s.station_id === station.station_id);
            return {
                name: station.name,
                lat: station.lat,
                lon: station.lon,
                availableBikes: status?.num_bikes_available || 0,
                availableDocks: status?.num_docks_available || 0,
            };
        });

        return stations;
    } catch (error) {
        console.error('Erreur lors de la récupération des données des vélos :', error);
        return [];
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
            const city = geoData.querySelector("city")?.textContent || "Ville inconnue";
            const region = geoData.querySelector("region")?.textContent || "Région inconnue";
            const country = geoData.querySelector("country_name")?.textContent || "Pays inconnu";
            const latitude = parseFloat(geoData.querySelector("latitude")?.textContent) || 0;
            const longitude = parseFloat(geoData.querySelector("longitude")?.textContent) || 0;

      document.getElementById("geo-status").innerHTML = `
                <strong>Ville :</strong> ${city}<br>
                <strong>Région :</strong> ${region}<br>
                <strong>Pays :</strong> ${country}<br>
                <strong>Latitude :</strong> ${latitude}<br>
                <strong>Longitude :</strong> ${longitude}
            `;

            // Affiche la carte Leaflet
            const map = L.map('map').setView([latitude, longitude], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            L.marker([latitude, longitude]).addTo(map).bindPopup("Votre position").openPopup();

            // Ajout des stations de vélos
            const stations = await getInfoVelo();
            stations.forEach(station => {
                const marker = L.marker([station.lat, station.lon]).addTo(map);
                marker.bindPopup(`
                    <strong>${station.name}</strong><br>
                    <strong>Vélos disponibles :</strong> ${station.availableBikes}<br>
                    <strong>Places libres :</strong> ${station.availableDocks}
                `);
            });

            // Appel des données météo
            const meteoData = await getDonneesMeteo(latitude, longitude);
            if (meteoData) {
                document.getElementById("weather-status").innerHTML = `
                    <strong>Température :</strong> ${meteoData.temperature}°C<br>
                    <strong>Vent :</strong> ${meteoData.vent_moyen} m/s<br>
                    <strong>Pluie :</strong> ${meteoData.pluie} mm
                `;
            } else {
                document.getElementById("weather-status").textContent = "Impossible de récupérer les données météo.";
            }
        } else {
            document.getElementById("geo-status").textContent = "Impossible de récupérer les données de géolocalisation.";
        }
    } else {
        document.getElementById("geo-status").textContent = "Impossible de récupérer votre adresse IP.";
    }
}

initialize();

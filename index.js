async function getGeolocation(ip) {
    const url = `https://ipapi.co/${ip}/json/`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;
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

async function getAirQuality(lat, lon) {
    try {
        const response = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=5a0007c057316c5c6d21be6645534904`);
        const data = await response.json();
        const aqiData = data.list[0];
        const aqi = aqiData.main.aqi;
        const components = aqiData.components;
      
        const aqiText = {
          1: 'Bon',
          2: 'Acceptable',
          3: 'Modéré',
          4: 'Mauvais',
          5: 'Très mauvais'
        };
      
        document.getElementById('air-quality-status').innerHTML = `
          <strong>Qualité de l'air :</strong> ${aqiText[aqi]}<br>
          <strong>CO :</strong> ${components.co} μg/m³<br>
          <strong>NO :</strong> ${components.no} μg/m³<br>
          <strong>NO2 :</strong> ${components.no2} μg/m³<br>
          <strong>O3 :</strong> ${components.o3} μg/m³<br>
          <strong>SO2 :</strong> ${components.so2} μg/m³<br>
          <strong>PM2.5 :</strong> ${components.pm2_5} μg/m³<br>
          <strong>PM10 :</strong> ${components.pm10} μg/m³<br>
          <strong>NH3 :</strong> ${components.nh3} μg/m³
        `;
      } catch (error) {
        console.error('Erreur lors de la récupération des données de qualité de l\'air :', error);
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

async function getCovidData() {
    const url = `https://tabular-api.data.gouv.fr/api/resources/2963ccb5-344d-4978-bdd3-08aaf9efe514/data/?semaine__sort=desc&page_size=20`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Erreur réseau lors de la récupération des données Covid.");
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des données Covid :", error);
        return false;
    }
}

async function initialize() {
    const ip = await fetchUserIP();
    if (ip) {
        const geoData = await getGeolocation(ip);
        if (geoData) {
            const city = geoData.city || "Ville inconnue";
            const region = geoData.region || "Région inconnue";
            const country = geoData.country_name || "Pays inconnu";
            const latitude = geoData.latitude || 0;
            const longitude = geoData.longitude || 0;

            document.getElementById("geo-status").innerHTML = `
                <strong>Ville :</strong> ${city}<br>
                <strong>Région :</strong> ${region}<br>
                <strong>Pays :</strong> ${country}<br>
                <strong>Latitude :</strong> ${latitude}<br>
                <strong>Longitude :</strong> ${longitude}
            `;

            // Initialisation de la carte Leaflet
            const map = L.map('map').setView([latitude, longitude], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

            // Marqueur pour la position de l'utilisateur
            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup("Votre position")
                .openPopup();

            // Récupération et affichage des stations de vélos
            const stations = await getInfoVelo();
            stations.forEach(station => {
                const marker = L.marker([station.lat, station.lon]).addTo(map);
                marker.bindPopup(`
                    <strong>${station.name}</strong><br>
                    <strong>Vélos disponibles :</strong> ${station.availableBikes}<br>
                    <strong>Places libres :</strong> ${station.availableDocks}
                `);
            });

            await getAirQuality(latitude, longitude);

            // Récupération et affichage des données météo
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

            // Récupération et affichage des données Covid
            const covidData = await getCovidData();
            if (covidData) {
                const labels = covidData.map(data => data.semaine);
                //On met en majuscule et on enlève les accents
                const cases = covidData.map(data => {
                    //Si la ville est Nancy on donne MAXEVILLE pour avoir les données
                    if (city.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "NANCY") {
                        return data["MAXEVILLE"];
                    }
                    return data[city.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
                });

                const ctx = document.getElementById('covid-chart').getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Ratio SARS-CoV-2 / Azote ammoniacal',
                            data: cases,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            fill: false
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                beginAtZero: true
                            },
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            } else {
                document.getElementById("covid-chart").textContent = "Impossible de récupérer les données Covid.";
            }
        } else {
            document.getElementById("geo-status").textContent = "Impossible de récupérer les données de géolocalisation.";
        }
    } else {
        document.getElementById("geo-status").textContent = "Impossible de récupérer votre adresse IP.";
    }
}

initialize();
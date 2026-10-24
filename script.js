
const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const result = document.getElementById("weatherResult");
const button = form.querySelector("button");

result.hidden = true;

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        return;
    }

    button.disabled = true;
    message.textContent = "Loading weather...";
    result.hidden = true;

    try {
        // Get city coordinates
        const locationResponse = await fetch(
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) + "&count=1&language=en&format=json"
        );

        if (!locationResponse.ok) {
            throw new Error("Could not search for the city.");
        }

        const locationData = await locationResponse.json();

        if (!locationData.results ||
            locationData.results.length === 0) {
            throw new Error("City not found. Try another name.");
        }

        const place = locationData.results[0];
        const latitude = place.latitude;
        const longitude = place.longitude;

        // Get current weather
        const weatherResponse = await fetch(
            "https://api.open-meteo.com/v1/forecast?latitude=" +
            latitude + "&longitude=" + longitude +
            "&current=temperature_2m,relative_humidity_2m," +
            "apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m"
        );

        if (!weatherResponse.ok) {
            throw new Error("Could not get weather data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Convert weather code to a description
        function getCondition(code) {
            if (code === 0) return "Clear sky";
            if ([1, 2, 3].includes(code)) return "Partly cloudy";
            if ([45, 48].includes(code)) return "Foggy";
            if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
            if ([61, 63, 65, 66, 67].includes(code)) return "Rain";
            if ([71, 73, 75, 77].includes(code)) return "Snow";
            if ([80, 81, 82].includes(code)) return "Rain showers";
            if ([85, 86].includes(code)) return "Snow showers";
            if ([95, 96, 99].includes(code)) return "Thunderstorm";
            return "Weather information unavailable";
        }

        document.getElementById("cityName").textContent =
            place.name + (place.country ? ", " + place.country : "");

        document.getElementById("temperature").textContent =
            current.temperature_2m + " °C";

        document.getElementById("condition").textContent =
            getCondition(current.weather_code);

        document.getElementById("humidity").textContent =
            "Humidity: " + current.relative_humidity_2m + "%";

        document.getElementById("wind").textContent =
            "Wind speed: " + current.wind_speed_10m + " km/h";

        message.textContent = "";
        result.hidden = false;

    } catch (error) {
        message.textContent = error.message ||
            "Something went wrong. Please try again.";
    } finally {
        button.disabled = false;
    }
});

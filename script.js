'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

///////////////////////////////////////

function renderCountry(data, neighbour = '') {
  let languages = '';
  for (const language of Object.values(data.languages)) {
    languages += `${language} `;
  }

  let currency = '';
  for (const curr of Object.keys(data.currencies)) {
    currency += `${data.currencies[String(curr)].name}`;
  }

  const html = `<article class="country ${neighbour}">
          <img class="country__img" src="${data.flags.svg}" />
          <div class="country__data">
            <h3 class="country__name">${data.name.common}</h3>
            <h4 class="country__region">${data.region}</h4>
            <p class="country__row"><span>👫</span>${(
              data.population / 1000000
            ).toFixed(1)} millions people</p>
            <p class="country__row"><span>🗣️</span>${languages}</p>
            <p class="country__row"><span>💰</span>${currency}</p>
          </div>
        </article>`;
  countriesContainer.insertAdjacentHTML('beforeend', html);
  btn.style.opacity = 0;
  countriesContainer.style.opacity = 1;
}

function renderError(message) {
  countriesContainer.insertAdjacentHTML('beforeend', message);
  countriesContainer.style.opacity = 1;
}

function getCountryDateNeighbours(name) {
  fetch(`https://restcountries.com/v3.1/name/${name}`)
    .then(response => {
      if (!response.ok)
        throw new Error(`Country not found (${response.status})`);
      else return response.json();
    })
    .then(data => {
      renderCountry(data[0]);
      const firstNeighbour = data?.[0].borders?.[0];

      if (!firstNeighbour) {
        return;
      }
      return fetch(`https://restcountries.com/v3.1/alpha/${firstNeighbour}`);
    })
    .then(response => {
      if (!response.ok)
        throw new Error(`Country not found (${response.status})`);
      else return response.json();
    })
    .then(data => renderCountry(data[0], 'neighbour'))
    .catch(error =>
      renderError(`Something went wrong 💥💥 ${error.message}. Try again!`)
    );
}

function whereiam() {
  return new Promise(function (resolve, reject) {
    const geo = navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude: lat, longitude: lng } = position.coords;
        resolve([lat, lng]);
      },
      error => reject(error)
    );
  });
}

btn.addEventListener('click', function () {
  let lat, lng;
  whereiam()
    .then(position => {
      return fetch(
        `https://geocode.xyz/${position[0]},${position[1]}?geoit=json`
      );
    })
    .then(result => result.json())
    .then(data => {
      countriesContainer.innerHTML = '';
      getCountryDateNeighbours(`${data.country}`.toLowerCase());
    });
});

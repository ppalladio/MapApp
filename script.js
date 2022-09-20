'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class WorkOut{

    date = new Date();
    id  = (Date.now()+'').slice(-10)
constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration= duration;

}


}

class Running extends WorkOut{
    constructor(coords, distance, duration, cadence){
        super(coords,distance, duration)
        this.cadence = cadence;
        this.calcPace()

    }

    calcPace(){
        this.pace = this.duration / this.distance;
    }
}

class Cycling extends WorkOut{
    constructor(coords,distance, duration, elevationGain){
        super(coords,distance, duration)
        this.elevationGain = elevationGain;
        this.calcSpeed()
    }

    calcSpeed(){
        this.speed = this.distance / (this.dutantion/60)
    }
}


// const run1 = new Running([39.-15],5.2,24,178);
// console.log(run1);
class App {
    #map;
    #mapE;
    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
    }

    _getPosition() {
        navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this), //. it is treated as a regular function call, and this keyword is set to undefined, use bind(this) method to point to current object
            function () {
                alert('Geolocation is not available');
            },
        );
    }

    // Handling clicks on map

    _loadMap(position) {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];
        this.#map = L.map('map').setView(coords, 15);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.prg/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(mapEvent) {
        this.#mapE = mapEvent;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputElevation
            .closest('.form__row')
            .classList.toggle('form__row--hidden'); // toggle if visible is set remove it, otherwise add it
        inputCadence
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();
        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
                '';
        const { lat, lng } = this.#mapE.latlng;
        L.marker({ lat, lng })
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: 'running-popup',
                }),
            )
            .setPopupContent('popup')
            .openPopup();
    }
}

const app = new App();

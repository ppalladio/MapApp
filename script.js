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

class WorkOut {
    date = new Date();
    id = (Date.now() + '').slice(-10); //**random id without using third party lib */
    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }
}

class Running extends WorkOut {
    type = 'running';
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration); // direct inherit from parent
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
    }
}

class Cycling extends WorkOut {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }

    calcSpeed() {
        this.speed = this.distance / (this.dutantion / 60);
    }
}

// const run1 = new Running([39.-15],5.2,24,178);
// console.log(run1);
class App {
    //' private field
    #map;
    #mapE;
    workouts = [];
    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField); //. does not need to bind because it doesnt return a function (bind returns a function)
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

        L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
            {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20,
            },
        ).addTo(this.#map);

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
        //. chekcing function
        const validInput = (...inputs) => {
            inputs.every((inp) => Number.isFinite(inp));
        };

        const positiveCheck = (...inputs) => {
            inputs.every((el) => el > 0);
        };

        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapE.latlng;
        let workout;

        //' running
        if (type === 'running') {
            const cadence = +inputCadence.value;
            console.log(validInput(distance, duration, cadence) === true);
            if (!validInput(distance, duration, cadence)||
            !positiveCheck(distance, duration, cadence))
                return (
                    alert('Please enter a positive number') 
                );
            workout = new Running([lat, lng], distance, duration, cadence);
        }

        //' cycling
        if (type === 'cycling') {
            const elevation = +inputElevation.value;
            if (
                !validInput(distance, duration, elevation) ||
                !positiveCheck(distance, duration)
            ) {
                return alert('Please enter a positive number');
                workout = new Running(
                    [lat, lng],
                    distance,
                    duration,
                    elevation,
                );
            }
        }
        this.workouts.push(workout);

        this._renderWorkoutMarker(workout);
        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
                '';
    }


    _renderWorkoutMarker(workout) {
        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                }),
            )
            .setPopupContent('workout.distance')
            .openPopup();
    }

    _renderWorkout(){
        
    }
}

const app = new App();

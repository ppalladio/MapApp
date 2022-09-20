'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//~* workout parent class
class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10); //**random id without using third party lib */
    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }

    //'description method, display dates

    _setDescription() {
        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(
            1,
        )} on ${months[this.date.getMonth()]}${this.date.getDate()}`;
    }
}

//> child classes Running and Cycling
class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration); // direct inherit from parent
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
    }
}

//> Cycling
class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        this.speed = this.distance / (this.dutantion / 60);
    }
}

// const run1 = new Running([39.-15],5.2,24,178);
// console.log(run1);
//~* main class
class App {
    //' private field
    #map;
    #mapE;
    workouts = [];

    constructor() {
        // get user position
        this._getPosition();
        // get data from localStorage
        this._getData();

        //. event listener use this.function , bind if function is included in the eventlistener
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField); //. does not need to bind because it doesnt return a function (bind returns a function)
        containerWorkouts.addEventListener('click', this._moveToPin.bind(this));
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
        this.#map = L.map('map').setView(coords, 15); //. the second parameter decides the zoom in level, the higher the more zoomed in

        L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
            {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20,
            },
        ).addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this)); // . clickevent in leaflet

        //. only render the marker when the map is fully shown
        this.workouts.forEach((workout) => {
            this._renderWorkout(workout);
        });
    }

    //> when click on the map, remove the hidden class and show form
    _showForm(mapEvent) {
        this.#mapE = mapEvent;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    //> after the data has been inputed, hide the form, but since the style has a transition effect, so set the display to none and wait for transition timer to pass.
    _hideForm() {
        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
                '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => {
            form.style.display = 'grid';
            1000;
        });
    }

    //> toggle field function
    _toggleElevationField() {
        inputElevation
            .closest('.form__row') //. select the siblings if found. if not. one level above.
            .classList.toggle('form__row--hidden'); //. toggle if visible is set remove it, otherwise add it
        inputCadence
            .closest('.form__row')
            .classList.toggle('form__row--hidden');
    }

    //> register new workout event
    _newWorkout(e) {
        e.preventDefault();

        //. validating functions
        const validInput = (...inputs) => {
            return inputs.every((el) => Number.isFinite(el));
        };

        const positiveCheck = (...inputs) => {
            return inputs.every((el) => el > 0);
        }; //

        //. define variables
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapE.latlng;
        let workout;

        //' running event
        if (type === 'running') {
            const cadence = +inputCadence.value;
            if (
                !validInput(distance, duration, cadence) ||
                !positiveCheck(distance, duration, cadence)
            )
                return alert('Please enter a positive number');
            workout = new Running([lat, lng], distance, duration, cadence);
        }

        //' cycling event
        if (type === 'cycling') {
            const elevation = +inputElevation.value;
            if (
                !validInput(distance, duration, elevation) ||
                !positiveCheck(distance, duration)
            )
                return alert('Please enter a positive number');
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }
        console.log(workout);
        this.workouts.push(workout);
        this._renderWorkoutMarker(workout);
        this._renderWorkout(workout);
        this._hideForm();
        this._localStorage();
    }

    //> mark the map with pin
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
            .setPopupContent(
                `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${
                    workout.description
                }`,
            )
            .openPopup();
    }

    //> log the event to the list, add to html
    _renderWorkout(workout) {
        let html = `<li class="workout workout--${workout.type}" data-id="${
            workout.id
        }">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`;

        if (workout.type === 'running') {
            html += `  <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
        }

        if (workout.type === 'cycling') {
            `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
        }
        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPin(e) {
        const workoutEl = e.target.closest('.workout');
        if (!workoutEl) return;

        const workout = this.workouts.find(
            (el) => el.id === workoutEl.dataset.id,
        );

        this.#map.setView(workout.coords, 13, {
            animate: true,
            pan: {
                duration: 1,
            },
        });
    }

    //> store data locally
    _localStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.workouts));
    }

    //> get stored data from local storage
    _getData() {
        const data = JSON.parse(localStorage.getItem('workouts')); //! when convert back from local storage, all the predefined methods will be lost. This is no longer a self defined class
        if (!data) return;
        this.workouts = data;
        this.workouts.forEach((workout) => {
            this._renderWorkout(workout);
        });
    }

    reset() {
        localStorage.removeItem('workouts');
        location.reload();
    }
}

const app = new App();

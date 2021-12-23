$(function () {
    // noCanvas();
    // const video = createCapture(VIDEO);
    // video.size(320, 240);

    const btn_fetch_car = document.getElementById('btn');
    // const btn_status = document.getElementById('btn-status');
    //btn.addEventListener('click', sendData);
    btn_fetch_car.addEventListener('click', sendData2);
    // btn_status.addEventListener('click', resetData);

    let name = 'Nokta';
    let section = 'Üst Kısım';
    let index = 1;
    let image64;

    async function sendData2() {
        // Image section
        // video.loadPixels(); // take that video element and load the pixels on canvas
        // image64 = video.canvas.toDataURL(); // record canvas pixels to a variable.

        // Sending data         
        const data = { "name": name, "section": section, "index": index };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // This data should be specified with header
        };
        const response = await fetch('/arabaCagrisi', options);
        const json = await response.json();
        console.log(json);
    }

    async function sendData() {

        // Sending data 
        const data = { "name": name, "index": index };
        //const data = { lat, lon };
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // This data should be specified with header
        };

        // Image section
        // video.loadPixels(); // take that video element and load the pixels on canvas
        // image64 = video.canvas.toDataURL(); // record canvas pixels to a variable.
        //image64 = 'https://drive.google.com/file/d/1UU7oAA7v8VUJoIPEgF-K5__uvXXgoHnm/view?usp=sharing';

        // Recieve a response
        //const response = await fetch('/api', options);
        const api_url = `/car/${name},${index},${image64}`;
        //const api_url = '/api';
        const response = await fetch(api_url);
        const json = await response.json();
        console.log(json); // Getting response from server after sending data successfully.

        console.log(data);
    }

    async function resetData() {
        const api_url = `/callCar/${name},${index}`;
        //const api_url = '/api';
        const response = await fetch(api_url);
        const json = await response.json();
        console.log(json); // Getting response from server after sending data successfully.
    }

    //getData();

    async function getData() {
        //const response = await fetch('/url');
        const response = await fetch('http://localhost:3000/services/nokta/1/c4ca4238a0b923820dcc509a6f75849b.json');
        const data = await response.json();

        /*
        for (item of data) {
            const root = document.createElement('p');
            const mood = document.createElement('div');
            const geo = document.createElement('div');
            const date = document.createElement('div');

            mood.textContent = `mood: ${item.mood}`;
            geo.textContent = `${item.lat}° , ${item.lon}°`;
            const dateString = new Date(item.timestamp).toLocaleString();
            date.textContent = dateString;

            root.append(mood, geo, date);
            document.body.append(root);
        }
        */
        console.log(data);
    }
});
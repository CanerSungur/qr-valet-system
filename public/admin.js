$(function () {
    const download_data = document.getElementById('download-data');
    download_data.addEventListener('click', downloadData);
    const delete_data = document.getElementById('delete-data');
    delete_data.addEventListener('click', deleteData);
    const save_car_count = document.getElementById('save-car-count');
    save_car_count.addEventListener('click', saveCarCount);

    async function saveCarCount() {
        const response = await fetch('/savecarcount');
        const json = await response.json();
        console.log(json);
    }

    async function deleteData() {
        const response = await fetch('/deletefiles');
        const json = await response.json();
        console.log(json);
    }

    async function downloadData() {
        // const api_url = '/download/C:/';

        const response = await fetch('/download');
        // download(response);
        // const json = await response.json();
        // console.log(json);
    }
    // let lat, lon;
    // if ('geolocation' in navigator) {
    //     console.log('geolocation available');
    //     navigator.geolocation.getCurrentPosition(async position => {
    //         lat = position.coords.latitude;
    //         lon = position.coords.longitude;

    //         document.getElementById('latitude').textContent = lat.toFixed(2);
    //         document.getElementById('longitude').textContent = lon.toFixed(2);
    //     });
    // } else {
    //     console.log('geolocation unavailable');
    // }

    // const btn = document.getElementById('btn');
    // btn.addEventListener('click', sendData);

    // async function sendData() {
    //     // Sending data 
    //     const data = { lat, lon };
    //     const options = {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(data) // This data should be specified with header
    //     };

    //     // Recieve a response
    //     const response = await fetch('/api', options);
    //     const json = await response.json();
    //     console.log(json); // Getting response from server after sending data successfully.
    // }
});
$(function () {
    const btn_fetch_car = document.getElementById('btn-fetch-car');
    btn_fetch_car.addEventListener('click', sendData2);

    let name = 'Nokta';
    let section = 'Üst Kısım';
    let index = 6;
    let image64;

    async function sendData2() {
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
});
import express, { request, response } from 'express';
import DataStore from 'nedb';
import editJsonFile from 'edit-json-file';
import bodyParser from 'body-parser';
import fs from 'fs';
import { zip } from 'zip-a-folder';

const app = express(); // create the app
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening server at ${port}`)); // listen to the server which we've created
app.use(express.static('public')); // make a folder called 'public' is public

// We expand sent data size here
app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true
}));
app.use(express.json({ limit: '1mb' }));

// Init main database
const database = new DataStore('data/database.db');
database.loadDatabase();

// Car count related db and variables
const noktaUstCarCountDatabase = new DataStore('data/Nokta/Ust/carCount.db');
noktaUstCarCountDatabase.loadDatabase();
let noktaDailyTakenCarCount = 0;
let noktaDailyGivenCarCount = 0;

//#region File Download

// We zip images first, send images.zip and db text files. Then delete them all.

let zipIsSuccessfull = false;
async function zipData() {
    if (fs.existsSync('data')) {
        await zip('data', 'data.zip');
        zipIsSuccessfull = true;
    } else {
        console.log('No data to be zipped!');
        zipIsSuccessfull = false;
    }
}

let filesHaveBeenDownloaded = false;
app.get('/download', async function (req, res) {
    await zipData(); // wait for the folder to be zipped

    if (zipIsSuccessfull) {
        const file = 'data.zip';
        res.download(file); // Set disposition and send it.
        filesHaveBeenDownloaded = true;
        console.log('Downloaded successfully.');
    } else console.log('There is no zip file to send!');
});

app.get('/deletefiles', async function (req, res) {
    if (filesHaveBeenDownloaded) {

        fs.rm("data",
            { recursive: true, force: true }, (err) => {

                if (err) {
                    return console.log("error occurred in deleting directory", err);
                } else {
                    fs.unlink('data.zip', (err) => {
                        if (err) return console.log(err);
                        else {
                            // Deletion is successfull.
                            console.log("Directory deleted successfully");
                            filesHaveBeenDownloaded = false;
                            res.json({ "message": 'Files are deleted successfully!' });

                            // Make a new database.db file
                            database.loadDatabase();
                            noktaUstCarCountDatabase.loadDatabase();
                        }
                    });
                }
            });
    } else {
        res.json({ "message": 'Download files first!' });
    }
});

//#endregion

//#region APIs

app.post('/arabaAlmak', async (request, response) => {
    const data = request.body;
    // const timestamp = Date.now();
    // data.timestamp = timestamp;

    const base64 = data.image;
    // Convert base64 to buffer => <Buffer ff d8 ff db 00 43 00 ...
    const buffer = Buffer.from(base64, "base64");
    // Pipes an image with "new-path.jpg" as the name.
    // currentName = data.name;
    // currentSection = data.section;
    // currentIndex = data.index;
    // currentDateTime = data.datetime;
    const imagePath = `data/${data.name}/${data.section}/`;
    await checkFolderPathExistance(imagePath);

    const savedImagePath = `${imagePath}${data.datetime}_PARK-${data.index}.jpg`;
    fs.writeFileSync(savedImagePath, buffer);

    //"RESİM": data.image

    database.insert({
        "TYPE": data.type,
        "AVM": data.name,
        "BÖLÜM": data.section,
        "PARK NO": data.index,
        "TESLİM ALAN": data.personel,
        "TARİH": data.datetime,
        "RESİM": savedImagePath
    });

    response.json({
        "TYPE": data.type,
        "AVM": data.name,
        "BÖLÜM": data.section,
        "PARK NO": data.index,
        "TESLİM ALAN": data.personel,
        "TARİH": data.datetime,
        "RESİM": savedImagePath
    });

    if (data.name == "Nokta" && data.section == "Ust") {
        changeParkSpaceStatus(noktaUstJSON[data.index], "full");
        const count = noktaDailyTakenCarCount + 1;
        updateTakenCarCount(count);
    } else {
        console.log("Böyle bir AVM yok!");
    }
});

app.post('/arabaVermek', async (request, response) => {
    const data = request.body;
    database.insert({
        "TYPE": data.type,
        "AVM": data.name,
        "BÖLÜM": data.section,
        "PARK NO": data.index,
        "TESLİM EDEN": data.personel,
        "TARİH": data.datetime,
    });

    response.json({
        "TYPE": data.type,
        "AVM": data.name,
        "BÖLÜM": data.section,
        "PARK NO": data.index,
        "TESLİM EDEN": data.personel,
        "TARİH": data.datetime,
    });

    if (data.name == "Nokta" && data.section == "Ust") {
        changeCallingCarStatus(noktaUstJSON[data.index], "false");
        changeParkSpaceStatus(noktaUstJSON[data.index], "empty");
        const count = noktaDailyGivenCarCount + 1;
        updateGivenCarCount(count);
    } else {
        console.log("Böyle bir AVM yok!");
    }
});

app.post('/arabaCagrisi', async (request, response) => {
    const data = request.body;

    if (data.name == "Nokta" && data.section == "Üst Kısım") { // this data comes from calling web page. Not from app.
        changeCallingCarStatus(noktaUstJSON[data.index], "true");
    } else {
        console.log('Böyle bir AVM yok!');
    }

    response.json(data);
});

//#endregion

//#region Data Path Variables

let noktaUstJSON = [
    '0',
    'https://the-vale-group.herokuapp.com/services/nokta-ust/1/c4ca4238a0b923820dcc509a6f75849b.json',//1
    'https://the-vale-group.herokuapp.com/services/nokta-ust/2/c81e728d9d4c2f636f067f89cc14862c.json',//2
    'https://the-vale-group.herokuapp.com/services/nokta-ust/3/eccbc87e4b5ce2fe28308fd9f2a7baf3.json',//3
    'https://the-vale-group.herokuapp.com/services/nokta-ust/4/a87ff679a2f3e71d9181a67b7542122c.json',//4
    'https://the-vale-group.herokuapp.com/services/nokta-ust/5/e4da3b7fbbce2345d7772b0674a318d5.json',//5
    'https://the-vale-group.herokuapp.com/services/nokta-ust/6/1679091c5a880faf6fb5e6087eb1b2dc.json',//6
    'https://the-vale-group.herokuapp.com/services/nokta-ust/7/8f14e45fceea167a5a36dedd4bea2543.json',//7
    'https://the-vale-group.herokuapp.com/services/nokta-ust/8/c9f0f895fb98ab9159f51fd0297e236d.json',//8
    'https://the-vale-group.herokuapp.com/services/nokta-ust/9/45c48cce2e2d7fbdea1afc51c7c6ad26.json',//9
    'https://the-vale-group.herokuapp.com/services/nokta-ust/10/d3d9446802a44259755d38e6d163e820.json',//10
]

//#endregion

//#region Functions

let url_start = 'https://the-vale-group.herokuapp.com/services/';
function checkFolderPathExistance(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
}

function changeCallingCarStatus(jsonPath, status) {
    let file = editJsonFile(jsonPath);
    let currentStatus = file.get("status");

    if (currentStatus == "full") {
        file.set("carIsCalled", status);
        file.save();
    } else {
        console.log("Park yeri zaten boş!");
    }
}

function changeParkSpaceStatus(jsonPath, status) {
    let file = editJsonFile(jsonPath);
    file.set("status", status);
    file.save();
}

function updateTakenCarCount(count) {
    let file = editJsonFile('https://the-vale-group.herokuapp.com/services/nokta-ust/noktaUstCarCount.json');
    file.set("taken_car_count", count);
    file.save();
}

function updateGivenCarCount(count) {
    let file = editJsonFile('https://the-vale-group.herokuapp.com/services/nokta-ust/noktaUstCarCount.json');
    file.set("given_car_count", count);
    file.save();
}

//#endregion
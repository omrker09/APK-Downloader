import axios from "axios";
import fs from "fs"
import path from "path";
import { v4 as uuidv4   } from 'uuid';
import gplay from "google-play-scraper";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageName = "com.ansangha.drdriving";

async function download() {
  const url = `http://d.apkpure.com/b/APK/${packageName}?version=latest`;
  const location = path.resolve(__dirname,"files",`${packageName}-${uuidv4()}.apk`);
  console.log("proccesing..");
  const response = await axios({
    url: url,
    method: "get",
    responseType: "stream",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  console.log("Downloading..");

  response.data.pipe(fs.createWriteStream(location));

  return new Promise((resolve, reject) => {
    response.data.on("end", () => {
      resolve(location);
    });

    response.data.on("error", (err) => {
      reject(err);
    });
  });
}

download()
  .then((location) => {
    console.log(`Download finished at: ${location}`);
    gplay
      .app({ appId: packageName })
      .then(console.log, console.log);
  })
  .catch((err) => {
    console.error("Error occurred during download:", err);
  });

import axios from "axios";
import fs from "fs";
import fsp from "fs/promises";
import gplay from "google-play-scraper";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const __filepath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filepath);

const directory = path.resolve(__dirname, "files");
const packageName = "com.ansangha.drdriving";

async function Download() {
  const url = process.env.BASE_URL + `${packageName}?version=latest`;
  console.log("processing ...");

  try {
    const apkName = await gplay.app({ appId: packageName });
    const location = path.join(directory, `${apkName.title}.apk`);
    await fsp.mkdir(directory, { recursive: true });

    const check = await fsp
      .access(location)
      .then(() => true)
      .catch(() => false);
    if (check) {
      console.log(`APK File is Exsist at : ${location}`);
      return;
    }

    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const writer = fs.createWriteStream(location);
    response.data.pipe(writer);
    console.log("downloading..");

    return new Promise((resolve, reject) => {
      writer.on("end", () => {
        resolve(location);
      });
      writer.on("error", () => {
        reject(location);
      });
      writer.on("finish", () => {
        console.log(`APK File has been installed at : ${location}`);
        resolve(location);
      });
    });
  } catch (err) {
    console.error(err);
    return;
  }
}

Download();

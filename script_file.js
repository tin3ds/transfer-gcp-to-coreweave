const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("node:fs/promises");

const fileBatch = require("./all-imerza-file.json");

const gcsBucket = "gs://e3ds-master.appspot.com";
const s3Endpoint = "https://object.ord1.coreweave.com";
const s3Bucket = "s3://e3ds-streaming-app";

async function runScript() {
  for (const file of fileBatch) {
    if (file.endsWith(".zip")) {
      try {
        console.log(`Processing ${file}`);

        const dirName = file.split("/")[1];
        try {
          await exec(`mkdir ${dirName}`)
        }catch{
        }

        const cmdInfo = `gsutil du -s -ch gs://e3ds-master.appspot.com/${file}`;
        const { stdout: infostdout, stderr: infostderr } = await exec(cmdInfo);
        console.log("cmdDownload", infostdout, infostderr);
        const cmdDownload = `gsutil -m cp -r ${gcsBucket}/${file} ./${dirName}/`;
        const { stdout, stderr } = await exec(cmdDownload);
        console.log("cmdDownload", stdout, stderr);
        let cmdUpload = `aws s3 --endpoint=${s3Endpoint} cp ./${dirName}/${file} ${s3Bucket}/${file}`;
        if (file.includes("/")) {
          const fileNames = file.split("/");
          const fileName = fileNames[fileNames.length - 1];
          cmdUpload = `aws s3 --endpoint=${s3Endpoint} cp ./${dirName}/${fileName} ${s3Bucket}/${file}`;

          const { stdout: uploadStout, stderr: uploadStderr } = await exec(
            cmdUpload
          );
          console.log("cmdUpload", uploadStout, uploadStderr);
          const cmdRemove = `rm -rf ${dirName}`;
          await exec(cmdRemove);
        } else {
          const { stdout: uploadStout, stderr: uploadStderr } = await exec(
            cmdUpload
          );
          console.log("cmdUpload", uploadStout, uploadStderr);
          const cmdRemove = `rm -rf ${dirName}`;
          await exec(cmdRemove);
        }

        await fs.appendFile("./done-files.txt", `${file} \n`);
        console.log(`Done ${file}`);
        console.log("=================================");
      } catch (err) {
        await fs.appendFile(
          "./errors-files.txt",
          `error: ${file} ${err.message}\n`
        );
      }
    }
  }
}

runScript();

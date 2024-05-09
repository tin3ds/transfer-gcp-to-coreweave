const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("node:fs/promises");

const batch = require("./batch-5.json");

const gcsBucket = "gs://e3ds-master.appspot.com";
const s3Endpoint = "https://object.ord1.coreweave.com";
const s3Bucket = "s3://e3ds-streaming-app";

async function runScript() {
  for (const folder of batch) {
    try {
      console.log(`Processing ${folder}`);
      const cmdGetChildFolder = `gsutil ls ${gcsBucket}/${folder}`;
      const { stdout: chilFoldersstdout } = await exec(cmdGetChildFolder);

      const childFolders = chilFoldersstdout.split('\n');
      childFolders.pop();

      try {
        await exec(`mkdir ${folder}`)
      } catch (err) {
      }

      for (const childFolder of childFolders) {
        try {
          const cmdInfo = `gsutil du -s -ch ${childFolder}`;
          const { stdout: infostdout, stderr: infostderr } = await exec(cmdInfo);
          console.log("cmdInfo", infostdout, infostderr);
          const slitNames = childFolder.split('/');

          if (slitNames.length === 6 && !infostdout.startsWith('0 B')) {
            slitNames.pop();
            const childFolderName = slitNames[slitNames.length - 1];

            const cmdDownload = `gsutil -m cp -r ${childFolder} ./${folder}/`;
            const { stdout, stderr } = await exec(cmdDownload);
            console.log("cmdDownload", stdout, stderr);

            const cmdUpload = `aws s3 --endpoint=${s3Endpoint} cp --recursive ./${folder}/${childFolderName}/ ${s3Bucket}/${folder}/${childFolderName}/`;
            const { stdout: uploadStout, stderr: uploadStderr } = await exec(cmdUpload, { maxBuffer: 1024 * 4000 });
            console.log("cmdUpload", uploadStout, uploadStderr);

            const childRemove = `rm -rf ./${folder}/${childFolderName}`;
            await exec(childRemove);

            await fs.appendFile("./done-app-names.txt", `${folder}/${childFolderName} \n`);
            console.log(`Done ${folder}/${childFolderName}`);
          } else {
            if (infostdout.startsWith('0 B')) {
              throw new Error('0 B folder');
            } else {
              throw new Error('Is valid not folder');
            }
          }
        } catch (error) {
          await fs.appendFile('./errors.txt', `APP error: ${childFolder} ${error.message}\n`);
        }
      }

      let cmdRemove = `rm -rf ${folder}`;
      if (folder.includes('/')) {
        const firstfolder = folder.split('/')[0];
        cmdRemove = `rm -rf ${firstfolder}`;
      }
      await exec(cmdRemove);
      await fs.appendFile("./done.txt", `${folder} \n`);
      console.log(`Done ${folder}`);
      console.log("=================================");
    } catch (error) {
      await fs.appendFile('./errors.txt', `USER error: ${folder} ${error.message}\n`);
    }
  }
}

runScript();

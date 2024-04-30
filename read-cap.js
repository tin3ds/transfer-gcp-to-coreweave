const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require("node:fs/promises");

const folders = require('./full-folders');
const gcsBucket = 'gs://e3ds-master.appspot.com';

async function runScript() {
  const result = [];
  let count = folders.length;
  for (const folder of folders) {
    console.log('Left: ', count);
    try {
      const cmdInfo = `gsutil du -s ${gcsBucket}/${folder}`;
      const { stdout: infostdout } = await exec(cmdInfo);
      const infoArr = infostdout.split(' ');
      result.push([folder, infoArr[0]]);
    } catch (err) {
      await fs.appendFile('./cap-errors.txt', `error: ${folder} ${err.message}\n`);
    }
    count -= 1;
  }

  const sorted = result.sort((a, b) => {
    const bigA = BigInt(a[1]);
    const bigB = BigInt(b[1]);
    if(bigA > bigB) {
      return 1;
    } else if (bigA < bigB){
      return -1;
    } else {
      return 0;
    }
  });

  await fs.writeFile('./cap.json', JSON.stringify(sorted));
}

runScript();

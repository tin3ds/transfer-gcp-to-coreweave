const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require("node:fs/promises");

const folders = require('./cap.json');

async function runScript() {
  const completed = [];
  const inCompleted = [];
  let count = folders.length;
  let totalSizeInCompleted = BigInt(0);
  for (const folder of folders) {
    try {
      const s3InfoCmd = `aws s3 --endpoint=https://object.ord1.coreweave.com ls --summarize --recursive s3://e3ds-streaming-app/${folder[0]}/`
      const { stdout: s3Infostdout } = await exec(s3InfoCmd);

      const splited = s3Infostdout.split('\n');
      const temp = splited[splited.length - 2].split(': ');

      if (BigInt(temp[1]) === BigInt(folder[1])) {
        completed.push(folder[0]);
      } else {
        inCompleted.push(folder[0]);
        totalSizeInCompleted += BigInt(folder[1]);
      }
      console.log('COMPLETED')
      console.log(completed);

      console.log('==============================================');
      console.log('INCOMPLETED')
      console.log(inCompleted);
    } catch (err) {
      // console.log(err);
      inCompleted.push(folder[0]);
      console.log('COMPLETED')
      console.log(completed);

      console.log('==============================================');
      console.log('INCOMPLETED')
      console.log(inCompleted);
      totalSizeInCompleted += BigInt(folder[1]);
    }

    count -= 1;
    console.log('LEFT: ', count);
    console.log('Total Incompleted Size: ', totalSizeInCompleted);
  }

  console.log('COMPLETED')
  console.log(completed);

  console.log('==============================================');
  console.log('INCOMPLETED')
  console.log(inCompleted);
}

runScript();

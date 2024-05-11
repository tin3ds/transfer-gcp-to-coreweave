const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require("node:fs/promises");

const folders = require('./batch-imerza-child.json');

async function runScript() {
  const completed = [];
  const incompleted = [];
  let count = folders.length;

  for (const folder of folders) {
    try {
      const gsInfoCmd = `gsutil du -s gs://e3ds-master.appspot.com/${folder}`;
      const { stdout: gsInfostdout } = await exec(gsInfoCmd, { maxBuffer: 1024 * 2000 });

      const s3InfoCmd = `aws s3 --endpoint=https://object.ord1.coreweave.com ls --summarize --recursive s3://e3ds-streaming-app/${folder}/`
      const { stdout: s3Infostdout } = await exec(s3InfoCmd);

      const infoArr = gsInfostdout.split(' ');

      const splited = s3Infostdout.split('\n');
      const temp = splited[splited.length - 2].split(': ');

      if (BigInt(infoArr[0]) === BigInt(temp[1])) {
        completed.push(folder);
      } else {
        incompleted.push(folder);
      }

      console.log('???????', incompleted);
    } catch (error) {
      if (JSON.stringify(error).includes('Total Size: 0')) {
        incompleted.push(folder)
      }
      console.error(JSON.stringify(error));
    }

    count -= 1;
    console.log('Left: ', count)
  }

  const result = {
    completed,
    incompleted,
  }

  await fs.writeFile("./imerza-result.json", JSON.stringify(result));
}

runScript();

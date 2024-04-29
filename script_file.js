const util = require('util');
const exec = util.promisify(require('child_process').exec);

const fileBatch = require('./fileBatch');

const gcsBucket = 'gs://e3ds-master.appspot.com';
const s3Endpoint = 'https://object.ord1.coreweave.com';
const s3Bucket = 's3://demo-gcp-coreweave';

async function runScript() {
  for (const file of fileBatch) {
    console.log(`Processing ${file}`)
    const cmdInfo = `gsutil du -s -ch gs://e3ds-master.appspot.com/${file}`;
    const { stdout: infostdout, stderr: infostderr } = await exec(cmdInfo);
    console.log('cmdDownload', infostdout, infostderr);
    const cmdDownload = `gsutil -m cp -r ${gcsBucket}/${file} ./`;
    const { stdout, stderr } = await exec(cmdDownload);
    console.log('cmdDownload', stdout, stderr);
    let cmdUpload = `aws s3 --endpoint=${s3Endpoint} cp ./${file} ${s3Bucket}/${file}`;
    if (file.includes('/')) {
      const fileNames = file.split('/');
      const fileName = fileNames[fileNames.length - 1];
      cmdUpload = `aws s3 --endpoint=${s3Endpoint} cp ./${fileName} ${s3Bucket}/${file}`;
    }
    const { stdout: uploadStout, stderr: uploadStderr } = await exec(cmdUpload);
    console.log('cmdUpload', uploadStout, uploadStderr);
    const cmdRemove = `rm -rf ${file}`;
    await exec(cmdRemove);
    console.log(`Done ${file}`);
    console.log('=================================');
  }
}

runScript();

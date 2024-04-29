const util = require('util');
const exec = util.promisify(require('child_process').exec);

const batch = require('./batch1');

const gcsBucket = 'gs://e3ds-master.appspot.com';
const s3Endpoint = 'https://object.ord1.coreweave.com';
const s3Bucket = 's3://demo-gcp-coreweave';

async function runScript() {
  for (const folder of batch) {
    console.log(`Processing ${folder}`)
    const cmdInfo = `gsutil du -s -ch gs://e3ds-master.appspot.com/${folder}`;
    const { stdout: infostdout, stderr: infostderr } = await exec(cmdInfo);
    console.log('cmdDownload', infostdout, infostderr);
    const cmdDownload = `gsutil -m cp -r ${gcsBucket}/${folder} ./`;
    const { stdout, stderr } = await exec(cmdDownload);
    console.log('cmdDownload', stdout, stderr);
    const cmdUpload = `aws s3 --endpoint=${s3Endpoint} cp --recursive ./${folder}/ ${s3Bucket}/${folder}/`;
    const { stdout: uploadStout, stderr: uploadStderr } = await exec(cmdUpload);
    console.log('cmdUpload', uploadStout, uploadStderr);
    const cmdRemove = `rm -rf ${folder}`;
    await exec(cmdRemove);
    console.log(`Done ${folder}`);
    console.log('=================================');
  }
}

runScript();

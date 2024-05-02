const fs = require("node:fs/promises");
const capArr = require('./cap.json');

async function runScript() {
  let bathCount = 1;
  let totalSize = BigInt(0);
  let maxSize = BigInt(1400000000000); // 1 TB
  let bathResult = [];

  const cloneCapArr = capArr;
  const imerzaItem = cloneCapArr.pop();
  const demoItem = cloneCapArr.pop();

  await fs.writeFile(`./batch-specicial.json`, JSON.stringify(
    [
      demoItem,
      imerzaItem
    ]
  ));

  for (const item of cloneCapArr) {
    const itemSize = BigInt(item[1]);

    if (itemSize > 0) {
      totalSize = BigInt(totalSize) + BigInt(itemSize);

      if (totalSize < maxSize) {
        bathResult.push(item)
      } else {

        bathResult = [['total', totalSize.toString()], ...bathResult]

        await fs.writeFile(`./batch-${bathCount}.json`, JSON.stringify(bathResult));

        bathCount += 1;
        bathResult = [];
        totalSize = 0;
        bathResult.push(item);
      }
    }
  }

  bathResult = [['total', totalSize.toString()], ...bathResult]
  await fs.writeFile(`./batch-${bathCount}.json`, JSON.stringify(bathResult));
}

runScript();

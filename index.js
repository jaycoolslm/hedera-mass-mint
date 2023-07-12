const { Worker } = require("worker_threads");
const path = require("path");

function runWorker(arrayOfStrings) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "lib/worker.js"));
    worker.postMessage(arrayOfStrings);
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

async function massMintWithThreads(number, i, numThreads) {
  const arrayOfStrings = createMetadataUrls(number, i);
  console.log("array of strings", arrayOfStrings);
  const segmentSize = Math.ceil(arrayOfStrings.length / numThreads);
  const arrayOfSegments = [];

  for (let i = 0; i < arrayOfStrings.length; i += segmentSize) {
    arrayOfSegments.push(arrayOfStrings.slice(i, i + segmentSize));
  }
  console.log("array of segments", arrayOfSegments);

  const promises = arrayOfSegments.map((segment) => runWorker(segment));
  const results = await Promise.all(promises);

  return results.flat();
}

// how many should we mint
const batch = 40;

function createMetadataUrls(number, i) {
  //if starting index = 1, then it starts the mint at 2.
  const startingIndex = 0 + i * batch;
  const endingIndex = startingIndex + batch;

  const metadataUrls = [];

  for (let i = startingIndex; i < endingIndex; i++) {
    const url = `/${number}/${i + 1}.json`;
    metadataUrls.push(url);
  }

  return metadataUrls;
}

module.exports = massMintWithThreads;

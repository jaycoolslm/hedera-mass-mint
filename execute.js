const massMintWithThreads = require("./index");

const number = 0;
const numThreads = 4;
const batches = 1; // specify how many batches of 10 to mint

execute(batches)
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

async function execute(iterations) {
  for (let i = 0; i < iterations; i++) {
    await massMintWithThreads(
      Number(process.argv.slice(1)[2]) || number,
      i,
      numThreads
    )
      .then((results) => {
        console.log("All NFTs minted:", results);
        let successCount = 0;
        let failCount = 0;
        results.forEach((obj) => {
          if (obj && obj._code === 22) {
            successCount++;
          } else {
            failCount++;
          }
        });
        console.log("Number of successes: ", successCount);
        console.log("Number of failures: ", failCount);
      })
      .catch((error) => {
        console.error("Error during mass minting:", error);
      });
  }
}

const { parentPort } = require("worker_threads");
const {
  TokenMintTransaction,
  Client,
  AccountId,
  PrivateKey,
} = require("@hashgraph/sdk");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

const accountId = AccountId.fromString(process.env.ID_1);
const privateKey = PrivateKey.fromString(process.env.KEY_1);
const network = process.env.NETWORK;
let client;
if (network === "testnet") {
  client = Client.forTestnet().setOperator(
    process.env.CLIENT_ID,
    process.env.CLIENT_KEY
  );
} else if (network === "mainnet") {
  client = Client.forMainnet().setOperator(
    process.env.CLIENT_ID,
    process.env.CLIENT_KEY
  );
}
const tokenId = process.env.NFT_ID;

function segmentArray(array) {
  const segmentedArray = [];
  let currentSegment = [];

  for (let i = 0; i < array.length; i++) {
    currentSegment.push(array[i]);

    if (currentSegment.length === 10) {
      segmentedArray.push(currentSegment);
      currentSegment = [];
    }
  }

  if (currentSegment.length > 0) {
    segmentedArray.push(currentSegment);
  }

  return segmentedArray;
}

function writeFileToBacklog(segment, metadataUrls) {
  const firstFile = segment[0]
    .substring(1)
    .replace(".json", "")
    .replace("/", "-");
  const lastFile = segment[segment.length - 1]
    .substring(1)
    .replace(".json", "")
    .replace("/", "-");
  const fileName = `${firstFile}--${lastFile}.json`;
  fs.writeFile(
    `${__dirname}/../backlog/${fileName}`,
    JSON.stringify(metadataUrls),
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
      } else {
        //
      }
    }
  );
}

async function massMintNFTs(arrayOfStrings) {
  const segmentedArray = segmentArray(arrayOfStrings);

  async function mintSegment(segment) {
    const metadataUrlBase = process.env.BASE_URL;
    const metadataUrls = segment.map((str) => metadataUrlBase + str);
    const transaction = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata(metadataUrls.map((url) => Buffer.from(url)))
      .freezeWith(client)
      .sign(privateKey);

    // Set other required parameters and sign the transaction here
    let status;
    try {
      const result = await transaction.execute(client);
      const rx = await result.getReceipt(client);

      status = rx.status;
      if (status._code !== 22) {
        writeFileToBacklog(segment, metadataUrls);
      }
      return status;
      return result;
    } catch (e) {
      console.error(e);
      writeFileToBacklog(segment, metadataUrls);
      return status;
    }
  }
  const promises = segmentedArray.map((segment) => mintSegment(segment));
  const results = await Promise.all(promises);
  return results;
}

if (parentPort) {
  parentPort.on("message", async (arrayOfStrings) => {
    const results = await massMintNFTs(arrayOfStrings);
    parentPort.postMessage(results);
  });
}

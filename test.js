const fs = require('fs');
const path = require('path');

function countFiles(directory) {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files.length);
      }
    });
  });
}

// Use it like this:
countFiles(path.join(__dirname, 'backlog'))
  .then(count => console.log("NFTs to mint: ", count * 10))
  .catch(err => console.error(err));

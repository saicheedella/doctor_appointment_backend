const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function getStorageFor(savePath, extension = null) {
  return multer.diskStorage({
    destination(req, file, cb) {
      cb(null, savePath);
    },

    async filename(req, file, cb) {

      const filename = uuidv4() + (extension || path.extname(file.originalname));
      console.log(filename)
      // Attach the filename
      req.uploadedFileName = filename;
      req.uploadedFile = file;

      cb(null, filename);
    },
  });
}

module.exports = { getStorageFor };

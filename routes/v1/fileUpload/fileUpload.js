var express = require('express');
var router = express.Router();
var config = require(__base + '/config/config');
var multer = require('multer');
var fs = require('fs');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploads.directory);
  },
  filename: function (req, file, cb) {
    logger.info(file);
    var extension = file.originalname.substr(file.originalname.lastIndexOf('.') + 1);
    if(extension == file.originalname || '.' + extension == file.originalname || extension == '') { // e.g. ".txt" or "xyz" or xyz.
       //either no file extension, or no filename
       cb(new Error('Invalid name or extension'));
    } else {
      cb(null, file.originalname); // change filename here if required
    }
  }
});

var upload = multer({ storage: storage,
 fileFilter: fileFilter,
 });

router.use(function(req, res, next) {
  //logger.info('fileUpload.js is working');
  next();
});

router.get('/:file', function(req, res) {
  //get individual file
  // The filename is simple the local directory and tacks on the requested url
  var filename = "./uploads/" +req.params.file;
  logger.info('Request for: ' + filename);

  // This line opens the file as a readable stream
  var readStream = fs.createReadStream(filename);

  // This will wait until we know the readable stream is actually valid before piping
  readStream.on('open', function () {
    // This just pipes the read stream to the response object (which goes to the client)
    readStream.pipe(res);
  });

  // This catches any errors that happen while creating the readable stream (usually invalid names)
  readStream.on('error', function(err) {
    res.end(err);
  });

});
router.get('/', function(req, res) {
  //get all files
  fs.readdir('./uploads', function (err, files){
    if(err){
      throw err;
    }

    logger.info(files);
    res.send({files:files});

  });

});
router.delete('/:file', function(req, res) {
  //delete a file
  var filename = "./uploads/" +req.params.file;
  logger.info('Delete: ' + filename);
  fs.unlink(filename, function (err){
    if(err)
    {
      logger.debug('Couldnt delete file');
      res.status(500).send('File doesnt exist, or cannot be deleted!');
    }
    else {
      res.end();
    }
  })
});

router.post('/', upload.array('file'), function(req, res) {
  //add a new file
  logger.info('File(s) received');
  res.status(200);
  res.end();
});

//should only be errors here
router.use(function (err, req, res, next) {
  if(err){
    var error = {error:"File Upload Error"};
    res.status(500).send(error);
    logger.info('fileUpload: ' + err);

  }
});



function fileFilter (req, file, cb) {
  for(var i = 0, length = config.uploads.allowedFileTypes.length; i < length; i++)
  {
    if(file.mimetype == config.uploads.allowedFileTypes[i])
    {
        logger.info('fileUpload: An allowed file type');
        return cb(null, true); //allowed file type
    }
  }
  //no filetype match
  logger.info('fileUpload: '+ file.mimetype + ' is not an acceptable file type');
  cb(new Error('Not an acceptable file'));
};

module.exports = router;

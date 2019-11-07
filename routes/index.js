const router = require('express').Router();
const os = require('os');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const extractAssets = require('../helpers/extract-assets');

const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve('uploads'),
    filename: function(req, file, cb) { cb(null, file.originalname); }
  })
});

router
  .get('/models', (req, res, next) => {

    const assets = extractAssets(res, 'models');
    res.render('models', assets);
  })
  .get('/face-comparison', (req, res, next) => {

    const assets = extractAssets(res, 'face-comparison');
    // res.sendStatus(200);
    // console.table(res.locals.webpackStats.toJson().assets, ['name', 'chunks', 'chunkNames'])
    res.render('face-comparison', assets);
  })
  .post('/upload', upload.fields([
    { name: 'name', maxCount: 1 },
    { name: 'models', maxCount: 5 }
  ]), (req, res, next) => {

    // I assume users are friendly and native

    for (const file of req.files.models) {

      const ext = file.mimetype.match(/(png|jpeg)/)[0];
      const filename = Math.random().toString(16).substr(2, 7) + '.' + ext;
      const delimiter = os.platform() === 'win32' ? '\\' : '/';
      const newPath = [file.destination, req.body.name, filename].join(delimiter);

      if (fs.existsSync(file.path)) {
        fs.mkdir(path.resolve('uploads', req.body.name), { mode: 766 }, (err) => {

          if (err && err.code !== 'EEXIST') throw err;
          fs.rename(file.path, newPath, (err) => {
            if (err) throw err;
          });
        });
      }
    }

    res.sendStatus(201);
  });

module.exports = router;
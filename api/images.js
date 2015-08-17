var cv = require('opencv');
var request = require('request');
var q = require('q');

var openCvInProgress = false;
var detectQueue = [];

module.exports = {
    countCrop: function (image) {
        var crop = {};
        var self = this;

        if (image.width / image.height > config.photoCropFactor) {
            crop.width = image.height * config.photoCropFactor | 0;
            crop.x = (image.width - crop.width) / 2;
            crop.height = image.height;
            crop.y = 0;
        } else {
            crop.width = image.width;
            crop.x = 0;
            crop.height = image.width / config.photoCropFactor | 0;
            crop.y = (image.height - crop.height) / 2;
        }

        return this.loadMatrix(image.src)
            .then(function(matrix) {
              image.width = matrix.width();
              image.height = matrix.height();
              return self.findFace(matrix);
            })
            .then(function (face) {
                if (face) {
                    var faceCenter = { x: face.x + face.width/2, y: face.y + face.height/2 };
                    var cropCenter = { x: crop.x + crop.width/2, y: crop.y + crop.height/2 };
                    var centersDiff = { x: cropCenter.x - faceCenter.x, y: cropCenter.y - faceCenter.y };

                    if (crop.y === 0) {
                        var newCropX = crop.x - centersDiff.x;

                        if (newCropX < 0) {
                            newCropX = 0
                        } else if (newCropX + crop.width > image.width) {
                            newCropX = image.width - crop.width;
                        }

                        crop.x = newCropX;
                    } else if (crop.x === 0) {
                        var newCropY = crop.y - centersDiff.y;

                        if (newCropY < 0) {
                            newCropY = 0
                        } else if (newCropY + crop.height > image.height) {
                            newCropY = image.height - crop.height;
                        }

                        crop.y = newCropY;
                    }
                }
                image.crop = crop;
                return image;
            });
    },

    findFace: function (img) {
        var deferred = q.defer();

        function runDetectAlgorithm() {
            img.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
                if (err) {
                    logger.info('Could not find faces on image', err);
                    deferred.resolve();
                } else {
                    deferred.resolve(faces[0]);
                }

                if (detectQueue.length) {
                    detectQueue.shift()();
                } else {
                    openCvInProgress = false;
                }
            });
        }

        if (openCvInProgress) {
            detectQueue.push(runDetectAlgorithm);
        } else {
            openCvInProgress = true;
            runDetectAlgorithm();
        }

        return deferred.promise;
    },

    loadMatrix: function (url) {
        var deferred = q.defer();
        var imgStream = new cv.ImageDataStream();

        request.get(url).pipe(imgStream);

        imgStream.on('load', function(matrix) {
           deferred.resolve(matrix);
        });

        imgStream.on('error', function(err) {   //hope it works :)
            deferred.reject(err);
        });


        return deferred.promise;
    }
};


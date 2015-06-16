var cv = require('opencv');
var request = require('request');
var q = require('q');

module.exports = {
    countCrop: function (image) {
        var crop = {};

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
            .then(this.findFace)
            .then(function (face) {
                if (face) {
                    var faceCenter = { x: face.x + face.width/2, y: face.y + face.height/2 };
                    var cropCenter = { x: crop.x + crop.width/2, y: crop.y + crop.height/2 };
                    var centersDiff = { x: cropCenter.x - faceCenter.x, y: cropCenter.y - faceCenter.y };

                    var adjust = {
                        x: crop.x == 0 ? 0 : crop.x - centersDiff.x,
                        y: crop.y == 0 ? 0 : crop.y - centersDiff.y
                    };

                    if (adjust.x < 0) {
                        adjust.x = 0
                    } else if (adjust.x + crop.width > image.width) {
                        adjust.x = image.width - crop.width;
                    }

                    if (adjust.y < 0) {
                        adjust.y = 0
                    } else if (adjust.y + crop.height > image.height) {
                        adjust.y = image.height - crop.height;
                    }

                    crop.x = adjust.x;
                    crop.y = adjust.y;
                    crop.faceCenter = faceCenter.x;
                }
                image.crop = crop;
                return image;
            });
    },

    findFace: function (img) {
        var deferred = q.defer();

        img.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
            if (err) {
                logger.info('Could not find faces on image', err);
                deferred.reject(err);
            }
            deferred.resolve(faces[0]);
        });

        return deferred.promise;
    },

    loadMatrix: function (url) {
        var deferred = q.defer();
        var imgStream = new cv.ImageDataStream();

        request.get(url).pipe(imgStream);

        imgStream.on('load', function(matrix){
           deferred.resolve(matrix);
        });

        return deferred.promise;
    }
};


var cv = require('opencv');
var request = require('request');
var config = require('./config.local');
var s = new cv.ImageDataStream();

var images = require('./api/images.js');

//images.loadMatrix('http://cs403620.vk.me/v403620491/8a2b/st6iwD2rYOI.jpg')
//    .then(images.findFace)
//    .then(console.log, console.log);


s.on('load', function(matrix){
    console.log(matrix.width());
    console.log(matrix.height());
    matrix.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
        if (err) throw err;
        console.log(faces)

        for (var i = 0; i < faces.length; i++){
            var face = faces[i];
            console.log(face);
            matrix.ellipse(face.x + face.width / 2, face.y + face.height / 2, face.width / 2, face.height / 2);
        }

        matrix.save('./face-detection.png');
        console.log('Image saved to ./face-detection.png');
    });
});

request.get('https://pp.vk.me/c412419/v412419928/7fcd/_kSHJn2Hr3s.jpg').pipe(s);
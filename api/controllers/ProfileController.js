module.exports = {

  findProfile: function (req, res) {
    if (!req.params.id) {
      return res.send(400, 'Incorrect parameters');
    }

    UserService.getUserWithPhotos(req.params.id, req.params.photoType)
      .then(function (user) {
        res.send(user);
      })
      .fail(function (error) {
        logger.error('findProfile: ' + error);
        res.send(500, 'Internal error');
      });
  }
};



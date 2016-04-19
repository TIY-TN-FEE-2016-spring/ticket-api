module.exports = function(Review) {
  Review.beforeRemote('create', function(context, user, next) {
    var req = context.req;

    req.body.data.attributes.date = Date.now();
    req.body.data.relationships.reviewer.data = {
      id: req.accessToken.userId,
    };

    next();
  });
};

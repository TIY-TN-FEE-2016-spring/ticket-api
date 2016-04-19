module.exports = function(Message) {
  Message.beforeRemote('create', function(context, user, next) {
    var req = context.req;

    req.body.data.attributes['created-at'] = Date.now();
    req.body.data.relationships.chatter.data = {
      id: req.accessToken.userId,
    };

    next();
  });
};

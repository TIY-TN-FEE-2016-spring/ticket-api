function migrateModel(database, modelName) {
  return new Promise(function(resolve, reject) {
    database.automigrate(modelName, function(err) {
      if (err) {
        reject(err);
      }

      resolve();
    })
  });
}

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());
  server.use(router);

  router.get(`/migrations`, function(req, res) {
    const db = server.dataSources.pg;
    const models = [
      'User',
      'AccessToken',
      'ACL',
      'RoleMapping',
      'Role',
      'coffee-shop',
      'review',
      'reviewer',
    ];

    Promise.all(models.map(function(model) {
      return migrateModel(db, model);
    })).then(function() {
      res.send({
        status: 200,
        message: 'Migration Complete',
      });
    });
  });

  router.get(`/seed`, function(req, res) {
    var async = require('async');

    // create all models
    async.parallel({
      reviewers: async.apply(createReviewers),
      coffeeShops: async.apply(createCoffeeShops)
    }, function(err, results) {
      if (err) throw err;

      createReviews(results.reviewers, results.coffeeShops, function(err) {
        if (err) throw err;

        res.send({
          status: 200,
          message: 'Migrations run',
        });
      });
    });

    // create reviewers
    function createReviewers(cb) {
      server.models.Reviewer.create([{
        email: 'foo@bar.com',
        password: 'foobar'
      }, {
        email: 'john@doe.com',
        password: 'johndoe'
      }, {
        email: 'jane@doe.com',
        password: 'janedoe'
      }], cb);
    }

    // create coffee shops
    function createCoffeeShops(cb) {
      server.models.CoffeeShop.create([{
        name: 'Bel Cafe',
        city: 'Vancouver'
      }, {
        name: 'Three Bees Coffee House',
        city: 'San Mateo'
      }, {
        name: 'Caffe Artigiano',
        city: 'Vancouver'
      }], cb);
    }

    // create reviews
    function createReviews(reviewers, coffeeShops, cb) {

      var DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

      server.models.Review.create([{
        date: Date.now() - (DAY_IN_MILLISECONDS * 4),
        rating: 5,
        comments: 'A very good coffee shop.',
        publisherId: reviewers[0].id,
        coffeeShopId: coffeeShops[0].id
      }, {
        date: Date.now() - (DAY_IN_MILLISECONDS * 3),
        rating: 5,
        comments: 'Quite pleasant.',
        publisherId: reviewers[1].id,
        coffeeShopId: coffeeShops[0].id
      }, {
        date: Date.now() - (DAY_IN_MILLISECONDS * 2),
        rating: 4,
        comments: 'It was ok.',
        publisherId: reviewers[1].id,
        coffeeShopId: coffeeShops[1].id
      }, {
        date: Date.now() - (DAY_IN_MILLISECONDS),
        rating: 4,
        comments: 'I go here everyday.',
        publisherId: reviewers[2].id,
        coffeeShopId: coffeeShops[2].id
      }], cb);
    }
  });
};

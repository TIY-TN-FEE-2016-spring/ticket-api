var postgresURI = process.env.DATABASE_URL;

var config = {
  "db": {
    "name": "db",
    "connector": "memory"
  },
  "pg": {
    "host": "localhost",
    "port": 5432,
    "database": "coffee-shop",
    "password": "",
    "name": "pg",
    "user": "ryan",
    "connector": "postgresql"
  }
}

if (postgresURI) {
  config.pg = {
    connector: "postgresql",
    url: postgresURI,
  };
}

module.exports = config;

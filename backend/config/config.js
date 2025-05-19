// backend/config/config.js

require('dotenv').config();
const path = require('path');

const config = {
  development: {
    database: {
      dialect: process.env.DB_DIALECT || 'mssql',
      host: process.env.DB_HOST || 'localhost',
      username: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'gustados',
      timeZone: 'America/Argentina/Buenos_Aires',
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: false,
          instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS',
          connectTimeout: 60000,
          requestTimeout: 60000
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      logging: console.log
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'secreto-desarrollo',
      expiresIn: '8h'
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    server: {
      port: process.env.PORT || 3001
    },
    image: {
      storage: process.env.IMAGE_STORAGE || 'database',

      limits: {
        maxSize: 5 * 1024 * 1024, // 5 MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif'
        ]
      },

      disk: {
        basePath: process.env.UPLOAD_PATH || path.join(__dirname, '..', '..', 'uploads', 'images')
      }
    }
  },

  production: {
    database: {
      dialect: process.env.DB_DIALECT || 'mssql',
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      timeZone: 'America/Argentina/Buenos_Aires',
      dialectOptions: {
        options: {
          encrypt: true,
          trustServerCertificate: false,
          instanceName: process.env.DB_INSTANCE,
          connectTimeout: 60000,
          requestTimeout: 60000
        }
      },
      pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000
      },
      logging: false
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '4h'
    },
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    server: {
      port: process.env.PORT || 3001
    },
    image: {
      storage: process.env.IMAGE_STORAGE || 'cloud',

      limits: {
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif'
        ]
      },

      disk: {
        basePath: process.env.UPLOAD_PATH || path.join(__dirname, '..', '..', 'uploads', 'images')
      }
    }
  },

  test: {
    database: {
      dialect: 'sqlite',
      timeZone: 'America/Argentina/Buenos_Aires',
      storage: ':memory:',
      logging: false
    },
    jwt: {
      secret: 'secreto-test',
      expiresIn: '1h'
    },
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    server: {
      port: 3002
    },
    image: {
      storage: 'database',

      limits: {
        maxSize: 5 * 1024 * 1024,
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif'
        ]
      },

      disk: {
        basePath: path.join(__dirname, '..', '..', 'uploads_test', 'images')
      }
    }
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];

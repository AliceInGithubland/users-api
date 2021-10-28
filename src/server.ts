import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './utils/database';

if (!process.allowedNodeEnvironmentFlags.MONGODB_URI) {
  throw new Error('No MongoDB URL dotenv variable');
}

const app = express();
const port = 3000;

/**
 * /api/users
 */

//Custom middleware to log request
app.use((request, _response, next) => {
  console.log('Request received', request.url);
  next();
});

// For parsing application/json
app.use(express.json());

const users = [
  {
    name: 'Marge',
    username: 'MargeS',
    password: 'homer123',
  },
  {
    name: 'Homer',
    username: 'HomerS',
    password: 'flenders123',
  },
  {
    name: 'Bart',
    username: 'BartS',
    password: 'itchyandscratchy123',
  },
  {
    name: 'KnechtRuprecht',
    username: 'KRuprechtS',
    password: 'snowball123',
  },
];

app.post('/api/login', (request, response) => {
  const logInUser = request.body;
  const user = users.find(
    (user) =>
      user.username === logInUser.username &&
      user.password === logInUser.password
  );
  if (user) {
    response.status(202).send('User found');
  } else {
    response.status(404).send('Name is unkown');
  }
});

app.delete('/api/users/:username', (request, response) => {
  const knownName = users.some(
    (user) => user.username === request.params.username
  );
  if (knownName) {
    const deleteUser = users.findIndex(
      (user) => user.username === request.params.username
    );
    users.splice(deleteUser, 1);
    response.send(users);
  } else {
    response.status(404).send('Name is unknown');
  }
});

app.get('/api/users', (_request, response) => {
  response.send(users);
});

app.get('/api/users/:name', function (request, response) {
  response.send(request.params);
});

connectDatabase(process.env.MONGODB_URI)().then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);

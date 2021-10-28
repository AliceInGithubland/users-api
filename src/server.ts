import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './utils/database';

if (!process.env.MONGODB_URI) {
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
app.use(cookieParser());
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
  const credentials = request.body;
  const existingUser = users.find(
    (user) =>
      user.username === credentials.username &&
      user.password === credentials.password
  );

  if (existingUser) {
    response.setHeader('Set-Cookie', `username=${existingUser.username}`);
    response.send('Logged in');
  } else {
    response.status(401).send('You shall not pass');
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

app.post('/api/users', (request, response) => {
  const newUser = request.body;
  if (
    typeof newUser.name !== 'string' ||
    typeof newUser.username !== 'string' ||
    typeof newUser.password !== 'string'
  ) {
    response.status(400).send('Missing properties');
    return;
  }

  if (users.some((user) => user.username === newUser.username)) {
    response.status(409).send('User already exists');
  } else {
    users.push(newUser);
    response.send(`${newUser.name} added`);
  }
});

app.get('/api/users', (_request, response) => {
  response.send(users);
});

app.get('/api/users/:name', function (request, response) {
  response.send(request.params);
});

app.get('/api/me', (request, response) => {
  const username = request.cookies.username;
  const foundUser = users.find((user) => user.username === username);
  if (foundUser) {
    response.send(foundUser);
  } else {
    response.status(404).send('User not found');
  }
});

connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);

const request = require('supertest');
const app = require('../service');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
const badUser = {name: 'bad pizza', email: 'reg@test.com', password: ''};
let testUserAuthToken;

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
});

test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
  expect(loginRes.body.user).toMatchObject(user);
});

test('register fail, no password', async () => {
  const registerRes = await request(app).post('/api/auth').send(badUser);
  expect(registerRes.status).toBe(400);
 
  expect(registerRes.body.message).toBe('name, email, and password are required' );
});

test('logout fail, no authToken', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);

  const logoutRes = await request(app).delete('/api/auth').send();
  expect(logoutRes.status).toBe(401);
  expect(logoutRes.body.message).toBe('unauthorized');
});

test('update user', async () => {
  const testAdmin = { name: 'pizzaAdmin', email: 'admin@here.com', password: 'adminPW' };
  const tempRequest = {email: "admin@here.com", password: "adminPW"};

  const updateRes = await request(app).put('/api/auth/:userId').send(tempRequest);
  //more
})


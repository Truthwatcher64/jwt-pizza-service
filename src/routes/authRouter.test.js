const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
const badUser = {name: 'bad pizza', email: 'reg@test.com', password: ''};

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  await request(app).post('/api/auth').send(testUser);
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
  await request(app).put('/api/auth').send(testUser);

  const logoutRes = await request(app).delete('/api/auth').send();
  expect(logoutRes.status).toBe(401);
  expect(logoutRes.body.message).toBe('unauthorized');
});

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}
async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  await DB.addUser(user);

  user.password = 'toomanysecrets';
  return user;
}

test('update user', async () => {
  let testAdmin = await createAdminUser();
  const adminRes = await request(app).put('/api/auth').send({"email": testAdmin.email, "password": testAdmin.password});
  adminAuthToken = adminRes.body.token;
  let tempRequest = {"email": `${testAdmin.email}`, "password": testAdmin.password};

  let tempUser = {}
  tempUser.name = randomName();
  tempUser.password = "124";
  tempUser.email = randomName() + "@test.com";
  let registerRes = await request(app).post('/api/auth').send(tempUser);
  let userId = registerRes.body.user.id;

  let path = `/api/auth/${userId}`;
  const updateRes = await request(app).put(path).send(tempRequest).set("Authorization", `Bearer ${adminAuthToken}`);
  expect(updateRes.status).toBe(200);
  expect(updateRes.body.roles).toStrictEqual([{role: 'admin'}]);
})


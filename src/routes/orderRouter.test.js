const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };

let testUserAuthToken;
let adminAuthToken;

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

beforeAll(async () => {
  testUser.name = randomName();
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).put('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  const adminUser = await createAdminUser();
  //console.log(adminUser);
  const adminRes = await request(app).post('/api/auth').send(adminUser);
  //console.log(adminRes.body);
  adminAuthToken = adminRes.body.token;
});

test('menu', async () => {
    const menuGetRes = await request(app).get('/api/order/menu');

    expect(menuGetRes.status).toBe(200);
    
});

test('add item not admin', async () => {
    const menuAdd = await request(app).put('/api/order/menu').send('{ "title":"Student", "description": "No topping, no sauce, just carbs", "image":"pizza9.png", "price": 0.0001 }').set('Authorization', '');

    expect(menuAdd.status).toBe(401);
    expect(menuAdd.body.message).toBe('unauthorized');
});

test('add item admin', async () => {
    //console.log((adminAuthToken));
    const menuAdd = await request(app).put('/api/order/menu').send('{ "title":"Student", "description": "No topping, no sauce, just carbs", "image":"pizza9.png", "price": 0.0001 }').set('Authorization', `Bearer ${adminAuthToken}`);

    expect(menuAdd.status).toBe(403);
    // ? expect(menuAdd.message).toBe('unable to add menu item');
});

test('get Orders', async () => {

});

test('create orders', async () => {

});
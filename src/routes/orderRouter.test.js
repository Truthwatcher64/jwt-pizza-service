const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

let testUser;
let testUserAuthToken;
let adminAuthToken;
let adminUser;
let testUserId;

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
    adminUser = await createAdminUser();
    const adminRes = await request(app).put('/api/auth').send({"email": adminUser.email, "password": adminUser.password});
    adminAuthToken = adminRes.body.token;

    let testUser={};
    testUser.name = randomName();
    testUser.email = testUser.name + '@test.com';
    testUser.password = "123";
    const registerRes = await request(app).post('/api/auth').send(testUser);
    testUserAuthToken = registerRes.body.token;

    testUserId = registerRes.body.user.id;
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

test('add item weird case', async () => {
    const menuAdd = await request(app).put('/api/order/menu').send('{ "title":"Student", "description": "No topping, no sauce, just carbs", "image":"pizza9.png", "price": 0.0001 }').set('Authorization', `Bearer ${testUserAuthToken}`);

    expect(menuAdd.status).toBe(403);
});

test('add item admin', async () => {
    //console.log((adminAuthToken));
    let tempTitle = randomName();
    let reqBody =  {"title":tempTitle, "description": "Cheesy Cheesey", "image":"pizza9.png", "price": 0.0001 }
    const menuAdd = await request(app).put('/api/order/menu').send(reqBody).set('Authorization', `Bearer ${adminAuthToken}`);

    expect(menuAdd.status).toBe(200);
    // ? expect(menuAdd.message).toBe('unable to add menu item');
});

let franchiseName;
let storeName;
let franchiseId;
let storeId;

async function createAStore(){
    franchiseName = randomName();
    let reqBody = {"name": franchiseName, "admins": [{"email": adminUser.email}]}
    const addRes = await request(app).post('/api/franchise').set("Authorization", `Bearer ${adminAuthToken}`).send(reqBody);
    
    franchiseId = addRes.body.id;
    let path = `/api/franchise/${franchiseId}/store`;

    storeName = randomName();
    reqBody = {"franchiseId": franchiseId, "name":storeName};
    const addStoreRes = await request(app).post(path).set("Authorization", `Bearer ${adminAuthToken}`).send(reqBody);
    console.log(addStoreRes.body);
    storeId = addStoreRes.body.id;
}

test('create and then get Orders', async () => {
    await createAStore();
    let curFranId = franchiseId;
    let curStoreId = storeId;

    let reqBody = {"franchiseId": curFranId, "storeId": curStoreId, "items":[{ "menuId": 1, "description": "Cheesy Cheesey", "price": 0.0001}]};
    console.log(reqBody);
    let orderMakeRes = await request(app).post('/api/order/').send(reqBody).set('Authorization', `Bearer ${testUserAuthToken}`);
    expect(orderMakeRes.status).toBe(200);

    let getOrderRes = await request(app).get('/api/order').set('Authorization', `Bearer ${testUserAuthToken}`);
    expect(getOrderRes.status).toBe(200);
    console.log(getOrderRes.body);
    expect(getOrderRes.body.dinerId).toBe(testUserId);

});


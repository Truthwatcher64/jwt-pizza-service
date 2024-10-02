const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

let adminAuthToken;
let adminUser;

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

});

function createFranchise(){

}

test('list franchise', async () => {
    let listRes = await request(app).get('/api/franchise');

    
    expect(listRes.status).toBe(200);
    expect(listRes.headers['content-type']).toMatch('application/json; charset=utf-8');



    let houseName = randomName();
    let temp = {"name": `${houseName}`, "admins": [{"email": `${adminUser.email}`}]}
    const addRes = await request(app).post('/api/franchise').send(temp).set("Authorization", `Bearer ${adminAuthToken}`);
    expect(addRes.status).toBe(200);
    expect(addRes.body.name).toBe(houseName);

    listRes = await request(app).get('/api/franchise');
    expect(listRes.status).toBe(200);
    expect(listRes.body.size).not.toBe(0);
});


test('adding test', async () => {
    let houseName = randomName();
    let reqBody = {"name": houseName, "admins": [{"email": adminUser.email}]}
    const addRes = await request(app).post('/api/franchise').set("Authorization", `Bearer ${adminAuthToken}`).send(reqBody);
    expect(addRes.status).toBe(200);
    expect(addRes.body.name).toBe(houseName);
});

test('getting another users franchise', async () => {
    let bigGuy = await createAdminUser();
    const adminRes = await request(app).put('/api/auth').send({"email": bigGuy.email, "password": bigGuy.password});

    let bigGuyAuth = adminRes.body.token;
    let bigGuyId = adminRes.body.user.id;

    let houseName = randomName();
    let temp = {"name": `${houseName}`, "admins": [{"email": `${bigGuy.email}`}]}
    const addRes = await request(app).post('/api/franchise').send(temp).set("Authorization", `Bearer ${bigGuyAuth}`);

    let path = `/api/franchise/${bigGuyId}`;
    let otherFranchisesRes = await request(app).get(path).set("Authorization", `Bearer ${adminAuthToken}`);
    expect(otherFranchisesRes.status).toBe(200);
    
    
});


test('adding a store test', async () => {
    let houseName = randomName();
    let reqBody = {"name": houseName, "admins": [{"email": adminUser.email}]}
    const addRes = await request(app).post('/api/franchise').set("Authorization", `Bearer ${adminAuthToken}`).send(reqBody);
    
    let id = addRes.body.id;
    let path = `/api/franchise/${id}/store`;
    let storeName = randomName();

    reqBody = {"franchiseId": id, "name":storeName};
    const addStoreRes = await request(app).post(path).set("Authorization", `Bearer ${adminAuthToken}`).send(reqBody);
    expect(addStoreRes.status).toBe(200);
    
    expect(addStoreRes.body.name).toBe(storeName);
    expect(addStoreRes.body.franchiseId).toBe(id);

});

test('delete a franchise', async () => {
    //example: `curl -X DELETE localhost:3000/api/franchise/1 -H 'Authorization: Bearer tttttt'`,
    let houseName = randomName();
    let reqBody = {"name": houseName, "admins": [{"email": adminUser.email}]}
    const addRes = await request(app).post('/api/franchise').set("Authorization", `Bearer ${adminAuthToken}`).send(reqBody);
    
    let id = addRes.body.id;
    let path = `/api/franchise/${id}`;
    let franchiseName = randomName();

    let deleteRes = await request(app).delete(path).set("Authorization", `Bearer ${adminAuthToken}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe('franchise deleted');
});

test('delete a store', async () => {
    //example: `curl -X DELETE localhost:3000/api/franchise/1 -H 'Authorization: Bearer tttttt'`,
    let houseName = randomName();
    let reqBody = {"name": houseName, "admins": [{"email": adminUser.email}]}
    const addRes = await request(app).post('/api/franchise').set("Authorization", `Bearer ${adminAuthToken}`).send(reqBody);
    
    let id = addRes.body.id;
    let path = `/api/franchise/${id}`;
    let franchiseName = randomName();

    let storeName = randomName();
    reqBody = {"franchiseId": id, "name":storeName};
    const addStoreRes = await request(app).post(path).set("Authorization", `Bearer ${adminAuthToken}`).send(reqBody);

    let storeId = addStoreRes.body.id;
    let StorePath = `/api/franchise/${id}/store/${storeId}`;

    let deleteRes = await request(app).delete(StorePath).set("Authorization", `Bearer ${adminAuthToken}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe('store deleted');
});
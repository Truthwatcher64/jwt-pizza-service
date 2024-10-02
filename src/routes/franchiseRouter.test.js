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

beforeEach(async () => {
  //testUser.name = randomName();
  //testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  //const registerRes = await request(app).put('/api/auth').send(testUser);
  //testUserAuthToken = registerRes.body.token;
  adminUser = await createAdminUser();
  //console.log(adminUser);
  //console.log(adminUser.email);
  //console.log(adminUser.password);
  const adminRes = await request(app).put('/api/auth').send({"email": adminUser.email, "password": adminUser.password});
  console.log(adminRes.body);
  adminAuthToken = adminRes.body.token;
  console.log(adminAuthToken);
});

test('list franchise', async () => {
    let listRes = await request(app).get('/api/franchise');

    expect(listRes.status).toBe(200);
    console.log(listRes.body);
    //expect(listRes.body).toBe('[]');

    console.log(adminAuthToken);
    console.log(adminUser.email);
    let houseName = randomName();
    //curl -X POST localhost:3000/api/franchise -H 'Content-Type: application/json' -H 'Authorization: Bearer tttttt' -d '{"name": "pizzaPocket", "admins": [{"email": "f@jwt.com"}]}'
    let temp = {"name": `${houseName}`, "admins": [{"email": `${adminUser.email}`}]}
    const addRes = await request(app).post('/api/franchise').send(temp).set("Authorization", `Bearer ${adminAuthToken}`);
    expect(addRes.status).toBe(200);
    expect(addRes.body.name).toBe(houseName);

    listRes = await request(app).get('/api/franchise');
    expect(listRes.status).toBe(200);
});


// test('adding test', async () => {
//     let houseName = randomName();
//     const addRes = await request(app).post('/api/franchise').set("Authorization", `Bearer ${adminAuthToken}`).send(`{"name": "${houseName}", "admins": [{"email": "${adminUser.email}"}]}`);
//     expect(addRes.status).toBe(200);
//     expect(addRes.body.name).toBe(houseName);
// });

// test('getting another users franchise', async () => {
//     let bigGuy = createAdminUser();
//     let bigGuyAuth = await request(app).put('/api/auth');
//     let otherFranchisesRes = await request(app).post('/api/franchise/1').set("Authorization", `Bearer ${adminAuthToken}`);
//     expect(otherFranchisesRes.status).toBe(200);
    
// });


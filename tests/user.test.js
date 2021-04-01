const { test, expect, beforeEach } = require('@jest/globals');
const User = require('../models/User');
let fbService = require('../services/FirebaseService');
let FBSrvice = fbService.FirebaseService;

let user;

beforeEach(() => {
  user = new User('testuser7', 'abc123');
});

test('User should exist', () => {
  expect(user).toBeDefined();
});

test("User name should be testuser1", () => {
  expect(user.username).toBe("testuser7");
})

test('confirm password should default to password if not explicitly provided', () => {
  expect(user.confirmPassword).toBe("abc123");
})

test("signup user", async () => {
  const fb = new FBSrvice({ ...user, searchTerm: "pizza" });
  // fb.findSearchResults();
  const userKey = await fb.signUpUser();
  expect(userKey).toContain("-M");
});

test("get users", async () => {
  const _fb = new FBSrvice({ users: [] });
  await _fb.getUsers();
  console.log('users: ' + _fb.data.users[0]);
  expect(_fb.data.users.length).toBeGreaterThan(0);
})
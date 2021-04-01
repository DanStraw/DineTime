const { test, expect, beforeEach, describe } = require('@jest/globals');
const recipeSearch = require('../models/RecipeSearch');
const RecipeSearch = recipeSearch.RecipeSearch;
const { DrinkSearch } = require('../models/DrinkSearch');
const axios = require('axios');

let _recipeSearch;
let _drinkSearch;

beforeEach(() => {
  _recipeSearch = new RecipeSearch('gnocchi', 'food');
  _drinkSearch = new DrinkSearch('gin', 'drink');
});

test('recipe class should exist', () => {
  expect(_recipeSearch).toBeDefined();
});

test('recipeSearch should contain searchTerm', () => {
  expect(_recipeSearch.searchTerm).toBe('gnocchi');
});

test('recipeSearch should contain a property `type`', () => {
  expect(_recipeSearch.type).toBe('food');
})

test('recipeSearch `results` should be defined', () => {
  expect(_recipeSearch.results).toBeDefined();
});

test('recipeSearch "results" should be an object', () => {
  expect(typeof _recipeSearch.results).toBe('object');
});

describe.skip('edamam api tests', () => {
  test('recipeSearch should have method search api method', () => {
    expect(_recipeSearch.searchDish()).toBeDefined();
  });

  test('recipeSearch.searchDish() should return null for results if no recipes found', async () => {
    _recipeSearch.searchTerm = 'oeiwotwe';
    await _recipeSearch.searchDish();
    expect(_recipeSearch.results.length).toBe(0);
  });

  test('search results should have length 10', async () => {
    await _recipeSearch.searchDish();
    expect(_recipeSearch.results.length).toBe(10);
  });
})

describe.skip("drink api search test", () => {
  test('drink search success', async () => {
    await _drinkSearch.searchAPI();
    expect(await _drinkSearch.results.length).toBeGreaterThan(0);
  });
});


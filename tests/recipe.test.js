const { test, expect, beforeEach, describe } = require('@jest/globals');
const recipeSearch = require('../models/RecipeSearch');
const RecipeSearch = recipeSearch.RecipeSearch;
const { DrinkSearch } = require('../models/DrinkSearch');
const { IngredientSearch } = require('../models/IngredientsSearch');
const axios = require('axios');
const { IngredientsSearch } = require('../models/IngredientsSearch');

let _recipeSearch;
let _drinkSearch;
let ingredientsSearch;

beforeEach(() => {
  _recipeSearch = new RecipeSearch('gnocchi', 'food');
  _drinkSearch = new DrinkSearch('gin', 'drink');
  ingredientsSearch = new IngredientsSearch(['chicken', 'rice', 'salt', 'pepper'], "food");
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

describe('ingredients array tests', () => {
  test('searchIngredients exists', () => {
    expect(typeof ingredientsSearch.searchAPI).toBe("function");
  });

  test('calling searchAPI on each ingredient', async () => {
    const response = await ingredientsSearch.searchIngredients();
    expect(response.length).toBe(ingredientsSearch.searchTerm.length * 10);
  })

  test('filtering ingredients', async () => {
    while (ingredientsSearch.results.length < 10 && ingredientsSearch.resultsLengthChanged === true || ingredientsSearch.startIndex > 20) {
      await ingredientsSearch.searchIngredients();
      ingredientsSearch.filterIngredients();
      ingredientsSearch.filterResultsByMatchPerc();
      ingredientsSearch.sortResultsByMatchPerc();
      ingredientsSearch.filterTopTenResults();
      ingredientsSearch.updateStartIndex();
    }

    expect(ingredientsSearch.results.length).toBe(10);
  })
})


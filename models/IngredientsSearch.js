const { RecipeSearch } = require('./RecipeSearch');
const axios = require('axios');
const keys = require("../keys");
const chicken = require('../data/chicken.json');
const rice = require('../data/rice.json');
const salt = require('../data/salt.json');
const pepper = require('../data/pepper.json');

class IngredientsSearch extends RecipeSearch {

  constructor(_searchTerms, _type, _results = [], startIndex = 0, resultsLengthChanged = true, startResultsLength = 0) {
    super(_searchTerms, _type, _results);
    this.startIndex = startIndex;
    this.resultsLengthChanged = resultsLengthChanged;
    this.startResultsLength = startResultsLength;
    this.newResults = [];
  }

  stringToArray(arrayString) {
    return arrayString.split(",");
  }

  async searchAPI(ingredient) {
    const api_key = keys.dish;
    const api_id = keys.dish_id;
    let api_url = "https://api.edamam.com/search?app_id=" + api_id + "&app_key=" + api_key + "&q=" + ingredient + "&from=" + this.startIndex + "&to=" + (this.startIndex + 20);

    let res;
    let recipes;
    switch (ingredient) {
      case "chicken":
        res = chicken;
        recipes = res.hits.slice(this.startIndex, (this.startIndex + 20));
        break;
      case "rice":
        res = rice;
        recipes = res.hits.slice(this.startIndex, (this.startIndex + 20));
        break;
      case "salt":
        res = salt;
        recipes = res.hits.slice(this.startIndex, (this.startIndex + 20));
        break;
      case "pepper":
        res = pepper;
        recipes = res.hits.slice(this.startIndex, (this.startIndex + 20));
        break;
      default:
        res = await axios.get(api_url);
        recipes = res.data.hits;
        break;
    }
    return recipes;
  }

  async searchIngredients() {
    let ingredients = this.searchTerm;

    for (let i = 0; i < ingredients.length; i++) {
      let recipes = await this.searchAPI(ingredients[i]);
      recipes.forEach(hit => {
        this.newResults.push(hit);
      });

    }
    return this.newResults;
  }



  filterIngredients() {
    let searchedIngredients = this.searchTerm;
    this.newResults.forEach((result, index) => {
      this.newResults[index].usedIngredients = [];
      this.newResults[index].unUsedIngredients = [];
      this.newResults[index].neededIngredients = this.newResults[index].recipe.ingredientLines;
      searchedIngredients.forEach(searchedIngredient => {
        const matchedIngredient = this.getUsedIngredients(searchedIngredient, result.recipe.ingredients);
        if (matchedIngredient.length > 0) {
          this.newResults[index].usedIngredients.push(searchedIngredient);
          this.newResults[index].neededIngredients = this.removeFromNeededIngredients(searchedIngredient, this.newResults[index].neededIngredients)
        } else {
          this.newResults[index].unUsedIngredients.push(searchedIngredient);
        }
      });

      this.newResults[index].matchPercentage = this.calculateMatch(this.newResults[index].usedIngredients.length, this.newResults[index].unUsedIngredients.length, this.newResults[index].neededIngredients.length);


    });

  }

  filterResultsByMatchPerc() {
    this.newResults = this.newResults.filter(result => {
      return result.matchPercentage >= 50
    })
    this.results = [...this.results, ...this.newResults];
    // this.results.forEach(result => console.log('gRes: ' + result.matchPercentage));
    if (this.results.length !== this.startResultsLength) {
      this.resultsLengthChanged = true;
      this.startResultsLength = this.results.length;
    } else {
      this.resultsLengthChanged = false;
    }
  }

  sortResultsByMatchPerc() {
    this.results = this.results.sort((a, b) => (a.matchPercentage < b.matchPercentage) ? 1 : -1);
  }

  filterTopTenResults() {
    if (this.results.length > 10) {
      this.results = this.results.filter((result, index) => index < 10);
    }
  }


  getUsedIngredients(searchedIngredient, ingredientsInRecipe) {
    const matches = ingredientsInRecipe.filter(ingredientInRecipe => {
      const incredientInrecipeLowerCase = ingredientInRecipe.text.toLowerCase();
      return incredientInrecipeLowerCase.includes(searchedIngredient.toLowerCase());
    })
    return matches;
  }

  removeFromNeededIngredients(searchedIngredient, neededIngredientsArray) {
    for (let i = 0; i < neededIngredientsArray.length; i++) {
      if (neededIngredientsArray[i].includes(searchedIngredient)) {
        neededIngredientsArray.splice(i, 1);
        break;
      }
    }
    return neededIngredientsArray;
  }

  calculateMatch(used_ing_count, un_used_ing_count, needed_ing_count) {
    let matchPercentage = (((used_ing_count / (used_ing_count + un_used_ing_count)) * .75) + ((used_ing_count / (used_ing_count + needed_ing_count)) * .25)) * 100;
    return matchPercentage;
  }

  updateStartIndex() {
    this.startIndex += 20;
  }

  returnResults() {
    if (this.results.length > 0) {
      return {
        results: this.results,
        statusCode: 200,
        message: 'succcess'
      }
    }
    return {
      results: null,
      statusCode: 404,
      message: 'ingredients search failed'
    }

  }

}

module.exports = {
  IngredientsSearch: IngredientsSearch
}
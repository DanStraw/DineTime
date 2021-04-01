const { RecipeSearch } = require('./RecipeSearch');
const axios = require('axios');
const keys = require("../keys");

class DishSearch extends RecipeSearch {
  constructor(_searchTerm, _type, _results = []) {
    super(_searchTerm, _type, _results);
  }

  async searchAPI() {
    const api_key = keys.dish;
    const api_id = keys.dish_id;
    const api_url = "https://api.edamam.com/search?app_id=" + api_id + "&app_key=" + api_key + "&q=" + this.searchTerm;

    const response = await axios.get(api_url);

    if (response.data == undefined) {
      return false;
    }
    if (response.data.count === 0) {
      return { statusCode: 404, results: null, message: "No data found" }
    }

    this.results = await response.data.hits.map(hit => {
      return {
        dishName: hit.recipe.label,
        calories: hit.recipe.calories,
        ingredientLine: hit.recipe.ingredientLines,
        ingredients: hit.recipe.ingredients,
        image: hit.recipe.image,
        url: hit.recipe.url
      }
    });
    return {
      results: this.results,
      statusCode: 200,
      message: "success"
    };
  }
}

module.exports = {
  DishSearch: DishSearch
}
const { RecipeSearch } = require('./RecipeSearch');
const axios = require('axios');

class DrinkSearch extends RecipeSearch {
  constructor(_searchTerm, _type, _results = []) {
    super(_searchTerm, _type, _results);
  }

  async searchAPI() {
    const that = this;
    const api_url = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=" + this.searchTerm;
    return await axios.get(api_url)
      .then(function (response) {
        if (response.data.drinks === null) {
          return { statusCode: 404, results: null, message: "No data found" }
        }

        that.results = response.data.drinks;
        return {
          results: this.results,
          statusCode: 200,
          message: "success"
        };
      }).catch(err => {
        return {
          results: null,
          statusCode: 400,
          message: 'drink search failed'
        }
      })
  }
}

module.exports = {
  DrinkSearch: DrinkSearch
}
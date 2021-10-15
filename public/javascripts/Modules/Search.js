class Search {
  constructor(term, type) {
    this.term = term;
    this.type = type;
    this.ingredients = [];
    this.results = [];
  }

  findItem() {
    this.type = this.type === 'food' ? 'dish' : this.type;
    return $.ajax({
      url: `/recipes/${this.type}/${removeSpaces(this.term)}`,
      dataType: 'JSON',
      method: 'GET'
    }).then((response) => {
      return response;

    }).catch(() => {
      return false;
    });
  }

  addIngredient(ingredient) {
    this.ingredients = [...this.ingredients, ingredient];
    let ingredientsView = new IngredientsView(this.ingredients);
    ingredientsView.showIngredients();
    $('#ingredients-input').val("");
    $('#ingredients-input').focus();
  }

  removeIngredient(index) {
    this.ingredients.splice(index, 1);
    let ingredientsView = new IngredientsView(this.ingredients);
    ingredientsView.showIngredients();
    $('#ingredients-input').val("");
  }
  clearIngredients() {
    this.ingredients = [];
  }

  getTerm() {
    return this.term;
  }

  async addToUserHistory(recipeResultsLength, key) {
    return await $.ajax({
      url: '/users/searchHistory',
      dataType: 'JSON',
      method: 'POST',
      data: {
        type: this.type,
        searchTerm: this.term,
        resultsLength: recipeResultsLength,
        key
      }
    })
      .then(response => {
        return response;
      })
      .catch(err => {
        return err;
      })
  }

  async userHistory() {
    const searchTermIsInUserHistory = await $.ajax({
      url: `/users/searchHistory/${this.type}/${this.term}`,
      dataType: 'JSON',
      method: 'GET'
    }).then(response => {
      return response;
    }).catch(err => {
      return { match: err.responseJSON.match, message: err.statusText };
    })
    return await searchTermIsInUserHistory;
  }

  arrayToString(terms) {
    let termsString = "";
    for (let term of terms) {
      termsString += term + ",";
    }
    return termsString;
  }

  async recipeHistory() {
    let termString = this.type === "ingredients" ? this.arrayToString(this.term) : this.term;
    const searchInRcipeCollection = await $.ajax({
      url: `/recipes/${this.type}/term/${removeSpaces(termString)}`,
      dataType: 'JSON',
      method: 'GET'
    }).then((response) => {
      const responseObj = {
        isMatch: response.match,
        recipes: response.search
      };
      return responseObj;
    }).catch((err) => {
      return {
        isMatch: false,
        recipes: null
      };
    })
    return searchInRcipeCollection;
  }

  async newRecipe(type) {
    const result = await $.ajax({
      url: `/recipes/${type}`,
      type: 'POST',
      dataType: 'JSON',
      data: { "term": this.term }
    }).done(function (response) {
      if (response) {
        return response;
      } else {
        return swal("no response found");
      }
    });
    return result;
  }

  //move HitoryItem to cb in index.js line 41
  async searchRecipes() {
    $('.loader').show();
    const userMatch = await this.userHistory();
    if (userMatch.match) {
      $('.loader').hide();
      return swal(`${this.type} search of ${this.term} is already in your history`);
    }
    const recipeCollectionMatch = await this.recipeHistory();
    if (recipeCollectionMatch.isMatch) {
      this.addToUserHistory(recipeCollectionMatch.recipes.data.results.length)
        .then(async (response) => {
          $('.loader').hide();
          const { index } = response;
          let { recipes } = recipeCollectionMatch;
          const recipesToDisplay = new HistoryItem({ searchTerm: recipes.searchTerm, index }, removeSpaces(recipes.searchTerm), recipes.type, recipes.results, true);
          recipesToDisplay.display();
          recipesToDisplay.showRecipes();
        });

    } else {
      await this.newRecipe(this.type).then(data => {
        this.addToUserHistory(data.results.length, data.key)
          .then(() => {
            $('.loader').hide();
            const recipesView = new RecipesView({ type: this.type, data });
            recipesView.showNewResults();
          })
          .catch(err => {
            $('.loader').hide();
            const recipesView = new RecipesView({ type: this.type, data });
            recipesView.showNewResults();
          })
      })
        .catch(() => swal("No recipes found")); 14
    }
  }
}
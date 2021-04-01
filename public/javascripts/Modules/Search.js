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
    this.ingredients.push(ingredient);
  }

  removeIngredient(index) {
    this.ingredients.splice(1, index);
  }

  getTerm() {
    return this.term;
  }

  async addToUserHistory(recipeResultsLength) {
    return await $.ajax({
      url: '/users/searchHistory',
      dataType: 'JSON',
      method: 'POST',
      data: {
        type: this.type,
        searchTerm: this.term,
        resultsLength: recipeResultsLength
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
      return { match: err.match, message: err.message };
    })
    return await searchTermIsInUserHistory;
  }

  async recipeHistory() {
    const searchInRcipeCollection = await $.ajax({
      url: `/recipes/${this.type}/${removeSpaces(this.term)}`,
      dataType: 'JSON',
      method: 'GET'
    }).then((response) => {
      const responseObj = {
        isMatch: true,
        recipes: response
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
      url: `/recipes/${type}/${removeSpaces(this.term)}`,
      type: 'POST',
      dataType: 'JSON'
    }).done(function (response) {
      if (response) {
        return response;
      } else {
        return swal("no response found");
      }
    });
    return result;
  }
}
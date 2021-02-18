class Search {
  constructor(term, type) {
    this.term = term;
    this.type = type;
    this.ingredients = [];
    this.results = [];
  }

  findItem() {
    const that = this;
    const id = removeSpaces(this.term);
    let found = false;
    database.ref(`${id}`).on("value", function (snapshot) {
      if (snapshot.val() && snapshot.val().type === that.type) {
        found = true;
      }
    })
    return found;
  }

  addIngredient(ingredient) {
    this.ingredients.push(ingredient);
  }

  removeIngredient(index) {
    this.ingredients.splice(1, index);
  }

  getItems() {
    const that = this;
    const id = removeSpaces(this.term);
    database.ref(`${id}`).on("value", function (snapshot) {
      if (!snapshot.val()) {
        return null;
      }
      console.log('snappyshott', snapshot.val());
    });
  }

  getTerm() {
    return this.term;
  }

  drink() {
    const that = this;
    var searchTermURL = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=" + this.term;
    $.ajax({
      url: searchTermURL,
      method: 'GET',
    }).then(function (response) {
      if (response.drinks === null) {
        return swal(`Search of ${that.term} returned no ${that.type} results`);
      } else {
        that.results = response.drinks;
        const fbService = new FirebaseService({
          term: that.term,
          type: that.type,
          results: that.results,
          id: removeSpaces(that.term)
        });
        fbService.saveResults();
      }
    })

  };

  dish() {
    const that = this;
    var API_KEY = keys.dish;
    var APP_ID = keys.dish_id;
    // var corsProxy = "https://cors-anywhere.herokuapp.com/";
    var apiUrl = "https://api.edamam.com/search?app_id=" + APP_ID + "&app_key=" + API_KEY + "&q=" + this.term;
    // var searchTermURL = apiUrl;

    $.ajax({
      url: apiUrl,
      method: 'GET',
    }).then(function (data) {

      if (data.hits.length === 0) {
        return swal(`Search of ${food} returned no results`);
      } else {
        that.results = data.hits.map(hit => {
          return {
            dishName: hit.recipe.label,
            calories: hit.recipe.calories,
            ingredientLine: hit.recipe.ingredientLines,
            ingredients: hit.recipe.ingredients,
            image: hit.recipe.image,
            url: hit.recipe.url
          }
        });
        const fbService = new FirebaseService({
          term: that.term,
          type: that.type,
          results: that.results,
          id: removeSpaces(that.term)
        });
        fbService.saveResults();
      }
    })
  }
}
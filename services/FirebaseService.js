var firebase = require('firebase');
var keys = require('../keys');
const axios = require('axios');
var config = keys.firebase_config;
firebase.initializeApp(config);
var database = firebase.database();


class FirebaseService {
  constructor(data) {
    this.data = data;
  }

  removeSpaces(string) {
    console.log('string to remove space: ' + string);
    const term = string.split("");
    for (let i = 0; i < term.length; i++) {
      if (term[i] === " ") {
        term.splice(i, 1);
      }
    }
    return term.join("");
  }

  async saveResults() {
    let that = this;
    if (!this.data.results) null;
    var id = this.removeSpaces(this.data.term);
    return await database.ref(`recipes/${id}`).set({
      searchTerm: this.data.term,
      type: this.data.type,
      results: this.data.results
    }).then(async function () {
      that.data.searchKey = id;
      return await that.getRecipes();
    }).catch(function (err) {
      console.log('err:', err);
    });
  };

  async findSearchResults() {
    if (!this.data.key) null;
    const keyRef = database.ref(`recipes/${this.data.key}`);
    const that = this;
    await keyRef.on("value", function (snapshot) {
      that.data.term = snapshot.val().searchTerm;
      that.data.type = snapshot.val().type;
      that.data.results = snapshot.val().results;
    })
  }

  async deleteSearch() {
    if (!this.data.term) null;
    return await database.ref().child(`recipes/${this.removeSpaces(this.data.term)}`).remove().then(function () {
      return { statusCode: 202 }
    }).catch(function (err) {
      console.log('delete err: ' + err);
      return { statusCode: 404 };
    });
  }

  async deleteRecipe() {
    return await database.ref(`recipes/${this.data.key}/results`).child(`${this.data.index}`).remove().then(function () {
      return {
        statusCode: 202
      }
    }).catch(function () {
      return {
        statusCode: 404
      }
    })
  }


  async getSearchHistory() {
    return await database.ref("/recipes").once("value");
  }

  async getRecipes() {
    if (!this.data.searchKey) {
      return new Error("No search key provided");
    }
    return await database.ref(`/recipes/${this.data.searchKey}`).once("value");
  }

  async searchDish() {

    const that = this;
    const api_key = keys.dish;
    const api_id = keys.dish_id;
    const api_url = "https://api.edamam.com/search?app_id=" + api_id + "&app_key=" + api_key + "&q=" + this.data.term;
    const res = await axios.get(api_url);

    that.data.results = res.data.hits.map(hit => {
      return {
        dishName: hit.recipe.label,
        calories: hit.recipe.calories,
        ingredientLine: hit.recipe.ingredientLines,
        ingredients: hit.recipe.ingredients,
        image: hit.recipe.image,
        url: hit.recipe.url
      }
    });

    return await that.saveResults();
  }

  async searchDrink() {
    const that = this;
    const api_url = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=" + this.data.term;
    const response = await axios.get(api_url);
    that.data.results = response.data.drinks;
  }



  //getUser() {}

  //addUser() {}

  //deleteUser() {}

  /* 
  authUser() {

    for firebase auth to secure rules
    firebase.auth().signInWithEmailAndPassword('test@email.com', 'test123')
      .then((userCredentials) => {
        var user = userCredentials;
        console.log(user);
      })
      .catch((error) => {
        console.log(error.message);
      });
    }
  */
}

module.exports = {
  FirebaseService: FirebaseService
};
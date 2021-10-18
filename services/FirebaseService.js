const admin = require('./fbAdmin');
const database = admin.database();

class FirebaseService {
  constructor(data) {
    this.data = data;
  }

  removeSpaces(string) {
    const term = string.split("");
    for (let i = 0; i < term.length; i++) {
      if (term[i] === " ") {
        term.splice(i, 1);
      }
    }
    return term.join("");
  }

  async saveResults() {
    if (!this.data.results) null;
    if (this.data.uid) delete this.data.uid;
    return await database.ref(`recipes/${this.data.type}`).push({
      results: this.data.results,
      searchTerm: this.data.searchTerm,
      type: this.data.type
    })
      .then(async function (snapshot) {
        console.log('ss:', snapshot.key);
        return snapshot.key;
      }).catch(function (err) {
        console.log('save err:', err);
        return false;
      });
  };

  async saveToUserSearches(recipesKey, resultsLength) {
    if (!this.data.uid) null;
    let resultsIndexes = [];
    for (let i = 0; i < resultsLength; i++) {
      resultsIndexes.push(i);
    }
    return await database.ref(`users/${this.data.uid}/recipes/${this.data.type}/${recipesKey}`).set({
      searchTerm: this.data.searchTerm,
      resultsIndexes: resultsIndexes
    }).then((res) => {
      return true
    }).catch(function (err) {
      console.log("save to user searches err: " + err);
      return false;
    });
  }

  async findSearchResults() {
    if (!this.data.searchTerm) null;
    const keyRef = database.ref(`recipes/${this.removeSpaces(this.data.searchTerm)}`);
    const that = this;
    await keyRef.on("value", function (snapshot) {
      that.data.searchTerm = snapshot.val().searchTerm;
      that.data.type = snapshot.val().type;
      that.data.results = snapshot.val().results;
    })
  }

  async deleteSearch() {
    if (!this.data.dbKey || !this.data.type || !this.data.uid) null;
    return await database.ref()
      .child(`users/${this.data.uid}/recipes/${this.data.type}/${this.data.dbKey}`)
      .remove()
      .then(function (response) {
        return { statusCode: 202 };
      })
      .catch(function (err) {
        return err;
      })

  }

  async deleteRecipe() {
    if (!this.data.dbKey || !this.data.type || !this.data.uid || !this.data.resultsIndex) null;
    return await database.ref()
      .child(`users/${this.data.uid}/recipes/${this.data.type}/${this.data.dbKey}/resultsIndexes/${this.data.resultsIndex}`)
      .remove()
      .then(function (response) {
        return { statusCode: 202 };
      })
      .catch(function (err) {
        return err;
      })
  }

  async getSearchHistory() {
    let recipes = await database.ref(`/users/${this.data.idToken}/recipes`).once("value");
    return recipes.val();
  }

  async getRecipes() {
    if (!this.data.dbKey) {
      return new Error("No search key provided");
    }

    let recipes = await database.ref(`/recipes/${this.data.type}/${this.data.dbKey}`).once("value").then((snapshot) => {
      return snapshot.val();
    })
      .catch(err => {
        return err;
      });
    return recipes;
  }

  async getSearchesByType() {
    if (!this.data.type) return null;
    const recipes = await database.ref(`/recipes/${this.data.type}`).once("value");
    return recipes.val();
  }

  async getUsers() {
    let users = await database.ref('users').once("value");
    return users;
  }

  async signUpUser() {
    if (!this.data) {
      return false;
    }
    let user = { ...this.data };
    database.ref('users/' + this.data.uid)
      .set({ email: user.user.email, username: user.user.username, recipes: user.user.recipes });
    return uid;
  }

  async getUserByUID() {
    let user = await database.ref(`users/${this.data.uid}`).once('value');
    return user.val();
  }
}

module.exports = {
  FirebaseService: FirebaseService
};
class RecipesView {
  constructor(data = null) {
    this.data = data;
  }

  deleteSingleRecipe(cb) {
    const that = this;
    $.ajax({
      url: `users/auth/recipes/${this.data.type}/${this.data.dbKey}/${this.data.recipeResultsIndex}`,
      type: 'DELETE',
      dataType: 'JSON'
    }).then(function (response) {
      if (response.statusCode === 202) {
        cb(that.data);
      }
    }).catch(err => {
      console.log('delete error: ', err);
    })
  }

  getHistoryItemRecipes(cb) {
    $.getJSON(`/recipes/${this.data[0]}/${this.data[1]}`, async function (response) {
      response.resultsIndexes = response.resultsIndexes.filter(element => {
        return element !== null
      })
      cb(response);
    });
  }

  showNewResults() {
    let resultsIndexes = [];
    for (let i = 0; i < this.data.data.results.length; i++) {
      resultsIndexes.push(i);
    }
    const recipesToDisplay = new HistoryItem({ searchTerm: this.data.data.searchTerm, index: this.data.data.key }, this.data.data.key, this.data.data.type, this.data.data.results, resultsIndexes, true);
    this.data.type === "ingredients" ? recipesToDisplay.display($("#ingredients-history").children().length + 1) : recipesToDisplay.display();
    recipesToDisplay.showRecipes();
  }

  resetRecipesView(cb) {
    $.getJSON(`/recipes/${this.data.type}/${this.data.dbKey}`, function (response) {
      response.resultsIndexes = response.resultsIndexes.filter(element => {
        return element !== null
      });
      cb(response);
    })
  }


}
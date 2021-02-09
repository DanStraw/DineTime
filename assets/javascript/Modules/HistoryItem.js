class HistoryItem {
  constructor(term = null, id, type = null, results = null) {
    this.term = term;
    this.id = id;
    this.type = type;
    this.results = results;
  }

  display() {
    var searchTermDiv = $('<div>');
    searchTermDiv.append(this.term);
    searchTermDiv.addClass('history');
    searchTermDiv.attr({ "id": this.id + "-hist", "value": this.type })
    var histItem = $("<li>");
    histItem.attr("id", this.id + "histdiv");
    var deleteButton = $("<button>")
    deleteButton.addClass("delete");
    deleteButton.attr("value", this.term);
    deleteButton.append("x");
    histItem.append(searchTermDiv);
    histItem.append(deleteButton);
    if (this.type === 'drink') {
      $("#drink-history").append(histItem);
    } else {
      $("#dish-history").append(histItem);
    }
  }

  showRecipes() {
    var resultsView = $('<div>');
    resultsView.attr("id", this.id);
    this.results.forEach(result => {
      const recipe = new Recipe(result);
      resultsView.append(recipe.display());
      $("#food-drink-view").prepend(resultsView);
      autoScroll(document.querySelector("#results-panel"));
    })
  }

  delete() {
    const results = new FirebaseService({
      key: this.id
    })
    results.delete();
  }
}
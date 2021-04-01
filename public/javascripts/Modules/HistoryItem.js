class HistoryItem {
  constructor(itemData = null, id, type = null, results = null, resultIndexes = [], userIsAuthroized = false) {
    this.itemData = itemData;
    this.id = id;
    this.type = type;
    this.results = results;
    this.resultIndexes = resultIndexes;
    this.userIsAuthroized = userIsAuthroized;
  }

  display() {
    var searchTermDiv = $('<div>');
    searchTermDiv.append(this.itemData.searchTerm || this.itmeData);
    searchTermDiv.addClass('history');
    searchTermDiv.attr({ "id": this.id + "-hist", "value": this.type + "-" + this.itemData.index })
    var histItem = $("<li>");
    histItem.attr("id", this.id + "histdiv");
    histItem.append(searchTermDiv);
    var deleteButton = $("<button>")
    deleteButton.addClass("delete");
    deleteButton.attr("value", this.itemData.searchTerm || this.itemData);
    deleteButton.append("x");
    histItem.append(deleteButton);

    if (this.type === 'drink') {
      $("#drink-history").append(histItem);
    } else {
      $("#dish-history").append(histItem);
    }
  }

  showRecipes() {
    var resultsView = $('<div>');
    resultsView.attr({ "id": this.id, "class": "row" });
    if (!this.results) return null;
    if (typeof this.results === "object") {
      for (let result in this.results) {
        if (this.results[result] !== null) {
          const recipe = new Recipe(this.itemData.searchTerm || this.itemData, this.results[result], this.resultIndexes[result], this.type, this.itemData.index, this.userIsAuthroized);
          resultsView.append(recipe.display());
          $("#food-drink-view").prepend(resultsView);
          autoScroll(document.querySelector("#results-panel"));
        }
      }
    } else {
      this.results.forEach((result, index) => {
        const recipe = new Recipe(this.itemData.searchTerm || this.itmeData, result, index, this.type, this.itemData.index);
        resultsView.append(recipe.display());
        $("#food-drink-view").prepend(resultsView);
        autoScroll(document.querySelector("#results-panel"));
      })
    }
  }
}
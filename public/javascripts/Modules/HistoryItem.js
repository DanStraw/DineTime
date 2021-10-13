class HistoryItem {
  constructor(itemData = null, id, type = null, results = null, resultIndexes = [], userIsAuthroized = false) {
    this.itemData = itemData;
    this.id = id;
    this.type = type;
    this.results = results;
    this.resultIndexes = resultIndexes;
    this.userIsAuthroized = userIsAuthroized;
  }

  display(ingredientSearchCount = 0) {
    var searchTermDiv = $('<div>');
    let historyText = "";
    if (this.type === "ingredients") {
      let ing_string = "";
      for (const term in this.itemData.searchTerm) {
        ing_string += ing_string === "" ? this.itemData.searchTerm[term] : `, ${this.itemData.searchTerm[term]}`;
      }
      historyText = "Ingredient Search " + ingredientSearchCount;
      searchTermDiv.attr({ "data-toggle": "popover", "data-trigger": "focus", "title": ing_string });
    } else {
      historyText = this.itemData.searchTerm
    }
    searchTermDiv.append(historyText);
    searchTermDiv.addClass('history');
    searchTermDiv.attr({ "id": this.type + "__" + this.id + "__hist" });
    var histItem = $("<li>");
    histItem.attr("id", this.id + "histdiv");
    histItem.append(searchTermDiv);
    var deleteButton = $("<button>")
    deleteButton.addClass("delete");
    deleteButton.attr({
      value: this.type + "__" + this.id,
      id: this.itemData.searchTerm + "-delete"
    });
    deleteButton.append("x");
    histItem.append(deleteButton);

    if (this.type === 'drink') {
      $("#drink-history").append(histItem);
    } else if (this.type === "ingredients") {
      $("#ingredients-history").append(histItem);
    } else {
      $("#dish-history").append(histItem);
    }
  }

  showRecipes() {
    var resultsView = $('<div>');
    resultsView.attr({ "id": this.id, "class": "row" });
    if (!this.results) return null;
    $('#results-header-text').text(" Top Results - " + this.itemData.searchTerm);
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

  deleteSearchFromUsersHistory(cb) {
    $.ajax({
      url: `/users/auth/recipes/${this.itemData.type}/${this.itemData.key}`,
      type: 'DELETE',
      dataType: 'JSON'
    }).then(function (response) {
      if (response.statusCode === 202) {
        cb();
      }
    }).catch(err => {
      console.log('delete err:', err);
    })
  }


}
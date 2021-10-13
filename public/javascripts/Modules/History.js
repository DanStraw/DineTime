class History {
  constructor(data = null) {
    this.data = data;
  }

  toggleHistoryList(id, parent) {
    $(id).is(":visible") ? $(id).hide() : $(id).show();
    $(id).is(":visible") ? parent.children("h4").children("span").text("-") : parent.children("h4").children("span").text("+");
  }

  getSearchHistory() {
    $.getJSON('/recipes', function (data) {
      let ingredientSearchCount = 0;
      for (const recipeType in data.data) {
        for (const dbKey in data.data[recipeType]) {
          if (recipeType === "ingredients") {
            ingredientSearchCount++;
          }
          let itemData = data.data[recipeType][dbKey];
          if (itemData === null) continue;
          let historyItem = new HistoryItem(itemData, dbKey, recipeType);
          historyItem.display(ingredientSearchCount);
          $("#ingredients-history").hide();
        }
      }
    })
  }
}


$("#drink-div").on("click", function () {
  new History().toggleHistoryList(`#${$('#drink-div').attr("value")}`, $('#drink-div'));
});

$("#ingredients-div").on("click", function () {
  new History().toggleHistoryList(`#${$('#ingredients-div').attr("value")}`, $('#ingredients-div'));
});
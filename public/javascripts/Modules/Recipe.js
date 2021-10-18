class Recipe {
  constructor(term, data, index, type, searchHistoryIndex, userIsAuthorized) {
    this.term = term;
    this.data = data;
    this.index = index;
    this.type = type;
    this.searchHistoryIndex = searchHistoryIndex;
    this.userIsAuthorized = userIsAuthorized;

  }

  addInfo(_type, _html_attr, _text) {
    let info = $(`${_type}`);
    for (const key in _html_attr) {
      info.attr(key, _html_attr[key]);
    }
    _text ? info.text(_text) : null;
    return info;
  }

  generateIngredientsList(ingredientLines, _id) {

    let list = $('<ol>');
    list.attr("id", _id);
    if (typeof ingredientLines === "object") {
      for (let ingredientLine in ingredientLines) {

        list.append(`<li>${ingredientLines[`${ingredientLine}`]}</li>`);
      }
    } else {
      ingredientsLine.forEach(ingredient => {
        list.append(`<li>${ingredient}</li>`);
      });
    }
    return list;
  }

  generateListItems(listDiv, list) {
    list.forEach(item => listDiv.append(`<li>${item}</li>`));
    return listDiv;
  }

  showMatchPercentage(percentage) {
    let matchDiv = $('<div>');
    matchDiv.text(percentage.toFixed(1) + "% match");
    matchDiv.attr("class", `match-text ${this.getMatchClass(percentage)}`);
    return matchDiv;
  }

  getMatchClass(percentage) {
    if (percentage >= 90) {
      return "match-a";
    } else if (percentage >= 80) {
      return "match-b";
    } else if (percentage >= 70) {
      return 'match-c';
    } else if (percentage >= 60) {
      return 'match-d';
    } else {
      return 'match-e';
    }
  }

  display() {
    let recipeData = this.data.recipe ? this.data.recipe : this.data;
    let resultDiv = this.addInfo('<div>', { "class": 'resultItem col-md-5 offset-md-1', id: `resultItem-${this.index}` });
    const headerRow = this.addInfo('<div>', { "class": "row" }, null);
    var heading = this.addInfo("<h3>", { 'class': 'item-name col-12 col-md-9' }, recipeData.drinkName || recipeData.strDrink || recipeData.label || recipeData.dishName);
    if (this.type === "ingredients") {
      this.term = JSON.stringify(this.term);
    }
    const deleteVal = removeSpaces(removeCommas(this.term));
    const deleteButton = this.addInfo('<button>', { 'class': 'col-md-2 delete-item btn btn-outline-secondary', 'value': deleteVal + "-" + this.index, 'type': "button", 'data-trigger': "hover", 'data-toggle': 'popover', 'title': `Delete '${heading.text()}' recipe`, "id": `${this.type}__${this.searchHistoryIndex}__recipe__${this.index}__delete-button` }, 'X');
    var image = this.addInfo("<img>", { "src": recipeData.picture || recipeData.image || recipeData.strDrinkThumb });

    recipeData.ingredientLines = [];
    let count = 0;

    if (this.type === "drink") {
      for (let key in recipeData) {
        if (key.includes("strIngredient") && (recipeData[key] !== null)) {
          count++;
        }
      }
      for (let i = 1; i <= count; i++) {
        recipeData.ingredientLines.push(recipeData[`strMeasure${i}`] + " " + recipeData[`strIngredient${i}`]);
      }
    } else {
      recipeData.ingredients.forEach(ingredient => recipeData.ingredientLines.push(ingredient.text));
    }

    var recipe = this.generateIngredientsList(recipeData.ingredientLines.length > 0 ? recipeData.ingredientLines : recipeData.ingredientLine, "recipe");
    var misc = this.addInfo("<p>", null, (recipeData.calories ? "Calories: " + Math.round(recipeData.calories) : recipeData.type));
    const instruction_attributes = recipeData.strInstructions ? { "id": "instructions" } : { "id": "instructions", "href": (recipeData.url || recipeData.recipe), "title": recipeData.dishName + " Recipe" };
    var instructions = this.addInfo((recipeData.strInstructions ? "<p>" : "<a>"), instruction_attributes, (!recipeData.strInstructions ? "Link to Recipe" : recipeData.strInstructions));

    this.userIsAuthorized ? headerRow.append(heading).append(deleteButton) : headerRow.append(heading);
    resultDiv.append(headerRow);

    resultDiv.append(image);
    if (this.data.matchPercentage) resultDiv.append(this.showMatchPercentage(this.data.matchPercentage));

    if (this.type === "ingredients") {
      let usedIngDiv = $("<ul>");
      usedIngDiv = this.generateListItems(usedIngDiv, this.data.usedIngredients);
      resultDiv.append(this.addInfo("<h4>", null, "You Have:"));
      resultDiv.append(usedIngDiv);

      if (this.data.neededIngredients) {
        let neededIngDiv = $("<ul>");
        neededIngDiv = this.generateListItems(neededIngDiv, this.data.neededIngredients);
        resultDiv.append(this.addInfo("<h4>", null, "What You Need:"));
        resultDiv.append(neededIngDiv);
      }

      if (this.data.unUsedIngredients && this.data.unUsedIngredients.length > 0) {
        let unUsedIngDiv = $("<ul>");
        unUsedIngDiv = this.generateListItems(unUsedIngDiv, this.data.unUsedIngredients);
        resultDiv.append(this.addInfo("<h4>", null, "What You Don't Need:"));
        resultDiv.append(unUsedIngDiv);
      }
    }


    resultDiv.append(this.addInfo("<h4>", null, "Full Recipe"));
    resultDiv.append(recipe);
    resultDiv.append(misc);
    resultDiv.append(instructions);

    return resultDiv;
  }
}
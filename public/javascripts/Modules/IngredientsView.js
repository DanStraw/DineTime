class IngredientsView {
  constructor(ingredients) {
    this.ingredients = ingredients;
  }

  showIngredients() {
    $('#ingredients-list').empty();
    this.ingredients.forEach((ingredient, index) => {
      let ingredientView = $('<button>');
      ingredientView.attr({ "id": ingredient, 'class': 'ingredient-item', 'disabled': 'true' });
      let ingredientDelete = $('<button>');
      ingredientDelete.attr({ "id": index, 'class': 'ingredient-item-delete', 'data-trigger': 'hover', 'data-toggle': 'popover', 'title': 'Remove Ingredient' })
      ingredientView.text(ingredient);
      ingredientDelete.text("X");
      $('#ingredients-list').append(ingredientView).append(ingredientDelete);
    });
  }
}
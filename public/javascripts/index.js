$("#food-drink-view").hide();
$("#drink-history").hide();
$("#dish-history").hide();
$("#food-ingredients-search").hide();

const ingredientSearch = new Search(null, 'ingredient');

const clearInputFields = function () {
    $("#ingredient-input").val("");
    $("#food-input").val("");
    $("#drink-input").val("");
}
const resetResultsView = function () {
    $("#food-drink-view").empty();
    $("#food-drink-view").show();
}

const clearSearchHisory = function () {
    $("#dish-history").empty();
    $("#drink-history").empty();
}

const types = ['food', 'drink'];
types.forEach(type => {
    $(`#search-${type}`).on("click", function (event) {
        event.preventDefault();
        var term = $(`#${type}-input`).val().trim();
        if (term === "") {
            clearInputFields();
            return swal("You left the search box empty");
        } else {
            clearInputFields();
            searchRecipes(term, type);
        }
    })
});

function searchRecipes(term, type) {
    resetResultsView();
    let search = new Search(term, type);
    if (search.findItem()) {
        return swal(`${term} is already in search history`)
    };
    let recipes;
    if (type === 'food') {
        search.dish().then(data => {
            recipes = data;
            const recipesToDisplay = new HistoryItem(recipes.searchTerm, removeSpaces(recipes.searchTerm), recipes.type, recipes.results);
            recipesToDisplay.display();
            recipesToDisplay.showRecipes();
        });
    } else {
        search.drink().then(data => {
            const results = data["results"];
            const type = data["type"];
            const searchTerm = data["searchTerm"]
            const recipesToDisplay = new HistoryItem(searchTerm, removeSpaces(searchTerm), type, results);
            recipesToDisplay.display();
            recipesToDisplay.showRecipes();
        });
    }


}

const toggleHistoryList = function (id) {
    $(id).is(":visible") ? $(id).hide() : $(id).show();
}

$("#dish-div").on("click", function () {
    toggleHistoryList(`#${$('#dish-div').attr("value")}`);
})
$("#drink-div").on("click", function () {
    toggleHistoryList(`#${$('#drink-div').attr("value")}`);
});

$("#add-ingredient").on('click', function (event) {
    event.preventDefault();
    let ingredient = $('#ingredient-input');
    ingredientSearch.addIngredient(ingredient[0].value);
    let ingredientsView = new IngredientsView(ingredientSearch.ingredients);
    ingredientsView.showIngredients();
    $('#ingredient-input').empty();
})

function deleteItemFromSearchHistory() {
    var searchTerm = $(this).val().trim();
    $.ajax({
        url: `/recipes/${removeSpaces(searchTerm)}`,
        type: 'DELETE',
        dataType: 'JSON'
    }).then(function (response) {
        if (response.statusCode === 202) {
            clearSearchHisory();
            getSearchHistory();
        }
    })
}

function deleteSingleRecipe() {
    var [searchTerm, index] = $(this).val().trim().split("-");
    console.log(searchTerm, index);
    $.ajax({
        url: `/recipes/${searchTerm}/${index}`,
        type: 'DELETE',
        dataType: 'JSON'
    }).then(function (response) {
        console.log('delete singl rec res: ' + response)
        if (response.statusCode === 202) {
            resetRecipesView(searchTerm);
        }
    })
}

function showHistoryItemRecipes() {
    resetResultsView();
    var searchTerm = $(this).text().trim();
    $.getJSON(`/recipes/${removeSpaces(searchTerm)}`, function (data) {
        const historyItem = new HistoryItem(data.searchTerm, removeSpaces(data.searchTerm), data.type, data.results);
        historyItem.showRecipes();
    })
}

function resetRecipesView(searchTerm) {
    $.getJSON(`/recipes/${removeSpaces(searchTerm)}`, function (data) {
        const historyItem = new HistoryItem(data.searchTerm, removeSpaces(data.searchTerm), data.type, data.results);
        historyItem.showRecipes();
    })
}

function getSearchHistory() {
    $.getJSON('/recipes', function (data) {
        for (let item in data) {
            let itemData = data[item];
            let historyItem = new HistoryItem(itemData.searchTerm, removeSpaces(itemData.searchTerm), itemData.type, itemData.results);
            historyItem.display();
        }
    })
}


$(document).ready(getSearchHistory);
$(document).on("click", ".history", showHistoryItemRecipes);
$(document).on("click", ".delete", deleteItemFromSearchHistory);
$(document).on("click", ".delete-item", deleteSingleRecipe);

$('#dish-type-select').change(function () {
    switch ($(this).val()) {
        case 'ingredients':
            $('#food-recipe-search').hide();
            $('#food-input').empty();
            $("#food-ingredients-search").show();
            break;
        default:
            $('#food-ingredients-search').hide();
            $('#ingredient-input').empty();
            $("#food-recipe-search").show();
            break;
    }
})
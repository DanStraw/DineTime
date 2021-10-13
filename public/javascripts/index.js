$("#food-drink-view").hide();
$("#drink-history").hide();
$("#dish-history").hide();
$("#food-ingredients-search").hide();
$('#signup-body').hide();
$('#history-panel').hide();
$('.loader').hide();

const clearInputFields = function () {
    $("#ingredient-input").val("");
    $("#food-input").val("");
    $("#drink-input").val("");
}
const resetResultsView = function () {
    console.log('reset results View');
    $("#food-drink-view").empty();
    $("#food-drink-view").show();
    $("#results-header-text").text("Top Results");
}

const clearSearchHisory = function () {
    $("#dish-history").empty();
    $("#drink-history").empty();
    $("#ingredients-history").empty();
}

const ingredientSearch = new Search(null, 'ingredient');
const types = ['food', 'drink', 'ingredients'];

types.forEach(type => {
    $(`#search-${type}`).on("click", function (event) {
        event.preventDefault();
        var term = type === "ingredients" ? ingredientSearch.ingredients : $(`#${type}-input`).val().trim();
        clearInputFields();
        if (term === "") {
            return swal("You left the search box empty");
        } else {
            resetResultsView();
            const recipeSearch = new Search(term, type);
            recipeSearch.searchRecipes();
            ingredientSearch.clearIngredients();
            $('#ingredients-list').empty();
        }
    })
});

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

$(document).ready(() => {
    const userAuth = new UserAuth(null);
    userAuth.verifyUserByToken(async (data) => {
        if (data.user !== null) {
            userAuth.displayLoggedInState();
            const history = new History();
            history.getSearchHistory();
        } else {
            userAuth.displayLoggedOutState();
        }
    })
});

$(document).on("click", ".history", function (event) {
    const params = event.target.id.split("__");;
    resetResultsView();
    const recipesView = new RecipesView(params);
    recipesView.getHistoryItemRecipes((data) => {
        const historyItem = new HistoryItem({ searchTerm: data.data.searchTerm, index: params[1] }, params[1], data.data.type, data.data.results, data.resultsIndexes, true);
        historyItem.showRecipes();
    });

});

$(document).on("click", ".delete", (event) => {
    event.preventDefault();
    const [type, key] = event.target.value.trim().split("__");
    const historySearchToDelete = new HistoryItem({ type, key });
    historySearchToDelete.deleteSearchFromUsersHistory(() => {
        clearSearchHisory();
        console.log(event.target.id);
        const displayedResults = $('#results-header-text').text().split(" - ")[1].trim();
        const deletedResults = event.target.id.split('-')[0].trim();
        console.log(displayedResults === deletedResults);
        if (displayedResults === deletedResults) resetResultsView();
        const history = new History();
        history.getSearchHistory();
    });
});
$(document).on("click", ".delete-item", (event) => {
    const idString = event.target.id.split("__");
    const data = {
        type: idString[0],
        dbKey: idString[1],
        recipeResultsIndex: idString[3]
    }
    $('#food-drink-view').empty();
    const recipesView = new RecipesView(data);
    recipesView.deleteSingleRecipe((res) => {
        const updatedView = new RecipesView({ type: res.type, dbKey: res.dbKey });
        updatedView.resetRecipesView((response) => {
            const historyItem = new HistoryItem({ searchTerm: response.data.searchTerm, index: data.dbKey }, data.dbKey, response.data.type, response.data.results, response.resultsIndexes, true);
            historyItem.showRecipes();
        });
    })
});
$(document).on('click', ".auth-toggle-button", () => {
    new UserAuth(null).toggleAuthForm();
});

$(document).on("click", "#dish-div", function () {
    let dishHistoryDisplay = new History(null);
    dishHistoryDisplay.toggleHistoryList(`#${$('#dish-div').attr("value")}`, $('#dish-div'));
})

$(document).on('click', "#signup-button", (event) => {
    event.preventDefault();
    const userInfo = {
        username: $("#signup-username").val().trim(),
        email: $("#signup-email").val().trim(),
        password: $("#signup-password").val().trim(),
        passwordConfirm: $("#signup-password-confirm").val().trim()
    }
    const newUser = new UserAuth(userInfo);
    newUser.signUpUser((data) => {
        const history = new History();
        history.getSearchHistory();
    });
});
$(document).on('click', "#login-button", (event) => {
    event.preventDefault();
    const email = $("#login-email").val();
    const password = $("#login-password").val();
    const returningUser = new UserAuth({ email, password });
    returningUser.loginUser((data) => {
        const history = new History();
        history.getSearchHistory();
    });
});
$(document).on('click', '#logout-icon', (event) => {
    event.preventDefault();
    const leavingUser = new UserAuth(null);
    leavingUser.logoutUser();
});
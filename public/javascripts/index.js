$("#food-drink-view").hide();
$("#drink-history").hide();
$("#dish-history").hide();
$("#food-ingredients-search").hide();
$('#signup-body').hide();
$('#history-panel').hide();

var config = {
    apiKey: "AIzaSyDFxvI2pF2TVAL8YxlTKiIJsA3zAT8wT1I",
    authDomain: "dinetime-c2874.firebaseapp.com",
    databaseURL: "https://dinetime-c2874.firebaseio.com",
    projectId: "dinetime-c2874",
    storageBucket: "",
    messagingSenderId: "647476940046"
};
let fb_app;


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
    $("#ingredients-history").empty();
}


const signupUser = function (event) {
    event.preventDefault();
    fb_app = firebase.initializeApp(config);
    fb_app.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    const userInfo = {
        username: $("#signup-username").val().trim(),
        email: $("#signup-email").val().trim(),
        password: $("#signup-password").val().trim(),
        passwordConfirm: $("#signup-password-confirm").val().trim()
    }


    fb_app.auth().createUserWithEmailAndPassword(userInfo.email, userInfo.password).then(({ user }) => {
        return user.getIdToken().then((idToken) => {
            userInfo.idToken = idToken;
            return $.ajax({
                url: `/users`,
                dataType: 'JSON',
                method: 'POST',
                data: userInfo
            })
        })
    }).then(response => {
        fb_app.delete();
        clearUserLogin();
        clearUserSignup();
        displayLoggedInState();
        getSearchHistory()
    }).catch(err => {
        fb_app.delete();
    })
}

const loginUser = function (event) {
    event.preventDefault();
    fb_app = firebase.initializeApp(config);
    fb_app.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    const email = $("#login-email").val();
    const password = $("#login-password").val();
    fb_app.auth().signInWithEmailAndPassword(email, password)
        .then(({ user }) => {
            user.getIdToken().then((idToken) => {
                $.ajax({
                    url: '/users/login',
                    dataType: 'JSON',
                    method: 'POST',
                    data: { idToken }
                }).then(response => {
                    fb_app.delete();
                    clearUserLogin();
                    clearUserSignup();
                    displayLoggedInState();
                    getSearchHistory();
                }).catch(err => {
                    return swal('Email or Password Incorrect');
                })
            })
        })
        .catch((error) => {
            fb_app.delete();
            var errorCode = error.code;
            var errorMessage = error.message;
            swal("Login Failed.  Please check your username and password and try again");
        });
}

function logoutUser(event) {
    event.preventDefault();
    fb_app = !firebase.apps.length ? firebase.initializeApp(config) : firebase.apps[0];
    fb_app.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    fb_app.auth().signOut().then(() => {
        $.getJSON(`/users/auth/logout`).then(() => {
            displayLoggedOutState();
            fb_app.delete();
        }).catch(err => {
            return err;
        })
    }).catch((error) => {
        console.log('auth logout error: ' + error);
    })
}

const toggleAuthForm = function () {
    if ($('#login-body').is(":hidden")) {
        $('#login-body').show();
        $('#signup-body').hide();
        $("#login-header-text").text("Login");
    } else {
        $('#login-body').hide();
        $('#signup-body').show();
        $("#login-header-text").text("Sign Up");
    }
}

const displayLoggedInState = function () {
    $("#history-panel").show();
    $("#login-panel").hide();
}

const displayLoggedOutState = function () {
    $("#history-panel").hide();
    $("#login-panel").show();
}

const types = ['food', 'drink', 'ingredients'];
types.forEach(type => {
    $(`#search-${type}`).on("click", function (event) {
        event.preventDefault();
        var term = type === "ingredients" ? ingredientSearch.ingredients : $(`#${type}-input`).val().trim();
        if (term === "") {
            clearInputFields();
            return swal("You left the search box empty");
        } else {
            clearInputFields();
            searchRecipes(term, type);
            ingredientSearch.clearIngredients();

        }
    })
});

async function searchRecipes(term, type) {
    resetResultsView();
    let search = new Search(term, type);
    const userMatch = await search.userHistory();
    if (userMatch.match) {
        return swal(`${type} search of ${term} is already in your history`);
    }
    const recipeCollectionMatch = await search.recipeHistory();
    if (recipeCollectionMatch.isMatch) {
        search.addToUserHistory(recipeCollectionMatch.recipes.data.results.length).then(async (response) => {
            const { index } = response;
            let { recipes } = recipeCollectionMatch;
            const recipesToDisplay = new HistoryItem({ searchTerm: recipes.searchTerm, index }, removeSpaces(recipes.searchTerm), recipes.type, recipes.results, true);
            recipesToDisplay.display();
            recipesToDisplay.showRecipes();
        });

    } else {
        await search.newRecipe(type).then(data => {
            search.addToUserHistory(data.results.length, data.key)
                .then(() => {
                    showNewResults(type, data);
                    const ingredientsView = new IngredientsView(ingredientSearch.ingredients);
                    ingredientsView.showIngredients();
                })
                .catch(err => {
                    console.log('user not logged in');
                    showNewResults(type, data);
                })
        })
            .catch(() => swal("No recipes found")); 14
    }
}

const showNewResults = function (type, data) {
    let resultsIndexes = [];
    for (let i = 0; i < data.results.length; i++) {
        resultsIndexes.push(i);
    }
    if (type === "ingredients") {
        const recipesToDisplay = new HistoryItem({ searchTerm: data.searchTerm, index: data.key }, data.key, data.type, data.results, resultsIndexes, true);
        recipesToDisplay.display($("#ingredients-history").children().length + 1);
        recipesToDisplay.showRecipes();
    } else {
        const recipesToDisplay = new HistoryItem({ searchTerm: data.searchTerm, index: data.key }, data.key, data.type, data.results, resultsIndexes, true);
        recipesToDisplay.display();
        recipesToDisplay.showRecipes();
    }
}

const toggleHistoryList = function (id, parent) {
    $(id).is(":visible") ? $(id).hide() : $(id).show();

    $(id).is(":visible") ? parent.children("h4").children("span").text("-") : parent.children("h4").children("span").text("+");
}

$("#dish-div").on("click", function () {
    toggleHistoryList(`#${$('#dish-div').attr("value")}`, $('#dish-div'));
})
$("#drink-div").on("click", function () {
    toggleHistoryList(`#${$('#drink-div').attr("value")}`, $('#drink-div'));
});

$("#ingredients-div").on("click", function () {
    toggleHistoryList(`#${$('#ingredients-div').attr("value")}`, $('#ingredients-div'));
});

$("#add-ingredient").on('click', function (event) {
    event.preventDefault();
    let ingredient = $('#ingredients-input');
    ingredientSearch.addIngredient(ingredient[0].value);
    let ingredientsView = new IngredientsView(ingredientSearch.ingredients);
    ingredientsView.showIngredients();
    $('#ingredients-input').val("");
    $('#ingredients-input').focus();
});

function removeTermFromIngredientSearchList(event) {
    event.preventDefault();
    const index = $(this).attr("id");
    ingredientSearch.removeIngredient(index);
    let ingredientsView = new IngredientsView(ingredientSearch.ingredients);
    ingredientsView.showIngredients();
    $('#ingredients-input').val("");
}

function deleteItemFromSearchHistory(event) {
    event.preventDefault();
    var searchTerm = $(this).val().trim();
    const values = searchTerm.split("__");
    const type = values[0];
    const key = values[1];
    $.ajax({
        url: `/users/auth/recipes/${type}/${key}`,
        type: 'DELETE',
        dataType: 'JSON'
    }).then(function (response) {
        if (response.statusCode === 202) {
            clearSearchHisory();
            getSearchHistory();
        }
    })
}

function clearUserLogin() {
    $('#login-email:text').val("");
    $('input[type="password"]').val('');
}
function clearUserSignup() {
    $("#signup-email:text").val("");
    $("#signup-username:text").val("");
    $('input[type="password"]').val('');
}

function deleteSingleRecipe() {
    var [searchTerm] = $(this).val().trim().split("-");
    const idString = $(this).attr('id').split("__");
    const type = idString[0];
    const dbKey = idString[1];
    const recipeResultsIndex = idString[3];
    $.ajax({
        url: `users/auth/recipes/${type}/${dbKey}/${recipeResultsIndex}`,
        type: 'DELETE',
        dataType: 'JSON'
    }).then(function (response) {
        if (response.statusCode === 202) {
            resetRecipesView(type, dbKey);
        }
    }).catch(err => {
        console.log('delete error: ', err);
    })
}

function showHistoryItemRecipes() {
    resetResultsView();
    let params = $(this).attr("id").split("__");
    $.getJSON(`/recipes/${params[0]}/${params[1]}`, function (response) {
        response.resultsIndexes = response.resultsIndexes.filter(element => {
            return element !== null
        })
        const historyItem = new HistoryItem({ searchTerm: response.data.searchTerm, index: params[1] }, params[1], response.data.type, response.data.results, response.resultsIndexes, true);
        historyItem.showRecipes();
    })
}

function resetRecipesView(type, dbKey) {
    $('#food-drink-view').empty();
    $.getJSON(`/recipes/${type}/${dbKey}`, function (response) {
        response.resultsIndexes = response.resultsIndexes.filter(element => {
            return element !== null
        });
        const historyItem = new HistoryItem({ searchTerm: response.data.searchTerm, index: dbKey }, dbKey, response.data.type, response.data.results, response.resultIndexes, true);
        historyItem.showRecipes();
    })
}

function getSearchHistory() {
    $.getJSON('/recipes', function (data) {
        displayLoggedInState();
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

$(document).ready(getSearchHistory);
$(document).on("click", ".history", showHistoryItemRecipes);
$(document).on("click", ".delete", deleteItemFromSearchHistory);
$(document).on("click", ".delete-item", deleteSingleRecipe);
$(document).on('click', ".auth-toggle-button", toggleAuthForm);
$(document).on('click', "#signup-button", signupUser);
$(document).on('click', "#login-button", loginUser);
$(document).on('click', '#logout-icon', logoutUser);
$(document).on('click', ".ingredient-item-delete", removeTermFromIngredientSearchList);

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
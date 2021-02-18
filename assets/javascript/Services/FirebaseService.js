class FirebaseService {
  constructor(data) {
    this.data = data;
  }

  saveResults() {
    if (!this.data.results) null;
    var id = removeSpaces(this.data.term);
    database.ref(`${id}`).set({
      searchTerm: this.data.term,
      type: this.data.type,
      results: this.data.results
    }).then(function () {
      console.log('item saved');
    }).catch(function (error) {
      console.log('e', error);
    });
  };

  findSearchResults() {
    if (!this.data.key) null;
    const keyRef = database.ref(this.data.key);
    const that = this;
    keyRef.on("value", function (snapshot) {
      that.data.term = snapshot.val().searchTerm;
      that.data.type = snapshot.val().type;
      that.data.results = snapshot.val().results;
    })
  }

  delete() {
    if (!this.data.key) null;
    database.ref().child(this.data.key).remove();
  }

  deleteRecipe() {
    this.data.results.splice(this.data.index, 1);
  }

}
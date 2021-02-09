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
  }

  delete() {
    if (!this.data.key) null;
    database.ref().child(this.data.key).remove();
  }

}
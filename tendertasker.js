Weeks = new Mongo.Collection('weeks');

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    weeks:function() {
      return Weeks.find({deleted: {$ne: true}}, {sort: {createdAt: -1}});
    },
  });

  Template.body.events({
    'submit .new-week': function(event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;

      // Insert a week into the collection
      Weeks.insert({
        text: text,
        createdAt: new Date(), // current time
      });

      // Clear form
      event.target.text.value = '';
    },
  });

  Template.week.events({
    'click .toggle-checked': function() {
      // Set the checked property to the opposite of its current value
      Weeks.update(this._id, {
        $set: {checked: !this.checked},
      });
    },

    'click .delete': function() {
      // SOFT DELETE
      Weeks.update(this._id, {
        $set: {deleted: true},
      });
    },
  });
}

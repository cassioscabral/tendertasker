Weeks = new Mongo.Collection('weeks');

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    weeks:function() {
      if (Session.get('hideCompleted')) {
        return Weeks.find({deleted: {$ne: true}, checked: {$ne: true}}, {sort: {createdAt: -1}});

      } else {
        return Weeks.find({deleted: {$ne: true}}, {sort: {createdAt: -1}});
      }
    },

    hideCompleted: function() {
      return Session.get('hideCompleted');
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

    'change .hide-completed input': function (event) {
      Session.set('hideCompleted', event.target.checked);
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

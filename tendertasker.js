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
      Meteor.call('addWeek', text);

      // Clear form
      event.target.text.value = '';
    },

    'change .hide-completed input': function(event) {
      Session.set('hideCompleted', event.target.checked);
    },
  });

  Template.week.events({
    'click .toggle-checked': function() {
      // Set the checked property to the opposite of its current value
      Meteor.call('setChecked', this._id, !this.checked);
    },

    'click .delete': function() {
      // SOFT DELETE
      Meteor.call('deleteWeek', this._id);
    },
  });

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY',
  });

}

Meteor.methods({
  addWeek: function(text) {
    // Make sure the user is logged in before inserting a task
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Weeks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
    });
  },

  deleteWeek: function(weekId) {
    Weeks.update(weekId, {
      $set: {deleted: true},
    });
  },

  setChecked: function(weekId, setChecked) {
    Weeks.update(weekId, { $set: { checked: setChecked} });
  },
});

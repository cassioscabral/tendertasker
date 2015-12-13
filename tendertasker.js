Weeks = new Mongo.Collection('weeks');
Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('weeks', function() {
    return Weeks.find({ owner: this.userId });
  });

  Meteor.publish('tasks', function() {
    return Tasks.find({ owner: this.userId });
  });
}

if (Meteor.isClient) {
  Meteor.subscribe('weeks');
  Meteor.subscribe('tasks');

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

  Template.weekInfo.helpers({
    tasks: function() {
      return Tasks.find({}); // TODO pull only from the selected week
    },
  });

  Template.task.helpers({

  });

  Template.task.events({
    'click .delete-task': function() {
      Meteor.call('deleteTask', this._id);
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

    'submit .new-task': function(event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;
      var percentage = event.target.percentage.value;

      // Insert a week into the collection
      Meteor.call('addTask', text, percentage);

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

    'click .delete-week': function() {
      // SOFT DELETE
      Meteor.call('deleteWeek', this._id);
    },
  });

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY',
  });

}

// WEEK
Meteor.methods({
  addWeek: function(text) {
    // Make sure the user is logged in before inserting a week
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

  // TASK
  addTask: function(text, percentage) {
    // Make sure the user is logged in before inserting a week
    if (!Meteor.userId()) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.insert({
      text: text,
      percentage: percentage,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
    });
  },

  deleteTask: function(taskId) {
    Tasks.remove(taskId);
  },
});

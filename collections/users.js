Users = Meteor.users;

// Search subscribe mongodb fields ['username', 'profile.name']
Users.initEasySearch(['username', 'profile.name'], {
    use: 'mongo-db'
});


// HELPERS
Users.helpers({
    boards: function() {
        return Boards.find({ userId: this._id });
    },
    hasStarred: function(boardId) {
        return this.profile.starredBoards && _.contains(this.profile.starredBoards, boardId);
    },
    isBoardMember: function() {
        var board = Boards.findOne(Router.current().params.boardId);
        return _.contains(_.pluck(board.members, 'userId'), this._id);
    },
    isBoardAdmin: function() {
        var board = Boards.findOne(Router.current().params.boardId);
        return this.isBoardMember(board) && _.where(board.members, {userId: this._id})[0].isAdmin;
    }
});


// BEFORE HOOK
Users.before.insert(function (userId, doc) {

    // connect profile.status default
    doc.profile.status = 'offline';

    // slugify to username
    doc.username = getSlug(doc.profile.name, '');
});


// AFTER HOOK
isServer(function() {
    Users.after.insert(function(userId, doc) {
        var ExampleBoard = {
            title: 'Welcome Board',
            userId: doc._id,
            permission: 'Private' // Private || Public
        };

        // Welcome Board insert and list, card :)
        Boards.insert(ExampleBoard, function(err, boardId) {

            // lists
            _.forEach(['Basics', 'Advanced'], function(title) {
                var list = {
                    title: title,
                    boardId: boardId,
                    userId: ExampleBoard.userId
                };

                // insert List
                Lists.insert(list);
            });
        });
    });
});

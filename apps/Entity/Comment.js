class Comment {
    _id;
    MovieId;
    UserId;
    Content;
    CreatedAt;

    constructor() {
        this.CreatedAt = new Date();
    }
}

module.exports = Comment;

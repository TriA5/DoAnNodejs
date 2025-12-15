class Bookmark {
    _id;
    UserId;
    MovieId;
    CreatedTime;

    constructor() {
        this.CreatedTime = new Date();
    }
}
module.exports = Bookmark;
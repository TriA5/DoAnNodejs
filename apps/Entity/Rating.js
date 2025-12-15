class Rating {
    _id;
    UserId;
    MovieId;
    Value; // 1 - 5
    CreatedTime;

    constructor() {
        this.CreatedTime = new Date();
    }
}
module.exports = Rating;
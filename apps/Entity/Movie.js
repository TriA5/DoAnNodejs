class Movie {
    _id;
    Title;
    Description;
    Year;
    Duration;
    Poster;
    Thumbnail;
    TrailerUrl;
    CategoryIds;
    Genres;
    Rating;
    ViewCount;

    constructor() {
        this.CategoryIds = [];
        this.Genres = [];
        this.Rating = 0;
        this.ViewCount = 0;
    }
}

module.exports = Movie;

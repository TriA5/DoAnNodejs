class History {
  _id;
  UserId;
  MovieId;
  Episode;
  Time;
  CurrentTime;
  Duration;
  LastWatched;

  constructor() {
    this.Time = 0;
    this.CurrentTime = 0;
    this.Duration = 0;
    this.LastWatched = new Date();
  }
}

module.exports = History;

class HistoryRepository {
  context;
  session;

  constructor(context, session = null) {
    this.context = context;
    this.session = session;
  }

  async saveHistory(history) {
    return await this.context
      .collection("history")
      .updateOne(
        { UserId: history.UserId, MovieId: history.MovieId },
        { $set: history },
        { upsert: true, session: this.session }
      );
  }

  async getHistory(userId) {
    return await this.context
      .collection("history")
      .find({ UserId: userId })
      .toArray();
  }

  // Cập nhật thời gian xem hiện tại của userId, movieId, episode, currentTime, duration
  async updateProgress(userId, movieId, episode, currentTime, duration) {
    const updateData = {
      UserId: userId,
      MovieId: movieId,
      Episode: episode,
      CurrentTime: currentTime,
      Duration: duration,
      LastWatched: new Date(),
      Time: Date.now(),
    };

    return await this.context
      .collection("history")
      .updateOne(
        { UserId: userId, MovieId: movieId, Episode: episode },
        { $set: updateData },
        { upsert: true, session: this.session }
      );
  }

  // Lấy thông tin tiến trình xem userId, movieId, episode
  async getProgress(userId, movieId, episode) {
    return await this.context.collection("history").findOne({
      UserId: userId,
      MovieId: movieId,
      Episode: episode,
    });
  }

  // Xóa tiến trình xem
  async clearProgress(userId, movieId, episode) {
    return await this.context
      .collection("history")
      .updateOne(
        { UserId: userId, MovieId: movieId, Episode: episode },
        { $set: { CurrentTime: 0 } },
        { session: this.session }
      );
  }
}

module.exports = HistoryRepository;

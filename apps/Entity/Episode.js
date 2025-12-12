class Episode {
    _id;
    Name;       // Tên tập: "Tập 1", "Full"
    MovieId;    // Thuộc phim nào
    Path;       // Đường dẫn file .m3u8 (QUAN TRỌNG)
    Duration;   // Thời lượng
    CreatedTime;

    constructor() {
        this.CreatedTime = new Date();
    }
}
module.exports = Episode;
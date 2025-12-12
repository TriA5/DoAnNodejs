class Movie {
    _id;
    Name;           // Tên phim
    OriginName;     // Tên gốc (Tiếng Anh)
    Slug;           // Đường dẫn SEO
    Content;        // Mô tả nội dung
    Type;           // 'single' (Phim lẻ) hoặc 'series' (Phim bộ)
    Status;         // 'completed', 'ongoing', 'trailer'
    Thumb;          // URL Poster phim
    CategoryId;     // ID Thể loại (ObjectId)
    Time;           // Thời lượng (VD: 120 phút)
    Year;           // Năm phát hành
    View;           // Lượt xem
    CreatedTime;

    constructor() {
        this.View = 0;
        this.CreatedTime = new Date();
    }
}
module.exports = Movie;
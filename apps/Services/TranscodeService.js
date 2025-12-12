var ffmpeg = require('fluent-ffmpeg');
var path = require('path');
var fs = require('fs');

// --- ĐOẠN MỚI THÊM ĐỂ FIX LỖI ---
// Tự động lấy đường dẫn ffmpeg.exe trong node_modules
try {
    var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    ffmpeg.setFfmpegPath(ffmpegPath);
    console.log("✅ Đã tìm thấy FFmpeg tại:", ffmpegPath);
} catch (e) {
    console.log("⚠️ Không tìm thấy thư viện @ffmpeg-installer/ffmpeg. Bạn nhớ chạy lệnh: npm install @ffmpeg-installer/ffmpeg");
}
// ---------------------------------

class TranscodeService {
    
    /**
     * Hàm convert Video MP4 sang HLS
     * @param {string} inputPath - Đường dẫn file gốc (vừa upload xong)
     * @param {string} outputDir - Thư mục chứa các file .ts và .m3u8 sau khi cắt
     * @param {string} fileName - Tên file gốc (để đặt tên cho playlist)
     */
    async transcodeToHLS(inputPath, outputDir, fileName) {
        return new Promise((resolve, reject) => {
            // 1. Tạo thư mục chứa nếu chưa có
            if (!fs.existsSync(outputDir)){
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const outputM3U8 = path.join(outputDir, 'playlist.m3u8');

            console.log("🎬 [FFmpeg] Bắt đầu convert:", inputPath);

            ffmpeg(inputPath, { timeout: 432000 })
                // Các thiết lập chuẩn HLS
                .addOptions([
                    '-profile:v baseline', // Profile cơ bản để tương thích nhiều thiết bị
                    '-level 3.0',
                    '-start_number 0',     // Segment bắt đầu từ số 0
                    '-hls_time 10',        // Mỗi đoạn video dài 10 giây
                    '-hls_list_size 0',    // Giữ lại tất cả các segment trong file list
                    '-f hls'               // Định dạng đầu ra là HLS
                ])
                .output(outputM3U8)
                .on('end', () => {
                    console.log('✅ [FFmpeg] Convert thành công!');
                    resolve(outputM3U8); // Trả về đường dẫn file playlist
                })
                .on('error', (err) => {
                    console.error('❌ [FFmpeg] Lỗi:', err);
                    reject(err);
                })
                .run();
        });
    }
}

module.exports = TranscodeService;
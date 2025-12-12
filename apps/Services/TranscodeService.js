var ffmpeg = require('fluent-ffmpeg');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto'); 

try {
    var ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    ffmpeg.setFfmpegPath(ffmpegPath);
} catch (e) {
    console.log("⚠️ Không tìm thấy thư viện @ffmpeg-installer/ffmpeg");
}

class TranscodeService {
    
    async transcodeToHLS(inputPath, outputDir, fileName) {
        return new Promise((resolve, reject) => {
            
            // 1. Tạo thư mục chứa
            if (!fs.existsSync(outputDir)){
                fs.mkdirSync(outputDir, { recursive: true });
            }
            // AES-128
            const key = crypto.randomBytes(16);
            const keyFile = 'enc.key'; 
            const keyPath = path.join(outputDir, keyFile); 

            // b. Lưu file Key xuống đĩa (để FFmpeg dùng mã hóa)
            fs.writeFileSync(keyPath, key);

            const keyInfoFile = path.join(outputDir, 'enc.keyinfo');
            fs.writeFileSync(keyInfoFile, `${keyFile}\n${keyPath}`);

            // ------------------------------------------

            const outputM3U8 = path.join(outputDir, 'playlist.m3u8');
            console.log("🎬 [FFmpeg] Bắt đầu convert & Mã hóa AES-128:", inputPath);

            ffmpeg(inputPath, { timeout: 432000 })
                .addOptions([
                    '-profile:v baseline',
                    '-level 3.0',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-f hls',
                    '-hls_key_info_file', keyInfoFile 
                ])
                .output(outputM3U8)
                .on('end', () => {
                    console.log('✅ [FFmpeg] Mã hóa thành công!');
                    
                    fs.unlinkSync(keyInfoFile); 
                    
                    resolve(outputM3U8);
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
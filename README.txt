| Bảng (Collection) | Mục đích                    |
| ----------------- | --------------------------- |
| **Category**      | Danh mục phim               |
| **Movie**         | Thông tin phim              |
| **Episode**       | Tập phim                    |
| **User**          | Người dùng                  |
| **Role**          | Quyền (ADMIN / USER)        |
| **Comment**       | Bình luận                   |
| **History**       | Lịch sử xem phim            |
| **Banner**        | Banner trang chủ (tuỳ chọn) |



| Collection   | Tính năng                              |
| ------------ | -------------------------------------- |
| **User**     | Đăng ký, đăng nhập, hồ sơ, yêu thích   |
| **Role**     | Phân quyền ADMIN/USER                  |
| **Movie**    | Danh sách phim, xem chi tiết, tìm kiếm |
| **Category** | Lọc phim theo danh mục                 |
| **Episode**  | Xem phim theo tập                      |
| **Comment**  | Bình luận dưới phim                    |
| **History**  | Lịch sử xem, tiếp tục xem              |
| **Banner**   | Slider trang chủ                       |

tải lại node modules

Vào Mongo cluster bữa tạo,  tạo mới database dì đó(ví dụ WebXemPhim) có collection dì đó (ví dụ a)
Ròi vào kết nối

Dô database dì đó
tạo các collection như sau :
banner
comment
episode
history
movie
role
user

ròi dô postman chạy thử api với phương thức post
http://localhost:3000/admin/role/insert-role


body gồm

{
  "Name": "Admin",
  "Description": "Full access"
}

Nếu chạy được oke thì oke
còn không được mà hiển thị lỗi kiểu
{ 
    "status": false, 
    "message": "282E0000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:openssl\\ssl\\record\\rec_layer_s3.c:916:SSL alert number 80\n" 
}

thì vào mongodb -> Database & network Access -> IP Access List -> nó sẽ hiển thị cái Add ip 
                                   hiện tại ròi bấm vào là đc do trên trường là ip khác về nhà là ip khác
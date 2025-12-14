var DatabaseConnection = require(global.__basedir + '/apps/Database/Database');
var Config = require(global.__basedir + "/Config/Setting.json");
var UserRepository = require(global.__basedir + "/apps/Repository/UserRepository");
var User = require(global.__basedir + "/apps/Entity/User");
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

class UserService {
    client;
    database;
    userRepository;

    constructor() { }

    async init() {
        this.client = await DatabaseConnection.getMongoClient();
        this.database = this.client.db(Config.mongodb.database);
        return this;
    }

    async registerUser(data) {
        const session = this.client.startSession();
        try {
            session.startTransaction();
            this.userRepository = new UserRepository(this.database, session);

            // 1. Kiểm tra Email đã tồn tại chưa
            var existingUser = await this.userRepository.getUserByEmail(data.Email);
            if (existingUser) {
                throw new Error("Email này đã được sử dụng!");
            }

            // 2. Lấy User Role ID từ database
            var RoleRepository = require(global.__basedir + "/apps/Repository/RoleRepository");
            var roleRepository = new RoleRepository(this.database, session);
            var userRole = await roleRepository.getRoleByName("User");
            
            if (!userRole) {
                throw new Error("Không tìm thấy role User trong hệ thống!");
            }

            var user = new User();
            // Nhận Username từ request, nếu không có thì lấy từ email
            user.Username = data.Username || data.Email.split('@')[0];
            user.Email = data.Email;
            user.Avatar = data.Avatar || ""; 
            
            // QUAN TRỌNG: Luôn gán role User, KHÔNG dùng RoleIds từ client
            // Điều này đảm bảo người dùng không thể tự đăng ký làm Admin
            user.RoleIds = [userRole._id.toString()];

            const salt = await bcrypt.genSalt(10);
            user.PasswordHash = await bcrypt.hash(data.Password, salt);

            var result = await this.userRepository.insertUser(user);

            await session.commitTransaction();
            return result;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async loginUser(email, password) {

        this.userRepository = new UserRepository(this.database, null);
        var RoleRepository = require(global.__basedir + "/apps/Repository/RoleRepository");
        var roleRepository = new RoleRepository(this.database, null);

        var user = await this.userRepository.getUserByEmail(email);
        if (!user) {
            throw new Error("Email hoặc mật khẩu không đúng!");
        }

        var isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            throw new Error("Email hoặc mật khẩu không đúng!");
        }

        // Kiểm tra role để xác định trang redirect
        var redirectUrl = "/movies"; // Mặc định User đến trang danh sách phim
        var isAdmin = false;

        console.log("User RoleIds:", user.RoleIds);
        console.log("Type:", typeof user.RoleIds);

        // Xử lý RoleIds có thể là string hoặc array
        let roleIds = [];
        if (typeof user.RoleIds === 'string') {
            // Nếu là string, chuyển thành array
            roleIds = [user.RoleIds];
        } else if (Array.isArray(user.RoleIds)) {
            roleIds = user.RoleIds;
        }

        console.log("Processed roleIds:", roleIds);

        if (roleIds.length > 0) {
            for (let roleId of roleIds) {
                try {
                    // Kiểm tra roleId có phải là string 24 ký tự hex không
                    if (!roleId || typeof roleId !== 'string' || roleId.length !== 24) {
                        console.log("Invalid roleId format:", roleId);
                        continue;
                    }
                    
                    var role = await roleRepository.getRoleById(roleId);
                    console.log("Found role:", role);
                    
                    if (role && role.Name === "Admin") {
                        isAdmin = true;
                        redirectUrl = "/admin-ui/movies";
                        console.log("✅ User is Admin!");
                        break;
                    }
                } catch (err) {
                    console.log("Error checking role:", err.message);
                }
            }
        }

        var token = jwt.sign(
            { _id: user._id, 
              RoleIds: user.RoleIds, 
              Email: user.Email,
              isAdmin: isAdmin
            },
              Config.jwt_secret || "SecretKey123", 
            { expiresIn: '24h' } 
        );

        delete user.PasswordHash;
        return {
            user: user,
            token: token,
            redirectUrl: redirectUrl,
            isAdmin: isAdmin
        };
    }


    async getUserProfile(id) {
         this.userRepository = new UserRepository(this.database, null);
         
         var user = await this.userRepository.getUserById(id);
         
         if(user) delete user.PasswordHash;
         
         return user;
    }
}

module.exports = UserService;
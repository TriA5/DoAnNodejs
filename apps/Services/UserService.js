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

            var user = new User();
            user.Username = data.Username;
            user.Email = data.Email;
            user.Avatar = data.Avatar || ""; 
            user.RoleIds = data.RoleIds || [];

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

        var user = await this.userRepository.getUserByEmail(email);
        if (!user) {
            throw new Error("Email hoặc mật khẩu không đúng!");
        }


        var isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) {
            throw new Error("Email hoặc mật khẩu không đúng!");
        }

        var token = jwt.sign(
            { _id: user._id, RoleIds: user.RoleIds, Email: user.Email },
            Config.jwt_secret || "SecretKey123", 
            { expiresIn: '24h' } 
        );

        delete user.PasswordHash;
        return {
            user: user,
            token: token
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
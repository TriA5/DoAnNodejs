class User {
    _id;
    Username;
    Email;
    PasswordHash;
    Avatar;
    RoleIds;
    Favorites;

    constructor() {
        this.RoleIds = [];
        this.Favorites = [];
    }
}

module.exports = User;

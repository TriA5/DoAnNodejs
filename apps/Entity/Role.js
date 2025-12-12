class Role {
    _id;
    Name;
    Description;

    constructor(name = "", description = "") {
        this.Name = name;
        this.Description = description;
    }
}

module.exports = Role;

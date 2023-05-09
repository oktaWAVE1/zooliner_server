module.exports = class UserDto {
    id;
    email;
    role;
    name;

    constructor(model) {
        this.id = model.id
        this.email = model.email
        this.role = model.role
        this.name = model.name
    }
}
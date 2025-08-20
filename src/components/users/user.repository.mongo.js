const UserModel = require("./user.model.js");

// methods of user
const userRepo = {
  // saves new user to MongoDB and return it
  async create(userData) {
    const newUser = new UserModel(userData);
    return await newUser.save();
  },

  // find user by email
  async findByEmail(email) {
    const user = await UserModel.findOne({ email });
    return user;
  },

  // find user by ID
  async findById(id) {
    const user = await UserModel.findById(id);
    return user;
  },

  // delete user
  async deleteUser(id) {
    const deletedUser = await UserModel.findByIdAndDelete(id);
    return deletedUser;
  },

  // update user name by id
  async updateUserName(id, newName) {
    const updatedName = await UserModel.findByIdAndUpdate(
      id,
      { $set: { name: newName } },
      { returnDocument: "after", runValidators: true, select: "name" },
    );
    return updatedName.name;
  },
};

module.exports = userRepo;

import User from "../models/user";

// Logic: Fetch user by internal ID
export const getUserById = async (userId: string) => {
    return await User.findById(userId);
};

// Logic: Fetch user by Auth0 ID
export const getUserByAuth0Id = async (auth0Id: string) => {
    return await User.findOne({ auth0Id });
};

// Logic: Create a new user
export const createUser = async (userData: any) => {
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
};

// Logic: Update user profile
export const updateUser = async (userId: string, updateData: any) => {
    const user = await User.findById(userId);
    if (!user) return null;

    user.name = updateData.name;
    user.addressLine1 = updateData.addressLine1;
    user.country = updateData.country;
    user.city = updateData.city;

    await user.save();
    return user;
};

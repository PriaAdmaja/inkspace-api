import bcrypt from "bcrypt";

export const encryptPassword = (password: string) => {
    return bcrypt.hashSync(password, 10);
}

export const comparePassword = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
}

export const decryptPassword = (hash: string) => {
    return bcrypt.hashSync(hash, 10);
}
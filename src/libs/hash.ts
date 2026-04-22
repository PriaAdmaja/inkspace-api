import bcrypt from "bcrypt";

export const hash = (string: string) => {
  return bcrypt.hashSync(string, 10);
};

export const compareHash = (string: string, hashedString: string) => {
  return bcrypt.compare(string, hashedString);
};



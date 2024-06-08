import { hash, compare } from "bcrypt";

const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds = 10;
    return hash(password, saltRounds);
  } catch (error) {
    throw error;
  }
};

const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return compare(password, hashedPassword);
  } catch (error) {
    throw error;
  }
};

export { hashPassword, comparePassword };

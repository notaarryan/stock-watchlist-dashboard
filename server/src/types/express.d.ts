declare global {
  namespace Express {
    interface User {
      user_id: number;
      username: string;
      password: string;
    }
  }
}

export {};

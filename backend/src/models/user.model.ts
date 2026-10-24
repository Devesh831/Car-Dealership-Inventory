import { getDB } from '../config/database';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  created_at: string;
}

export type SafeUser = Omit<User, 'password'>;

/**
 * User model - all database operations for the users table.
 * Uses the async sqlite API via the singleton getDB() instance.
 */
export const UserModel = {
  /**
   * Creates a new user in the database.
   */
  async create(data: {
    username: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
  }): Promise<SafeUser> {
    const db = getDB();
    const result = await db.run(
      `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
      [data.username, data.email, data.password, data.role || 'user']
    );
    const user = await db.get<SafeUser>(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [result.lastID]
    );
    return user as SafeUser;
  },

  /**
   * Finds a user by their email address.
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const db = getDB();
    return db.get<User>('SELECT * FROM users WHERE email = ?', [email]);
  },

  /**
   * Finds a user by their username.
   */
  async findByUsername(username: string): Promise<User | undefined> {
    const db = getDB();
    return db.get<User>('SELECT * FROM users WHERE username = ?', [username]);
  },

  /**
   * Finds a user by their ID (no password returned).
   */
  async findById(id: number): Promise<SafeUser | undefined> {
    const db = getDB();
    return db.get<SafeUser>(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
  },

  /**
   * Returns all users (safe, no passwords).
   */
  async findAll(): Promise<SafeUser[]> {
    const db = getDB();
    return db.all<SafeUser[]>(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
  },
};

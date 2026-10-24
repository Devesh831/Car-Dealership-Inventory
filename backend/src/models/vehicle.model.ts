import { getDB } from '../config/database';

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  category: 'Sedan' | 'SUV' | 'Truck' | 'Coupe' | 'Van' | 'Electric' | 'Hybrid';
  price: number;
  quantity: number;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreateInput {
  make: string;
  model: string;
  year: number;
  category: Vehicle['category'];
  price: number;
  quantity: number;
  description?: string;
  image_url?: string;
}

export interface VehicleUpdateInput {
  make?: string;
  model?: string;
  year?: number;
  category?: Vehicle['category'];
  price?: number;
  quantity?: number;
  description?: string;
  image_url?: string;
}

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: Vehicle['category'];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedVehicles {
  data: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Vehicle model - all database operations for vehicles table.
 * Implements pagination, filtering, and inventory management.
 */
export const VehicleModel = {
  /**
   * Creates a new vehicle in the inventory.
   */
  async create(data: VehicleCreateInput): Promise<Vehicle> {
    const db = getDB();
    const result = await db.run(
      `INSERT INTO vehicles (make, model, year, category, price, quantity, description, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.make,
        data.model,
        data.year,
        data.category,
        data.price,
        data.quantity,
        data.description || '',
        data.image_url || '',
      ]
    );
    return db.get<Vehicle>('SELECT * FROM vehicles WHERE id = ?', [result.lastID]) as Promise<Vehicle>;
  },

  /**
   * Returns all vehicles with pagination.
   */
  async findAll(page = 1, limit = 10): Promise<PaginatedVehicles> {
    const db = getDB();
    const offset = (page - 1) * limit;

    const countRow = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM vehicles');
    const total = countRow?.count || 0;
    const data = await db.all<Vehicle[]>(
      'SELECT * FROM vehicles ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Finds a vehicle by its ID.
   */
  async findById(id: number): Promise<Vehicle | undefined> {
    const db = getDB();
    return db.get<Vehicle>('SELECT * FROM vehicles WHERE id = ?', [id]);
  },

  /**
   * Searches vehicles with filters and pagination.
   */
  async search(filters: SearchFilters): Promise<PaginatedVehicles> {
    const db = getDB();
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters.make) {
      conditions.push('LOWER(make) LIKE ?');
      params.push(`%${filters.make.toLowerCase()}%`);
    }
    if (filters.model) {
      conditions.push('LOWER(model) LIKE ?');
      params.push(`%${filters.model.toLowerCase()}%`);
    }
    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }
    if (filters.minPrice !== undefined) {
      conditions.push('price >= ?');
      params.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      conditions.push('price <= ?');
      params.push(filters.maxPrice);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRow = await db.get<{ count: number }>(
      `SELECT COUNT(*) as count FROM vehicles ${whereClause}`,
      params
    );
    const total = countRow?.count || 0;

    const data = await db.all<Vehicle[]>(
      `SELECT * FROM vehicles ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Updates a vehicle. Only updates provided fields.
   */
  async update(id: number, data: VehicleUpdateInput): Promise<Vehicle | undefined> {
    const db = getDB();
    const fields = Object.keys(data).filter(
      (k) => data[k as keyof VehicleUpdateInput] !== undefined
    );

    if (fields.length === 0) return this.findById(id);

    const setClauses = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f as keyof VehicleUpdateInput]);

    await db.run(
      `UPDATE vehicles SET ${setClauses} WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  },

  /**
   * Deletes a vehicle. Returns true if deleted, false if not found.
   */
  async delete(id: number): Promise<boolean> {
    const db = getDB();
    const result = await db.run('DELETE FROM vehicles WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  },

  /**
   * Decrements quantity by amount (purchase). Throws if insufficient stock.
   */
  async purchase(id: number, quantity: number): Promise<Vehicle> {
    const db = getDB();

    const vehicle = await this.findById(id);
    if (!vehicle) throw new Error('Vehicle not found');
    if (vehicle.quantity < quantity) {
      throw new Error(`Insufficient stock. Only ${vehicle.quantity} units available.`);
    }

    await db.run(
      'UPDATE vehicles SET quantity = quantity - ? WHERE id = ?',
      [quantity, id]
    );

    return this.findById(id) as Promise<Vehicle>;
  },

  /**
   * Increments quantity by amount (restock).
   */
  async restock(id: number, quantity: number): Promise<Vehicle> {
    const db = getDB();

    const vehicle = await this.findById(id);
    if (!vehicle) throw new Error('Vehicle not found');

    await db.run(
      'UPDATE vehicles SET quantity = quantity + ? WHERE id = ?',
      [quantity, id]
    );

    return this.findById(id) as Promise<Vehicle>;
  },
};

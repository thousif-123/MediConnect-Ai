import fs from 'fs';
import path from 'path';

// Embedded Document Store replicating MongoDB collection behavior with JSON disk persistence
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class Collection<T extends { _id?: string; createdAt?: string; updatedAt?: string }> {
  private filePath: string;
  private memoryCache: Map<string, T> = new Map();

  constructor(public name: string) {
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.load();
  }

  private load(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const items: T[] = JSON.parse(raw);
        items.forEach((item) => {
          if (item._id) this.memoryCache.set(item._id, item);
        });
      } catch {
        this.memoryCache.clear();
      }
    }
  }

  private save(): void {
    const list = Array.from(this.memoryCache.values());
    fs.writeFileSync(this.filePath, JSON.stringify(list, null, 2), 'utf-8');
  }

  public async find(filter: Partial<Record<keyof T, any>> = {}): Promise<T[]> {
    return Array.from(this.memoryCache.values()).filter((item) => {
      for (const key of Object.keys(filter) as (keyof T)[]) {
        const val = filter[key];
        const itemVal = item[key];
        if (val !== null && typeof val === 'object') {
          const filterObj = val as Record<string, any>;
          if ('$in' in filterObj && Array.isArray(filterObj.$in)) {
            if (!filterObj.$in.includes(itemVal)) return false;
          }
          if ('$regex' in filterObj) {
            const regex = new RegExp(filterObj.$regex, filterObj.$options || 'i');
            if (!regex.test(String(itemVal || ''))) return false;
          }
        } else if (val !== undefined && itemVal !== val) {
          return false;
        }
      }
      return true;
    });
  }

  public async findOne(filter: Partial<Record<keyof T, any>>): Promise<T | null> {
    const results = await this.find(filter);
    return results.length > 0 ? results[0] : null;
  }

  public async findById(id: string): Promise<T | null> {
    return this.memoryCache.get(id) || null;
  }

  public async insertOne(doc: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & { _id?: string }): Promise<T> {
    const id = doc._id || `${this.name.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const fullDoc = {
      ...doc,
      _id: id,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    this.memoryCache.set(id, fullDoc);
    this.save();
    return fullDoc;
  }

  public async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const existing = this.memoryCache.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...update,
      updatedAt: new Date().toISOString(),
    };
    this.memoryCache.set(id, updated);
    this.save();
    return updated;
  }

  public async findByIdAndDelete(id: string): Promise<boolean> {
    const exists = this.memoryCache.has(id);
    if (exists) {
      this.memoryCache.delete(id);
      this.save();
    }
    return exists;
  }

  public async countDocuments(filter: Partial<Record<keyof T, any>> = {}): Promise<number> {
    const items = await this.find(filter);
    return items.length;
  }

  public async deleteMany(filter: Partial<Record<keyof T, any>>): Promise<number> {
    const items = await this.find(filter);
    let count = 0;
    for (const item of items) {
      if (item._id && this.memoryCache.delete(item._id)) {
        count++;
      }
    }
    if (count > 0) this.save();
    return count;
  }
}

// Global Collections
export const usersCollection = new Collection<any>('users');
export const pharmacistsCollection = new Collection<any>('pharmacists');
export const pharmaciesCollection = new Collection<any>('pharmacies');
export const doctorsCollection = new Collection<any>('doctors');
export const hospitalsCollection = new Collection<any>('hospitals');
export const medicinesCollection = new Collection<any>('medicines');
export const inventoryCollection = new Collection<any>('inventory');
export const prescriptionsCollection = new Collection<any>('prescriptions');
export const ordersCollection = new Collection<any>('orders');
export const appointmentsCollection = new Collection<any>('appointments');
export const consentsCollection = new Collection<any>('consents');
export const auditLogsCollection = new Collection<any>('auditLogs');
export const symptomSessionsCollection = new Collection<any>('symptomSessions');
export const notificationsCollection = new Collection<any>('notifications');

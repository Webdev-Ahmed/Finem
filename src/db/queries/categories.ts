import { getDB } from '../index';
import { Category, CategoryType } from '@/types';

export async function insertCategory(
  name: string,
  icon: string,
  color: string,
  type: CategoryType,
  isDefault = false
): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync(
    'INSERT INTO categories (name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?)',
    [name, icon, color, type, isDefault ? 1 : 0]
  );
  return result.lastInsertRowId;
}

export async function getCategories(type?: CategoryType): Promise<Category[]> {
  const db = await getDB();
  if (type) {
    return db.getAllAsync<Category>(
      'SELECT * FROM categories WHERE type = ? ORDER BY is_default DESC, name ASC',
      [type]
    );
  }
  return db.getAllAsync<Category>('SELECT * FROM categories ORDER BY is_default DESC, name ASC');
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?', [id]);
  return row ?? null;
}

export async function updateCategory(
  id: number,
  name: string,
  icon: string,
  color: string
): Promise<void> {
  const db = await getDB();
  await db.runAsync('UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?', [
    name,
    icon,
    color,
    id,
  ]);
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDB();
  // Guard: never delete seeded defaults
  await db.runAsync('DELETE FROM categories WHERE id = ? AND is_default = 0', [id]);
}

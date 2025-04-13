import { withLoading } from './api';
import type { Category, CategoryRequest, CategoryUpdateRequest } from '../types/category';

class CategoryService {
  // Single category validation
  private isValidCategory(item: any): item is Category {
    return item 
      && typeof item === 'object'
      && typeof item.id === 'number'
      && typeof item.name === 'string'
      && (item.type === 'income' || item.type === 'expense')
      && typeof item.icon === 'string';
  }

  // Category array validation
  private isValidCategoryArray = (data: any): data is Category[] => {
    return Array.isArray(data) && data.every(this.isValidCategory);
  };

  async getCategories(): Promise<Category[]> {
    const response = await withLoading<any>(
      'getCategories',
      (api) => api.get('/categories')
    );
    console.log('Raw API response:', response);
    
    const categories = response?.data?.data || [];
    console.log('Extracted categories:', categories);

    // Validate and transform data
    const validCategories = categories.map((item: any) => ({
      ...item,
      // Ensure icon exists
      icon: item.icon || 'help-circle',
      // Ensure name exists
      name: item.name || ''
    }));
    console.log('Transformed categories:', validCategories);
    
    return validCategories;
  }

  async createCategory(data: CategoryRequest): Promise<Category> {
    return await withLoading<Category>('createCategory', (api) => 
      api.post('/categories', data)
    );
  }

  async updateCategory(id: number, data: CategoryUpdateRequest): Promise<Category> {
    return await withLoading<Category>(`updateCategory_${id}`, (api) => 
      api.put(`/categories/${id}`, data)
    );
  }

  async deleteCategory(id: number): Promise<void> {
    await withLoading<void>(`deleteCategory_${id}`, (api) => 
      api.delete(`/categories/${id}`)
    );
  }
}

export const categoryService = new CategoryService();
export default categoryService;

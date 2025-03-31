import api from './api';
import type { Category, CategoryRequest, CategoryUpdateRequest } from '../types/category';

class CategoryService {
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data.data;
  }

  async createCategory(data: CategoryRequest): Promise<Category> {
    const response = await api.post('/categories', data);
    return response.data.data;
  }

  async updateCategory(id: string, data: CategoryUpdateRequest): Promise<Category> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data;
  }

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
}

export const categoryService = new CategoryService();
export default categoryService;

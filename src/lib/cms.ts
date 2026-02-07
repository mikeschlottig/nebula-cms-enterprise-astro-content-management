import { toast } from "sonner";
import type { CMSCollection, CMSEntry } from "../../worker/app-controller";
class CMSService {
  private baseUrl = '/api/cms';
  async getCollections(): Promise<{ success: boolean; data?: CMSCollection[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/collections`);
      if (!response.ok) throw new Error("Failed to fetch collections");
      return await response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      toast.error(message);
      return { success: false, error: message };
    }
  }
  async createCollection(data: Omit<CMSCollection, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: CMSCollection; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create collection");
      const result = await response.json();
      toast.success("Collection created successfully");
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create collection";
      toast.error(message);
      return { success: false, error: message };
    }
  }
  async getEntries(collectionId: string): Promise<{ success: boolean; data?: CMSEntry[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/entries/${collectionId}`);
      if (!response.ok) throw new Error("Failed to fetch entries");
      return await response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error";
      toast.error(message);
      return { success: false, error: message };
    }
  }
  async saveEntry(entry: Omit<CMSEntry, 'id' | 'updatedAt'> & { id?: string }): Promise<{ success: boolean; data?: CMSEntry; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) throw new Error("Failed to save entry");
      const result = await response.json();
      toast.success("Entry saved successfully");
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save entry";
      toast.error(message);
      return { success: false, error: message };
    }
  }
}
export const cmsService = new CMSService();
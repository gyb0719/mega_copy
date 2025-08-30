import { create } from 'zustand';
import { supabase } from '../supabase';

interface InventoryState {
  stocks: Map<string, number>;
  updateStock: (productId: string, quantity: number) => Promise<void>;
  decrementStock: (productId: string, quantity: number) => Promise<boolean>;
  getStock: (productId: string) => number;
  loadStock: (productId: string) => Promise<void>;
  subscribeToStockUpdates: (productId: string) => () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  stocks: new Map(),

  updateStock: async (productId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          stock: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      set((state) => {
        const newStocks = new Map(state.stocks);
        newStocks.set(productId, quantity);
        return { stocks: newStocks };
      });
    } catch (error) {
      console.error('Failed to update stock:', error);
      throw error;
    }
  },

  decrementStock: async (productId: string, quantity: number = 1) => {
    const currentStock = get().getStock(productId);
    
    if (currentStock < quantity) {
      return false;
    }

    try {
      await get().updateStock(productId, currentStock - quantity);
      return true;
    } catch (error) {
      console.error('Failed to decrement stock:', error);
      return false;
    }
  },

  getStock: (productId: string) => {
    return get().stocks.get(productId) || 0;
  },

  loadStock: async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (data) {
        set((state) => {
          const newStocks = new Map(state.stocks);
          newStocks.set(productId, data.stock);
          return { stocks: newStocks };
        });
      }
    } catch (error) {
      console.error('Failed to load stock:', error);
    }
  },

  subscribeToStockUpdates: (productId: string) => {
    const channel = supabase
      .channel(`stock-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`
        },
        (payload) => {
          if (payload.new && 'stock' in payload.new) {
            set((state) => {
              const newStocks = new Map(state.stocks);
              newStocks.set(productId, payload.new.stock as number);
              return { stocks: newStocks };
            });
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
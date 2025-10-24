import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  course: string;
  addedAt: string;
  _id?: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  count: number;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  count: 0,
};

// Async thunk to fetch cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart/my-cart', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      return data.data.cart;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to add to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add to cart');
      }

      const data = await response.json();
      return data.data.cart;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    updateCartCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.count = action.payload.items?.length || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.count = action.payload.items?.length || 0;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateCartCount, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
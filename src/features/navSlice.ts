import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  value: false,
}

export const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    setNav: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload;
    }
  },
})

export const { setNav } = navSlice.actions;
export default navSlice.reducer;
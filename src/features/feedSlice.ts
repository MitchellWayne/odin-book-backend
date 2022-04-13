import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Feed {
  isFiltered: boolean,
  filter: string,
}

const initialState = {
  isFiltered: false,
  filter: '',
}

export const feedSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    setFeed: (state, action: PayloadAction<Feed>) => {
      state.isFiltered = (action.payload.isFiltered ? action.payload.isFiltered : false);
      state.filter = (action.payload.filter ? action.payload.filter : '');
    }
  },
})

export const { setFeed } = feedSlice.actions;
export default feedSlice.reducer;
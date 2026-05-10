import { createSlice } from '@reduxjs/toolkit';

const initialTheme =
  typeof window !== 'undefined' ? window.localStorage.getItem('ttm-theme') || 'dark' : 'dark';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: initialTheme,
    sidebarOpen: true,
    taskView: 'board'
  },
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem('ttm-theme', state.theme);
    },
    setTheme(state, action) {
      state.theme = action.payload;
      window.localStorage.setItem('ttm-theme', state.theme);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTaskView(state, action) {
      state.taskView = action.payload;
    }
  }
});

export const { setTaskView, setTheme, toggleSidebar, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;

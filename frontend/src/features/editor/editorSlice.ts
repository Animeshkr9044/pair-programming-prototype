import { createSlice } from '@reduxjs/toolkit';

interface EditorState {
  code: string;
}

const initialState: EditorState = {
  code: "// Start coding here...",
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    updateCode: (state, action: { payload: string }) => {
      state.code = action.payload;
    },
  },
});

export const { updateCode } = editorSlice.actions;
export default editorSlice.reducer;
import { createSlice } from '@reduxjs/toolkit'

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    selectedProject: null,
  },
  reducers: {
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null
    },
  },
})

export const { setSelectedProject, clearSelectedProject } = projectSlice.actions
export default projectSlice.reducer


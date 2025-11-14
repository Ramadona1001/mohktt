import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as projectService from '../../services/projectService'

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjects(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchProject = createAsyncThunk(
  'projects/fetchProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectService.getProject(projectId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await projectService.createProject(projectData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, projectData }, { rejectWithValue }) => {
    try {
      const response = await projectService.updateProject(projectId, projectData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(projectId)
      return projectId
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const uploadBlueprint = createAsyncThunk(
  'projects/uploadBlueprint',
  async ({ projectId, file }, { rejectWithValue }) => {
    try {
      const response = await projectService.uploadBlueprint(projectId, file)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const getProjectStatistics = createAsyncThunk(
  'projects/getProjectStatistics',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjectStatistics(projectId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    selectedProject: null,
    statistics: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload.results || action.payload
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch single project
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.selectedProject = action.payload
      })
      // Create project
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload)
      })
      // Update project
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.projects[index] = action.payload
        }
        if (state.selectedProject?.id === action.payload.id) {
          state.selectedProject = action.payload
        }
      })
      // Delete project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload)
        if (state.selectedProject?.id === action.payload) {
          state.selectedProject = null
        }
      })
      // Upload blueprint
      .addCase(uploadBlueprint.fulfilled, (state, action) => {
        if (state.selectedProject) {
          state.selectedProject.blueprint = action.payload
        }
      })
      // Get statistics
      .addCase(getProjectStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload
      })
  },
})

export const { setSelectedProject, clearSelectedProject, clearError } = projectSlice.actions
export default projectSlice.reducer


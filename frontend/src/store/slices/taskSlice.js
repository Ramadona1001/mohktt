import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as taskService from '../../services/taskService'

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await taskService.getTask(taskId)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(taskData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(taskId, taskData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(taskId)
      return taskId
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const logTime = createAsyncThunk(
  'tasks/logTime',
  async ({ taskId, timeData }, { rejectWithValue }) => {
    try {
      const response = await taskService.logTime(taskId, timeData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, commentData }, { rejectWithValue }) => {
    try {
      const response = await taskService.addComment(taskId, commentData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const uploadAttachment = createAsyncThunk(
  'tasks/uploadAttachment',
  async ({ taskId, file }, { rejectWithValue }) => {
    try {
      const response = await taskService.uploadAttachment(taskId, file)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTaskStatus(taskId, status)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const getMyTasks = createAsyncThunk(
  'tasks/getMyTasks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await taskService.getMyTasks(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const getTaskStatistics = createAsyncThunk(
  'tasks/getTaskStatistics',
  async (params, { rejectWithValue }) => {
    try {
      const response = await taskService.getTaskStatistics(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    selectedTask: null,
    statistics: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload.results || action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch single task
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.selectedTask = action.payload
      })
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload)
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload
        }
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload)
        if (state.selectedTask?.id === action.payload) {
          state.selectedTask = null
        }
      })
      // Get statistics
      .addCase(getTaskStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload
      })
  },
})

export const { setSelectedTask, clearSelectedTask, clearError } = taskSlice.actions
export default taskSlice.reducer


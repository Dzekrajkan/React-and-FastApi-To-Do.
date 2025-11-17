import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from "./axiosInstance.js"

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async ( _, { rejectWithValue } ) => {
    try {
      const res = await api.get('/task', {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        withCredentials: true,
      });

      return res.data.tasks;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Error loading tasks');
    }
  }
);

export const fetchAddTask = createAsyncThunk('tasks/fetchAddTask', async ({ title, description, completed }, { rejectWithValue }) => {
    try {
      const res = await api.post("/task", { title, description, completed }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
      )
      return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Error adding tasks');
  }
})

export const fetchTaskById = createAsyncThunk('tasks/fetchTaskById', async ({ task_id }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/task/${task_id}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (!res.data.task) {
        return rejectWithValue("Task not found");
      }

      return res.data.task;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Error loading task');
    }
  }
);

export const fetchPatchTaskById = createAsyncThunk('tasks/fetchPatchTaskById', async ({ task_id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/task/${task_id}`, data,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      return res.data.task;

    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Error patching task');
    }
  }
);


export const fetchDeleteTaskById = createAsyncThunk('tasks/fetchDeleteTaskById', async ({ task_id }, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/task/${task_id}`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      return res.data

    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Error deleting task');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    filter: 'all',
    loading: false,
    error: null,
  },
  reducers: {
    toggleTask: (state, action) => {
      const task = state.tasks.find(t => t.id === action.payload)
      if (task) task.completed = !task.completed
    },
    setFilter: (state, action) => {
      state.filter = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAddTask.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTaskById.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDeleteTaskById.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload
      })
      .addCase(fetchAddTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload.task);
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false
        const task = action.payload
        const index = state.tasks.findIndex(t => t.id === task.id)
        if (index >= 0) {
          state.tasks[index] = task
        } else {
          state.tasks.push(task)
        }
      })
      .addCase(fetchDeleteTaskById.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.deleted_id
        state.tasks = state.tasks.filter(t => t.id !== deletedId);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchAddTask.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchDeleteTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
})

export const { toggleTask, setFilter, setError } = tasksSlice.actions
export default tasksSlice.reducer

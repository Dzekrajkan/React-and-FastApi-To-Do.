import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import api from "../js/axiosInstance";

const apiUrl = import.meta.env.VITE_API_URL;

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/me");
      return res.data;
    } catch (err) {
      return rejectWithValue("unauthorized");
    }
  }
);

export const fetchRegister = createAsyncThunk("auth/register", async ({ username, email, password1, password2 }, { rejectWithValue }) => {
    try {

      const res = await axios.post(`${apiUrl}/register`, { username, email, password1, password2 }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const me = await api.get("/me");
      
      return me.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Error during registration');
    }
});

export const fetchLogin = createAsyncThunk("auth/login", async ({ username, password }, {rejectWithValue}) => {
    try {

      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const res = await axios.post(`${apiUrl}/login`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        withCredentials: true,
      });

      const me = await api.get("/me");
      
      return me.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.detail || 'Login error')
    }
})

export const fetchLogout = createAsyncThunk("auth/logout", async ( _, {rejectWithValue} ) => {
    try{

        const res = axios.post(`${apiUrl}/logout`, {}, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            withCredentials: true,
        })

        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.detail || 'Error when exiting')
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
    user: null,
    isAuthenticated: null,
    checked: false,

    loading: false,
    error: null,
    success: null
    },
    reducers: {
        setError: (state, action) => {
            state.error = action.payload;
        },
        setSuccess: (state, action) => {
            state.success = action.payload
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchRegister.pending, state => {
                state.loading = true
                state.error = null
                state.success = null
            })
            .addCase(fetchLogin.pending, state => {
                state.loading = true
                state.error = null
                state.success = null
            })
            .addCase(fetchLogout.pending, state => {
                state.loading = true
                state.error = null
                state.success = null
            })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.checked = true;
            })
            .addCase(fetchRegister.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.success = "Registration was successful!";
            })
            .addCase(fetchLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.success = "Login was successful!";
            })
            .addCase(fetchLogout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.success = "The exit was successful!";
            })
            .addCase(fetchMe.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.checked = true;
            })
            .addCase(fetchRegister.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchLogin.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchLogout.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || action.error.message;
            })
    }
})

export const { setError, setSuccess } = authSlice.actions
export default authSlice.reducer
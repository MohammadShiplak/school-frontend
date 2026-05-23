import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";

import {
  addTeacher,
  deleteTeacher,
  updateTeacher,
  getAllTeachers,
} from "../../api/teachersAPI";

export const fetchTeacher = createAsyncThunk(
  "teachers/fetchAll",
  async ({ pageNumber, pageSize }, { rejectWithValue }) => {
    try {
      const response = await getAllTeachers(pageNumber, pageSize);

      return response.data;
    } catch (error) {
      return rejectWithValue("failed to load API");
    }
  },
);

export const createTeacher = createAsyncThunk(
  "teachers/add",
  async (teacherData, { rejectWithValue }) => {
    try {
      const response = await addTeacher(teacherData);

      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to add a teacher");
    }
  },
);

export const editTeacher = createAsyncThunk(
  "teacher/update",
  async ({ id, teacherData }, { rejectWithValue }) => {
    try {
      const response = await updateTeacher(id, teacherData);

      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to update teacher");
    }
  },
);

export const removeTeacher = createAsyncThunk(
  "teacher/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteTeacher(id);
      return id;
    } catch (error) {
      return rejectWithValue("failed to delete teacher ");
    }
  },
);

// __________________ Slice teacher ___________________________________________________________

export const teacherSlice = createSlice({
  name: "teachers",
  initialState: {
    teachers: [],
    totalRecords: 0,
    totalPages: 0,
    pageNumber: 1,
    pageSize: 10,

    loading: false,
    error: null,

    submitting: false,
    submitError: null,

    deleting: false,
  },

  reducers: {
    setPage: (state, action) => {
      state.pageNumber = action.payload;
    },

    clearSubmitError: (state) => {
      state.submitError = null;
    },
  },

  extraReducers: (builder) => {
    //______________Fetch All ______________________________________
    builder
      .addCase(fetchTeacher.pending, (state) => {
        ((state.loading = true), (state.error = null));
      })
      .addCase(fetchTeacher.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload.data;
        state.totalRecords = action.payload.totalRecords;
        state.totalPages = action.payload.totalPages;
        state.pageNumber = action.payload.pageNumber;
      })
      .addCase(fetchTeacher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // _____Create  ___________________________________________________________
      .addCase(createTeacher.pending, (state) => {
        state.submitting = true;
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.submitting = false;
        state.teachers.unshift(action.payload);
        state.totalRecords += 1;
      })
      //________ Edit ______________________________________________________________
      .addCase(editTeacher.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(editTeacher.fulfilled, (state, action) => {
        state.submitting = false;

        const index = state.teachers.findIndex(
          (s) => s.id === action.payload.id,
        );

        if (index !== -1) {
          state.teachers[index] = action.payload;
        }
      })
      .addCase(editTeacher.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })
      //______Delete _________________________________________________________

      .addCase(removeTeacher.pending, (state) => {
        state.deleting = true;
      })
      .addCase(removeTeacher.fulfilled, (state, action) => {
        state.deleting = false;
        // remove deleted student from list by filtering out its id
        state.teachers = state.teachers.filter((s) => s.id !== action.payload);
        state.totalRecords -= 1;
      })
      .addCase(removeTeacher.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { setPage, clearSubmitError } = teacherSlice.actions;
export default teacherSlice.reducer;

//______selectors _______________________________________________

export const selectTeacher = (state) => state.teachers.teachers ?? [];
export const selectTeacherMeta = createSelector(
  // Input selectors — extract individual values (primitives)
  (state) => state.teachers.totalRecords,
  (state) => state.teachers.totalPages,
  (state) => state.teachers.pageNumber,
  (state) => state.teachers.pageSize,

  // Result function — only runs when inputs change
  (totalRecords, totalPages, pageNumber, pageSize) => ({
    totalRecords,
    totalPages,
    pageNumber,
    pageSize,
  }),
);
export const selectTeacherLoading = (state) => state.teachers.loading;
export const selectTeacherError = (state) => state.teachers.error;
export const selectTeacherSubmitting = (state) => state.teachers.submitting;
export const selectSubmitError = (state) => state.teachers.submitError;
export const selectDeleting = (state) => state.teachers.deleting;

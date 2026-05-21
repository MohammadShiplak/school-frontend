import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";

import {
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
} from "../../api/studentsAPI";

//______________Thunk 1 : fetch all students __________________

export const fetchStudents = createAsyncThunk(
  "students/fetchAll",
  async ({ pageNumber, pageSize }, { rejectWithValue }) => {
    try {
      const response = await getAllStudents(pageNumber, pageSize);

      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to load students ");
    }
  },
);

// _____thunk 2: Add Student ________________________________

export const createStudent = createAsyncThunk(
  "students/create",
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await addStudent(studentData);

      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to add student");
    }
  },
);

// _____ Thunk 3 : update Student _______________________

export const editStudent = createAsyncThunk(
  "students/edit",
  async ({ id, studentData }, { rejectWithValue }) => {
    try {
      const response = await updateStudent(id, studentData);

      return response.data;
    } catch (error) {
      return rejectWithValue("Failed to update student");
    }
  },
);

//_____ think 4 : Delete Student _________________________

export const removeStudent = createAsyncThunk(
  "students/remove",
  async (id, { rejectWithValue }) => {
    try {
      await deleteStudent(id);
    } catch (error) {
      return rejectWithValue("Failed to delete student");
    }
  },
);

// Slice  _____________________________________________________

export const studentSlice = createSlice({
  name: "students=",
  initialState: {
    students: [],
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
      .addCase(fetchStudents.pending, (state) => {
        ((state.loading = true), state.error);
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.data;
        state.totalRecords = action.payload.totalRecords;
        state.totalPages = action.payload.totalPages;
        state.pageNumber = action.payload.pageNumber;
        console.log("API response:", action.payload);
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // _____Create  ___________________________________________________________
      .addCase(createStudent.pending, (state, action) => {
        state.submitting = false;
        // add new student to beginning of list

        state.students.unshift(action.payload);
        state.totalRecords += 1;
      })
      .addCase(createStudent.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })

      //________ Edit ______________________________________________________________
      .addCase(editStudent.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(editStudent.fulfilled, (state, action) => {
        state.submitting = false;

        const index = state.students.findIndex(
          (s) => s.id === action.payload.id,
        );

        if (index !== -1) {
          state.students[index] = action.payload;
        }
      })
      .addCase(editStudent.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      })
      //______Delete _________________________________________________________

      .addCase(removeStudent.pending, (state) => {
        state.deleting = false;
      })
      .addCase(removeStudent.fulfilled, (state, action) => {
        state.deleting = false;
        // remove deleted student from list by filtering out its id
        state.students = state.students.filter((s) => s.id !== action.payload);
        state.totalRecords -= 1;
      })
      .addCase(removeStudent.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { setPage, clearSubmitError } = studentSlice.actions;
export default studentSlice.reducer;

//______selectors _______________________________________________

export const selectStudent = (state) => state.students.students ?? [];
export const selectStudentsMeta = createSelector(
  // Input selectors — extract individual values (primitives)
  (state) => state.students.totalRecords,
  (state) => state.students.totalPages,
  (state) => state.students.pageNumber,
  (state) => state.students.pageSize,

  // Result function — only runs when inputs change
  (totalRecords, totalPages, pageNumber, pageSize) => ({
    totalRecords,
    totalPages,
    pageNumber,
    pageSize,
  }),
);
export const selectStudentsLoading = (state) => state.students.loading;
export const selectStudentError = (state) => state.students.error;
export const selectStudentsSubmitting = (state) => state.students.submitting;
export const selectSubmitError = (state) => state.students.submitError;
export const selectDeleting = (state) => state.students.deleting;

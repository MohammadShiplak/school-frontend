// src/features/chatbot/chatbotSlice.js
// ═══════════════════════════════════════════════════════════════
// WHY EVERYTHING IS IN ONE FILE:
//   Redux Toolkit's convention is one slice file = one feature.
//   It contains: thunks + slice (reducers + actions) + selectors.
//   Splitting them across files works but creates import confusion
//   and is the reason you got the "does not provide an export named
//   'clearChat'" error — the slice (which defines clearChat) was
//   in a different file than the thunk, so the exports were split.
// ═══════════════════════════════════════════════════════════════

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sendChatMessage } from "../../api/chatbotAPI";

// ── HELPER: unique ID for each message ───────────────────────────
// WHY not use array index? If messages are deleted, indices shift.
// Date.now() + random suffix = practically unique for a chat widget.
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ── WELCOME MESSAGE (defined once, reused in clearChat) ──────────
// WHY extract as a constant?
//   Both initialState AND clearChat need this exact same object.
//   If you hardcode it twice and later change the text, you'd need
//   to update it in two places. One constant = one place to change.
const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  content:
    "👋 Hi! I'm **EduPulse AI**, your school management assistant.\n\nI can help you with questions about:\n- 👨‍🎓 Students & enrollment\n- 👨‍🏫 Teachers & classes\n- 📚 Homework & subjects\n- 📋 Attendance records\n- 🏢 Departments & courses\n\nWhat would you like to know?",
  timestamp: new Date().toISOString(),
};

// ═══════════════════════════════════════════════════════════════
// ASYNC THUNK: askAssistant
// ─────────────────────────────────────────────────────────────
// WHY a thunk?
//   Thunks handle ASYNC operations in Redux (API calls, timers).
//   They auto-dispatch three action states:
//     pending   → API call started  → show typing indicator
//     fulfilled → API call succeeded → show AI response
//     rejected  → API call failed    → show error message
//
// NOTE ON MEMORY:
//   Your GeminiService currently accepts ONE string — no history.
//   Each message is a fresh, isolated call to Gemini.
//   This means the AI has NO memory between messages right now.
//   The fix (when ready) is to update GeminiService to accept
//   List<ChatMessageDTO> and send the full conversation as
//   Gemini's `contents` array with role: "user" / role: "model".
//   That's a backend-only change — this slice barely changes.
// ═══════════════════════════════════════════════════════════════
export const askAssistant = createAsyncThunk(
  "chatbot/askAssistant",
  async (userMessage, { rejectWithValue }) => {
    try {
      const aiResponse = await sendChatMessage(userMessage);
      return aiResponse;
    } catch (error) {
      // error.response?.data = the body of your ChatController's
      // StatusCode(502, "AI service error: ...") response.
      // This gives you the REAL Gemini error instead of "Network Error".
      return rejectWithValue(
        error.response?.data || "Something went wrong. Please try again.",
      );
    }
  },
);

// ═══════════════════════════════════════════════════════════════
// THE SLICE
// ─────────────────────────────────────────────────────────────
// createSlice bundles three things:
//   1. initialState  — what state looks like before any actions
//   2. reducers      — SYNCHRONOUS state changes (toggle, clear)
//   3. extraReducers — handles ASYNC thunk results (pending/fulfilled/rejected)
// ═══════════════════════════════════════════════════════════════
const chatbotSlice = createSlice({
  name: "chatbot",

  initialState: {
    messages: [WELCOME_MESSAGE], // start with the greeting visible
    isOpen: false, // chat panel starts closed
    isTyping: false, // "AI is typing..." indicator
    error: null, // error message if API fails
  },

  // ── SYNCHRONOUS REDUCERS ──────────────────────────────────────
  // These run INSTANTLY — no API calls, no async.
  // Redux Toolkit uses Immer under the hood, so you can write
  // "mutating" code like state.isOpen = !state.isOpen and it
  // safely produces a NEW immutable state object behind the scenes.
  reducers: {
    // ── toggleChat ────────────────────────────────────────────
    // WHY one toggle instead of separate open/close actions?
    //   The FAB button always FLIPS the state — never needs to
    //   force-open or force-close independently. One action is simpler.
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
      // Clear stale errors when reopening — fresh start UX
      if (state.isOpen) {
        state.error = null;
      }
    },

    // ── clearChat ────────────────────────────────────────────
    // Resets conversation but keeps the welcome message.
    // WHY not reset to empty []?
    //   An empty chat looks broken. The welcome message gives
    //   users immediate context about what the assistant can do.
    clearChat: (state) => {
      // Spread WELCOME_MESSAGE to create a fresh object with a
      // new timestamp — avoids mutating the shared constant.
      state.messages = [
        { ...WELCOME_MESSAGE, timestamp: new Date().toISOString() },
      ];
      state.error = null;
    },

    // ── clearError ───────────────────────────────────────────
    // Used if you ever want to dismiss the error programmatically
    // without clearing the whole conversation.
    clearError: (state) => {
      state.error = null;
    },
  },

  // ── ASYNC THUNK HANDLERS ──────────────────────────────────────
  // extraReducers handles the three auto-generated thunk states.
  // builder.addCase() = "when THIS action happens, run THIS reducer".
  extraReducers: (builder) => {
    builder
      // ── PENDING: user just hit send ─────────────────────────
      .addCase(askAssistant.pending, (state, action) => {
        // action.meta.arg = the original argument passed to the thunk
        // = the user's message string. RTK stores it automatically.
        // WHY add the user message HERE (not after fulfillment)?
        //   UX: users expect to see their message instantly.
        //   Waiting for the API response (~1-3 seconds) before showing
        //   it would make the interface feel broken and unresponsive.
        state.messages.push({
          id: generateId(),
          role: "user",
          content: action.meta.arg,
          timestamp: new Date().toISOString(),
        });
        state.isTyping = true;
        state.error = null;
      })

      // ── FULFILLED: Gemini responded successfully ─────────────
      .addCase(askAssistant.fulfilled, (state, action) => {
        // action.payload = the string returned from the thunk (AI's reply)
        state.isTyping = false;
        state.messages.push({
          id: generateId(),
          role: "assistant",
          content: action.payload,
          timestamp: new Date().toISOString(),
        });
      })

      // ── REJECTED: API call failed ────────────────────────────
      .addCase(askAssistant.rejected, (state, action) => {
        state.isTyping = false;
        // action.payload = the rejectWithValue() string from the thunk
        state.error = action.payload || "Failed to get a response.";

        // WHY add an error MESSAGE to the chat (not just set state.error)?
        //   An inline error bubble inside the chat is more natural UX
        //   than a separate banner. The user sees it in context,
        //   right where they expected the AI's reply to appear.
        state.messages.push({
          id: generateId(),
          role: "assistant",
          content:
            "⚠️ I encountered an error. Please check your connection and try again.",
          timestamp: new Date().toISOString(),
          isError: true, // used in ChatBot.jsx for red styling
        });
      });
  },
});

// ── EXPORT ACTIONS ────────────────────────────────────────────────
// WHY destructure from chatbotSlice.actions?
//   createSlice auto-generates action creators for each reducer.
//   { toggleChat, clearChat, clearError } = the functions you dispatch.
//   dispatch(toggleChat()) → Redux calls the toggleChat reducer.
export const { toggleChat, clearChat, clearError } = chatbotSlice.actions;

// ── DEFAULT EXPORT: the reducer ───────────────────────────────────
// This is what store.js imports and registers under the "chatbot" key.
export default chatbotSlice.reducer;

// ── SELECTORS ─────────────────────────────────────────────────────
// WHY selector functions instead of accessing state directly?
//   Components write: useSelector(selectChatMessages)
//   Not:              useSelector(state => state.chatbot.messages)
//
//   Benefit: if you ever rename the slice key or restructure state,
//   you fix it in ONE place here — not in every component that reads it.
export const selectChatMessages = (state) => state.chatbot.messages;
export const selectChatIsOpen = (state) => state.chatbot.isOpen;
export const selectChatIsTyping = (state) => state.chatbot.isTyping;
export const selectChatError = (state) => state.chatbot.error;

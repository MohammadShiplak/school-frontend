// ═══════════════════════════════════════════════════════════════
// FILE: src/components/chatbot/ChatBot.jsx
//
// WHAT THIS IS:
//   A floating chat widget that appears in the bottom-right corner
//   of every page in the dashboard. Users can open it, ask questions
//   about the school, and get AI-powered answers.
//
// PATTERN USED: "Floating Action Button" (FAB) + Slide-up panel
//   This is the same UX pattern used by:
//   - Intercom (customer support chat)
//   - Crisp (live chat)
//   - Google Assistant
//
// WHY FLOATING?
//   It's always accessible without leaving the current page.
//   Users don't lose their place (they're on Students page, ask a question,
//   get an answer, continue working — no navigation needed).
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import {
  askAssistant,
  toggleChat,
  clearChat,
  selectChatMessages,
  selectChatIsOpen,
  selectChatIsTyping,
} from "../../features/chatbot/chatbotSlice";

// ── OUTSIDE COMPONENT: Format timestamp for messages ────────────
// WHY outside? Pure function — no need for component context.
// Converts ISO string → "2:30 PM"
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ── OUTSIDE COMPONENT: Suggested quick questions ─────────────────
// WHY outside? Static data — same on every render.
// These appear as clickable buttons to help users get started.
// WHY provide suggestions?
//   "Blank slate" problem: Users don't know WHAT to ask.
//   Pre-written suggestions lower the barrier to start.
//   Same pattern used by ChatGPT, Gemini, etc.
const SUGGESTED_QUESTIONS = [
  "What features does EduPulse have?",
  "How do I add a new student?",
  "Where can I view attendance records?",
  "How does homework assignment work?",
];

// ── THE MAIN COMPONENT ─────────────────────────────────────────
const ChatBot = () => {
  const dispatch = useDispatch();

  // ── READ REDUX STATE ──────────────────────────────────────────
  const messages = useSelector(selectChatMessages);
  const isOpen = useSelector(selectChatIsOpen);
  const isTyping = useSelector(selectChatIsTyping);

  // ── LOCAL STATE ───────────────────────────────────────────────
  // WHY local state (not Redux) for inputText?
  //   The input field value is TEMPORARY — it only matters while
  //   the user is typing. Once sent, it's cleared.
  //   It's not needed by any OTHER component.
  //   Rule: Local state for temporary UI state. Redux for shared/persistent data.
  const [inputText, setInputText] = useState("");

  // ── REF: Auto-scroll to bottom ───────────────────────────────
  // WHY useRef here?
  //   We need to scroll the message list to the bottom whenever
  //   a new message arrives. useRef gives us DIRECT DOM ACCESS
  //   to the scrollable container without triggering re-renders.
  //
  // WHY not useState?
  //   A state change causes a RE-RENDER.
  //   A ref change does NOT cause a re-render.
  //   We don't NEED to re-render when the ref changes — we just
  //   want to scroll. So useRef is the right tool.
  const messagesEndRef = useRef(null);

  // ── EFFECT: Auto-scroll when messages change ──────────────────
  // WHY useEffect with [messages, isTyping] dependency?
  //   Whenever a new message is added (user sends OR AI responds),
  //   or the typing indicator appears/disappears,
  //   we scroll to the bottom so the latest message is visible.
  //
  // scrollIntoView({ behavior: "smooth" }) = animated smooth scroll
  // vs scrollIntoView() = instant jump (less polished)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // ── HANDLE SEND ───────────────────────────────────────────────
  const handleSend = () => {
    const trimmed = inputText.trim();

    // WHY check trimmed (not inputText)?
    //   inputText = "   " (spaces only) → trimmed = "" → don't send blank message.
    //   .trim() removes leading/trailing whitespace.
    if (!trimmed || isTyping) return;
    // ↑ WHY check isTyping?
    //   Prevent sending while AI is still responding.
    //   Otherwise user could spam messages and API calls would pile up.

    dispatch(askAssistant(trimmed));

    // Clear the input field immediately after sending
    // WHY immediately? Better UX — user can start typing next message.
    setInputText("");
  };

  // ── HANDLE KEYBOARD: Enter to send ───────────────────────────
  // WHY keyboard handler?
  //   Users expect to press Enter to send (like Slack, WhatsApp, etc.)
  //   Without this, they'd have to click the button every time.
  //
  // WHY check e.key === "Enter" AND NOT e.shiftKey?
  //   Enter alone → send the message.
  //   Shift+Enter → new line (multi-line input support).
  //   This matches the behavior of every major chat app.
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent the default Enter behavior (form submit / newline)
      handleSend();
    }
  };

  // ── HANDLE SUGGESTION CLICK ───────────────────────────────────
  // When user clicks a quick question, fill the input AND send immediately.
  // WHY send immediately (not just fill)?
  //   Clicking a suggestion = user has already made their choice.
  //   They don't need to edit it. Immediate send is more efficient.
  const handleSuggestionClick = (question) => {
    dispatch(askAssistant(question));
  };

  // ── HANDLE CLEAR ──────────────────────────────────────────────
  const handleClear = () => {
    dispatch(clearChat());
  };

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    // WHY fixed positioning?
    //   The widget must stay in the corner regardless of scroll position.
    //   "fixed" positions relative to the VIEWPORT (browser window).
    //   "absolute" would position relative to the nearest positioned parent.
    //   Fixed = always visible, always in the corner. That's what we want.
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* ── CHAT PANEL ─────────────────────────────────────────── */}
      {/* WHY conditional render (not display:none)?
          When isOpen is false, the component is NOT in the DOM.
          This means React doesn't render it at all — more efficient.
          The messages stay in REDUX, so history is preserved.
          The COMPONENT unmounts but the STATE (Redux) survives. */}
      {isOpen && (
        <div
          className="w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl 
                     border border-slate-100 flex flex-col overflow-hidden
                     animate-in slide-in-from-bottom-4 fade-in duration-200"
          // ↑ WHY these animation classes?
          //   Tailwind CSS animate-in plugin makes the panel slide up from below.
          //   This matches the "card appears from the button" UX pattern.
          //   WITHOUT animation: panel just pops in abruptly (jarring).
          //   With animation: feels smooth and polished.
        >
          {/* ── HEADER ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600">
            {/* AI Identity */}
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4.5 h-4.5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">
                  EduPulse AI
                </p>
                <p className="text-[10px] text-indigo-200 mt-0.5 flex items-center gap-1">
                  {/* Online indicator dot */}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  School Assistant
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {/* Clear chat */}
              <button
                onClick={handleClear}
                title="Clear conversation"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>

              {/* Close button */}
              <button
                onClick={() => dispatch(toggleChat())}
                title="Close chat"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* ── MESSAGES AREA ───────────────────────────────────── */}
          {/* WHY overflow-y-auto?
              When messages exceed the panel height, scroll within this container.
              Without it: messages would push the panel taller (bad). */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
            {/* ── RENDER ALL MESSAGES ─────────────────────────── */}
            {messages.map((message) => (
              <div
                key={message.id}
                // WHY dynamic className based on role?
                //   User messages → right-aligned (like WhatsApp, iMessage).
                //   AI messages → left-aligned.
                //   This is a universal chat UX pattern users already understand.
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* AI Avatar (only for assistant messages) */}
                {message.role === "assistant" && (
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-3.5 h-3.5 text-indigo-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                      />
                    </svg>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`
                    max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed
                    ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-sm"
                        : message.isError
                          ? "bg-red-50 border border-red-100 text-red-700 rounded-bl-sm"
                          : "bg-white border border-slate-100 text-slate-800 shadow-sm rounded-bl-sm"
                    }
                  `}
                  // ↑ WHY different corner rounding?
                  //   rounded-br-sm (user) = bottom-right corner flat
                  //   rounded-bl-sm (AI) = bottom-left corner flat
                  //   This is a subtle design trick that "points" the bubble
                  //   toward the sender's side. Polished chat apps do this.
                >
                  {/* ── MARKDOWN RENDERING ──────────────────────
                      WHY ReactMarkdown?
                        The AI often responds with **bold text**, bullet lists, etc.
                        Without markdown rendering, users see raw "**bold**" syntax.
                        ReactMarkdown converts markdown → proper HTML elements.
                      
                      WHY only for assistant messages?
                        User messages are plain text — no markdown needed.
                        (Users could theoretically type markdown but it's unusual.)
                      
                      components prop: WHY override default elements?
                        ReactMarkdown renders <p> tags with margins by default.
                        We override them to control spacing precisely.
                        p → no extra margin (our bubble already has padding)
                        ul → smaller font, proper list spacing
                        strong → bold text (Tailwind needs explicit font-bold)
                  */}
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-1.5 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-0.5 my-1.5">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-xs">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold">{children}</strong>
                        ),
                        code: ({ children }) => (
                          <code className="bg-slate-100 rounded px-1 py-0.5 text-[11px] font-mono">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <span>{message.content}</span>
                  )}

                  {/* Timestamp */}
                  <p
                    className={`text-[10px] mt-1 ${
                      message.role === "user"
                        ? "text-indigo-200 text-right"
                        : "text-slate-400"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* ── TYPING INDICATOR ────────────────────────────── */}
            {/* WHY show this?
                When the AI is generating a response, users need feedback.
                Without it: the UI looks frozen for 1-3 seconds (confusing).
                With it: users know something is happening. */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3.5 h-3.5 text-indigo-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
                    />
                  </svg>
                </div>
                {/* Three animated dots — the "typing" animation */}
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                      // ↑ WHY staggered delay?
                      //   Each dot bounces at a slightly different time.
                      //   This creates the "typing wave" effect.
                      //   Without delay: all 3 dots bounce simultaneously (less realistic).
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── SCROLL ANCHOR ────────────────────────────────── */}
            {/* WHY an empty div with a ref?
                scrollIntoView() needs a DOM element to scroll TO.
                We put this at the END of the messages list.
                When it's scrolled into view, the latest message is visible.
                This is a common React pattern for auto-scrolling. */}
            <div ref={messagesEndRef} />
          </div>

          {/* ── SUGGESTIONS (only show when few messages) ──────── */}
          {/* WHY hide after messages? 
              Once conversation is going, suggestions take up space.
              We show them only at the start to guide new users.
              messages.length <= 2 means: only welcome + (maybe) 1 exchange */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestionClick(q)}
                  disabled={isTyping}
                  className="text-[11px] px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 
                             text-indigo-700 rounded-full border border-indigo-100 
                             transition disabled:opacity-50 text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* ── INPUT AREA ──────────────────────────────────────── */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <div className="flex items-end gap-2">
              {/* Text input */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about students, teachers, homework..."
                rows={1}
                disabled={isTyping}
                className="flex-1 resize-none border border-slate-200 rounded-xl 
                           px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 
                           focus:border-indigo-500 transition disabled:opacity-50
                           max-h-24 overflow-y-auto"
                // WHY textarea instead of input type="text"?
                //   textarea supports multi-line input.
                //   With rows={1} and max-h-24, it starts as one line
                //   but expands as the user types more.
                //   input type="text" stays one line forever.
              />

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className="w-9 h-9 flex items-center justify-center shrink-0
                           bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 
                           text-white rounded-xl transition shadow-sm 
                           shadow-indigo-200 active:scale-95"
              >
                {isTyping ? (
                  // Show spinner while AI is responding
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                ) : (
                  // Send icon (paper plane)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">
              Press{" "}
              <kbd className="bg-slate-100 border border-slate-200 rounded px-1 text-[10px]">
                Enter
              </kbd>{" "}
              to send ·{" "}
              <kbd className="bg-slate-100 border border-slate-200 rounded px-1 text-[10px]">
                Shift+Enter
              </kbd>{" "}
              for new line
            </p>
          </div>
        </div>
      )}

      {/* ── FLOATING ACTION BUTTON (FAB) ───────────────────────── */}
      {/* This is always visible — clicking opens/closes the chat panel.
          WHY always visible?
            Users need to be able to open the chat from ANY page.
            If we hid the button, they'd have no way to open the chat.
          
          WHY gradient + shadow?
            The button needs to stand out from the page content.
            gradient = visually distinct from white/slate backgrounds.
            shadow = visual depth, makes it feel "floating" above content. */}
      <button
        onClick={() => dispatch(toggleChat())}
        className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 
                   hover:from-indigo-700 hover:to-violet-700
                   text-white rounded-2xl shadow-xl shadow-indigo-300/50 
                   flex items-center justify-center
                   transition-all duration-200 active:scale-95 hover:scale-105
                   focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        // ↑ WHY aria-label? Accessibility — screen readers announce this label.
      >
        {/* Toggle between chat icon (closed) and X icon (open) */}
        {isOpen ? (
          // X icon when open (clicking closes the panel)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Sparkle/AI icon when closed (clicking opens the panel)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatBot;

import tailwindcss from "@tailwindcss/vite";
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // scan all your files
  ],
  theme: {
    extend: {},
  },
  plugins: [tailwindcss()],

  server: {
    port: 5173, // ✅ always use this port
    strictPort: true, // ✅ if 5173 is busy → crash instead of picking random port
    //    this way you KNOW immediately there's a conflict
  },
};

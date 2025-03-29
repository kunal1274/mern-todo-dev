import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import dotenv from 'dotenv';

// dotenv.config(); // Load `.env` manually

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// import { defineConfig } from 'vite';



// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  console.log(`Running in ${mode} mode`);
  

  return {
    plugins: [react()], // Include the React plugin here
    
    define: {
      'process.env': { ...process.env }, // Use spread operator to copy all environment variables
    },
    // server: {
    //   port: parseInt(process.env.VITE_PORT, 10) || 5173, // Use the env variable or default to 5173
    //   //port : process.env.VITE_PORT
    // },
    server: {
      proxy: {
        "/api": {
          //target: "https://reliably-moving-dog.ngrok-free.app",
          target:"http://localhost:5051",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
  };
});




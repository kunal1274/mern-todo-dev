import axios from 'axios';

async function validateBackendUrl() {
  console.log('Environment Variables:', import.meta.env);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  if (!backendUrl) {
    throw new Error('VITE_BACKEND_URL is not defined in the environment variables.');
  }

  let url;
  try {
    url = new URL(backendUrl);
    console.log(`Valid URL format detected: ${url.href}`);
  } catch (formatError) {
    throw new Error(`Invalid URL format: ${backendUrl}`);
  }

  // try {
  //   const response = await axios.head(url.href);
  //   if (response.status >= 200 && response.status < 400) {
  //     console.log(`Backend URL is reachable: ${url.href}`);
  //   } else {
  //     throw new Error(`Backend URL is not reachable. Status: ${response.status}`);
  //   }
  // } catch (networkError) {
  //   throw new Error(`Backend URL is not reachable: ${url.href}. Network error: ${networkError.message}`);
  // }
}

export default validateBackendUrl;
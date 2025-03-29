// client/src/App.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        // Define the API URL based on environment variables
        const apiUrl = `https://reliably-moving-dog.ngrok-free.app/api`;

        axios.get(apiUrl, { withCredentials: true })
            .then(response => {
                console.log('API Response:', response.data);
                setMessage(response.data.backendMessage);
            })
            .catch(err => {
                console.error('Axios Fetch Error:', err);
                setError(err.message);
            });
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div>
                <h1 className="text-4xl font-bold text-blue-500">Hello, MERN with Tailwind NEW!</h1>
                {error ? (
                    <p className="mt-4 text-lg text-red-500">Error: {error}</p>
                ) : (
                    <p className="mt-4 text-lg">{message}</p>
                )}
            </div>
        </div>
    );
}

export default App;

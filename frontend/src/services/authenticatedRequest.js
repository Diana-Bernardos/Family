import axios from 'axios';

// Esta función maneja las solicitudes HTTP autenticadas
const authenticatedRequest = async (method, url, data = {}) => {
  // Obtén el token de autenticación (asumido que está en el localStorage)
  const token = localStorage.getItem('authToken'); // o sessionStorage

  // Si no hay token, no hagas la solicitud
  if (!token) {
    throw new Error('No se encontró el token de autenticación');
  }

  // Configura los encabezados de la solicitud con el token
  const config = {
    method: method,
    url: url,
    headers: {
      'Authorization': `Bearer ${token}`, // Utiliza el token en el header
      'Content-Type': 'application/json',
    },
    data: data, // Si la solicitud tiene cuerpo (POST, PUT, etc.)
  };

  try {
    const response = await axios(config);
    return response.data; // Devuelve los datos de la respuesta
  } catch (error) {
    console.error('Error en la solicitud autenticada:', error);
    throw error; // Propaga el error
  }
};

export default authenticatedRequest;

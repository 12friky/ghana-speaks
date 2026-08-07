import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://pollserver-mj1g.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api





// export default api

// import axios from 'axios'

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// export default api

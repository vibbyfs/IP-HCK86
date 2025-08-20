import axios from "axios";

const http = axios.create({
    baseURL: import.meta.env.VITE_LOCAL_PORT
})

export default http
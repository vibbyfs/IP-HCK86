import axios from "axios";

const http = axios.create({
    baseURL: "https://api-heyremindly.vibbyfs.web.id/api/"
})

export default http
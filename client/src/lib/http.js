import axios from "axios";

const http = axios.create({
    baseURL: "https://social-reminders.vibbyfs.web.id/api/"
})

export default http
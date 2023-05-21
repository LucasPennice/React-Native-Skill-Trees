import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://server.lpenn.dev/api/",
});

export default axiosClient;

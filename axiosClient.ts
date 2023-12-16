import axios from "axios";

const DEV_SERVER_URI = "https://devserver.skilltreesapp.com/api/";
const PRODUCTION_SERVER_URI = "https://server.skilltreesapp.com/api/";

const axiosClient = axios.create({
    baseURL: process.env.NODE_ENV === "development" ? DEV_SERVER_URI : PRODUCTION_SERVER_URI,
});

export default axiosClient;

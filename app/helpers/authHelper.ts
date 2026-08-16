import Cookies from "js-cookie";

export const getToken = () =>
    Cookies.get("access_token");

export const getUserId = () =>
    Cookies.get("user_id");

export const logout = () => {
    Cookies.remove("access_token");
    Cookies.remove("user_id");
};
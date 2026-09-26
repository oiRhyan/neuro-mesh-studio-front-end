import { CheckSessionType, LoginRequestForm, LoginRequestResponse } from "@/types/Authorization.type";
import { tripoApi } from "../core/api";

export async function AuthorizateUser(
    payload: LoginRequestForm
) : Promise<LoginRequestResponse> {
   const response = await tripoApi.post<LoginRequestResponse>("User/auth", payload);
   return response.data;
}

export async function checkUserSession(): Promise<CheckSessionType> {
   const response = await tripoApi.get("User/me");
   return response.data;
}

export async function logout() {
    const response = await tripoApi.post("User/logout");
    return response.data;
}
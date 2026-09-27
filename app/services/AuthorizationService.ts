'use server'
import { CheckSessionType, LoginRequestForm, LoginRequestResponse } from "@/types/Authorization.type";
import { getApiClient } from "../core/api";

export async function AuthorizateUser(
    payload: LoginRequestForm
) : Promise<LoginRequestResponse> {
   const apiClient = await getApiClient();
   const response = await apiClient.post<LoginRequestResponse>("User/auth", payload);
   console.log("[API RESPONSE]", response);
   return response.data;
}

export async function checkUserSession(): Promise<CheckSessionType> {
    const apiClient = await getApiClient();
   const response = await apiClient.get("User/me");
   return response.data;
}

export async function logout() {
    const apiClient = await getApiClient();
    const response = await apiClient.post("User/logout");
    return response.data;
}
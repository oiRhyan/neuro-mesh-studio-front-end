import { LoginRequestForm, LoginRequestResponse } from "@/types/Authorization.type";
import { tripoApi } from "../core/api";

export default async function AuthorizateUser(
    payload: LoginRequestForm
) : Promise<LoginRequestResponse> {
   const response = await tripoApi.post<LoginRequestResponse>("User/auth", payload);
   return response.data;
}
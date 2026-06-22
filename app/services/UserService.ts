import { RegisterUserForm, RegisterUserResult } from "@/types/User.type";
import { tripoApi } from "../core/api";

export default async function RegisterUser(
    payload: RegisterUserForm
) : Promise<RegisterUserResult> {
    
    const formData = new FormData();

    formData.append("Name", payload.Name);
    formData.append("Email", payload.Email);
    formData.append("Password", payload.Password);
    formData.append("ImageProfile", payload.ImageProfile ?? '');
    formData.append("ImageBanner", payload.ImageBanner ?? '');
    formData.append("Biography", payload.Biography);

    const response = await tripoApi.post<RegisterUserResult>("User", formData);
    return response.data;
}
import { GetUserByIdResponse, RegisterUserForm, RegisterUserResult, UpdateUserFormRequest, UpdateUserFormResponse } from "@/types/User.type";
import { tripoApi } from "../core/api";

export async function RegisterUser(
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

export async function UpdateUser(
    userId: string,
    payload: UpdateUserFormRequest
) : Promise<UpdateUserFormResponse> {
   const formData = new FormData();

   formData.append('Name', payload.Name ?? ''),
   formData.append('Biography', payload.Biography ?? ''),
   formData.append('ImageProfile', payload.ImageProfile ?? ''),
   formData.append('ImageBanner', payload.ImageBanner ?? '')

   const response = await tripoApi.patch<UpdateUserFormResponse>(`User/update/${userId}`, formData);
   return response.data;
}

export async function getUserById(
    userId: string
) : Promise<GetUserByIdResponse> {
    const response = await tripoApi.get<GetUserByIdResponse>(`User/${userId}`);
   return response.data;
}
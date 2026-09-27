'use server'
import { GetUserByIdResponse, RegisterUserForm, RegisterUserResult, UpdateUserFormRequest, UpdateUserFormResponse } from "@/types/User.type";
import { getApiClient } from "../core/api";

export async function RegisterUser(
    payload: RegisterUserForm
) : Promise<RegisterUserResult> {
    const apiClient = await getApiClient();
    const formData = new FormData();

    formData.append("Name", payload.Name);
    formData.append("Email", payload.Email);
    formData.append("Password", payload.Password);
    formData.append("Biography", payload.Biography);

    if (payload.ImageProfile) {
        formData.append("ImageProfile", payload.ImageProfile);
    }
    if (payload.ImageBanner) {
        formData.append("ImageBanner", payload.ImageBanner);
    }

    const response = await apiClient.post<RegisterUserResult>("User", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
}

export async function UpdateUser(
    userId: string,
    payload: UpdateUserFormRequest
) : Promise<UpdateUserFormResponse> {
   const formData = new FormData();
   const apiClient = await getApiClient();

   formData.append('Name', payload.Name ?? ''),
   formData.append('Biography', payload.Biography ?? ''),
   formData.append('ImageProfile', payload.ImageProfile ?? ''),
   formData.append('ImageBanner', payload.ImageBanner ?? '')

   const response = await apiClient.patch<UpdateUserFormResponse>(`User/update/${userId}`, formData, {
       headers: {
            "Content-Type": "multipart/form-data",
       },
   });
   return response.data;
}

export async function getUserById(
    userId: string
) : Promise<GetUserByIdResponse> {
   const apiClient = await getApiClient();
   const response = await apiClient.get<GetUserByIdResponse>(`User/${userId}`);
   return response.data;
}
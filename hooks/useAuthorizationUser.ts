'use client'

import { AuthorizateUser } from "@/app/services/AuthorizationService";
import { LoginRequestForm } from "@/types/Authorization.type";
import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function useAuthorization(router: AppRouterInstance) {

    const loginMutation = useMutation({
        mutationFn: async (body: LoginRequestForm) => {
            const request = await AuthorizateUser(body);

            Cookies.set(
                "user",
                JSON.stringify(request.user),
                {
                    expires: 8,
                    sameSite: "strict",
                    path: "/"
                }
            );

            return request;
        },
        onError: (error: Error) => {
            const axiosError = error as AxiosError<{ error: string }>;
            toast.error(
                axiosError.response?.data?.error ??
                "Erro ao autenticar usuário"
            );
        },
        onSuccess: () => {
            router.push("/home");
        }
    });

    return {
        login: loginMutation.mutateAsync,
        isLoading: loginMutation.isPending,
    };
}
'use client'

import AuthorizateUser from "@/app/services/AuthorizationService";
import { LoginRequestForm } from "@/types/Authorization.type";
import { useMutation } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type JwtPayload = {
    exp: number;
};

export function useAuthorization(router: AppRouterInstance) {

    const loginMutation = useMutation({
        mutationFn: async (body: LoginRequestForm) => {
            const request = await AuthorizateUser(body);

            if (!request) {
                throw new Error("Erro ao autenticar usuário");
            }

            if (request.error) {
                throw new Error(request.error);
            }

            const decoded = jwtDecode<JwtPayload>(
                request.token
            );

            const expiresAt = new Date(
                decoded.exp * 1000
            );

            Cookies.set(
                "access-token",
                request.token,
                {
                    expires: expiresAt,
                    sameSite: "strict",
                }
            );

            Cookies.set(
                "user",
                JSON.stringify(request.user),
                {
                    expires: expiresAt,
                    sameSite: "strict",
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
export interface LoginRequestForm {
    email: string,
    password: string
}

export interface LoginRequestResponse {
    token: string,
    generateAt: Date,
    user: {
        id: string,
        userName: string,
        imageProfile: string,
        banner: string,
        biography: string,
    },
    error?: string
}
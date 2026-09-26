export interface LoginRequestForm {
    email: string,
    password: string
}

export interface LoginRequestResponse {
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

export interface CheckSessionType {
    id: string,
    name: string
}
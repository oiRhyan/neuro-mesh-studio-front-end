export interface User {
    Id: string,
    CreatedAt: Date
    UserEmail: string,
    Profile: {
        UserName: string,
        ProfileImage: string,
        BannerImage: string,
        Biography: string
    }
}

export interface RegisterUserForm {
    Name: string,
    Email: string,
    Password: string,
    ImageProfile: File | null,
    ImageBanner: File | null,
    Biography: string
}

export interface RegisterUserResult {
    Id: string,
    DateTime: Date
}
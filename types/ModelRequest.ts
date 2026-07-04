export type CreateModelRequest = {
    type: string,
    model_version: string,
    file: File
}

export type SaveModelRequest = {
    userId: string,
    title: string,
    thumbnail: string | File,
    description: string,
    public: boolean,
    model: string
}

export type SavedModels = {
    id: string,
    title: string,
    description: string,
    isPublic: boolean,
    thumbnail: string
    createdAt: Date
    model: string
}

export type DeleteModel = {
   modelId: string
}
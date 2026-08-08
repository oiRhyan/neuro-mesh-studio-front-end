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

export type PublicModelRequest = {
    publicModels: PublicModel[]
}

export type PublicModel = {
    modelThumbnail: string,
    modelTitle: string,
    modelDescription: string,
    pbrModel: string,
    user: {
        userName: string,
        profileImage: string,
        bannerImage: string,
        biography: string
    }
}

export type RiggCheckModelResponse = {
    task_id: string,
    rig_type: string
}

export type RiggExecutorResponse = {
    task_id: string
}
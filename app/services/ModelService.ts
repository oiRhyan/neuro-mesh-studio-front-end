import { tripoApi } from "../core/api";
import { CreateModelRequest, DeleteModel, PublicModel, PublicModelRequest, RiggCheckModelResponse, RiggExecutorResponse, SavedModels, SaveModelRequest } from "@/types/ModelRequest";

function base64ToBlob(base64Data: string, contentType = 'image/png') {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
}

export async function createModel(
    payload: CreateModelRequest
) {
    const formData = new FormData();

    formData.append("Type", payload.type);
    formData.append("ModelVersion", payload.model_version);
    formData.append("File", payload.file);

    const response = await tripoApi.post<string>('Tripo', formData);
    return response.data;
}

export async function getModelStatus(
    payload: string
) {
    const response = await tripoApi.get('Tripo/status', { params: { taskid: payload } });
    return response.data;
}

export async function saveModel(payload: SaveModelRequest) {
    const form = new FormData();

    form.append('UserID', payload.userId);
    form.append('Title', payload.title);
    form.append('Description', payload.description);
    form.append('Public', String(payload.public));
    form.append('Model', payload.model);

    if (typeof payload.thumbnail === 'string') {
        if (payload.thumbnail.startsWith('data:')) {
            const imageBlob = base64ToBlob(payload.thumbnail);
            form.append('Thumbnail', imageBlob, 'thumbnail.png');
        } else {
            form.append('Thumbnail', payload.thumbnail);
        }
    } else {
        form.append('Thumbnail', payload.thumbnail);
    }

    const response = await tripoApi.post('Tripo/save', form, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}

export async function getListModels(
    userId: string
) {
    const response = await tripoApi.get<{ models: Array<SavedModels> }>(`Tripo/models?UserId=${userId}`);
    return response.data;
}

export async function deleteModel(
    modelId: string
) {
    const body: DeleteModel = {
        modelId: modelId
    }
    const response = await tripoApi.delete('Tripo', { data: body });
    return response.data;
}

export async function getPublicModels() {
    const response = await tripoApi.get<PublicModelRequest>('Tripo/models/public');
    return response.data;
}

export async function checkRiggModel(
    task_id: string
) {
   const response = await tripoApi.post<RiggCheckModelResponse>("Tripo/models/checking", {
      modelUrl: task_id
   });
   return response.data;
}

export async function executeRiggModel(
    task_id: string,
    rig_type: string
) {
    const response = await tripoApi.post<RiggExecutorResponse>("Tripo/models/rig", {
        task_id,
        rig_type
    });
    return response.data;
}
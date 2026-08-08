'use client';

import { checkRiggModel, createModel, getModelStatus, executeRiggModel } from '@/app/services/ModelService';
import { useState } from 'react';

export type GenerationStep = 'idle' | 'generating' | 'checking_rig' | 'rigging';

export function useGenerateModel() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState<GenerationStep>('idle');
    const [modelUrl, setModelUrl] = useState<string>();

    async function pollUntilSuccess(taskId: string, label = "Task"): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log(`[Model Pipeline] ⏳ Iniciando polling para: ${label} (${taskId})`);

            const interval = setInterval(async () => {
                try {
                    const response: any = await getModelStatus(taskId);
                    
                    if (!response) return;

                    const taskData = response.data ? response.data : response;
                    
                    const currentStatus = taskData.status || taskData.Status;
                    const currentProgress = taskData.progress ?? taskData.Progress ?? 0;

                    setProgress(currentProgress);
                    console.log(`[Model Pipeline] 📊 [${label}] Progresso: ${currentProgress}% | Status: ${currentStatus}`);

                    if (currentStatus === "success" || currentStatus === "SUCCESS") {
                        console.log(`[Model Pipeline] ✅ [${label}] Concluído com sucesso!`);
                        clearInterval(interval);
                        resolve(taskData);
                    } else if (currentStatus === "failed" || currentStatus === "FAILED") {
                        console.error(`[Model Pipeline] ❌ [${label}] Falhou na Tripo3D.`);
                        clearInterval(interval);
                        reject(new Error(`Task ${taskId} (${label}) falhou.`));
                    }
                } catch (error) {
                    console.error(`[Model Pipeline] ❌ Erro crítico no polling de ${label}:`, error);
                    clearInterval(interval);
                    reject(error);
                }
            }, 5000);
        });
    }

    async function generate(image: File) {
        try {
            console.log("[Model Pipeline] Started", image);
            setLoading(true);
            setModelUrl(undefined);

            setStep('generating');
            setProgress(0);
            
            const createResponse: any = await createModel({
                type: "image_to_model",
                model_version: "v3.0-20250812",
                file: image
            });
            
            const baseTaskId = createResponse?.data?.taskId || createResponse?.data?.task_id || 
                               createResponse?.taskId || createResponse?.task_id;
                               
            console.log("[Model Pipeline] Base TaskId:", baseTaskId);
            
            if (!baseTaskId) {
                throw new Error("Não foi possível obter o task_id da criação do modelo.");
            }

            await pollUntilSuccess(baseTaskId, "Generation");

            setStep('checking_rig');
            setProgress(0);
            
            const checkResponse: any = await checkRiggModel(baseTaskId);
            const checkTaskId = checkResponse?.data?.taskId || checkResponse?.data?.task_id || 
                                checkResponse?.taskId || checkResponse?.task_id;
                                
            console.log("[Model Pipeline] Checking Rig TaskId:", checkTaskId);

            if (!checkTaskId) {
                throw new Error("Não foi possível obter o task_id do Rigg Check.");
            }

            const checkStatus = await pollUntilSuccess(checkTaskId, "Rig Check");
            
            let rigType = checkStatus.output?.rig_type || checkStatus.Rig_type || checkStatus.rig_type;
            if (rigType === "other" || !rigType) {
                rigType = "bipped";
            }
            console.log("[Model Pipeline] Rig Type selecionado:", rigType);

            setStep('rigging');
            setProgress(0);
            
            const rigResponse: any = await executeRiggModel(baseTaskId, rigType);
            const rigTaskId = rigResponse?.data?.taskId || rigResponse?.data?.task_id || 
                              rigResponse?.taskId || rigResponse?.task_id;
                              
            console.log("[Model Pipeline] Rigging TaskId:", rigTaskId);

            if (!rigTaskId) {
                throw new Error("Não foi possível obter o task_id da execução do Rig.");
            }

            const rigStatus = await pollUntilSuccess(rigTaskId, "Rigging Execution");

            const glbUrl = rigStatus.output?.model_url || rigStatus.ModelUrl || rigStatus.model_url;
            console.log("[Model Pipeline] Final GLB URL:", glbUrl);

            if (glbUrl) {
                const proxiedUrl = `https://localhost:7103/api/Tripo/download?url=${encodeURIComponent(glbUrl)}`;
                setModelUrl(proxiedUrl);
            } else {
                throw new Error("O processo finalizou, mas a URL do modelo 3D não foi retornada.");
            }

        } catch (error: any) {
            console.error("[Model Pipeline] Error:", error);
        } finally {
            setLoading(false);
            setStep('idle');
            setProgress(0);
        }
    }

    return {
        generate,
        loading,
        progress,
        step,
        modelUrl
    };
}
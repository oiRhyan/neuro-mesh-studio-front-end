'use client'

import { createModel, getModelStatus } from '@/app/services/ModelService';
import { useState } from 'react';

export function useGenerateModel() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [modelUrl, setModelUrl] = useState<string>();

    async function generate(image: File) {
        try {
            console.log("[Model Generation] Started");
            console.log("[Model Generation] Image:", image);

            setLoading(true);

            const createResponse: any = await createModel({
                type: "image_to_model",
                model_version: "v3.1-20260211",
                file: image
            });

            console.log("[Model Generation] Raw Response:", createResponse);
            const taskId = createResponse.taskId;
            console.log("[Model Generation] TaskId:", taskId);
            startPolling(taskId);

        } catch (error: any) {
            console.error("[Model Generation] Error:", error);
            console.error("[Model Generation] Status:", error.response?.status);
            console.error("[Model Generation] Data:", error.response?.data);
            console.error("[Model Generation] Full Response:", error.response);
            setLoading(false);
        }
    }

    async function startPolling(taskId: string) {
        console.log("[Polling] Started with taskId:", taskId);

        const interval = setInterval(async () => {

            try {
                console.log("[Polling] Requesting status for:", taskId);
                const status: any = await getModelStatus(taskId);

                console.log("[Polling] Raw Response:", status);
                console.log("[Polling] Response JSON:", JSON.stringify(status, null, 2));

                const task = status;

                if (!task) {
                    console.error("[Polling] Task is undefined");
                    return;
                }

                setProgress(task.progress ?? 0);

                console.log("[Polling] Task:", task);

                if (task.status === "success") {
                    console.log("[Polling] Model generation completed");

                    const glbUrl = task.output?.model_url;

                    console.log("[Polling] GLB URL:", glbUrl);

                    if (glbUrl) {
                        const proxiedUrl =
                            `https://localhost:7103/api/Tripo/download?url=${encodeURIComponent(glbUrl)}`;

                        console.log("[Polling] Proxied URL:", proxiedUrl);
                        setModelUrl(proxiedUrl);
                        clearInterval(interval);
                        setLoading(false);
                    }
                }

                if (task.status === "failed") {
                    console.error("[Polling] Generation failed");
                    clearInterval(interval);
                    setLoading(false);
                }
            } catch (err: any) {
                console.error("[Polling] Error:", err);
                console.error("[Polling] Status:", err.response?.status);
                console.error("[Polling] Data:", err.response?.data);
                console.error("[Polling] Full Response:", err.response);
                clearInterval(interval);
                setLoading(false);
            }
        }, 5000);
    }

    return {
        generate,
        loading,
        progress,
        modelUrl
    };
}
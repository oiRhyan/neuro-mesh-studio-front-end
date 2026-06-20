'use client'
import { Progress } from "@/components/ui/progress"
import '../../studio.scss';

type LoadingProps = {
    progress: number,
    loading: boolean
}

export function LoadingModel({ loading, progress }: LoadingProps) {
    if (!loading) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#12141A]/80 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Gerando Modelo
                        </h2>

                        <h1 className="text-sm text-zinc-400">
                            Processando malha 3D...
                        </h1>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                    </div>
                </div>

                <Progress
                    value={progress}
                    id="progress-upload"
                    className="h-3 rounded-full"
                />

                <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                        Aguarde alguns instantes
                    </span>

                    <span className="font-medium text-violet-300">
                        {progress}%
                    </span>
                </div>
            </div>
        </div>
    );
}
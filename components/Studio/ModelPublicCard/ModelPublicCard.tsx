import Image from 'next/image';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

interface ModelPublicCardProps {
    title?: string;
    imageUrl?: string;
    avatarUrl?: string;
    authorName?: string;
}

export default function ModelPublicCard({
    title = "",
    imageUrl = "",
    avatarUrl = "",
    authorName = ""
}: ModelPublicCardProps) {
    return (
        <div className="group relative flex flex-col w-full overflow-hidden rounded-2xl border border-white/5 bg-[#13131a]/60 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/5">
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="
                    object-contain
                    object-center
                    p-4
                    transition-transform
                    duration-500
                    group-hover:scale-105
                    "
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent opacity-90" />
            </div>
            <div className='flex items-center justify-between p-3 gap-3 bg-black/20'>
                <div className="flex flex-col min-w-0 font-sans">
                    <h3 className="fontfamily font-medium text-xs text-gray-200 truncate group-hover:text-purple-400 transition-colors tracking-wide">
                        {title}
                    </h3>
                    <p className="fontfamily text-[11px] text-gray-500 truncate mt-0.5">
                        por <span className="text-purple-400/70 hover:underline cursor-pointer">{authorName}</span>
                    </p>
                </div>
                <Avatar className="size-7 shrink-0 ring-1 ring-white/10 group-hover:ring-purple-500/30 transition-all">
                    <AvatarImage src={avatarUrl} alt={authorName} />
                </Avatar>
            </div>
        </div>
    );
}
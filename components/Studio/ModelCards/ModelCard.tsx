import BorderGlow from "./Glow/BorderGlow";

type Props = {
  imageUrl: string;
  title: string;
};

export function ModelCard({
  imageUrl,
  title,
}: Props) {
  return (
    <BorderGlow
      edgeSensitivity={30}
      glowColor="40 80 80"
      backgroundColor="#120F17"
      borderRadius={20}
      glowRadius={18}
      glowIntensity={1}
      coneSpread={32}
      animated={false}
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
    >
      <div className="w-[115px] h-[120px] overflow-hidden rounded-[20px] bg-[#120F17] flex flex-col">
        
        {/* Thumbnail */}
        <div className="h-[130px] w-full bg-zinc-900">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-zinc-500 text-3xl font-bold">
                3D
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-1 px-3 py-2 border-t border-white/10 flex items-center">
          <span className="text-sm text-white truncate">
            {title}
          </span>
        </div>
      </div>
    </BorderGlow>
  );
}
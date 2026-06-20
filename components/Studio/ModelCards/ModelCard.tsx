import BorderGlow from "./Glow/BorderGlow";

type Props = {
  title: string,
  thumbnail: string,
  onClick?: () => void;
};

export function ModelCard({
  title,
  thumbnail,
  onClick
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
      className="overflow-hidden"
    >
      <div className="w-[90px] h-[110px] overflow-hidden rounded-[20px] bg-[#120F17] flex flex-col" onClick={onClick}>
        <div className="h-[80px] w-[110px] bg-zinc-900 overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
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
        <div className="flex-1 px-3 py-2 border-t border-white/10 flex items-center overflow-hidden">
          <span className="text-sm text-white truncate">
            {title}
          </span>
        </div>
      </div>
    </BorderGlow>
  );
}
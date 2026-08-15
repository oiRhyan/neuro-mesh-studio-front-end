import BorderGlow from "./Glow/BorderGlow";

type Props = {
  title: string;
  thumbnail: string;
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
      className="w-fit h-fit rounded-[20px]"
    >
      <div 
        className="w-[100px] h-[140px] overflow-hidden rounded-[20px] bg-[#120F17] flex flex-col cursor-pointer" 
        onClick={onClick}
      >
        <div className="h-[90px] w-full bg-zinc-900 overflow-hidden shrink-0">
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
        <div className="flex-1 border-t border-white/10 flex items-center px-1 overflow-hidden">
          <span className="text-sm text-white truncate w-full text-center">
            {title}
          </span>
        </div>
      </div>
    </BorderGlow>
  );
}
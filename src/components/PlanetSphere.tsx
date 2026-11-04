export function PlanetSphere({ sizePx, textureUrl }: { sizePx: number, textureUrl: string }) {
  return (
    <div
      className="planet-sphere"
      style={{
        width: `${sizePx}px`,
        height: `${sizePx}px`,
        backgroundImage: `url('${textureUrl}')`,
      }}
    />
  );
}
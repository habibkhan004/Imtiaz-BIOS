export function Particles() {
  return (
    <div className="particles">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="particle" key={i} />
      ))}
    </div>
  );
}

export function ViewerTopbar() {
  return (
    <div className="viewer-topbar">
      <select>
        <option>Perspective</option>
      </select>

      <select>
        <option>Tripo P1</option>
        <option>Tripo v3.1</option>
        <option>Tripo v2.5</option>
      </select>

      <select>
        <option>Studio</option>
        <option>City</option>
        <option>Night</option>
      </select>
    </div>
  );
}
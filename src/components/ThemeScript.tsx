// Runs in <head> before first paint: applies the saved theme, or dark if none is saved.
// Prevents a flash of the wrong theme for visitors who picked light.
const script = `(function(){
  var t = null;
  try { t = localStorage.getItem("theme"); } catch (e) {}
  document.documentElement.dataset.theme = t === "light" ? "light" : "dark";
})()`;

export default function ThemeScript() {
  return (
    <script
      // The client never re-runs this; the type swap avoids React's dev warning about rendering scripts.
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}

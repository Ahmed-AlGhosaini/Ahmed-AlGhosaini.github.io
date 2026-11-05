// Runs in <head> before first paint: applies the saved theme, or the OS theme if none is saved.
// Prevents a flash of the wrong theme. Also follows OS changes until the visitor picks a theme.
const script = `(function(){
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  function apply() {
    var t = null;
    try { t = localStorage.getItem("theme"); } catch (e) {}
    document.documentElement.dataset.theme = t === "light" || t === "dark" ? t : media.matches ? "dark" : "light";
  }
  apply();
  media.addEventListener("change", apply);
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

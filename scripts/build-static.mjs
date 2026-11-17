// Сборка игры в обычный статический сайт (папка site/), который можно
// просто загрузить на GitHub Pages или любой хостинг.
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";

const OUT = "site";
rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/assets`, { recursive: true });

await build({
  entryPoints: { app: "scripts/static-entry.tsx" },
  bundle: true,
  splitting: true,
  format: "esm",
  outdir: `${OUT}/assets`,
  chunkNames: "chunk-[hash]",
  minify: true,
  target: "es2020",
  jsx: "automatic",
  legalComments: "none",
  logLevel: "error",
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_STATIC": '"1"',
    "process.env.NEXT_PUBLIC_BASE_PATH": '""',
    global: "globalThis",
  },
});

const css = await postcss([tailwind({ optimize: { minify: true } })]).process(readFileSync("src/app/globals.css", "utf8"), {
  from: "src/app/globals.css",
});
writeFileSync(`${OUT}/assets/app.css`, css.css);

for (const dir of ["chars", "bg", "fonts"]) cpSync(`public/${dir}`, `${OUT}/${dir}`, { recursive: true });

writeFileSync(
  `${OUT}/index.html`,
  `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0f172a">
<title>КиберЩит: Беларусь — игра о кибербезопасности</title>
<meta name="description" content="Стань оперативником управления по противодействию киберпреступности. Раскрывай дела по всей Беларуси, допрашивай мошенников и расти от стажёра до полковника.">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;700;900&family=Russo+One&display=swap&subset=cyrillic" rel="stylesheet">
<link rel="stylesheet" href="assets/app.css">
</head>
<body class="bg-slate-950 text-slate-900 antialiased">
<div id="root"></div>
<noscript>Для игры включите JavaScript.</noscript>
<script type="module" src="assets/app.js"></script>
</body>
</html>
`,
);
writeFileSync(`${OUT}/.nojekyll`, "");
console.log("Готово: папка site/");

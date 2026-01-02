<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Smarty Overlay</title>
    <script>
      window.__OVERLAY__ = @json([
        'slug' => $slug,
        'token' => $token,
      ]);
    </script>
    @vite(['resources/css/overlay.css', 'resources/js/overlay.jsx'])
  </head>
  <body>
    <div id="overlay-root"></div>
  </body>
</html>

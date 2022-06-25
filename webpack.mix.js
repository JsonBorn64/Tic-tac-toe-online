let mix = require('laravel-mix');

mix
    // index page
    .copy('src/index.html', 'dist/index.html')
    .sass('src/css/index.scss', 'css')
    .js('src/js/index.js', 'js').sourceMaps()

    // single page
    .copy('src/single.html', 'dist/single.html')
    .sass('src/css/single.scss', 'css')
    .js('src/js/single.js', 'js').sourceMaps()

    // vsComp page
    .copy('src/vsComp.html', 'dist/vsComp.html')
    .js('src/js/vsComp.js', 'js').sourceMaps()

    // room page
    .copy('src/room.html', 'dist/room.html')
    .sass('src/css/room.scss', 'css')
    .js('src/js/room.js', 'js').sourceMaps()

    // assets
    .copy('src/assets', 'dist/assets')

    // public path
    .setPublicPath('dist')

    // disable OS notifications
    .disableNotifications();

function requireAll(r) {
    r.keys().forEach(r);
}

requireAll(require.context('./static/img/svg/', true, /\.svg$/));
requireAll(require.context('./static/img/', true, /\.png|jpg|gif$/));
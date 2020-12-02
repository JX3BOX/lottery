const {
    createProxyMiddleware
} = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:14422',
            changeOrigin: true,
        })
    );
    app.use(
        '/sync-action',
        createProxyMiddleware({
            ws: true,
            target: 'http://localhost:14422'
        })
    )
};
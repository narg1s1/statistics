const PROXY_CONFIG = [
  {
    context: [
      '/api/rest/v1',
    ],
    target: 'https://stage.payever.de/',
    secure: false,
    changeOrigin: true
  }
];

module.exports = PROXY_CONFIG;

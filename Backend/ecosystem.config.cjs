module.exports = {
  apps: [
    {
      name: "ceramic-studio-api",
      script: "dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: { NODE_ENV: "production" },
    },
  ],
};

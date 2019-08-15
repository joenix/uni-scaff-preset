function getArgv(name, cache = {}) {
  // Argv
  const [node, path, ...argv] = process.argv;

  // Mapping
  argv.map(
    item => (
      (item = item.replace(/^--/, "")),
      item.replace(
        /^([\w\.\-\:\/]+)\=?(.*)/g,
        (word, $1, $2) => ((cache[$1] = `"${$2 || true}"`), word)
      )
    )
  );

  return name ? cache[name] : cache;
}

module.exports = {
  devServer: {
    proxy: {
      "/local": {
        target: "http://api.taojiji.com",
        changeOrigin: true,
        pathRewrite: {
          "/local": "/" // Need Path Rewrite
        }
      }
    }
  },
  chainWebpack(config, argvs = getArgv()) {
    // Env Default
    argvs.env = argvs.env || `"dev"`;
    // Injection
    config
      .plugin("define")
      .tap(
        definitions => (
          Object.assign(definitions[0]["process.env"], { ...argvs }),
          definitions
        )
      );
  }
};

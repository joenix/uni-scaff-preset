// File System
const fs = require("fs");

// File Path
const path = require("path");

// File is Binary
const binary = require("isbinaryfile");

// Glob
const glob = require("glob");

// Rim Raf
const rimraf = require("rimraf");

// Console
const ora = require("ora");

// Home Process
const home = require("user-home");

// Download Repo
const download = require("download-git-repo");

// Generate Project
async function generate(
  // Direct
  dir,
  // Files
  files,
  // Base
  base = "",
  // Root Options
  rootOptions = {}
) {
  glob
    // Check Files
    .sync("**/*", {
      cwd: dir,
      nodir: true
    })
    // Map Paths
    .forEach(rawPath => {
      // Source Path
      const sourcePath = path.resolve(dir, rawPath);
      // File Name
      const filename = path.join(base, rawPath);

      // Is Binary
      if (binary.sync(sourcePath)) {
        // Binary File
        files[filename] = fs.readFileSync(sourcePath);
        // Return Buffer
        return;
      }

      // Read File Content
      let content = fs.readFileSync(sourcePath, "utf-8");

      // Read Manifest
      if (path.basename(filename) === "manifest.json") {
        // Replace Manifest with Root Options
        content = content.replace("{{name}}", rootOptions.projectName || "");
      }

      // Filename _
      if (filename.charAt(0) === "_") {
        // Files Prefix
        let prefix = `${filename.charAt(1) === "_" ? "" : "."}`;
        // Files Name
        let name = `${filename.slice(1)}`;

        // Assignment
        files[`${prefix}${name}`] = content;

        // Return Specials
        return;
      }

      // Normal
      files[filename] = content;
    });
}

// Exports
module.exports = (api, options, rootOptions) => {
  // Extend Package
  api.extendPackage(pkg => {
    return {
      dependencies: {
        // Lock Version: 0.12.1 For Applet
        "regenerator-runtime": "^0.12.1"
      },
      devDependencies: {
        // Allow Postcss to Support Inline Comments
        "postcss-comment": "^2.0.0"
      }
    };
  });

  // Render Template
  api.render(async function(files) {
    // Clean Files
    Object.keys(files).forEach(name => {
      delete files[name];
    });

    // Template
    const template = options.repo || options.template;

    // Basic
    const base = "src";

    // Must Default
    if (template === "default") {
      // Spinner
      const spinner = ora("Fetch Template ...");
      spinner.start();

      // Temp Path
      const tmp = path.join(
        home,
        ".uni-app/templates",
        template.replace(/[/:]/g, "-"),
        base
      );

      // Repo Address
      // const repo = `https://gitee.taojiji.com/hybrid/uni-scaff.git`;
      const repo = `joenix/uni-scaff`;

      console.log("\n");
      console.log("repo is ::: ", repo);
      console.log("tmp is ::: ", tmp);

      // Rim Raf
      if (fs.existsSync(tmp)) {
        try {
          rimraf.sync(tmp);
        } catch (e) {
          console.error(e);
        }
      }

      // Download Repo
      await new Promise((resolve, reject) => {
        // Download
        download(repo, tmp, { clone: true }, err => {
          // Spinner Stop
          spinner.stop();
          // Throw Error
          if (err) {
            return reject(err);
          }
          // Resolve
          resolve();
        });
      });

      // Finally
      await generate(tmp, files, base);
    }

    // Copy: dcloudio/uni-preset-vue
    await generate(path.resolve(__dirname, "./template/common"), files);
  });
};

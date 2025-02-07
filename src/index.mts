import fs from "fs";

const main = async (...args: (string | object)[]) => {
  fs.readFileSync("package.json");
  console.log(args);
};

main("Hello World");

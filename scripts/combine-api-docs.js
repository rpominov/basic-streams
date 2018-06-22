const fs = require("fs")

function printItem(name, documentation) {
  return `
<!-- doc ${name} -->

### ${name}

${documentation}

<!-- docstop ${name} -->
`
}

fs.writeFileSync(
  "./README.md",
  fs
    .readFileSync("./README.md")
    .toString()
    .replace(
      /<!-- doc ([0-9a-z-]+) -->[\s\S]*?<!-- docstop[a-z -]+-->/gm,
      (_, name) => {
        try {
          return printItem(
            name,
            fs
              .readFileSync(`./packages/${name}/README.md`)
              .toString()
              .match(/<!-- doc -->([\s\S]*)<!-- docstop -->/m)[1]
              .trim(),
          )
        } catch (e) {
          return printItem(name, "")
        }
      },
    ),
)

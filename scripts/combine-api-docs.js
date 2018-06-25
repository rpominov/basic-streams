const fs = require("fs")

function printItem(name, documentation) {
  return `<!-- doc ${name} -->

### ${name}

${documentation}

\`\`\`sh
npm install @basic-streams/${name} --save
\`\`\`

<!-- docstop ${name} -->`
}

const content = fs.readFileSync("./README.md").toString()

const names = []

const content1 = content.replace(
  /<!-- doc ([0-9a-z-]+) -->[\s\S]*?<!-- docstop[0-9a-z -]+-->/gm,
  (_, name) => {
    names.push(name)
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
)

const content2 = content1.replace(
  /<!-- links -->[\s\S]*?<!-- linksstop -->/m,
  "<!-- links -->\n" +
    names.map(name => `[${name}]: #${name}`).join("\n") +
    "\n<!-- linksstop -->",
)

fs.writeFileSync("./README.md", content2)

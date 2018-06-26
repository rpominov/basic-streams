const fs = require("fs")

function getDoc(name) {
  try {
    const content = fs
      .readFileSync(`./packages/${name}/README.md`)
      .toString()
      .match(/<!-- doc -->([\s\S]*)<!-- docstop -->/m)[1]
      .trim()

    return content.replace(/```js(.*\n){3,}?```/gm, block => {
      return `
<details><summary>Example</summary>

${block}

</details><br/>
      `
    })
  } catch (e) {
    return ""
  }
}

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
    return printItem(name, getDoc(name))
  },
)

const content2 = content1.replace(
  /<!-- links -->[\s\S]*?<!-- linksstop -->/m,
  "<!-- links -->\n" +
    names.map(name => `[${name}]: #${name}`).join("\n") +
    "\n<!-- linksstop -->",
)

fs.writeFileSync("./README.md", content2)

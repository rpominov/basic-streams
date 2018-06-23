const {spawn} = require("child_process")
const {readdirSync, statSync, existsSync} = require("fs")

function exec(cmd, cwd) {
  return new Promise(resolve => {
    console.log(`\n[${cmd.join(" ")} IN ${cwd}]\n`)

    const proc = spawn(cmd[0], cmd.slice(1), {cwd})

    proc.stdout.on("data", data => {
      console.log(data.toString())
    })

    proc.stderr.on("data", data => {
      console.error(data.toString())
    })

    proc.on("close", code => {
      if (code !== 0) {
        console.error(`[EXIT CODE ${code}]`)
      }
      console.log(`[END IN ${cwd}]\n`)
      resolve()
    })
  })
}

;(async function() {
  const cmd = process.argv.slice(2)
  for (const pkg of readdirSync("./packages")) {
    const cwd = `./packages/${pkg}`
    if (
      pkg !== "basic-streams" &&
      statSync(cwd).isDirectory() &&
      existsSync(`${cwd}/package.json`)
    ) {
      await exec(cmd, cwd)
    }
  }
})()

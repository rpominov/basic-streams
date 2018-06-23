const {spawn} = require("child_process")
const {readdirSync, statSync, existsSync} = require("fs")

function exec(cmd, cwd) {
  return new Promise(resolve => {
    console.log(`\n[in ${cwd}]\n`)
    spawn(cmd[0], cmd.slice(1), {cwd, stdio: "inherit"}).on("close", code => {
      if (code !== 0) {
        console.error(`\n[failed! (${code})]`)
      }
      resolve()
    })
  })
}

function getKey() {
  return new Promise(resolve => {
    const {stdin} = process
    stdin.setRawMode(true)
    stdin.setEncoding("utf8")
    stdin.on("data", function listener(x) {
      stdin.off("data", listener)
      stdin.setRawMode(false)
      stdin.pause()
      resolve(x)
    })
  })
}

;(async function() {
  const cmd = process.argv.slice(2)

  const packages = readdirSync("./packages").filter(
    pkg =>
      pkg !== "basic-streams" &&
      statSync(`./packages/${pkg}`).isDirectory() &&
      existsSync(`./packages/${pkg}/package.json`),
  )

  console.log("You're about to run the following command:")
  console.log("\n")
  console.log("  " + cmd.join(" "))
  console.log("\n")
  console.log("In the following directories:")
  console.log("\n")
  console.log("  " + packages.map(x => `./packages/${x}`).join("\n  "))
  console.log("\n")
  console.log('Continue? Press [enter] for "yes" or any other key for "no".')

  if ((await getKey()).charCodeAt(0) === 13) {
    for (const pkg of packages) {
      await exec(cmd, `./packages/${pkg}`)
    }
  }
})()

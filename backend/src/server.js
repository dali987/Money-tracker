import express from "express"
import next from "next"
import { ENV } from "./lib/env.js"

const dev = ENV.NODE_ENV !== "production"
const nextApp = next({ dev, dir: "../frontend"})
const handle = nextApp.getRequestHandler()

const PORT = ENV.PORT

nextApp.prepare().then(() =>{
    const app = express()

    app.all(/.*/, (req, res) => {
        return handle(req, res)
    })

    app.listen(PORT, async () =>{
        console.log("server is up, port: ", PORT)
    })
})
const express = require('express')
const app = express()



app.use(("/hello"),(req,res)=>{
  res.send("HEllo from the server")
})
app.use(("/test"),(req,res)=>{
  res.send("testin the server")
})


app.listen(3000,()=>{
  console.log("server is successfully listening on port 3000...")
})

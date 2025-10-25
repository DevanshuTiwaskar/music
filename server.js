import app from './src/app.js'



const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log(`music server is runnging on port: ${PORT}`)
})
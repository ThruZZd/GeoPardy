const express = require('express')
const app = express()
const port = 8080
var uArray = []

app.use(express.static('public'))
app.use(express.json())

app.get('/fetch', (req, res)=>{

res.status(200).send(JSON.stringify(uArray))


})

app.get('/reset', (req, res)=>{

    res.status(200).send('')
    uArray=[]
    console.log('reset')
    
    
    })

app.post('/uinput',(req,res)=>{

const parcel = req.body
uArray.push(parcel['parcel'])


if(!parcel){
    res.status(400).send('<h1>Error!</h1>')
}
res.status(200).send('<h1>Danke</h1>')

})


app.listen(port,'0.0.0.0', ()=>{
    console.log('Server listening to '+port)
})



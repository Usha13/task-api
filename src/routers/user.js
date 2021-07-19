const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const User = require('../model/user')
const {welcomeMail, cancelMail} = require('../emails/account')
require('../db/mongoose')
const userroutes = new express.Router()

userroutes.post('/users', async (req,res)=> {
    let user = new User(req.body)
    
    try{
        const u = await user.save()
        const token = await u.generateAuthToken()
        welcomeMail(user.email,user.name)
        res.status(200).send({user: u, token}) 
    }
    catch(e){
        res.status(400).send(e.message)
    }
    
})

userroutes.post('/users/login', async (req,res)=> {
    let user = new User(req.body)
    
    try{
        const u = await User.findOneByCredentials(user.email , user.password)
        const token = await u.generateAuthToken()
        await welcomeMail(u.email , u.name)
        res.status(200).send({user: u, token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
    
})


userroutes.get('/users/me',auth, async (req,res)=> {
    
        try {
            res.status(200).send(req.user)
        } catch (e) {
            res.status(400).send(e.message)
        }
    
    })

userroutes.post('/users/logout',auth, async (req,res)=> {
    
        try {
            req.user.tokens = req.user.tokens.filter((token)=>{
                return token.token != req.token
            })

            req.user.save()
            res.send()
        } catch (e) {
            res.status(500).send(e.message)
        }
    
    })

userroutes.patch('/users/me',auth, async (req,res)=> {
    
    const reqkey = Object.keys(req.body)
    const valip = ['email', 'name', 'password', 'age']
    const vld = reqkey.every((k)=> valip.includes(k))

    if(!vld){
        return res.status(400).send({error: "Invalid Updates"})
    }

    try {
        const user = req.user
        reqkey.forEach((key)=> user[key] = req.body[key])
        const u = await user.save()
        // const user = await User.findByIdAndUpdate(_id, req.body, {new : true, runValidators: true})      
        res.status(200).send(u)
    } catch (e) {
        res.status(400).send(e)
    }
})

userroutes.delete('/users/me', auth,async (req,res)=> {
  
    try {
        await req.user.remove()
        cancelMail(req.user.email, req.user.name)
        res.status(200).send(req.user)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

const upload = multer({
    limits : {
        fileSize :1000000
    },
    fileFilter(req, file, cb) {
         if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
             cb(new Error("Please upload a Image"))
         }
         cb(undefined, true)
    }
})

userroutes.post('/users/me/avatar',auth, upload.single('avatar') , async (req,res)=> {
    const bimage = await sharp(req.file.buffer).resize({height : 300 , width : 300}).png().toBuffer();
    req.user.avatar = bimage
    await req.user.save()
    res.status(200).send()
    
}, (err, req, res, next) => {
    res.status(400).send({error : err.message})
})

userroutes.delete('/users/me/avatar',auth, async (req,res)=> {
  
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
    
}, (err, req, res, next) => {
    res.status(400).send({error : err.message})
})

userroutes.get('/users/:id/avatar', async (req,res)=> {
   
    try {
        const user = await User.findById(req.params.id)
        if(!user| !user.avatar)
        {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.status(200).send(user.avatar)
    } catch (error) {
        res.status(400).send(error.message)
    }
    
    
})

// userroutes.get('/users',auth, async (req,res)=> {
    
//     try {
//         const users = await User.find({})
//         res.status(201).send(users)
//     } catch (e) {
//         res.status(400).send(e.message)
//     }

// })


// userroutes.get('/users/:id', async (req,res)=> {
//     let _id = req.params.id

//     try {
//         const u = await User.findById(_id)
//         if(!u){
//            return res.status(404).send()
//         }
//         res.status(200).send(u)
//     } catch (e) {
//         res.status(400).send(e.message)
//     }
// })


module.exports = userroutes
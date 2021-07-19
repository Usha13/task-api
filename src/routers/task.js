const express = require('express')
const Task = require('../model/task')
const auth = require('../middleware/auth')
const taskroutes = new express.Router()
require('../db/mongoose')

taskroutes.post('/tasks', auth ,async (req,res)=> {
    let task = new Task({
         ...req.body,
         owner : req.user._id
    })

    try {
        const t = await task.save()
        res.send(t)
    } catch (e) {
        res.status(400).send(e.message)
    }

})

taskroutes.get('/tasks',auth, async (req,res)=> {
    let match;
    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1]== 'desc' ? -1 : 1;
    }

    try {
        if(req.query.completed){
            match = req.query.completed === 'true'
            let t = await Task.find({owner : req.user._id , completed : match},null,{
                limit : parseInt(req.query.limit) , 
                skip: parseInt(req.query.skip) ,
                sort
            })
            res.status(201).send(t)
        }
        else {
            let t = await Task.find({owner : req.user._id},null,{
                limit : parseInt(req.query.limit) , 
                skip: parseInt(req.query.skip) ,
                sort
            })
            res.status(201).send(t)
        }
       
    } catch (e) {
        res.status(400).send(e.message)
    }
   
})

taskroutes.get('/tasks/:id', auth, async (req,res)=> {
    let _id = req.params.id
    
    try {
        const t = await Task.findOne({_id ,owner : req.user._id})
        if(!t){
            return res.status(404).send()
        }
        res.status(200).send(t)
    } catch (e) {
        res.status(400).send(e)
    }
  
})

taskroutes.patch('/tasks/:id', auth , async (req,res)=> {
    let _id = req.params.id
    const reqkey = Object.keys(req.body)
    const valip = ['description', 'completed']
    const vld = reqkey.every((k)=> valip.includes(k))

    if(!vld){
        return res.status(400).send({error: "Invalid Updates"})
    }

    try {
        const task = await Task.findOne({_id, owner : req.user._id})
        if(!task)
        {
            return res.status(404).send()
        }

        reqkey.forEach((key) => task[key] = req.body[key])
        await task.save()

        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

taskroutes.delete('/tasks/:id', auth ,async (req,res)=> {
    let _id = req.params.id

    try {
        // const task = await Task.findByIdAndDelete(_id)
        const task = await Task.findOneAndDelete({_id , owner : req.user._id})

        if(!task)
        {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

module.exports = taskroutes

require('dotenv').config()
const express = require('express')
const jwt =  require('jsonwebtoken');
const app = express()
const router = express.Router
const verifyToken = require('./middleware/auth')
const mongoose =  require('mongoose');
const User = require('./models/User');
const argon2 = require('argon2')

const connectDB = async() => {
    try {
        await mongoose.connect(`mongodb+srv://george:dev123@@mern-george.ohcow.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        
        console.log("MongoDB connected")
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

connectDB();

app.use(express.json());

let users = [
    {
        id:1,
        username: `henry`,
        refreshToken: null
    },
    {
        id:2,
        username: `george`,
        refreshToken: null
    }
]

const generateTokens = payload => {

    const {_id, username} = payload;
    
    const accessToken = jwt.sign({_id, username}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '5m'
    })

    const refreshToken = jwt.sign({_id, username}, process.env.REFESH_TOKEN_SECRET, {
        expiresIn: '1h'
    })

    return {accessToken, refreshToken};
}

//app
app.post('/register', async(req, res) => {
    const {username, password} = req.body;
    
    if(!username || !password){
        return res.status(400).json({success: false, message: 'Missing user/password'})
    }

    try {
        //check exist user
        const user = await User.findOne({username})

        if (user) return res.status(400).json({success: false, message: 'Username already exist'})
        
        //create
        const hashedPassword = await argon2.hash(password)
        const newUser = new User({username, password: hashedPassword})
        await newUser.save();

        //Return token
        //create JWT
        const tokens = generateTokens(newUser);
        updateRefreshToken(username, tokens.refreshToken);

        console.log(newUser);
        res.json({success: true, message:"user created successfully", data: tokens});

    } catch (error) {
        console.log(error);
        return res.status(400).json({success: false, message: 'General error'})
    }
})

app.post('/login', async(req, res) => {
    const {username, password} = req.body;
    
    if(!username || !password){
        return res.status(400).json({success: false, message: 'Missing user/password'})
    }

    try {
        const user = await User.findOne({username})
        if (!user) return res.status(400).json({success: false, message: 'Incorrect username/password'})

        const passwordValid = await argon2.verify(user.password, password)
        if(!passwordValid) return res.status(400).json({success: false, message: 'Incorrect username/password'})

        //create JWT
        const tokens = generateTokens(user);
        updateRefreshToken(username, tokens.refreshToken);

        return res.json({success: true, message:"Login successfully", data: tokens});

    } catch (error) {
        console.log(error);
        return res.status(400).json({success: false, message: 'General error'})
    }

    
    
    

  
})

const updateRefreshToken = (username, refreshToken) => {
    users = users.map(user => {
        if (user.username === username) 
        return {
            ...user,
            refreshToken
        }

        return user;
    })
}

app.post('/token', (req,res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(401)
    }

    const user = users.find(user => user.refreshToken === refreshToken);
    if(!user) return res.sendStatus(403)

    try {
        jwt.verify(refreshToken, process.env.REFESH_TOKEN_SECRET)        
        
        const tokens = generateTokens(user)
        updateRefreshToken(user.username, tokens.refreshToken)

        res.json(tokens);
                
    } catch (error) {
        console.log(error)
        return res.sendStatus(403)
    }
})

app.delete('/logout', verifyToken, (req,res) => {
    const user = users.find(user => user.id === req.userId)
    updateRefreshToken(user.username, null)
    res.sendStatus(204)
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`server start on port ${PORT}`))
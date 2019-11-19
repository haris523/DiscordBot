const botconfig =require("./botconfig.json");
const Discord=require ('discord.js');
const Axios=require("axios");
const ytdl=require('ytdl-core');
require('dotenv').config();
const apiKey=process.env.YTB_API_KEY;
//GIFOVI
apiKeyGPH=process.env.GIPHY_API_KEY;
GiphyApiClient=require('giphy-js-sdk-core');
client=GiphyApiClient(apiKeyGPH);
//
//imgur oauth2
let clientID=process.env.CLIENT_ID;
let clientSecret=process.env.CLIENT_SECRET;

let bot=new Discord.Client();
bot.on("ready",async ()=>{
    console.log("bot ready");
})
let songQue=[];
var servers={};
let autoplay=false;
let brojac=0;
bot.on("message", (message)=>{
    let prefix=botconfig.prefix;
    let poruke=message.content.split(" ");
    let komanda=poruke[0];
    let vrijednost=poruke.slice(1);
    let strZaTrazenje=vrijednost.join(" ");
    if(komanda==`${prefix}gp`)
    {
        Axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${strZaTrazenje}&key=${apiKey}&maxResults=10`)
        .then(res=>{
           // console.log(strZaTrazenje);
            //console.log(res.data.items[0]);
            songQue=[...songQue,{link:`https://www.youtube.com/watch?v=${res.data.items[0].id.videoId}`,message:message}];
           // console.log(songQue[0].message.member.voiceChannel.connection.dispatcher);
            
            if(!servers[message.guild.id])
            servers[message.guild.id]={
                queue:[],
                videoID:[],
                naziv:[]
            }
            var server=servers[message.guild.id];
            /*if(autoplay && !server.queue[0])
            {
                brojac++;
            }*/
            if(res.data.items[0].id.videoId==undefined)
            return message.channel.send("That song is undefined, try another 1 or write the full name");
            else {
                server.queue=[...server.queue,`https://www.youtube.com/watch?v=${res.data.items[0].id.videoId}`];
            server.videoID=[...server.videoID,res.data.items[0].id.videoId];
            server.naziv=[...server.naziv,res.data.items[0].snippet.title]
            if(!message.guild.voiceConnection)
            {
                message.member.voiceChannel.join()
                .then((connection)=>{
                    play(connection,message);
                })
            }
            return message.channel.send(`https://www.youtube.com/watch?v=${res.data.items[0].id.videoId}`)
            }
            
            
          /*  message.member.voiceChannel.join()
        .then(connection=>{
            const broadcast = bot.createVoiceBroadcast();
            const stream = ytdl(songQue[0], { filter : 'audioonly' });
            broadcast.playStream(stream);
            const dispatcher=connection.playBroadcast(broadcast);   
            console.log(songQue);    
            songQue.shift();
        })
        .catch(err=>{
            console.log(err);
        })*/

           
        })
        .catch(err=>{
            console.log(err);
        })
        //return message.channel.send("not loli");
    }
    else if(komanda==`${prefix}dc`)
    {
        message.react('✌');
        message.member.voiceChannel.leave();
        
    }
    else if(komanda==`${prefix}pause`)
    {
        
        message.member.voiceChannel.connection.dispatcher.pause();
       //console.log(message.client.voiceConnections);
        /*message.member.voiceChannel.join()
        .then(connection=>{
            connection.playBroadcast().pause();
        })  */    
    }
    else if(komanda==`${prefix}resume`)
    {
        message.member.voiceChannel.connection.dispatcher.resume();
    }
    else if(komanda==`${prefix}gnext`)
    {
        var server=servers[message.guild.id];
        if(server.dispatcher)
        server.dispatcher.end();
    }
    else if(komanda==`${prefix}aon`)
    {
        autoplay=true;
        message.react('💋')
    }
    else if(komanda==`${prefix}aoff`)
    {
        autoplay=false;
        message.react('💋')
    }
    else if(komanda==`${prefix}gif`)
    {
        console.log(vrijednost);
        if(vrijednost && vrijednost.length>0)
        {
            
            client.random('gifs',{"tag":strZaTrazenje})
            .then((res)=>{
                console.log(res);
                console.log(strZaTrazenje);
                if(res.data.url==undefined)
                return message.channel.send("Try a different keyword");
                else
                return message.channel.send(res.data.url);   
            })
        }
        else {
            client.random('gifs',{})
            .then((res)=>{
                console.log(res);
                if(res.data.url==undefined)
                return message.channel.send("Try a different keyword");
                else
                return message.channel.send(res.data.url);   
            })
        }
    }
    else if(komanda==`${prefix}img`)
    {
        Axios.get(`https://api.imgur.com/3/gallery/search?q=${strZaTrazenje}&client_id=${clientID}&client_secret=${clientSecret}`)
        .then((res)=>{
            if(res.data.data.length>0)
            {
                let rand=Math.floor(Math.random()*res.data.data.length);
            console.log(res);
            return message.channel.send(res.data.data[rand].link);
            }
            else
            {
                return message.channel.send("Try a different keyword");
            }
            //console.log(res);
        })
    }
    //console.log(poruke);

})
bot.login(botconfig.token);

function Play()
{
    songQue[0].message.member.voiceChannel.join()
    .then(connection=>{
        const broadcast = bot.createVoiceBroadcast();
        const stream = ytdl(songQue[0].link, { filter : 'audioonly' });
        broadcast.playStream(stream);
        const dispatcher=connection.playBroadcast(broadcast);   
        console.log(songQue);            
        broadcast.on("end",()=>{
            songQue.shift();
        })
    })
}

function play(connection,message){
    var server=servers[message.guild.id];
    server.dispatcher=connection.playStream(ytdl(server.queue[0],{filter:'audioonly'}));
    let vidID=server.videoID[0];
    console.log("USLO TEK U FUNKCIJU");
    console.log(vidID);
    //console.log(server.naziv);
    message.reply(`Currently playing: ${server.naziv[0]}`);
    server.queue.shift();
    server.videoID.shift();
    server.naziv.shift();
    server.dispatcher.on("end",()=>{
        if(server.queue[0])
        {
        play(connection,message);
        console.log("Ima pjesma");
        }
       /* else if(brojac>0 && server.queue[0])
        {
            console.log("uslo gdje je brojac");
            brojac--;
            play(connection,message); 
        }*/
        else if(autoplay && !server.queue[0])
        {
            Axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${vidID}&type=video&key=${apiKey}&maxResults=10`)
            .then((res)=>{
                console.log("uslo");
                //console.log(res.data.items[0]);
                let rand=0;
                if(res.data.items.length>5)             
                rand=Math.floor(Math.random()*5);

                server.queue.push(`https://www.youtube.com/watch?v=${res.data.items[rand].id.videoId}`);
                server.videoID.push(res.data.items[rand].id.videoId);
                server.naziv.push(res.data.items[rand].snippet.title);
                play(connection,message);
               // console.log(res.data.items[0].id.videoId);
                //server.dispatcher=connection.playStream(ytdl(`https://www.youtube.com/watch?v=${res.data.items[0].id.videoId}`,{filter:'audioonly'}));
            });
        }
        else{
            connection.disconnect();
        }
    });
}



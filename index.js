require("dotenv").config();
const path = require('path');
const express = require('express');
const exphbs  = require('express-handlebars');
const bodyparser= require('body-parser');
const cookieparser = require('cookie-parser');
const route = require('./routes');
const passport = require('passport');

const db = require('./config/db');
const http = require("http");
const socketio = require("socket.io");
const initSocket = require("./sockets/index")
const session = require('./config/session');
const passportSocketIo = require("passport.socketio");
const cookieParser = require("cookie-parser")

const formatTime = require("./ulti/formatTime");

const app = express();

const server = http.createServer(app)
let io = socketio(server)

app.use(cookieparser('back-end-web-2020-vnua'));
db.connect();
app.use(express.static(path.join(__dirname, 'public')));
session.config(app); 

//user cookie parser
app.use(cookieParser())
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key:"express.sid",
    secret:"mySecret",
    store: session.sessionStore,
    success: (data, accept) => {
        if(!data.user.logged_in){
            return accept("Invalid user", false)
        }
        return accept(null, true)
    },
    fail: (data, message, error, accept) => {
        if(error) {
            console.log("Failed connect to socket.io", message);
            return accept(new Error(message), false)
        }

    }
}))

app.engine('handlebars', exphbs({
    helpers: {
        sum: (a, b)=>a+b,
        admin: (position, color)=>{
            if (position === 'admin'){
                let out = `<td class="text-warning">`;
                out = out +color;
                return out + `</td>`;
            }else {
                let out = `<td>`;
                out = out +color;
                return out+`</td>`;
            }
        },
        pagination: ( total,size,page ) =>{
            var pages = Math.ceil(total / size); 
            let out = `<ul class="pagination">
                            <li class="page-item">
                                <a class="page-link" href="?page=`+1+`">Trang ?????u</a>
                            </li>
            `;
            for (var i = 1; i <= pages;i++){
                if (i == page){
                  out = out + `
               <li class="page-item active">
                    <a class="page-link" href ="?page=`+i+`">`+i+`</a>
               </li>
               `   }else{
                out = out + `
                <li class="page-item">
                     <a class="page-link" href ="?page=`+i+`">`+i+`</a>
                </li>
                `
               }
            }
                return out + `<li class="page-item">
                <a class="page-link" href="?page=`+pages+`">Trang cu???i</a>
              </li>
            </ul>`;
        },
        time: (timesta) => {
            var time = Number(timesta);
            var datenow = new Date();
            var age = Math.abs(datenow - time);
            var unti ='';
            var out = '';
                if (age < 60000) {
                    return out = "V????a xong";
                }
                else {
                    if (age >=60000 && age <3600000) {
                    age = Math.round(age/1000/60);
                    unti = 'phu??t';
                    }
                    else if (age >= 3600000 && age <= 86400000) {
                        age = Math.round(age/1000/60/60);
                        unti = 'gi????';
                    }
                    else{
                        age = Math.round(age/1000/60/60/24);
                        unti = 'nga??y';
                    }
                    return out = age +" "+ unti + " tr??????c";
                }
        },

        count: (num) => {
            if (num == 0) {
                return `<p class ="text-center">Kh??ng co?? go??p y?? na??o trong ho??m th?? <a href="/"> Quay v???? trang chu?? </a></p>`
            }else {
                return `<p class ="text-right"><a href="/admin/pinread" class ="text-danger">??a??nh d????u t????t ca?? la?? ??a?? ??o??c</a></p>`
            }
        },
        viewRateComment: (idUser, amountDating, courseId) => {
           if(amountDating.length){
                for(let i = 0; i < amountDating.length; i++){
                    if(String(amountDating[i].idUser) == String(idUser)){
                        return `<span class="ui rating" data-rating="1" data-max-rating="1" data-idCourse="${courseId}"></span> ${amountDating.length}`
                    }
                }
           }else{
             return `<span class="ui rating" data-rating="0" data-max-rating="1" data-idCourse="${courseId}"></span>0`
           }
        },
        handleTimeComment: (createdAt, updatedAt) => {
            if(updatedAt > createdAt){
                return `<span class="date">Th???i gian ???? ch???nh s???a ${updatedAt}</span>`
            }
            return `<span class="date">Th???i gian ${createdAt}</span>`
        },
        viewReplyComment: (replyComment, idComment) => {
            if(replyComment.length){
                return `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"> Hi???n th??? th??m tr??? l???i b??nh lu???n </div>`
            }
            return  `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"></div>`
        },
        displayComment: (commentItem, totalComment, indexCommentNow, userNow, idCourse) => {
            function viewReplyComment(replyComment, idComment){
                if(replyComment.length){
                    return `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"> Hi???n th??? th??m tr??? l???i b??nh lu???n </div>`
                }
                return  `<div onclick='displayReplyComment.call(this, "${idComment}")' class="display-more-reply-comment"></div>`
            }
            function handleTimeComment(createdAt, updatedAt) {
                if(updatedAt > createdAt){
                    return `<span class="date">Th???i gian ???? ch???nh s???a ${formatTime(updatedAt)}</span>`
                }
                return `<span class="date">Th???i gian ${formatTime(createdAt)}</span>`
            }
            function viewRateComment(idUser, comment, courseId){
                let amountDating = comment.rate;
                if(comment.status === "active"){
                    if(comment.rate && amountDating.length){
                        let count = 0;
                        for(let i = 0; i < amountDating.length; i++){
                            if(String(amountDating[i].idUser) == String(idUser)){
                                count++;
                            }
                        }
                        if(count){
                            return `
                                <span class="ui rating" data-rating="1" data-max-rating="1" data-idcomment="${comment._id}"></span> 
                                <span>${amountDating.length}</span> 
                            `
                        }else{
                            return `
                                <span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}"></span>
                                <span>${amountDating.length}</span> 
                            `
                        }
                   }else{
                     return `
                        <span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}"></span>
                        <span>0</span> 
                     `
                   }
                }else{
                    if(comment.rate && amountDating.length){
                        let count = 0;
                        for(let i = 0; i < amountDating.length; i++){
                            if(String(amountDating[i].idUser) == String(idUser)){
                                count++;
                            }
                        }
                        if(count){
                            return `
                                <span class="ui rating" data-rating="1" data-max-rating="1" data-idcomment="${comment._id}" style="display: none"></span> 
                                <span>${amountDating.length}</span> 
                            `
                        }else{
                            return `
                                <span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}" style="display: none"></span>
                                <span>${amountDating.length}</span> 
                            `
                        }
                   }else{
                     return `<span class="ui rating" data-rating="0" data-max-rating="1" data-idcomment="${comment._id}" style="display: none"></span>
                            <span></span>
                        `
                   }
                }
                
            };
            
            function displayNoneComment(position, comment){
                if(position === "admin"){
                    if(comment.status === "active"){
                        return `<span style="color: blue !important; cursor: pointer; padding-right: 5px" status="none" onclick='displayNoneComment.call(this, "${comment._id}")'> ???n </span>`
                    }else{
                        return `<span style="color: blue !important; cursor: pointer; padding-right: 5px;" status="active" onclick='displayNoneComment.call(this, "${comment._id}")'> Hi???n </span>`
                    }
                }else{
                    return ``
                }
            }
            function deleteComment(idUserNow, comment, position){
                let idUserInComment = comment.idUser._id;
                if(String(idUserNow) === String(idUserInComment) || position === "admin"){
                    return `<span style="color: red !important; cursor: pointer" onclick="handleDeleteComment.call(this, '${comment._id}')"> X??a </span>`
                }else{
                    return ``
                }
            }

            let templateComment = `
                <div class="comment">
                    <a class="avatar">
                        <img src='https://o.vdoc.vn/data/image/2020/09/07/hinh-nen-cute-de-thuong-10.jpg'>
                    </a>
                    <div class="content">
                        <a class="author">${commentItem.idUser.user}</a>
                        <div class="metadata">
                            ${handleTimeComment(commentItem.createdAt, commentItem.updatedAt)}
                        </div>
                        <div class="text">
                            <p>${commentItem.content}</p>
                        </div>
                        <div class="actions">
                            ${viewRateComment(userNow._id, commentItem, idCourse)}
                            <span class="reply" onclick='addReply.call(this, "${commentItem._id}")' style="cursor: pointer; padding: 0 5px">Tr??? l???i</span>
                            ${displayNoneComment(userNow.position, commentItem)}
                            ${deleteComment(userNow._id, commentItem, userNow.position)}
                        </div>
                    </div>
                    <div class="comments reply-comment">
                        ${viewReplyComment(commentItem.replyComment, commentItem._id)}
                    </div>
                </div>
            `
            let templateCommentBanned = `
                <div class="comment banned">
                    <a class="avatar">
                        <img src='https://o.vdoc.vn/data/image/2020/09/07/hinh-nen-cute-de-thuong-10.jpg'>
                    </a>
                    <div class="content">
                        <a class="author" style="text-decoration: line-through;">${commentItem.idUser.user}</a>
                        <div class="metadata">
                            ${handleTimeComment(commentItem.createdAt, commentItem.updatedAt)}
                        </div>
                        <div class="text">
                            <p>N???i dung b??? ???n v?? vi ph???m do ch???a n???i dung b??? c???m</p>
                        </div>
                        <div class="actions">
                            ${viewRateComment(userNow._id, commentItem, idCourse)}
                            <span class="reply" onclick='addReply.call(this, "${commentItem._id}")' style="cursor: pointer; padding: 0 5px; display: none">Tr??? l???i</span>
                            ${displayNoneComment(userNow.position, commentItem)}
                            ${deleteComment(userNow._id, commentItem, userNow.position)}
                        </div>
                    </div>
                    <div class="comments reply-comment">
                        ${viewReplyComment(commentItem.replyComment, commentItem._id)}
                    </div>
                </div>
            `
            if(indexCommentNow <= 1){
                //n???u status comment l?? active th?? hi???n th??? ra c??n kh??ng th?? th??m class banned
                if(commentItem.status === "none"){
                    return templateCommentBanned
                }else{
                    return templateComment
                }
            }else{
                let templateCommentBanned = ` <div class="comment banned" style="display: none">
                    <a class="avatar">
                        <img src='https://o.vdoc.vn/data/image/2020/09/07/hinh-nen-cute-de-thuong-10.jpg'>
                    </a>
                    <div class="content">
                        <a class="author" style="text-decoration: line-through;">${commentItem.idUser.user}</a>
                        <div class="metadata">
                            ${handleTimeComment(commentItem.createdAt, commentItem.updatedAt)}
                        </div>
                        <div class="text">
                            <p>N???i dung b??? ???n v?? vi ph???m do ch???a n???i dung b??? c???m</p>
                        </div>
                        <div class="actions">
                            ${viewRateComment(userNow._id, commentItem, idCourse)}
                            <span class="reply" onclick='addReply.call(this, "${commentItem._id}")' style="cursor: pointer; display: none">Tr??? l???i</span>
                            ${displayNoneComment(userNow.position, commentItem)}
                            ${deleteComment(userNow._id, commentItem, userNow.position)}
                        </div>
                    </div>
                    <div class="comments reply-comment">
                        ${viewReplyComment(commentItem.replyComment, commentItem._id)}
                    </div>
                </div>`
                let templateCommentNone = 
                ` <div class="comment" style="display: none">
                    <a class="avatar">
                        <img src='https://o.vdoc.vn/data/image/2020/09/07/hinh-nen-cute-de-thuong-10.jpg'>
                    </a>
                    <div class="content">
                        <a class="author">${commentItem.idUser.user}</a>
                        <div class="metadata">
                            ${handleTimeComment(commentItem.createdAt, commentItem.updatedAt)}
                        </div>
                        <div class="text">
                            <p>${commentItem.content}</p>
                        </div>
                        <div class="actions">
                            ${viewRateComment(userNow._id, commentItem, idCourse)}
                            <span class="reply" onclick='addReply.call(this, "${commentItem._id}")' style="cursor: pointer;">Tr??? l???i</span>
                            ${displayNoneComment(userNow.position, commentItem)}
                            ${deleteComment(userNow._id, commentItem, userNow.position)}
                        </div>
                    </div>
                    <div class="comments reply-comment">
                        ${viewReplyComment(commentItem.replyComment, commentItem._id)}
                    </div>
                </div>`
                let btnViewMoreComment = 
                `<div class="actions">
                    <button  
                        style="cursor: pointer; margin-bottom: 20px;outline: none;
                        border: 0px;
                        background: transparent;"
                        class="add-view-comment" 
                        data-now=1
                        data-comment=${totalComment.length}
                        onclick='viewMoreComment.call(this)'
                        id="view-more-comment"
                        data-perpage=2
                    >
                        Hi???n th??? th??m b??nh lu???n
                    </button>
                </div>`
                
                if(commentItem.status === "none"){
                    if(indexCommentNow === totalComment.length - 1){
                        return templateCommentBanned + btnViewMoreComment
                    }
                    return templateCommentBanned
                }else{
                    if(indexCommentNow === totalComment.length - 1){
                        return templateCommentNone + btnViewMoreComment
                    }
                    return templateCommentNone
                }
            }
                
            
        },
        message: (user, contentMessage, indexMessage) => {
            if(parseInt(indexMessage) === 0) {
                if(String(user._id )=== String(contentMessage.senderId)){
                    
                    return  `
                        <div class="chat user-chat" data-idse="${contentMessage.senderId}" data-idre="${contentMessage.receiverId}">
                            <img src="/img/bot.jpg" alt="HeHe">
                            <span>
                            </span>
                            ${contentMessage.text}
                            <small id="time__now">${formatTime(contentMessage.createdAt)}</small>
                        </div>
                    `
                }
                
                return `
                    <div class="chat admin-feed" data-idse="${contentMessage.senderId}" data-idre="${contentMessage.receiverId}>
                        <img src="/img/bot.jpg" alt="HeHe">
                        <span></span>
                        ${contentMessage.text}
                        <small id="time__now">${formatTime(contentMessage.createdAt)}</small>
                    </div>
                `
            }
            if(String(user._id )=== String(contentMessage.senderId)){
                
                return  `
                    <div class="chat user-chat">
                        <img src="/img/bot.jpg" alt="HeHe">
                        <span>
                        </span>
                        ${contentMessage.text}
                        <small id="time__now">${formatTime(contentMessage.createdAt)}</small>
                    </div>
                `
            }
            
            return `
                <div class="chat admin-feed">
                    <img src="/img/bot.jpg" alt="HeHe">
                    <span></span>
                    ${contentMessage.text}
                    <small id="time__now">${formatTime(contentMessage.createdAt)}</small>
                </div>
            `
        },
        contact: (allConversationsWithMessage) =>{
            if(allConversationsWithMessage.length){
                let previewMessage = (message)=>{
                    let content = message[message.length - 1].text
                    if(content.length > 11){
                        return message[message.length - 1].text.substr(0, 11) +"<span>...</span>"
                    }
                    return content;
                    
                }
                for(let index = 0; index< allConversationsWithMessage.length; index++){
                    let url = "/message?thread="+allConversationsWithMessage[index]._id
                    return `
                    <a href=${url} class="room-chat">
                        <li class="person" data-chat="contact._id">
                            <div class="left-avatar">
                                <div class="dot"></div>
                                <img src="${allConversationsWithMessage[index].avatar}" alt="">
                            </div>
                            <span class="name" style="display:block">${allConversationsWithMessage[index].fullName}</span>
                            <p class="preview">${previewMessage(allConversationsWithMessage[index].messages)} </p>
                            <span class="time">${formatTime(allConversationsWithMessage[index].createAt)}</span>
                        </li>
                    </a>
                ` 
                }
                return ``;  
            }else{
                return `<li class="person"> B???n ch??a c?? tin nh???n n??o </li>`
            }
        },
        viewMessage: (currentUser, messages, statusMessage, infoUserReceiver) => {
            let checkAuthorMessage = (message)=>{
                let template = ``;
                for(let index = 0; index < messages.length; index++){
                    if(String(currentUser._id) === String(message[index].senderId)){
                        template += `
                            <div class="bubble you" data-mess-id="${message[index]._id}">
                                ${message[index].text}
                            </div>
                        `
                    }else{
                        template += `
                            <div class="bubble me" data-mess-id="${message[index]._id}">
                                ${message[index].text}
                            </div>
                        `
                    }
                }
                return template

            }
            if(statusMessage){
                if(messages.length){
                        return `
                            <div class="top" data-id=${infoUserReceiver._id}>
                                <span>To: <span class="name">${ infoUserReceiver.fullName}</span></span>
                            </div>
                            <div class="content-chat" id="content-chat">
                                <div class="chat" id="chat-element">
                                    ${checkAuthorMessage(messages)}
                                </div>                               
                            </div>
                        `
                    }
                return    `<p> B???n ch??a c?? cu???c h???i tho???i n??o</p>` 
            }
            return `<p> Ch???n m???t chu???i tin nh???n m?? b???n mu???n ?????c n??</p>`
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session())
//init all socket
route(app);
initSocket(io)

const port = process.env.PORT || 8800;

server.listen(port, () => console.log(`App listening at http://localhost:${port}`));
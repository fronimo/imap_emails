const Imap = require('imap'),
    inspect = require ('util').inspect;

const fs = require('fs');
const db = require('./database');

const imap = new Imap({
    user: 'user@outlook.com',
    password: 'password',
    host: 'imap-mail.outlook.com',
    port: 993,
    tls: true
});

let emails=[];

function openInbox(cb) {
    imap.openBox('INBOX', true, cb);
}

function clear_email(email){
    let init = email.indexOf('<');
    let end = email.indexOf('>');

    if(init == -1 || end == -1){
        return 0;
    }
    
    let clean = email.slice(init+1, end);
    return clean;
}

imap.once('ready', () => {
    openInbox( (err, box) => {
      if (err) throw err;
    //   console.log(box.messages.total);
      var f = imap.seq.fetch('1:' + box.messages.total, {
        bodies: 'HEADER.FIELDS (FROM)',
        struct: true
      });
        
        f.on('message', (msg, seqno) => {
            // console.log('Message #%d', seqno);
            var prefix = '(#' + seqno + ') ';
            msg.on('body', (stream, info) => {
                var buffer = '';
                var my_email = '';
                stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
                });
                stream.once('end', async () => {
                    my_email = clear_email(buffer);
                    // console.log(buffer);
                    if(my_email != 0){
                        emails.push(my_email);
                    }
                });
            });
        });
        f.once('error', (err) => {
            console.log('Fetch error: ' + err);
        });
        f.once('end', () => {
            console.log('Done fetching all messages!');
            for(let i = 0; i < emails.length; i++){
              let email_db =  new db({
                email: emails[i]
              });
              email_db.save();
            }
            console.log('Emails saved!')
            imap.end();
        });
    });
  });
  
  imap.once('error', (err) => {
    console.log(err);
  });
  
  imap.once('end', () => {
    console.log('Connection ended');
  });
  
  imap.connect();

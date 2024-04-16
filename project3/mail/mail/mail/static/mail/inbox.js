


document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    load_mailbox('inbox');
    sessionStorage.setItem('currentMailbox', 'inbox');
});
  document.querySelector('#sent').addEventListener('click', () =>{ 
    
    load_mailbox('sent');
    sessionStorage.setItem('currentMailbox', 'sent');
    

});
  document.querySelector('#archived').addEventListener('click', () =>{ 
    
    load_mailbox('archive');
    sessionStorage.setItem('currentMailbox', 'archive');
});

  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector("#compose-form").addEventListener("submit",send_mail);

  // updated the rendering so that upon refreshing I stay on the same page
  const lastMailbox = sessionStorage.getItem('currentMailbox');
  load_mailbox(lastMailbox || 'inbox');
});

function compose_email(mailbox = "compose", recipients = null, subject = null, timestamp = null, body = null) {


  
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view').style.display = 'none';

  // Clear out composition fields
  if(mailbox==="compose"){
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
  else{

    if(subject.split(" ",1)[0] != "Re:"){
      subject = 'Re: ' + subject;
    }
    document.querySelector('#compose-recipients').value = recipients;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = `On ${timestamp}, ${recipients} wrote:\n ${body} \n`;
  }
  
}


function view_mail(mail){
  fetch(`/emails/${mail.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
    })
    

  // takes user to the page where the email is

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view').style.display = 'block';

  document.querySelector("#view").innerHTML = `
    <div id="header">
      <h6><strong>From:</strong> ${mail.sender}</h6>
      <h6><strong>To:</strong> ${mail.recipients}</h6>
      <h6><strong>Subject:</strong> ${mail.subject}</h6>
      <h6><strong>Timestamp:</strong> ${mail.timestamp}<br></h6>

      <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
      <button class="btn btn-sm btn-outline-primary" id="archive">Archive</button>

    </div>
    <div >
      <hr>
      <p>${mail.body}</p>
    </div>
  `;

  if(sessionStorage.getItem('currentMailbox')==="sent"){
    document.querySelector("#reply").style.display="none";
    document.querySelector("#archive").style.display="none";
  }

  document.querySelector("#archive").innerHTML = mail.archived ? "Unarchive":"Archive";

  document.querySelector("#reply").addEventListener('click', function() {
      compose_email("reply", mail.sender, mail.subject, mail.timestamp, mail.body);
  });

  document.querySelector("#archive").addEventListener('click', function() {
    fetch(`/emails/${mail.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: !mail.archived
      })
      })
      .then(() => {
        mail.archived = !mail.archived;
        const currentMailbox = sessionStorage.getItem('currentMailbox');
        load_mailbox(currentMailbox);
      })
  });

}


function load_mailbox(mailbox) {

  sessionStorage.setItem('currentMailbox', `${mailbox}`);
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      
      console.log(emails);

      // ... do something else with emails ...

      emails.forEach(mail =>{

  

        const element = document.createElement('div');
       
        element.style.border = "1px solid black"
        element.style.marginBottom = "3px"
        element.style.padding = "3px 3px 3px 3px";
        element.addEventListener('mouseenter', function() {
            element.style.backgroundColor = "#add8e6";
        });
        
        element.addEventListener('mouseleave', function() {
          element.style.backgroundColor = mail.read ? "#d3d3d3": "white";
        });
        element.innerHTML = `
            <h4>Sender: ${mail.sender}</h4>
            <h5>Subject: ${mail.subject}</h5>
            <p>${mail.timestamp}</p>

        `;

        if(mail.read==true){
          element.style.backgroundColor = "#d3d3d3";
        }
        else{
          element.style.backgroundColor = "white";
        }

        element.addEventListener('click', function() {
          view_mail(mail);

        });
        document.querySelector('#emails-view').append(element);
      
      })

      
  });
}

function send_mail(){

  event.preventDefault();
 
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);

      load_mailbox("sent")
  });
}
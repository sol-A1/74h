const form = document.querySelector('form')
const chatContainer = document.getElementById('chat-container')

const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9)
}

const chatStripe = (isBot, text, id, isLoading = false) => {
  const stripeClass = isBot ? 'bot-stripe' : 'user-stripe'
  const name = isBot ? ' ' : ' '
  const uniqueId = id ? `id="${id}"` : ''
  const textClass = isBot ? 'bot-text' : 'user-text'

  let messageText = text
  if (isLoading && !text) {
    messageText = 'Making a decision...'
  }

  return `
    <div class="stripe ${stripeClass}">
      <div class="avatar">${name[0]}</div>
      <div class="text" ${uniqueId}>
        <div class="${textClass}">${messageText}</div>
        <div class="loader"></div>
      </div>
      <div class="gap"></div>
    </div>
  `
}


const typeText = (messageDiv, text) => {
  const charsPerInterval = 5;
  const lines = text.split('\n').filter(Boolean); // Split text into individual lines
  let currentLine = 0;

  const intervalId = setInterval(() => {
    if (currentLine < lines.length) {
      const line = lines[currentLine];
      if (line.trim().startsWith("Explanation:")) {
        messageDiv.querySelector('.bot-text').innerHTML += `<br />\n<b>${line}</b><br />\n`; // Add bold tags to Explanation
        messageDiv.querySelector('.bot-text').innerHTML += '<br />\n'; // Add line break
      } else if (line.trim().startsWith("Decision:")) {
        messageDiv.querySelector('.bot-text').innerHTML += `<br />\n<b>${line}</b><br />\n`; // Add bold tags to Decision
        messageDiv.querySelector('.bot-text').innerHTML += '<br />\n'; // Add line break
      } else if (line.trim().startsWith("-")) {
        messageDiv.querySelector('.bot-text').innerHTML += `${line}<br />\n`; // Add bullet point
      } else {
        messageDiv.querySelector('.bot-text').innerHTML += `${line}<br />\n`; // Add line break
      }
      currentLine += 1;
    } else {
      clearInterval(intervalId);
      messageDiv.querySelector('.loader').style.display = 'none'; // hide the loader div
    }
  }, 50);
}



const loader = (messageDiv) => {
  const loaderDiv = messageDiv.querySelector('.loader')
  const intervalId = setInterval(() => {
    if (loaderDiv.textContent.length < 3) {
      loaderDiv.textContent += '.'
    } else {
      loaderDiv.textContent = ''
    }
  }, 500)

  return intervalId
}

const handleSubmit = async (e) => {
  e.preventDefault()

  const form = e.target;
  const formData = new FormData(form);
  const skills = formData.get('skills');
  const balance = formData.get('balance');

  // user's chatstripe
  const userStripe = chatStripe(false, `${skills}`);
  const loadingStripe = chatStripe(false, "Making a calculated decision...");
  chatContainer.innerHTML += userStripe.replace(skills, loadingStripe);

  // bot's chatstripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, "", uniqueId)

  // to focus scroll to the bottom 
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div 
  const messageDiv = document.getElementById(uniqueId)

  const response = await fetch('https://yfne.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      skills: skills,
      balance: balance,
    })
  })

  clearInterval(loader(messageDiv))
  messageDiv.querySelector('.loader').style.display = 'none'

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

    typeText(messageDiv, parsedData)
  } else {
    messageDiv.querySelector('.bot-text').textContent = "Something went wrong"
    alert('Something went wrong')
  }
}




form.addEventListener('submit', handleSubmit);

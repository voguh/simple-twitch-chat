let CHANNEL = {}
let MAX_MESSAGES_TO_SHOW = 6
let ANIMATION_DURATION = 0.25
let IGNORED_USERNAMES = []

function htmlEncode(str) {
  return str.replace(/[<>"^]/g, (e) => `&#${e.charCodeAt(0)};`)
}

function buildUsernameBadge(data) {
  let usernameText = ''

  for (const badge of data.badges) {
    usernameText += `<img alt="${badge.description}" src="${badge.url}" />`
  }

  return usernameText + data.displayName
}

function buildMessageWithEmotes(data) {
  return data.emotes.reduce((text, emote) => {
    emote.name = htmlEncode(emote.name)
    return text.replace(emote.name, `<img alt="${emote.name}" src="${emote.urls['4']}" />`)
  }, htmlEncode(data.text))
}

function doMessage(event) {
  const data = event.data
  const messageId = data.msgId
  const usernameData = buildUsernameBadge(data)

  if (IGNORED_USERNAMES.includes(data.nick) || data.text.startsWith('!')) {
    return
  }

  const mainContainer = document.querySelector('.main-container > .outer-wrapper')
  if (mainContainer != null) {
    const container = document.createElement('div')
    container.setAttribute('data-msgId', messageId)
    container.setAttribute('data-userId', data.userId)
    container.classList.add('messageBox--container')

    const username = document.createElement('div')
    username.classList.add('messageBox--username')
    username.style.color = data.displayColor
    username.innerHTML = usernameData
    container.appendChild(username)

    const message = document.createElement('div')
    message.classList.add('messageBox--message')
    message.innerHTML = buildMessageWithEmotes(data)
    container.appendChild(message)

    mainContainer.appendChild(container)

    const removeMessages = () => {
      const children = Array.from(mainContainer.children).reverse()
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const childRect = child.getBoundingClientRect()
        const top = childRect.top - 8

        if (i >= MAX_MESSAGES_TO_SHOW || top < 0) {
          child.classList.add('vanish')
          setTimeout(() => child.remove(), ANIMATION_DURATION * 1000)
        }
      }

      if (children.length > 0) {
        requestAnimationFrame(removeMessages)
      }
    }

    requestAnimationFrame(removeMessages)
  }
}

// ================================================================================================================== \\

function doDeleteMessage(event) {
  const message = document.querySelector(`div[data-msgId="${event.msgId}"]`)

  if (message != null) {
    message.remove()
  }
}

// ================================================================================================================== \\

function doDeleteMessages(event) {
  const messages = document.querySelectorAll(`div[data-userId="${event.userId}"]`)

  if (messages != null && messages.length > 0) {
    for (const message of messages) {
      message.remove()
    }
  }
}

window.addEventListener('onWidgetLoad', function (obj) {
  MAX_MESSAGES_TO_SHOW = obj.detail.fieldData.maxMessagesToShow ?? 6
  ANIMATION_DURATION = obj.detail.fieldData.animationDuration ?? 0.25
  IGNORED_USERNAMES = (obj.detail.fieldData.ignoredUsernames ?? '').split(',').map((username) => username.trim())
  CHANNEL = obj.detail.channel
})

window.addEventListener('onEventReceived', function (obj) {
  const event = obj.detail.event
  const detailListener = obj.detail.listener

  if (detailListener == 'event:test') {
    const eventListener = event.listener
    switch (eventListener) {
      case 'widget-button':
        const defaultEventBody = {
          detail: {
            listener: 'message',
            event: {
              service: 'twitch',
              data: {
                nick: CHANNEL.username,
                userId: CHANNEL.providerId,
                displayName: CHANNEL.username,
                displayColor: '#B22222',
                badges: [],
                text: '',
                emotes: [],
                msgId: Date.now()
              },
              renderedText: ''
            }
          }
        }

        if (obj.detail.event.field === 'testMessage') {
          fetch('https://baconipsum.com/api/?type=all-meat&paras=1')
            .then((data) => data.json())
            .then((data) => {
              defaultEventBody.detail.event.data.badges = [
                {
                  type: 'subscriber',
                  version: '1',
                  url: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
                  description: 'Subscriber'
                },
                {
                  type: 'turbo',
                  version: '1',
                  url: 'https://static-cdn.jtvnw.net/badges/v1/bd444ec6-8f34-4bf9-91f4-af1e3428d80f/3',
                  description: 'Turbo'
                },
                {
                  type: 'vip',
                  version: '1',
                  url: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/3',
                  description: 'VIP'
                }
              ]
              defaultEventBody.detail.event.data.text = data[0]
              defaultEventBody.detail.event.renderedText = data[0]
              let emulated = new CustomEvent('onEventReceived', defaultEventBody)

              window.dispatchEvent(emulated)
            })
        } else if (obj.detail.event.field === 'testMessageRaw') {
          defaultEventBody.detail.event.data.badges = [
            {
              type: 'broadcaster',
              version: '1',
              url: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/3',
              description: 'Broadcaster'
            },
            {
              type: 'turbo',
              version: '1',
              url: 'https://static-cdn.jtvnw.net/badges/v1/bd444ec6-8f34-4bf9-91f4-af1e3428d80f/3',
              description: 'Turbo'
            }
          ]
          defaultEventBody.detail.event.data.text = 'Just a test'
          defaultEventBody.detail.event.renderedText = 'Just a test'
          let emulated = new CustomEvent('onEventReceived', defaultEventBody)
          window.dispatchEvent(emulated)
        }
        break
    }
  } else {
    switch (detailListener) {
      case 'message':
        doMessage(obj.detail.event)
        break
      case 'delete-message':
        doDeleteMessage(obj.detail.event)
        break
      case 'delete-messages':
        doDeleteMessages(obj.detail.event)
        break
    }
  }
})

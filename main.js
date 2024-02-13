let CHANNEL = {}
let MAX_MESSAGES_TO_SHOW = 6
let ANIMATION_DURATION = 0.25
let IGNORED_USERNAMES = []
let IGNORE_COMMANDS = true

/** @type {JQuery<HTMLDivElement>} */
let mainContainer = null

function htmlEncode(str) {
  return (str ?? '').trim().replace(/[<>"^]/g, (e) => `&#${e.charCodeAt(0)};`)
}

function buildUsernameBadge(data) {
  let usernameText = ''
  for (const badge of data.badges) {
    usernameText += `<img src="${badge.url}" />`
  }

  return usernameText + data.displayName
}

function buildMessageWithEmotes(data) {
  return data.emotes.reduce((text, emote) => {
    return text.replaceAll(emote.name, `<img src="${emote.urls['4']}" />`)
  }, htmlEncode(data.text))
}

function onMessage(event, callback) {
  const data = event.data
  const messageId = data.msgId

  if (IGNORED_USERNAMES.includes(data.nick) || (IGNORE_COMMANDS && data.text.trim().startsWith('!'))) {
    return
  }

  if (mainContainer != null) {
    const usernameText = buildUsernameBadge(data)
    const messageText = buildMessageWithEmotes(data)
    const messageBox = $.parseHTML(`
      <div class="messageBox--container" data-msgId="${messageId}" data-userId="${data.userId}">
        <div class="messageBox--username" style="color:${data.displayColor}">${usernameText}</div>
        <div class="messageBox--message">${messageText}</div>
      </div>
    `)

    mainContainer.append(messageBox)

    const removeMessages = () => {
      const children = mainContainer.children().toArray().reverse()
  
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const childRect = child.getBoundingClientRect()
        const top = childRect.top - 8
  
        if (i >= MAX_MESSAGES_TO_SHOW || top < 0) {
          child.classList.add('vanish')
          setTimeout(() => child.remove(), ANIMATION_DURATION * 1000)
        }
      }
    }
  
    requestAnimationFrame(removeMessages)
  }

  callback()
}

// ================================================================================================================== \\

function dispatchDebugMessage(event) {
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

  if (event.field === 'testMessage') {
    fetch('https://baconipsum.com/api/?type=all-meat&paras=1')
      .then((data) => data.json())
      .then((data) => {
        defaultEventBody.detail.event.data.badges = [
          {
            type: 'vip',
            version: '1',
            url: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/3',
            description: 'VIP'
          },
          {
            type: 'subscriber',
            version: '1',
            url: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
            description: 'Subscriber'
          }
        ]
        defaultEventBody.detail.event.data.text = data[0]
        defaultEventBody.detail.event.renderedText = data[0]
        window.dispatchEvent(new CustomEvent('onEventReceived', defaultEventBody))
      })
  } else if (event.field === 'testMessageRaw') {
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
    window.dispatchEvent(new CustomEvent('onEventReceived', defaultEventBody))
  }
}
// ================================================================================================================== \\

const messages = async.queue(onMessage, 1)

window.addEventListener('onWidgetLoad', function (obj) {
  CHANNEL = obj.detail.channel

  const fieldData = obj.detail.fieldData
  MAX_MESSAGES_TO_SHOW = fieldData.maxMessagesToShow ?? 6
  ANIMATION_DURATION = fieldData.animationDuration ?? 0.25
  IGNORED_USERNAMES = (fieldData.ignoredUsernames ?? '').split(',').map((username) => username.trim())
  IGNORE_COMMANDS = fieldData.ignoreCommands ?? true

  mainContainer = $('.main-container > .outer-wrapper')
})

window.addEventListener('onEventReceived', function (obj) {
  switch (obj.detail.listener) {
    case 'message':
      messages.push(obj.detail.event)
      break
    case 'delete-message':
      $(`div[data-msgId="${obj.detail.event.msgId}"]`).remove()
      break
    case 'delete-messages':
      $(`div[data-userId="${obj.detail.event.userId}"]`).remove()
      break
    case 'event:test':
      switch (obj.detail.event.listener) {
        case 'widget-button':
          dispatchDebugMessage(obj.detail.event)
          break
      }
      break
  }
})

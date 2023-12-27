function addMessageRandom() {
  fetch('https://baconipsum.com/api/?type=all-meat&paras=1')
    .then((data) => data.json())
    .then((data) => {
      const defaultEventBody = {
        detail: {
          listener: 'message',
          event: {
            service: 'twitch',
            data: {
              nick: 'm_voguh_ya',
              userId: Date.now(),
              displayName: 'M_Voguh_ya',
              displayColor: '#B22222',
              badges: [
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
              ],
              text: data[0],
              emotes: [],
              msgId: Date.now()
            },
            renderedText: data[0]
          }
        }
      }

      window.dispatchEvent(new CustomEvent('onEventReceived', defaultEventBody))
    })
}

function addMessage() {
  const defaultEventBody = {
    detail: {
      listener: 'message',
      event: {
        service: 'twitch',
        data: {
          nick: 'm_voguh_ya',
          userId: '1',
          displayName: 'M_Voguh_ya',
          displayColor: '#B22222',
          badges: [
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
          ],
          text: 'Just a test',
          emotes: [],
          msgId: Date.now()
        },
        renderedText: 'Just a test'
      }
    }
  }

  window.dispatchEvent(new CustomEvent('onEventReceived', defaultEventBody))
}

window.onload = function () {
  MAX_MESSAGES_TO_SHOW = 9
  ANIMATION_DURATION = 0.25
  MESSAGE_PERCENTAGE_TO_HIDE = 25 / 100
  IGNORED_USERNAMES = ''.split(',').map((username) => username.trim())

  const debugContainer = document.createElement('duv')
  debugContainer.style.position = 'absolute'
  debugContainer.style.top = '16px'
  debugContainer.style.left = '16px'
  debugContainer.style.display = 'flex'
  debugContainer.style.flexDirection = 'column'
  debugContainer.style.gap = '8px'

  const b1 = document.createElement('button')
  b1.textContent = 'ADD MESSAGE'
  b1.onclick = addMessage
  debugContainer.appendChild(b1)

  const b2 = document.createElement('button')
  b2.textContent = 'ADD MESSAGE (RANDOM)'
  b2.onclick = addMessageRandom
  debugContainer.appendChild(b2)

  document.body.appendChild(debugContainer)
}

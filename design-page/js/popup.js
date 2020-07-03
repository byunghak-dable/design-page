// 버튼 elements
const designModeToggleBtn = document.querySelector('.btn--design-mode')
const screenShotBtn = document.querySelector('.btn--screen-shot')
const p5ModeToggleBtn = document.querySelector('.btn--start-p5')
const playControllerBtn = document.querySelector('.btn--play-controller')

// content.js 에게 메시지를 보내는 메소드
const broadcastToContent = message => {
  // MEMO : query -> 모든 텝을 쿼리, 파라미터 - (1) chrome.tabs 확인 (2) 모든 tabs(tabs[0] = 현재 텝)
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, message, response => {
      if (!response) return console.log('no response')

      switch (response.type) {
        case 'toggle-design-mode':
          const designMode = response.payload
          designModeToggleBtn.innerHTML = designMode === 'on' ? 'Disable' : 'Enable'
          designMode === 'on' ? designModeToggleBtn.classList.add('active') : designModeToggleBtn.classList.remove('active')
          break

        case 'get-mode-state':
          const storedDesignMode = response.payload
          designModeToggleBtn.innerHTML = storedDesignMode.designMode === 'on' ? 'Disable' : 'Enable'
          storedDesignMode.designMode === 'on' ? designModeToggleBtn.classList.add('active') : designModeToggleBtn.classList.remove('active')
          break

        case 'toggle-p5-mode':
          const p5Mode = response.payload
          p5ModeToggleBtn.innerHTML = p5Mode ? 'Disable' : 'Enable'
          p5Mode ? p5ModeToggleBtn.classList.add('active') : p5ModeToggleBtn.classList.remove('active')
          break

        case 'get-p5-mode-state':
          const storedP5Mode = response.payload
          p5ModeToggleBtn.innerHTML = storedP5Mode ? 'Disable' : 'Enable'
          storedP5Mode ? p5ModeToggleBtn.classList.add('active') : p5ModeToggleBtn.classList.remove('active')
          break

        default:
          console.log('response : 정하지 않은 type 선언')
          break
      }
    })
  })
}

designModeToggleBtn.addEventListener('click', () => {
  broadcastToContent({ type: 'toggle-design-mode' })
})

p5ModeToggleBtn.addEventListener('click', () => {
  broadcastToContent({ type: 'toggle-p5-mode' })
})

playControllerBtn.addEventListener('click', () => {
  broadcastToContent({ type: 'pause-sketch-mode' })
})

screenShotBtn.addEventListener('click', () => {
  broadcastToContent({ type: 'capture-tab' })
})

window.onload = () => {
  broadcastToContent({ type: 'get-mode-state' })
  broadcastToContent({ type: 'get-p5-mode-state' })
}

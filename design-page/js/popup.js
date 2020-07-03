// 버튼 elements
const designModeToggleBtn = document.querySelector('.btn--design-mode')
const p5ModeToggleBtn = document.querySelector('.btn--start-p5')
const playControllerBtn = document.querySelector('.btn--play-controller')
const screenShotBtn = document.querySelector('.btn--screen-shot')

// content.js 에게 메시지를 보내는 메소드
const broadcastToContent = message => {
  // MEMO : query -> 모든 텝을 쿼리, 파라미터 - (1) chrome.tabs 확인 (2) 모든 tabs(tabs[0] = 현재 텝)
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, message, response => {
      if (!response) return console.log('no response')

      // 디자인 모드 버튼 클릭할 때마다 스타일 변경 관련 메소드
      const handleDesignModeBtn = state => {
        designModeToggleBtn.innerHTML = state === 'on' ? 'Disable' : 'Enable'
        state === 'on' ? designModeToggleBtn.classList.add('active') : designModeToggleBtn.classList.remove('active')
      }

      // 스케치 모드 버튼 클릭할 때마다 스타일 변경 관련 메소드
      const handleSketchModeBtn = state => {
        p5ModeToggleBtn.innerHTML = state ? 'Disable' : 'Enable'
        state ? p5ModeToggleBtn.classList.add('active') : p5ModeToggleBtn.classList.remove('active')
      }

      // 스케치 play/pause 버튼 컨트롤 하는 메소드
      const handleSketchController = state => {
        if (state) {
          playControllerBtn.classList.add('active')
          playControllerBtn.classList.remove('fa-play-circle')
          playControllerBtn.classList.add('fa-pause-circle')
        } else {
          playControllerBtn.classList.remove('active')
          playControllerBtn.classList.remove('fa-pause-circle')
          playControllerBtn.classList.add('fa-play-circle')
        }
      }

      switch (response.type) {
        // 디자인 모드 버튼 : 페이지 조작
        case 'toggle-design-mode':
          const designMode = response.payload
          handleDesignModeBtn(designMode, designModeToggleBtn)
          break

        // 디자인 모드 초기 값 : 페이지 조작
        case 'get-mode-state':
          const storedDesignMode = response.payload.designMode
          handleDesignModeBtn(storedDesignMode, designModeToggleBtn)
          break

        // p5 캔버스 모드 버튼 : 페이지에 팬으로 그림 그리는 기능
        case 'toggle-p5-mode':
          const p5Mode = response.payload
          handleSketchModeBtn(p5Mode)
          broadcastToContent({ type: 'toggle-sketching' }) // 처음 enable 될 때 바로 스케치 할 수 있게 모드 바꾸기
          break

        // p5 캔버스 모드 버튼 : 페이지에 팬으로 스케치 기능
        case 'get-p5-mode-state':
          const storedP5Mode = response.payload
          handleSketchModeBtn(storedP5Mode)
          break

        // p5 캔버스 모드 초기 값: 페이지에 팬으로 스케치 기능
        case 'toggle-sketching':
          const sketchToggleMode = response.payload
          handleSketchController(sketchToggleMode)
          break

        // p5 스케치 모드 버튼 : 스케치 일시정지 하거나 다시 그릴 수 있음
        case 'get-p5-sketch-state':
          const storedSketchMode = response.payload
          handleSketchController(storedSketchMode)
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
  broadcastToContent({ type: 'toggle-sketching' })
})

screenShotBtn.addEventListener('click', () => {
  broadcastToContent({ type: 'capture-tab' })
})

window.onload = () => {
  broadcastToContent({ type: 'get-mode-state' })
  broadcastToContent({ type: 'get-p5-mode-state' })
  broadcastToContent({ type: 'get-p5-sketch-state' })
}

const wordSelected = () => {
  const selectedText = window.getSelection().toString()
  console.log(selectedText)
}
window.addEventListener('mouseup', wordSelected)

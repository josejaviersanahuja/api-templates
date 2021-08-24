/**
 * library for the test printout style
 *
 */

//INITIALIZING MODULE OBJ
const cli = {};
/*********************************
 *        CLI FORMAT helper
 * ****************************** */

// draw a horizontal line of the console's width
cli.horizontalLine= function(){
  //GET available screen size
  const width = process.stdout.columns

  let line = ''
  for (let i = 0; i < width; i++) {
    line+='-'
  }
  console.log(line);
}

// centered will show a text CENTERED like a title
cli.centered = function(title){
  title = typeof title == 'string' && title.length > 0 ? title.trim() : ''
  
  // get the width
  const width = process.stdout.columns

  //calculate de left padding
  const leftPadding = Math.floor((width - title.length)/2)
  let line = ''
  for (let i = 0; i < leftPadding; i++) {
    line += ' ' 
  }
  line+=title
  console.log(line);
}

// determine de number of colums you want to format
cli.verticalSpace = function(lines=1){
  lines = typeof lines == 'number' && lines > 0 ? lines : 1
  for (let i = 0; i < lines; i++) {
    console.log('');    
  }
}

// 
cli.renderObjectStyle = function(title, object, color){
  
  const wasColorpassedAsParameter = Boolean(color)
  color = color? color : 33
  //CLI FORMAT Helpers
    cli.horizontalLine()
    cli.centered(title)
    cli.horizontalLine()
    //cli.verticalSpace()
    
    // Show each command, followed by its explination
    Object.keys(object).forEach(e=>{
      let line= e==='Fail'? '\x1b[31m'+e+'\x1b[0m' : `\x1b[${color}m`+e+'\x1b[0m'

      const value = object[e]
      const padding = wasColorpassedAsParameter ? 75-line.length :45- line.length
      for (let i = 0; i < padding; i++) {
        line += ' '
      }
      line +=  value
      console.log(line);
      //cli.verticalSpace()
    })
}
//EXPORTING THE OBJECT
module.exports = cli;

import { LightningElement, api, track } from 'lwc';

export default class Demjfilepreview extends LightningElement {

  @api imgElement;
  @api contentId;
  @api cancelCallback;
  @api saveCallback;

  @track rendered = false;
  startX; startY; isDown=false; rects=[]; canvas; ctx; offsetX; offsetY; mouseX; mouseY; newRect;
  img;

  cancel() {
    this.cancelCallback();
  }
 
  save() {
    try{
      console.log('save ====')
      const aaa = this.canvas.toDataURL();
      console.log(aaa)
      this.saveCallback(this.contentId, aaa);
    } catch(e) {
      console.log(e)
    }
  }

  undo = () => {
    this.rects.pop();
    this.drawAll();
  }

  renderedCallback() {
    if (this.rendered) {
      return;
    }
    this.rendered = true;
    const canvas = this.template.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const img = this.imgElement
    this.img = img;
    this.ctx = ctx;
    this.canvas = canvas;
    this.drawImage();
    this.listen();
    const BB = this.canvas.getBoundingClientRect();
    this.offsetX = BB.left + window.scrollX;
    this.offsetY = BB.top + window.scrollY;
  }

  handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.startX=parseInt(e.clientX-this.offsetX);
    this.startY=parseInt(e.clientY-this.offsetY);
    
    // Put your mousedown stuff here
    this.isDown=true;
  }

  handleMouseUp = (e) =>{
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
  
    this.mouseX=parseInt(e.clientX-this.offsetX);
    this.mouseY=parseInt(e.clientY-this.offsetY);
  
    // Put your mouseup stuff here
    this.isDown=false;
    this.rects.push(this.newRect);
    
    this.drawAll();
  }

  drawImage = (e) => {
    const hRatio = this.canvas.width  / this.img.width    ;
    const vRatio = this.canvas.height / this.img.height  ;
    const scale  = Math.min ( hRatio, vRatio );
    const x = (this.canvas.width / 2) - (this.img.width / 2) * scale;
    const y = (this.canvas.height / 2) - (this.img.height / 2) * scale;
    // const img = new Image();
    // img.src = this.img.src;
    // img.crossOrigin = "Anonymous"
    this.ctx.drawImage(this.img, x, y, this.img.width * scale, this.img.height * scale);  
  }

  drawAll = () =>{
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.lineWidth=1;
    this.drawImage();
    for(let i=0;i<this.rects.length;i++){
      const r=this.rects[i];
      this.ctx.fillRect(r.left,r.top,r.right-r.left,r.bottom-r.top);
    }
  }
  
  handleMouseOut = (e) =>{
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
  
    this.mouseX=parseInt(e.clientX-this.offsetX);
    this.mouseY=parseInt(e.clientY-this.offsetY);
  
    // Put your mouseOut stuff here
    this.isDown=false;
  }
  
  handleMouseMove = (e) => {
    if(!this.isDown){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
  
    this.mouseX=parseInt(e.clientX-this.offsetX);
    this.mouseY=parseInt(e.clientY-this.offsetY);
  
    this.newRect = {
      left:Math.min(this.startX,this.mouseX),
      right:Math.max(this.startX,this.mouseX),
      top:Math.min(this.startY,this.mouseY),
      bottom:Math.max(this.startY,this.mouseY),
    }
  
    this.drawAll();
    this.ctx.strokeStyle = "#16325c";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(this.startX,this.startY,this.mouseX-this.startX,this.mouseY-this.startY);
  
  }

  listen = () => {
    this.canvas.addEventListener('mousedown', (e) => {
      this.handleMouseDown(e);
    }, false);
    this.canvas.addEventListener('mouseup', (e) => {
      this.handleMouseUp(e);
    }, false);
    this.canvas.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    }, false);
    this.canvas.addEventListener('mouseout', (e) => {
      this.handleMouseOut(e);
    }, false);

  }
}
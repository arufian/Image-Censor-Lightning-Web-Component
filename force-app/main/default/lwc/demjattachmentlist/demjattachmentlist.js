import { LightningElement, api, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import getFiles from '@salesforce/apex/DemjAccountFileManager.getFiles';
import updateFile from '@salesforce/apex/DemjAccountFileManager.updateFile';

export default class Demjattachmentlist extends LightningElement {

  @api recordId;
  @api blockColor;
  @api componentTitle;
  @track previewContainer;
  currentContentId;
  showModal = false;
  @track rendered = false;

  renderImage = async () => {
    try {

      const imageList = await getFiles({ id: this.recordId });
      const imageEls = this.template.querySelectorAll((`[data-id="image"]`));
      this.previewContainer = this.template.querySelector((`[data-id="preview"]`));
      const imageIds = Object.keys(imageList);
      imageEls.forEach((element, i) => {
        element.src = `data:image/jpg;base64,${imageList[imageIds[i]]}`;
        element.setAttribute('content-id', imageIds[i]);
        if (i == 0) {
          this.previewContainer.src = `data:image/jpg;base64,${imageList[imageIds[i]]}`;
          this.currentContentId = imageIds[i];
        }
      });

      this.previewContainer.addEventListener('load', () => {
        const spinner = this.template.querySelector('.spinner-container');
        spinner.className = 'spinner-container slds-hide';
        const mediaList = this.template.querySelector('.media-list');
        mediaList.className = 'media-list slds-visible';
      });
      this.rendered = true;

    } catch (e) {
      console.error(e);
    }
  }

  renderedCallback() {
    if (this.rendered) return;
    this.renderImage();
    this.rendered = true;
  }

  toDataURL = url => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))
    .catch((e) => new Error(e))

  preview = async (e) => {
    if (this.showModal) return;
    const src = e.target.src;
    this.previewContainer.src = src;

    this.currentContentId = e.target.getAttribute('content-id');
    const currentEl = this.template.querySelector('.current');
    currentEl.className = '';
    e.target.className = 'current';
  }

  get imgElement() {
    return this.previewContainer;
  }

  get contentId() {
    return this.currentContentId;
  }

  showImageEditor = () => {
    this.showModal = true;
  }

  hideImageEditor = () => {
    this.showModal = false;
  }

  saveImage = async (id, base64Data) => {
    const a = 'data:image/png;base64,';
    const strImg = base64Data.substring(base64Data.indexOf(a) + a.length);
    const imageList = await updateFile({
      contentDocumentId: id,
      base64Data: strImg
    });
    this.showModal = false;
    this.rendered = false;

    const spinner = this.template.querySelector('.spinner-container');
    spinner.className = 'spinner-container slds-visible';
    const mediaList = this.template.querySelector('.media-list');
    mediaList.className = 'media-list slds-hide';
  }
}
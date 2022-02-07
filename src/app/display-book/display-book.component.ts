import { Component, AfterViewInit, HostListener, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { BibleService } from '../bible.service';
import { HistoryService } from '../history.service';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import * as wasm from '../../../pkg';

@Component({
  selector: 'app-display-book',
  templateUrl: './display-book.component.html',
  styleUrls: ['./display-book.component.scss'],
  encapsulation: ViewEncapsulation.None // removes ::ng-deep need
})
export class DisplayBookComponent implements OnInit, AfterViewInit {

public renderedBook: string;
public scroll: number;
private observer: IntersectionObserver;

  constructor( public bibleService: BibleService,
               public historyService: HistoryService,
               public title: Title,
               public meta: Meta, 
               @Inject(DOCUMENT) public document: Document, ) { 
    

    this.renderedBook = wasm.render(this.bibleService.testament, this.bibleService.bookSelected);
    this.historyService.newBook();
    this.meta.addTag({ name: 'description', content: 'King James Version (Cambridge) Bible; utilising WebAssembly for speed.' });
  }   
  
  ngOnInit() {} 

  ngAfterViewInit() {

    window.scroll(0, Number(localStorage.getItem('curScrollY')));

    // store book for loading on return, if not chosen from history -MUST BE UNDER ngAfterViewInit 
    this.historyService.storeBooks();
    
    // change tab title on load
    let tabTitle = (this.bibleService.title).concat(' ',localStorage.getItem('curChap'));
    this.title.setTitle(tabTitle);

    // save chapters on scroll
    const chapters = this.document.querySelectorAll("section");
    const options = {
      root: null, // viewport
      threshold: [0],
      rootMargin: "-50%" //highlight multiple chapters if visible
    };
    this.observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      let chapter = entry.target.querySelector("div").id; 
      if (entry.isIntersecting ) {
         localStorage.setItem('curChap', chapter); 
      }
      else {
        if (window.pageYOffset < this.scroll && chapter != "1")  { //chapter !- 1 ; necessary if history book - will result in chapter 0.
          let newChap = (Number(chapter)-1).toString();
          localStorage.setItem( 'curChap', newChap);
        }     
      }
      this.scroll = window.pageYOffset;
    });
    },options);
      chapters.forEach(chapter=> {
      this.observer.observe(chapter);
    }) 

  }

  @HostListener('window:scroll', []) scrolled() {    
    // change chapter numbers in tab title as scrolling
    let tabTitle = (this.bibleService.title).concat(' ',localStorage.getItem('curChap'));
    this.title.setTitle(tabTitle);

    localStorage.setItem('curScrollY', window.pageYOffset.toString());
  }
  @HostListener('window:beforeunload')
    async ngOnDestroy() {
    // store scroll position and chapter on exit
    this.historyService.savePosition();
    } 
}

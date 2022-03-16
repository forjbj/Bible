import { Component, AfterViewInit, HostListener, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { BibleService } from '../bible.service';
import { HistoryService } from '../history.service';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import * as wasm from '../../../pkg';
import { ActivatedRoute } from '@angular/router';

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

public fragString: string;

public routedLink = false; //Needed to test for outside links including search link

  constructor( public bibleService: BibleService,
               public historyService: HistoryService,
               public title: Title,
               public meta: Meta, 
               @Inject(DOCUMENT) public document: Document,
               private activatedRoute: ActivatedRoute, ) { 

    this.meta.addTag({ name: 'description', content: 'King James Version (Cambridge) Bible; utilising WebAssembly for speed.' });
    this.bibleService.pageTitle = this.bibleService.title;
    this.bibleService.chapterButton = true;
    this.bibleService.chapterNumber = localStorage.getItem('curChap');


      let fragment = this.activatedRoute.snapshot.fragment;
      if (fragment && (this.bibleService.searchNavigate == false)){
      let frag = fragment.split('-')
      if (frag[3] != null){ // only if verse exists in route
        localStorage.setItem( 'curTestamentIndex', (frag[0]));
        localStorage.setItem( 'curBookIndex', (frag[1]));
        localStorage.setItem('curChap', frag[2]);
        this.bibleService.testament = Number(frag[0]);
        this.bibleService.bookSelected = Number(frag[1]);
        this.bibleService.title = this.bibleService.bible[frag[0]].books[frag[1]].bookName;
        this.bibleService.showChapters = false;
        this.fragString = fragment.toString();
        this.routedLink = true;
      } 
    }

    this.renderedBook = wasm.render(this.bibleService.testament, this.bibleService.bookSelected);
    if (this.routedLink == false) {
      this.historyService.newBook();
    }
  }   
  
  ngOnInit() {} 

  ngAfterViewInit() {


    // store book for loading on return, if not chosen from history -MUST BE UNDER ngAfterViewInit 
    this.historyService.storeBooks();
    
    // change tab title on load and chapter number
    this.bibleService.chapterNumber = localStorage.getItem('curChap');
    let tabTitle = (this.bibleService.title).concat(' ',this.bibleService.chapterNumber);
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
      let splits = chapter.split('-');
      let targetChapter = splits[2];
      if (entry.isIntersecting ) {
         localStorage.setItem('curChap', targetChapter); 
      }
      else {
        if (window.pageYOffset < this.scroll && targetChapter != "1")  { //chapter !- 1 ; necessary if history book - will result in chapter 0.
          let newChap = (Number(targetChapter)-1).toString();
          localStorage.setItem( 'curChap', newChap);
        }     
      }
      this.scroll = window.pageYOffset;
    });
    },options);
      chapters.forEach(chapter=> {
      this.observer.observe(chapter);
    }) 

    // add highlighting if come from link and scroll
    if (this.routedLink == true) {
      let target = document.getElementById(this.fragString);
      target.classList.add("activatedLink");
      setTimeout( function(){target.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"})}, 100); //needed as it doesn't work on chrome without setTimeout
    } else { //only scroll if not an outside link
      // get scroll position (Y offset) from local storage and scroll to it -THIS MUST GO HERE OR SCROLLING TO OLD POSITION DOESN'T WORK
      window.scroll(0, Number(localStorage.getItem('curScrollY')));
    }
  }

  @HostListener('window:scroll', []) scrolled() {    
    // change chapter numbers in tab title as scrolling
    this.bibleService.chapterNumber = localStorage.getItem('curChap');
    let tabTitle = (this.bibleService.title).concat(' ',this.bibleService.chapterNumber);
    this.title.setTitle(tabTitle);

    localStorage.setItem('curScrollY', window.pageYOffset.toString());
  }
  @HostListener('window:beforeunload')
    async ngOnDestroy() {
    // store scroll position and chapter on exit
    this.historyService.savePosition();
    } 
}

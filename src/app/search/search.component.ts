import { Component, OnInit, AfterViewInit, HostListener, ElementRef, ViewEncapsulation } from '@angular/core';
import { BibleService } from '../bible.service';
import * as wasm from '../../../pkg';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  encapsulation: ViewEncapsulation.None // removes ::ng-deep need
})
export class SearchComponent implements OnInit, AfterViewInit {

  public checkedNumber: number = 2;

  public worker: any;

  testaments = [    
    { id: 0, label: "Old Testament" },
    { id: 1, label: "New Testament" },
    { id: 2, label: "Old & New Testaments", selected: true}
  ]

  public accuracy: number = 0;

  accuracyLevel = [
    { id: 0, label: "Contains Characters" },
    { id: 1, label: "Exact Word/s (slower)" },
  ]
  
  constructor(public bibleService: BibleService,
              public title: Title,
              public meta: Meta,
              public elementRef:ElementRef,
              private router: Router ) { 
    //nav titles and buttons
    this.bibleService.pageTitle = "Search";
    this.bibleService.chapterButton = false;

    this.title.setTitle('Bible Search');
    this.meta.addTag({ name: 'description', content: 'Search for words in the bible offline; uses WebAssembly for faster results' });

    // Worker needs to be created immediately or will only work with double click
    if (typeof Worker !== 'undefined') {
      // Create a new
      this.worker = new Worker(new URL('./search.worker', import.meta.url));
    }
  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    window.scroll(0, Number(localStorage.getItem('searchScrollY')));
    this.bibleService.spinner = false; //needed for reopening search page
  }
  ngAfterViewChecked() {
    //hack needed to add functionality to innerhtml from Rust/wasm
    if (!(this.elementRef.nativeElement.querySelector(".eventListenerAdded"))) { //check if this function has already run
      if (this.elementRef.nativeElement.querySelectorAll(".listResults")) {
        const res = this.elementRef.nativeElement.querySelectorAll(".listResults");
        res.forEach(element => {
          element.addEventListener("click", () => { //must be arrow function or doesn't work; function contains 'this.' - apparently requires arrow function
            element.classList.add("eventListenerAdded"); //add empty class to test against; see above; - this is a terrible hack
            const splits = element.id.toString().split('-');
            this.bibleService.testament = Number(splits[0]);
            this.bibleService.bookSelected = Number(splits[1]);
            this.bibleService.title = this.bibleService.bible[this.bibleService.testament].books[this.bibleService.bookSelected].bookName 
            this.bibleService.showChapters = false;
            this.bibleService.displayMenu = false;
            let frag = element.id.toString();
            this.router.navigate(['book'], {fragment: frag}); //works
            //the following is necessary or doesn't work;
            document.getElementById(frag).classList.add("activatedLink"); //necessary or doesn't work; thinking it's a timing thing
            document.getElementById(frag).scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});          
          });
        });
      }
    }
  }

  selectedTest() {
    this.checkedNumber = +this.checkedNumber;
  }
  selectedAccuracy() {
    this.accuracy = +this.accuracy;
  }
  submitSearch(req: string) {
    this.bibleService.spinner = true; // run spinner animation
    this.bibleService.spinnerTitle = "Searching"
    if (typeof Worker !== 'undefined') {
      this.worker.onmessage = ({ data }) => {
        this.bibleService.searchRequest = req;
        this.bibleService.searchResults = data;
        this.bibleService.spinner = false;
      };
      this.worker.postMessage(wasm.search(this.checkedNumber, req, this.accuracy));
    } else {
      // Web workers are not supported in this environment.
      console.log('thread not used');
      setTimeout(() => {
        this.bibleService.searchRequest = req;
        this.bibleService.searchResults = wasm.search( this.checkedNumber, req, this.accuracy)
        this.bibleService.spinner = false;
      }, 100); // give it a moment to redraw
    }
    window.scrollTo(0,0); // bring new search to top of page
  }
  @HostListener('window:scroll', []) scrolled() {    
    // keep position in case of return
    localStorage.setItem('searchScrollY', window.pageYOffset.toString());
  }
}
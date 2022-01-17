import { Component, OnInit, AfterViewInit, HostListener, ElementRef } from '@angular/core';
import { BibleService } from '../bible.service';
import * as wasm from '../../../pkg';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewInit {

  public checkedNumber: number = 2;

  testaments = [    
    { id: 0, label: "Old Testament" },
    { id: 1, label: "New Testament" },
    { id: 2, label: "Old and New Testaments", selected: true}
  ]

  public accuracy: number = 0;

  accuracyLevel = [
    { id: 0, label: "Contains (faster)" },
    { id: 1, label: "Exact (slower)" },
  ]
  
  constructor(public bibleService: BibleService,
              public title: Title,
              private meta: Meta,
              public elementRef:ElementRef,
              private router: Router ) { 
    // change title so as to not make it a button
    this.bibleService.pageTitle = "Search";
    this.bibleService.title = this.bibleService.pageTitle;
    this.title.setTitle('Bible Search');
    this.meta.addTag({ name: 'description', content: 'Offline search function for the bible (webassembly)' });


  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    window.scroll(0, Number(localStorage.getItem('searchScrollY')));
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
            let frag = (splits[2] + "-" + splits[3]).toString();
            this.router.navigate(['book'], {fragment: frag}); //works
            if (document.getElementById(frag)) {
              document.getElementById(frag).classList.add("active");
            }
          }
          );
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
      window.scrollTo(0,0); // bring new search to top of page
      this.bibleService.searchRequest = req;
      this.bibleService.searchResults = wasm.search( this.checkedNumber, req, this.accuracy);
  }
  @HostListener('window:scroll', []) scrolled() {    
    // keep position in case of return
    localStorage.setItem('searchScrollY', window.pageYOffset.toString());
  }
}


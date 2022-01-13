import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject } from '@angular/core';
import { BibleService } from '../bible.service';
import { HistoryService } from '../history.service';

@Component({
  selector: 'app-chapter-numbers',
  templateUrl: './chapter-numbers.component.html',
  styleUrls: ['./chapter-numbers.component.scss']
})
export class ChapterNumbersComponent implements AfterViewInit{

  private observer: IntersectionObserver;

  constructor(public bibleService: BibleService,
              public historyService: HistoryService,
              @Inject(DOCUMENT) public document: Document, ) { }

  ngAfterViewInit() {
    // highlight chapters on scroll
    const chapters = this.document.querySelectorAll("section");
    const chaptersGrid = this.document.getElementsByClassName("chapters");
    const options = {
      root: null, // viewport
      threshold: [0],
      rootMargin: "-50%" //highlight multiple chapters if visible
    };
    this.observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      let chapter = entry.target.querySelector("div").id; 
      if (entry.isIntersecting ) {
          chaptersGrid[Number(chapter)-1].classList.add("chapterScroll");
      } else {
          chaptersGrid[Number(chapter)-1].classList.remove("chapterScroll");  
      }
        //block: "nearest" is essential to stop page moving!
      chaptersGrid[(Number(localStorage.getItem('curChap'))-1)].scrollIntoView({block: "nearest"});
    });
    },options);
      chapters.forEach(chapter=> {
      this.observer.observe(chapter);
    })  
  }
  ngOnDestroy() {
    this.observer.disconnect();
  }

}

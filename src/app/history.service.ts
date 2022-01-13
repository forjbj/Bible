import { Injectable } from '@angular/core';
import { BibleService } from './bible.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  public curTheme:string;

  public curBookMenu: string;
  public secBookMenu: string;
  public thirdBookMenu: string;

  public curChap: string;
  public curSavedChap: string;
  public secSavedChap: string;
  public thirdSavedChap: string;
  public curScrollYPostion: string;
  public secScrollY: string;
  public thirdScrollY: string;

  public curBookArr: string;
  public curTestamentArr: string;
  public secBookArr: string;
  public secTestamentArr: string;
  public thirdBookArr: string;
  public thirdTestamentArr: string;

  constructor( public bibleService: BibleService,
              public router: Router) { } 

  menuBooks() {
    this.curTheme =  localStorage.getItem('theme');
    
    this.curBookMenu = this.bibleService.bible[Number(localStorage.getItem('curTestamentIndex'))].books[Number(localStorage.getItem('curBookIndex'))].bookName
    + ' '  + localStorage.getItem('curChap') ;
    if (localStorage.getItem('secTestamentIndex') != null) {
      this.secBookMenu = this.bibleService.bible[Number(localStorage.getItem('secTestamentIndex'))].books[Number(localStorage.getItem('secBookIndex'))].bookName
      + ' ' + localStorage.getItem('secSavedChap') ;
    }
    if (localStorage.getItem('thirdTestamentIndex') != null) {
      this.thirdBookMenu = this.bibleService.bible[Number(localStorage.getItem('thirdTestamentIndex'))].books[Number(localStorage.getItem('thirdBookIndex'))].bookName
      + ' ' + localStorage.getItem('thirdSavedChap') ;
    }
  }

  rearrangeBooks(book:string) {

    this.bibleService.menuHistoryBook = true;
    this.bibleService.showChapters = false;
    this.bibleService.displayMenu = false;
    
    switch (book) {
      case 'cur':
        break;
      
      case 'sec':
        this.curTestamentArr = localStorage.getItem('curTestamentIndex');
        this.curBookArr = localStorage.getItem('curBookIndex');
        this.curChap = localStorage.getItem('curChap');
        this.curScrollYPostion = localStorage.getItem('curScrollY');
        this.secTestamentArr= localStorage.getItem('secTestamentIndex');
        this.secBookArr = localStorage.getItem('secBookIndex');
        this.secSavedChap = localStorage.getItem('secSavedChap');
        this.secScrollY = localStorage.getItem('secScrollYSaved');

        this.bibleService.testament = Number(this.secTestamentArr);
        this.bibleService.bookSelected = Number(this.secBookArr);
        localStorage.setItem('curChap', this.secSavedChap);
        localStorage.setItem('curScrollY', this.secScrollY);

        localStorage.setItem('secTestamentIndex', this.curTestamentArr);
        localStorage.setItem('secBookIndex', this.curBookArr);
        localStorage.setItem('secSavedChap', this.curChap);
        localStorage.setItem('secScrollYSaved', this.curScrollYPostion);

        break;
        
      case 'third':
        this.curTestamentArr = localStorage.getItem('curTestamentIndex');
        this.curBookArr = localStorage.getItem('curBookIndex');
        this.curChap = localStorage.getItem('curChap');
        this.curScrollYPostion = localStorage.getItem('curScrollY');
        this.secTestamentArr= localStorage.getItem('secTestamentIndex');
        this.secBookArr = localStorage.getItem('secBookIndex');
        this.secSavedChap = localStorage.getItem('secSavedChap');
        this.secScrollY = localStorage.getItem('secScrollYSaved');

        this.bibleService.testament = Number(localStorage.getItem('thirdTestamentIndex'));
        this.bibleService.bookSelected = Number(localStorage.getItem('thirdBookIndex'));
        localStorage.setItem('curChap', localStorage.getItem('thirdSavedChap'));
        localStorage.setItem('curScrollY', localStorage.getItem('thirdScrollYSaved'));

        localStorage.setItem('secTestamentIndex', this.curTestamentArr);
        localStorage.setItem('secBookIndex', this.curBookArr);
        localStorage.setItem('secSavedChap', this.curChap);
        localStorage.setItem('secScrollYSaved', this.curScrollYPostion);

        localStorage.setItem('thirdTestamentIndex', this.secTestamentArr);
        localStorage.setItem('thirdBookIndex', this.secBookArr);
        localStorage.setItem('thirdSavedChap', this.secSavedChap);
        localStorage.setItem('thirdScrollYSaved', this.secScrollY);

        break;
    };
    this.bibleService.title = this.bibleService.bible[this.bibleService.testament].books[this.bibleService.bookSelected].bookName;
    localStorage.setItem('curTestamentIndex', (this.bibleService.testament).toString());
    localStorage.setItem('curBookIndex', (this.bibleService.bookSelected).toString());
   
    //hack to force angular to reload with the above parameters - route to '/testament' then back
    this.router.navigateByUrl('/testament', { skipLocationChange: true }).then(() => {
    //Below works, however gives an error code 404 from static server (github pages) on reload if - this.router.navigate(['/book', this.bibleService.title]);  
      this.router.navigate(['/book']);  
    }); 
  }

  newBook() {
  // reset scroll position if new book selected                
    if ((this.bibleService.title != (this.bibleService.bible[Number(localStorage.getItem('curTestamentIndex'))]
                                      .books[Number(localStorage.getItem('curBookIndex'))].bookName ) 
                                    || (localStorage.getItem('curChap') == null) )
                                    && (this.bibleService.menuHistoryBook == false )) {
        localStorage.setItem('curScrollY', '0');
        localStorage.setItem('curChap', '1');  
        this.bibleService.showChapters = true;
    } 
  }

  savePosition() {
    localStorage.setItem('ScrollYSaved', localStorage.getItem('curScrollY'));
    localStorage.setItem('curSavedChap', localStorage.getItem('curChap'));
  }

  storeBooks() {
    // only execute if not selected from history
    if (this.bibleService.menuHistoryBook == false) {

      this.curBookArr = localStorage.getItem('curBookIndex');
      this.curTestamentArr = localStorage.getItem('curTestamentIndex');
      this.secBookArr = localStorage.getItem('secBookIndex');
      this.secTestamentArr = localStorage.getItem('secTestamentIndex');
      this.curScrollYPostion = localStorage.getItem('ScrollYSaved');
      this.secScrollY = localStorage.getItem('secScrollYSaved');

      this.curSavedChap = localStorage.getItem('curSavedChap');
      this.secSavedChap = localStorage.getItem('secSavedChap');

      if (this.bibleService.bookSelected != Number(this.curBookArr) 
          || this.bibleService.testament != Number(this.curTestamentArr) ) { 
        if (this.secTestamentArr != null) {
          localStorage.setItem('thirdTestamentIndex', this.secTestamentArr);
          localStorage.setItem('thirdBookIndex', this.secBookArr);
          localStorage.setItem('thirdScrollYSaved', this.secScrollY);
          localStorage.setItem('thirdSavedChap', this.secSavedChap);
        }
        localStorage.setItem('secTestamentIndex', this.curTestamentArr);
        localStorage.setItem('secBookIndex', this.curBookArr);
        localStorage.setItem('secScrollYSaved', this.curScrollYPostion);
        localStorage.setItem('secSavedChap', this.curSavedChap);
      }
      // The following need to be here or history won't originally populate
      localStorage.setItem('curTestamentIndex', (this.bibleService.testament).toString());
      localStorage.setItem('curBookIndex', (this.bibleService.bookSelected).toString());
    }
  }
}

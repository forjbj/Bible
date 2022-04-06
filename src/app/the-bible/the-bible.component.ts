import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BibleService } from '../bible.service';
import { HistoryService } from '../history.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-the-bible',
  templateUrl: './the-bible.component.html',
  styleUrls: ['./the-bible.component.scss']
})

export class TheBibleComponent implements OnInit, AfterViewInit {

  constructor(public bibleService: BibleService,
              public historyService: HistoryService,
              public meta: Meta,
              public title: Title,
              ) {
    
    title.setTitle('Bible - King James Version');
    this.meta.addTag({ name: 'description', content: 'Bible application with History and Search functionality.'});

  } 

  ngOnInit() {
    // apply righthanded if set in storage
    let grid = document.getElementById('navGrid') as HTMLInputElement;
    if (localStorage.getItem('leftHanded') == 'no' || (localStorage.getItem('leftHanded') == null)) { // or null necessary for first visit or memory wipe
      grid.setAttribute('leftHanded', 'no');
    } else {
      grid.setAttribute('leftHanded', 'yes');
    }
  }
  
  ngAfterViewInit() {
  }

}

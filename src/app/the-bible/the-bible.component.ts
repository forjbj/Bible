import { AfterViewInit, Component } from '@angular/core';
import { BibleService } from '../bible.service';
import { HistoryService } from '../history.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-the-bible',
  templateUrl: './the-bible.component.html',
  styleUrls: ['./the-bible.component.scss']
})

export class TheBibleComponent implements AfterViewInit {


  constructor(public bibleService: BibleService,
              public historyService: HistoryService,
              public meta: Meta,
              public title: Title,
              ) {
    
    title.setTitle('Bible');
    this.meta.addTag({ name: 'description', content: 'Bible application with History and Search functionality.'});

  } 

  ngAfterViewInit() {
    
  }
}

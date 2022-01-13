import { AfterViewInit, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BibleService } from '../bible.service';

@Component({
  selector: 'app-testaments',
  templateUrl: './testaments.component.html',
  styleUrls: ['./testaments.component.scss']
})
export class TestamentsComponent implements AfterViewInit {

  constructor(public bibleService: BibleService,
              public title: Title ) {
        // change title so as to not make it a button
    this.bibleService.pageTitle = "King James Version"
    this.bibleService.title = this.bibleService.pageTitle;
    this.title.setTitle('Bible Books');
    
  }
  ngAfterViewInit() {

  }

}

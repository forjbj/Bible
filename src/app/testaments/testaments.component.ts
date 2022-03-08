import { AfterViewInit, Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BibleService } from '../bible.service';

@Component({
  selector: 'app-testaments',
  templateUrl: './testaments.component.html',
  styleUrls: ['./testaments.component.scss']
})
export class TestamentsComponent implements AfterViewInit {

  constructor(public bibleService: BibleService,
              public title: Title,
              private meta: Meta, ) {
    //nav titles and buttons
    this.bibleService.pageTitle = "KJV";
    this.bibleService.chapterButton = false;

    this.title.setTitle('Bible Books');
    this.meta.addTag({ name: 'description', content: 'Select the Bible book to read' });

  }
  ngAfterViewInit() {

  }

}

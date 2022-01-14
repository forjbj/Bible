import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BibleService } from '../bible.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor(public bibleService: BibleService,
    public title: Title,) {
        // change title so as to not make it a button
        this.bibleService.pageTitle = "About this App";
        this.bibleService.title = this.bibleService.pageTitle;
        this.title.setTitle('About');
   }

  ngOnInit(): void {
  }

}

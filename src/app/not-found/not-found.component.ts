import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  constructor(private title: Title, private meta: Meta) {
    title.setTitle('404 Not Found');
    this.meta.addTag({ name: 'description', content: 'The page does not exist.' });

  }
  ngOnInit() {
  }

}

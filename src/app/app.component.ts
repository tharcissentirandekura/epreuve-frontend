import { Component,OnInit, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
  title = 'EpreuvesTypes-website';
  ngOnInit(): void {
    if(isDevMode()){
      console.log('Development mode');
      environment.production = false;
    }else{
      console.log('Production mode');
      environment.production = true;
    }
  }

}

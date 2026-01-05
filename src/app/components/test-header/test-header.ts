import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from "../../reusable/navbar/navbar.component";

@Component({
  selector: 'app-test-header',
  imports: [CommonModule, NavbarComponent],
  templateUrl: './test-header.html',
  styleUrl: './test-header.scss',
  standalone:true
})
export class TestHeader {

}

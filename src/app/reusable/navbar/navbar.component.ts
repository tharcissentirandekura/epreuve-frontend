import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import {SearchBarComponent} from '../search-bar/search.component';
import { AuthService } from '../../services/auth/auth.service';


@Component({
	selector: 'app-navbar',
	standalone: true,
	imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule,SearchBarComponent],
	templateUrl: './navbar.component.html',
	styleUrl: './navbar.component.scss',

})
export class NavbarComponent implements OnInit {
	// Using a Subject to manage the unsubscribe logic
	isLoggedIn: boolean = false;
	isSearchBarVisible: boolean = false;
	searchQuery: string = '';
	searchResults: any[] = [];
	isFeatureOn: boolean = false;

	constructor(
		private authservice: AuthService,
	) {}

	ngOnInit(): void {
		// Subscribe to the login state
		this.authservice.isLoggedIn$.subscribe((state) => {
			this.isLoggedIn = state;
		});

	}
	logout() {
		// Clear the token from local storage
		this.authservice.logout();
	}
}
